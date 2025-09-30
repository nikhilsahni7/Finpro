package ch

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
)

func ConnectClickHouse(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	// Strategy selection based on env: CH_PROTOCOL in {native,http}, CH_TLS in {true,false}
	protocol := strings.ToLower(strings.TrimSpace(os.Getenv("CH_PROTOCOL")))
	tlsEnabled := strings.EqualFold(os.Getenv("CH_TLS"), "true")
	allowPlainFallback := strings.EqualFold(os.Getenv("CH_ALLOW_PLAINTEXT"), "true")

	var strategies []func(context.Context) (ch.Conn, error)

	switch protocol {
	case "native":
		if tlsEnabled {
			strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openNativeTLS(c, addr, database, user, pass) })
			if allowPlainFallback {
				strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openNativePlain(c, addr, database, user, pass) })
			}
		} else {
			strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openNativePlain(c, addr, database, user, pass) })
		}
	case "http":
		if tlsEnabled {
			strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openHTTPS(c, addr, database, user, pass) })
			if allowPlainFallback {
				strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openHTTPPlain(c, addr, database, user, pass) })
			}
		} else {
			strategies = append(strategies, func(c context.Context) (ch.Conn, error) { return openHTTPPlain(c, addr, database, user, pass) })
		}
	default:
		// Auto mode: try TLS of both protocols, then optionally plaintext fallbacks
		if tlsEnabled {
			strategies = append(strategies,
				func(c context.Context) (ch.Conn, error) { return openNativeTLS(c, addr, database, user, pass) },
				func(c context.Context) (ch.Conn, error) { return openHTTPS(c, addr, database, user, pass) },
			)
			if allowPlainFallback {
				strategies = append(strategies,
					func(c context.Context) (ch.Conn, error) { return openNativePlain(c, addr, database, user, pass) },
					func(c context.Context) (ch.Conn, error) { return openHTTPPlain(c, addr, database, user, pass) },
				)
			}
		} else {
			strategies = append(strategies,
				func(c context.Context) (ch.Conn, error) { return openNativePlain(c, addr, database, user, pass) },
				func(c context.Context) (ch.Conn, error) { return openHTTPPlain(c, addr, database, user, pass) },
			)
		}
	}

	var lastErr error
	for i, strat := range strategies {
		conn, err := strat(ctx)
		if err == nil {
			pingErr := conn.Ping(ctx)
			if pingErr == nil {
				return conn, nil
			}
			_ = conn.Close()
			lastErr = fmt.Errorf("strategy %d ping failed: %w", i+1, pingErr)
		} else {
			lastErr = fmt.Errorf("strategy %d connect failed: %w", i+1, err)
		}
	}
	return nil, lastErr
}

func baseSettings() ch.Settings {
	return ch.Settings{
		"max_execution_time":                 getenvIntDefault("CH_MAX_EXECUTION_TIME", 30),
		"allow_experimental_analyzer":        getenvIntDefault("CH_ALLOW_EXPERIMENTAL_ANALYZER", 1),
		"optimize_move_to_prewhere":          getenvIntDefault("CH_OPTIMIZE_MOVE_TO_PREWHERE", 1),
		"use_uncompressed_cache":             getenvIntDefault("CH_USE_UNCOMPRESSED_CACHE", 1),
		"max_threads":                        getenvIntDefault("CH_MAX_THREADS", 4),
		"max_memory_usage":                   getenvStringDefault("CH_MAX_MEMORY_USAGE", "4000000000"),
		"join_algorithm":                     getenvStringDefault("CH_JOIN_ALGORITHM", "hash"),
		"max_bytes_before_external_group_by": getenvStringDefault("CH_MAX_BYTES_BEFORE_EXTERNAL_GROUP_BY", "1000000000"),
	}
}

func tlsConfigFor(addr string) *tls.Config {
	host := addr
	if h, _, err := net.SplitHostPort(addr); err == nil {
		host = h
	}
	return &tls.Config{ServerName: host}
}

func connectionOptions(addr, database, user, pass string, protocol ch.Protocol, tlsConf *tls.Config) *ch.Options {
	return &ch.Options{
		Addr:             []string{addr},
		Auth:             ch.Auth{Database: database, Username: user, Password: pass},
		Settings:         baseSettings(),
		Compression:      &ch.Compression{Method: ch.CompressionLZ4},
		DialTimeout:      getenvDurationDefault("CH_DIAL_TIMEOUT", 60*time.Second), // increased from 30s
		ConnOpenStrategy: ch.ConnOpenInOrder,
		Protocol:         protocol,
		TLS:              tlsConf,

		// Connection pool tuning (configurable via env)
		MaxOpenConns:    getenvIntDefault("CH_MAX_OPEN_CONNS", 200), // increased from 100
		MaxIdleConns:    getenvIntDefault("CH_MAX_IDLE_CONNS", 100), // increased from 50
		ConnMaxLifetime: getenvDurationDefault("CH_CONN_MAX_LIFETIME", 60*time.Minute),
	}
}

func openNativeTLS(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	return ch.Open(connectionOptions(addr, database, user, pass, ch.Native, tlsConfigFor(addr)))
}

func openHTTPS(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	return ch.Open(connectionOptions(addr, database, user, pass, ch.HTTP, tlsConfigFor(addr)))
}

func openNativePlain(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	return ch.Open(connectionOptions(addr, database, user, pass, ch.Native, nil))
}

func openHTTPPlain(ctx context.Context, addr, database, user, pass string) (ch.Conn, error) {
	return ch.Open(connectionOptions(addr, database, user, pass, ch.HTTP, nil))
}

func getenvIntDefault(k string, d int) int {
	v := strings.TrimSpace(os.Getenv(k))
	if v == "" {
		return d
	}
	if n, err := strconv.Atoi(v); err == nil {
		return n
	}
	return d
}

func getenvStringDefault(k, d string) string {
	v := strings.TrimSpace(os.Getenv(k))
	if v == "" {
		return d
	}
	return v
}

func getenvDurationDefault(k string, d time.Duration) time.Duration {
	v := strings.TrimSpace(os.Getenv(k))
	if v == "" {
		return d
	}
	if dur, err := time.ParseDuration(v); err == nil {
		return dur
	}
	return d
}
