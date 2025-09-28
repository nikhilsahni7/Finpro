package ch

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	ch "github.com/ClickHouse/clickhouse-go/v2"
)

func EnsureSchema(ctx context.Context, conn ch.Conn) error {
	db := os.Getenv("CH_DATABASE")
	if strings.TrimSpace(db) == "" {
		db = "finpro"
	}
	stmts := []string{
		fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", db),
		fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s.contacts (
			name String,
			email String,
			phone String,
			linkedin String,
			position String,
			company String,
			company_phone String,
			website String,
			domain String,
			facebook String,
			twitter String,
			linkedin_company_page String,
			country String,
			state String,
			file_id UInt64,
			created_at DateTime DEFAULT now(),

			name_lc String MATERIALIZED lowerUTF8(name),
			email_lc String MATERIALIZED lowerUTF8(email),
			linkedin_lc String MATERIALIZED lowerUTF8(linkedin),
			position_lc String MATERIALIZED lowerUTF8(position),
			company_lc String MATERIALIZED lowerUTF8(company),
			website_lc String MATERIALIZED lowerUTF8(website),
			domain_lc String MATERIALIZED lowerUTF8(domain),
			facebook_lc String MATERIALIZED lowerUTF8(facebook),
			twitter_lc String MATERIALIZED lowerUTF8(twitter),
			linkedin_company_page_lc String MATERIALIZED lowerUTF8(linkedin_company_page),
			country_lc String MATERIALIZED lowerUTF8(country),
			state_lc String MATERIALIZED lowerUTF8(state),

			INDEX idx_name name_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
			INDEX idx_email email_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
			INDEX idx_company company_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
			INDEX idx_position position_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
			INDEX idx_domain domain_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
			INDEX idx_linkedin linkedin_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
			INDEX idx_state state_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1
		) ENGINE = MergeTree
		ORDER BY (created_at, email_lc)
		SETTINGS index_granularity = 8192;`, db),
	}
	for _, s := range stmts {
		scanner := bufio.NewScanner(strings.NewReader(s))
		scanner.Split(splitSemicolons)
		for scanner.Scan() {
			stmt := strings.TrimSpace(scanner.Text())
			if stmt == "" {
				continue
			}
			if err := conn.Exec(ctx, stmt); err != nil {
				return err
			}
		}
		if err := scanner.Err(); err != nil {
			return err
		}
	}
	return nil
}

// splitSemicolons is a bufio.SplitFunc that splits on ';' delimiters.
func splitSemicolons(data []byte, atEOF bool) (advance int, token []byte, err error) {
	for i, b := range data {
		if b == ';' {
			return i + 1, data[:i], nil
		}
	}
	if atEOF && len(data) > 0 {
		return len(data), data, nil
	}
	return 0, nil, nil
}
