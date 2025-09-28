package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"finpro/internal/ch"
	"finpro/internal/db"
	"finpro/internal/server"
)

func main() {
	ctx := context.Background()

	pgDsn := getenv("PG_DSN", "postgres://postgres:postgres@localhost:5432/finpro?sslmode=disable")
	chAddr := getenv("CH_ADDR", "localhost:9000")
	chDatabase := getenv("CH_DATABASE", "finpro")
	chUser := os.Getenv("CH_USERNAME")
	chPass := os.Getenv("CH_PASSWORD")
	bindAddr := getenv("BIND_ADDR", ":8080")

	pg, err := db.ConnectPostgres(ctx, pgDsn)
	if err != nil {
		log.Fatalf("postgres connect: %v", err)
	}
	defer pg.Close()

	if err := db.RunMigrations(ctx, pg); err != nil {
		log.Fatalf("postgres migrate: %v", err)
	}

	chConn, err := ch.ConnectClickHouse(ctx, chAddr, chDatabase, chUser, chPass)
	if err != nil {
		log.Fatalf("clickhouse connect: %v", err)
	}
	if err := ch.EnsureSchema(ctx, chConn); err != nil {
		log.Fatalf("clickhouse schema: %v", err)
	}

	r := server.Router(pg, chConn)
	srv := &http.Server{
		Addr:              bindAddr,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("API listening on %s", bindAddr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server: %v", err)
	}
}

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
