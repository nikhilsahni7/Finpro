package server

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var serialRe = regexp.MustCompile(`\((\d+)\)`)

func (h *Handlers) UploadCSV(c *gin.Context) {
	ctx := c.Request.Context()

	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file field is required"})
		return
	}

	f, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	defer f.Close()

	uploadsDir := getenv("UPLOADS_DIR", "./uploads")
	if err := os.MkdirAll(uploadsDir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	safeName := sanitizeFilename(fileHeader.Filename)
	dstPath := filepath.Join(uploadsDir, fmt.Sprintf("%d_%s", time.Now().UnixNano(), safeName))
	dst, err := os.Create(dstPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer dst.Close()

	hasher := sha256.New()
	size, err := io.Copy(io.MultiWriter(dst, hasher), f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	sha := hex.EncodeToString(hasher.Sum(nil))

	serial := sql.NullInt64{}
	if m := serialRe.FindStringSubmatch(fileHeader.Filename); len(m) == 2 {
		serial.Int64 = parseInt64(m[1])
		serial.Valid = true
	}

	var id int64
	err = h.pg.QueryRow(ctx, `
		INSERT INTO uploads (original_filename, safe_name, serial_number, status, size_bytes, sha256)
		VALUES ($1, $2, $3, 'uploaded', $4, $5)
		RETURNING id
	`, fileHeader.Filename, filepath.Base(dstPath), serial, size, sha).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Kick off ingestion asynchronously with concurrency limit
	go func(uploadID int64, path string) {
		h.ingestSem <- struct{}{}
		defer func() { <-h.ingestSem }()
		h.ingestFile(context.Background(), uploadID, path)
	}(id, dstPath)

	c.JSON(http.StatusOK, gin.H{"file_id": id, "status": "uploaded"})
}

func (h *Handlers) ListUploads(c *gin.Context) {
	rows, err := h.pg.Query(c.Request.Context(), `
		SELECT id, original_filename, safe_name, serial_number, status, size_bytes, row_count, processed_rows, progress_pct, error, created_at, updated_at
		FROM uploads
		ORDER BY id DESC
		LIMIT 200
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var out []gin.H
	for rows.Next() {
		var (
			id                   int64
			orig, safe, status   string
			serial               sql.NullInt64
			size, rowCount       sql.NullInt64
			processedRows        sql.NullInt64
			progressPct          sql.NullFloat64
			errmsg               sql.NullString
			createdAt, updatedAt time.Time
		)
		if err := rows.Scan(&id, &orig, &safe, &serial, &status, &size, &rowCount, &processedRows, &progressPct, &errmsg, &createdAt, &updatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, gin.H{
			"id":                id,
			"original_filename": orig,
			"safe_name":         safe,
			"serial_number":     nullableInt(serial),
			"status":            status,
			"size_bytes":        nullableInt(size),
			"row_count":         nullableInt(rowCount),
			"processed_rows":    nullableInt(processedRows),
			"progress_pct": func() any {
				if progressPct.Valid {
					return progressPct.Float64
				}
				return nil
			}(),
			"error":      nullableString(errmsg),
			"created_at": createdAt,
			"updated_at": updatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"uploads": out})
}

func sanitizeFilename(name string) string {
	s := strings.ReplaceAll(name, "..", "_")
	s = strings.ReplaceAll(s, "/", "_")
	s = strings.ReplaceAll(s, "\\", "_")
	return s
}

func parseInt64(s string) int64 { var n int64; fmt.Sscanf(s, "%d", &n); return n }

func nullableInt(v sql.NullInt64) any {
	if v.Valid {
		return v.Int64
	}
	return nil
}
func nullableString(v sql.NullString) any {
	if v.Valid {
		return v.String
	}
	return nil
}

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
