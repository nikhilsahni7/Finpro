package server

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type searchRequest struct {
	Logic               string `json:"logic"`
	Page                int    `json:"page"`
	PageSize            int    `json:"pageSize"`
	Name                string `json:"name"`
	Email               string `json:"email"`
	Phone               string `json:"phone"`
	Linkedin            string `json:"linkedin"`
	Position            string `json:"position"`
	Company             string `json:"company"`
	CompanyPhone        string `json:"companyPhone"`
	Website             string `json:"website"`
	Domain              string `json:"domain"`
	Facebook            string `json:"facebook"`
	LinkedinCompanyPage string `json:"linkedinCompanyPage"`
	// Country and State are intentionally omitted from filters for this app
}

type contactRow struct {
	Name                string `json:"name"`
	Email               string `json:"email"`
	Phone               string `json:"phone"`
	Linkedin            string `json:"linkedin"`
	Position            string `json:"position"`
	Company             string `json:"company"`
	CompanyPhone        string `json:"companyPhone"`
	Website             string `json:"website"`
	Domain              string `json:"domain"`
	Facebook            string `json:"facebook"`
	Twitter             string `json:"twitter"`
	LinkedinCompanyPage string `json:"linkedinCompanyPage"`
	Country             string `json:"country"`
	State               string `json:"state"`
}

