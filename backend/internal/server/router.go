package server

import (
	"os"
	"strings"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Router(pg *pgxpool.Pool, ck ch.Conn) *gin.Engine {
	r := gin.Default()
	// CORS: allow configured origins (defaults to Vite dev origin)
	origins := []string{"http://localhost:5173"}
	if v := strings.TrimSpace(os.Getenv("CORS_ORIGINS")); v != "" {
		parts := strings.Split(v, ",")
		var cleaned []string
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p != "" {
				cleaned = append(cleaned, p)
			}
		}
		if len(cleaned) > 0 {
			origins = cleaned
		}
	}
	cfg := cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(cfg))

	h := NewHandlers(pg, ck)

	r.GET("/healthz", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })

	// Public
	r.POST("/auth/login", h.Login)
	r.POST("/register", h.CreateRegistrationRequest)
	r.GET("/register/verify", h.VerifyRegistrationEmail)
	// Logout a session by verifying credentials (used on device conflict screen)
	r.POST("/auth/sessions/:sid/logout-by-credentials", h.LogoutSessionByCredentials)

	// Authenticated routes
	auth := r.Group("/")
	auth.Use(h.AuthMiddleware())
	{
		auth.POST("/auth/logout", h.Logout)
		auth.GET("/auth/me", h.Me)
		// Protected search with quota tracking is inside Search handler using context
		auth.POST("/search", h.Search)
		// history endpoints (to be implemented fully)
		auth.GET("/user/history", h.UserHistory)
		auth.GET("/user/last-search", h.UserLastSearch)
	}

	// Admin routes
	admin := r.Group("/admin")
	admin.Use(h.AuthMiddleware(), h.AdminMiddleware())
	{
		admin.POST("/users", h.AdminCreateUser)
		admin.GET("/users", h.AdminListUsers)
		admin.PUT("/users/:id", h.AdminUpdateUser)
		admin.DELETE("/users/:id", h.AdminDeleteUser)
		admin.GET("/users/:id/sessions", h.AdminListUserSessions)
		admin.POST("/sessions/:sid/logout", h.AdminLogoutSession)
		admin.GET("/uploads", h.ListUploads)
		admin.POST("/uploads", h.UploadCSV)
		admin.GET("/registration-requests", h.ListRegistrationRequests)
		admin.PUT("/registration-requests/:id", h.UpdateRegistrationRequest)
		admin.GET("/users/:id/searches", h.AdminUserSearches)
	}

	return r
}
