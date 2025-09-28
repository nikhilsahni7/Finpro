package db

import (
	"context"
	"embed"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func RunMigrations(ctx context.Context, pg *pgxpool.Pool) error {
	files, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return err
	}
	// Sort by filename to ensure 001_*, 002_* order
	sort.Slice(files, func(i, j int) bool { return files[i].Name() < files[j].Name() })
	for _, f := range files {
		if f.IsDir() {
			continue
		}
		b, err := migrationsFS.ReadFile("migrations/" + f.Name())
		if err != nil {
			return err
		}
		stmts := strings.TrimSpace(string(b))
		if stmts == "" {
			continue
		}
		if _, err := pg.Exec(ctx, stmts); err != nil {
			return err
		}
	}
	return nil
}
