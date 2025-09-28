package server

import (
	"bufio"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"
)

// ingestFile reads a CSV and inserts rows into ClickHouse in batches.
func (h *Handlers) ingestFile(ctx context.Context, uploadID int64, path string) {
	start := time.Now()
	defer func() {
		_, _ = h.pg.Exec(context.Background(), `UPDATE uploads SET updated_at=now() WHERE id=$1`, uploadID)
	}()

	// mark processing
	_, _ = h.pg.Exec(ctx, `UPDATE uploads SET status='processing', processed_rows=0, progress_pct=0, updated_at=now() WHERE id=$1`, uploadID)

	f, err := os.Open(path)
	if err != nil {
		h.failUpload(uploadID, fmt.Errorf("open: %w", err))
		return
	}
	defer f.Close()

	reader := csv.NewReader(bufio.NewReader(f))
	reader.ReuseRecord = true
	reader.FieldsPerRecord = -1

	headers, err := reader.Read()
	if err != nil {
		h.failUpload(uploadID, fmt.Errorf("read header: %w", err))
		return
	}
	cols := mapHeaders(headers)
	if len(cols.idx) == 0 {
		h.failUpload(uploadID, errors.New("no recognized columns in CSV"))
		return
	}

	batchSize := 5000
	inserted := int64(0)

	batch, err := h.ck.PrepareBatch(ctx, `INSERT INTO contacts (
		name, email, phone, linkedin, position, company, company_phone, website, domain, facebook, twitter, linkedin_company_page, country, state, file_id, created_at
	) VALUES`)
	if err != nil {
		h.failUpload(uploadID, fmt.Errorf("prepare batch: %w", err))
		return
	}
	flush := func() error {
		if batch.Rows() == 0 {
			return nil
		}
		if err := batch.Send(); err != nil {
			return err
		}
		batch, err = h.ck.PrepareBatch(ctx, `INSERT INTO contacts (
			name, email, phone, linkedin, position, company, company_phone, website, domain, facebook, twitter, linkedin_company_page, country, state, file_id, created_at
		) VALUES`)
		return err
	}

	// estimate total rows from file size and average row length? Not reliable; instead update processed_rows and compute pct when size_bytes is known
	var lastUpdate time.Time
	const updateEvery = time.Second

	for {
		rec, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			h.failUpload(uploadID, fmt.Errorf("read: %w", err))
			return
		}

		row := extractRow(rec, cols)
		if err := batch.Append(
			row.name,
			row.email,
			row.phone,
			row.linkedin,
			row.position,
			row.company,
			row.companyPhone,
			row.website,
			row.domain,
			row.facebook,
			row.twitter,
			row.linkedinCompanyPage,
			row.country,
			row.state,
			uploadID,
			time.Now(),
		); err != nil {
			h.failUpload(uploadID, fmt.Errorf("append: %w", err))
			return
		}
		inserted++
		// periodic progress update
		if time.Since(lastUpdate) >= updateEvery {
			lastUpdate = time.Now()
			// progress percentage unknown without total rows; approximate using bytes? We'll expose processed_rows and let UI show rows instead
			_, _ = h.pg.Exec(ctx, `UPDATE uploads SET processed_rows=$2, updated_at=now() WHERE id=$1`, uploadID, inserted)
		}
		if batch.Rows() >= batchSize {
			if err := flush(); err != nil {
				h.failUpload(uploadID, fmt.Errorf("flush: %w", err))
				return
			}
		}
	}
	if err := flush(); err != nil {
		h.failUpload(uploadID, fmt.Errorf("final flush: %w", err))
		return
	}

	_, _ = h.pg.Exec(ctx, `UPDATE uploads SET status='succeeded', row_count=$2, processed_rows=$2, progress_pct=100, updated_at=now() WHERE id=$1`, uploadID, inserted)
	_ = os.Chtimes(path, time.Now(), time.Now())
	_ = os.Remove(path)
	fmt.Printf("ingested upload_id=%d rows=%d in %s\n", uploadID, inserted, time.Since(start))
}

type csvRow struct {
	name                string
	email               string
	phone               string
	linkedin            string
	position            string
	company             string
	companyPhone        string
	website             string
	domain              string
	facebook            string
	twitter             string
	linkedinCompanyPage string
	country             string
	state               string
}

type headerCols struct {
	idx map[string]int
}

func mapHeaders(h []string) headerCols {
	m := make(map[string]int)
	for i, col := range h {
		key := strings.ToLower(strings.TrimSpace(strings.ReplaceAll(col, "\ufeff", "")))
		m[key] = i
	}
	return headerCols{idx: m}
}

func get(h headerCols, rec []string, key string) string {
	if i, ok := h.idx[key]; ok && i < len(rec) {
		return strings.TrimSpace(rec[i])
	}
	return ""
}

func extractRow(rec []string, cols headerCols) csvRow {
	return csvRow{
		name:                get(cols, rec, "name"),
		email:               get(cols, rec, "email"),
		phone:               get(cols, rec, "phone"),
		linkedin:            get(cols, rec, "linkedin"),
		position:            get(cols, rec, "position"),
		company:             get(cols, rec, "company"),
		companyPhone:        get(cols, rec, "company phone"),
		website:             get(cols, rec, "website"),
		domain:              get(cols, rec, "domain"),
		facebook:            get(cols, rec, "facebook"),
		twitter:             get(cols, rec, "twitter"),
		linkedinCompanyPage: get(cols, rec, "linkedin company page"),
		country:             get(cols, rec, "country"),
		state:               get(cols, rec, "state"),
	}
}

func (h *Handlers) failUpload(id int64, err error) {
	fmt.Println("ingest error:", err)
	_, _ = h.pg.Exec(context.Background(), `UPDATE uploads SET status='failed', error=$2, updated_at=now() WHERE id=$1`, id, err.Error())
}
