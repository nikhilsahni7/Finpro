package server

import (
	"os"
	"strconv"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handlers struct {
	pg        *pgxpool.Pool
	ck        ch.Conn
	ingestSem chan struct{}
}

func NewHandlers(pg *pgxpool.Pool, ck ch.Conn) *Handlers {
	max := getIntEnv("INGEST_MAX_CONCURRENCY", 2)
	if max < 1 {
		max = 1
	}
	return &Handlers{pg: pg, ck: ck, ingestSem: make(chan struct{}, max)}
}

func getIntEnv(k string, d int) int {
	if v := os.Getenv(k); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return n
		}
	}
	return d
}