func (h *Handlers) Search(c *gin.Context) {
	// quota check
	userIDAny, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "auth required"})
		return
	}
	userID := userIDAny.(string)
	fingerprintAny, _ := c.Get("device_fingerprint")
	fingerprint, _ := fingerprintAny.(string)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	var req searchRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}
	logic := strings.ToUpper(strings.TrimSpace(req.Logic))
	if logic != "OR" {
		logic = "AND"
	}
	page := req.Page
	if page < 1 {
		page = 1
	}
	size := req.PageSize
	if size <= 0 || size > 1000 {
		size = 100 // Changed from 25 to 100 for better UX
	}
	offset := (page - 1) * size

	// Build normalized key (trimmed, lower-cased where applicable)
	norm := func(s string) string { return strings.TrimSpace(strings.ToLower(s)) }
	normalizedKey := fmt.Sprintf("logic=%s|name=%s|email=%s|phone=%s|linkedin=%s|position=%s|company=%s|companyPhone=%s|website=%s|domain=%s|facebook=%s|linkedinCompanyPage=%s|page=%d|size=%d",
		logic, norm(req.Name), norm(req.Email), norm(req.Phone), norm(req.Linkedin), norm(req.Position), norm(req.Company), norm(req.CompanyPhone), norm(req.Website), norm(req.Domain), norm(req.Facebook), norm(req.LinkedinCompanyPage), page, size,
	)

	// Check device cache (per device last-search, only a single entry per device)
	var cachedSnapshot []byte
	var cachedTotal int64
	_ = h.pg.QueryRow(c.Request.Context(), `SELECT snapshot, total_results FROM user_device_search_cache WHERE user_id=$1 AND device_fingerprint=$2 AND normalized_key=$3`, userID, fingerprint, normalizedKey).Scan(&cachedSnapshot, &cachedTotal)
	if cachedSnapshot != nil && cachedTotal > 0 {
		var out []contactRow
		_ = json.Unmarshal(cachedSnapshot, &out)
		c.JSON(http.StatusOK, gin.H{"rows": out, "total": cachedTotal})
		return
	}

	// Enforce daily limit based on IST midnight window
	ist, _ := time.LoadLocation("Asia/Kolkata")
	nowIST := time.Now().In(ist)
	var limit int
	if err := h.pg.QueryRow(c.Request.Context(), `SELECT daily_search_limit FROM users WHERE id = $1`, userID).Scan(&limit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed quota"})
		return
	}
	var used int
	_ = h.pg.QueryRow(c.Request.Context(), `SELECT search_count FROM user_daily_usage WHERE user_id = $1 AND usage_date = $2`, userID, nowIST.Format("2006-01-02")).Scan(&used)
	if used >= limit {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "daily search limit reached"})
		return
	}

	where, args := buildWhere(req, logic)
	if where == "" {
		where = "1"
	}

	// Request-scoped timeout for ClickHouse queries
	ckTimeout := 20 * time.Second // Increased from 15s to 20s
	if s := strings.TrimSpace(c.Request.Header.Get("X-CH-Timeout")); s != "" {
		if d, err := time.ParseDuration(s); err == nil {
			ckTimeout = d
		}
	}
	ckCtx, ckCancel := context.WithTimeout(c.Request.Context(), ckTimeout)
	defer ckCancel()

	// Execute data query and count query in parallel for better performance
	type dataResult struct {
		rows []contactRow
		err  error
	}
	type countResult struct {
		total uint64
		err   error
	}
	dataChan := make(chan dataResult, 1)
	countChan := make(chan countResult, 1)

	// Fetch data rows
	go func() {
		// Query with SETTINGS for better performance on large datasets
		query := fmt.Sprintf(`SELECT name, email, phone, linkedin, position, company, company_phone, website, domain, facebook, twitter, linkedin_company_page, country, state
			FROM contacts
			WHERE %s
			ORDER BY created_at DESC
			LIMIT %d OFFSET %d
			SETTINGS max_threads = 4`, where, size, offset)
		rows, err := h.ck.Query(ckCtx, query, args...)
		if err != nil {
			dataChan <- dataResult{err: err}
			return
		}

		var out []contactRow
		for rows.Next() {
			var r contactRow
			if err := rows.Scan(&r.Name, &r.Email, &r.Phone, &r.Linkedin, &r.Position, &r.Company, &r.CompanyPhone, &r.Website, &r.Domain, &r.Facebook, &r.Twitter, &r.LinkedinCompanyPage, &r.Country, &r.State); err != nil {
				rows.Close()
				dataChan <- dataResult{err: err}
				return
			}
			out = append(out, r)
		}
		rows.Close()
		dataChan <- dataResult{rows: out, err: nil}
	}()

	// Fetch count in parallel
	go func() {
		countCtx, countCancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer countCancel()
		totalQ := fmt.Sprintf(`SELECT count() FROM contacts WHERE %s`, where)
		var total uint64
		if err := h.ck.QueryRow(countCtx, totalQ, args...).Scan(&total); err != nil {
			countChan <- countResult{err: err}
			return
		}
		countChan <- countResult{total: total, err: nil}
	}()

	// Wait for both results
	dataRes := <-dataChan
	countRes := <-countChan

	if dataRes.err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": dataRes.err.Error()})
		return
	}
	if countRes.err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": countRes.err.Error()})
		return
	}

	out := dataRes.rows
	total := countRes.total

	// Log search and update cache; decrement count only if results>0 and not from cache
	snap, _ := json.Marshal(out)
	paramsJSON := toJSON(req)
	_, _ = h.pg.Exec(c.Request.Context(), `INSERT INTO user_search_logs (user_id, device_fingerprint, ip_address, user_agent, params, normalized_key, total_results, snapshot)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, userID, fingerprint, ip, ua, paramsJSON, normalizedKey, int64(total), snap)
	// Cache last search per device (replace)
	_, _ = h.pg.Exec(c.Request.Context(), `INSERT INTO user_device_search_cache (user_id, device_fingerprint, normalized_key, snapshot, total_results, params, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,now())
		ON CONFLICT (user_id, device_fingerprint) DO UPDATE SET normalized_key=EXCLUDED.normalized_key, snapshot=EXCLUDED.snapshot, total_results=EXCLUDED.total_results, params=EXCLUDED.params, created_at=now()`, userID, fingerprint, normalizedKey, snap, int64(total), paramsJSON)
	if total > 0 {
		_, _ = h.pg.Exec(c.Request.Context(), `INSERT INTO user_daily_usage (user_id, usage_date, search_count) VALUES ($1,$2,1)
			ON CONFLICT (user_id, usage_date) DO UPDATE SET search_count = user_daily_usage.search_count + 1`, userID, nowIST.Format("2006-01-02"))
	}

	c.JSON(http.StatusOK, gin.H{"rows": out, "total": total})
}

// buildWhere constructs the WHERE clause for search queries
// AND logic: ALL filled fields must match (intersection)
// OR logic: ANY filled field can match (union)
func buildWhere(req searchRequest, logic string) (string, []any) {
	var parts []string
	var args []any
	add := func(expr string, val string, like bool) {
		if strings.TrimSpace(val) == "" {
			return
		}
		if like {
			parts = append(parts, expr+" LIKE ?")
			args = append(args, "%"+strings.ToLower(val)+"%")
		} else {
			parts = append(parts, expr+" = ?")
			args = append(args, val)
		}
	}
	// Use lowercased materialized columns for LIKE to benefit from ngram bloom filter indexes
	// This provides fast substring matching even on large datasets
	add("name_lc", req.Name, true)
	add("email_lc", req.Email, true)
	add("replaceRegexpAll(phone, '[^0-9]+', '')", onlyDigits(req.Phone), true)
	add("linkedin_lc", req.Linkedin, true)
	add("position_lc", req.Position, true)
	add("company_lc", req.Company, true)
	add("replaceRegexpAll(company_phone, '[^0-9]+', '')", onlyDigits(req.CompanyPhone), true)
	add("website_lc", req.Website, true)
	add("domain_lc", req.Domain, true)
	add("facebook_lc", req.Facebook, true)
	add("linkedin_company_page_lc", req.LinkedinCompanyPage, true)
	if len(parts) == 0 {
		return "", nil
	}
	// Join conditions with AND or OR operator
	// e.g., AND: (name LIKE ? AND email LIKE ? AND company LIKE ?)
	// e.g., OR:  (name LIKE ? OR email LIKE ? OR company LIKE ?)
	return "(" + strings.Join(parts, " "+logic+" ") + ")", args
}

func onlyDigits(s string) string {
	s = strings.TrimSpace(s)
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func toJSON(v any) []byte { b, _ := json.Marshal(v); return b }
