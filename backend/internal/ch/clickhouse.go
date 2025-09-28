package ch

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"os"
	"strings"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
)

func ConnectClickHouse(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	// Try strategies: native+TLS → HTTP+TLS → plaintext (if allowed)
	strategies := []func(context.Context) (ch.Conn, error){
		func(c context.Context) (ch.Conn, error) { return openNativeTLS(c, addr, database, user, pass) },
		func(c context.Context) (ch.Conn, error) { return openHTTPS(c, addr, database, user, pass) },
	}
	if strings.EqualFold(os.Getenv("CH_ALLOW_PLAINTEXT"), "true") {
		strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openPlaintext(c, addr, database, user, pass) })
	}

	var lastErr error
	for i, strat := range strategies {
		conn, err := strat(ctx)
		if err == nil {
			if pingErr := conn.Ping(ctx); pingErr == nil {
				return conn, nil
			}
			_ = conn.Close()
			lastErr = fmt.Errorf("strategy %d ping failed: %w", i+1, err)
		} else {
			lastErr = fmt.Errorf("strategy %d connect failed: %w", i+1, err)
		}
	}
	return nil, lastErr
}

func baseSettings() ch.Settings {
	return ch.Settings{
		"max_execution_time":                 30,
		"allow_experimental_analyzer":        1,
		"optimize_move_to_prewhere":          1,
		"use_uncompressed_cache":             1,
		"max_threads":                        4,
		"max_memory_usage":                   "4000000000",
		"join_algorithm":                     "hash",
		"max_bytes_before_external_group_by": "1000000000",
	}
}

func tlsConfigFor(addr string) *tls.Config {
	host := addr
	if h, _, err := net.SplitHostPort(addr); err == nil {
		host = h
	}
	return &tls.Config{ServerName: host}
}

func openNativeTLS(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	options := &ch.Options{
		Addr:             []string{addr},
		Auth:             ch.Auth{Database: database, Username: user, Password: pass},
		Settings:         baseSettings(),
		Compression:      &ch.Compression{Method: ch.CompressionLZ4},
		DialTimeout:      10 * time.Second,
		ConnOpenStrategy: ch.ConnOpenInOrder,
		Protocol:         ch.Native,
		TLS:              tlsConfigFor(addr),
		MaxOpenConns:     20,
		MaxIdleConns:     10,
		ConnMaxLifetime:  60 * time.Minute,
	}
	return ch.Open(options)
}

func openHTTPS(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	options := &ch.Options{
		Addr:             []string{addr},
		Auth:             ch.Auth{Database: database, Username: user, Password: pass},
		Settings:         baseSettings(),
		Compression:      &ch.Compression{Method: ch.CompressionLZ4},
		DialTimeout:      10 * time.Second,
		ConnOpenStrategy: ch.ConnOpenInOrder,
		Protocol:         ch.HTTP,
		TLS:              tlsConfigFor(addr),
		MaxOpenConns:     20,
		MaxIdleConns:     10,
		ConnMaxLifetime:  60 * time.Minute,
	}
	return ch.Open(options)
}

func openPlaintext(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	options := &ch.Options{
		Addr:             []string{addr},
		Auth:             ch.Auth{Database: database, Username: user, Password: pass},
		Settings:         baseSettings(),
		Compression:      &ch.Compression{Method: ch.CompressionLZ4},
		DialTimeout:      10 * time.Second,
		ConnOpenStrategy: ch.ConnOpenInOrder,
		MaxOpenConns:     20,
		MaxIdleConns:     10,
		ConnMaxLifetime:  60 * time.Minute,
	}
	return ch.Open(options)
}
