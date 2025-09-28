package server

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-change"
	}
	return []byte(secret)
}

func hashToken(tok string) string {
	h := sha256.Sum256([]byte(tok))
	return hex.EncodeToString(h[:])
}

// AuthMiddleware validates JWT, active session, and device enforcement
func (h *Handlers) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization"})
			c.Abort()
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader || tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

		// Validate JWT
		tok, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return getJWTSecret(), nil
		})
		if err != nil || !tok.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}
		claims, ok := tok.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}
		userID, _ := claims["user_id"].(string)
		role, _ := claims["role"].(string)
		email, _ := claims["email"].(string)

		// Validate active session against hashed token
		hash := hashToken(tokenString)
		var (
			sessionActive bool
			deviceID      *string
		)
		err = h.pg.QueryRow(c, `SELECT is_active, COALESCE(device_id::text, '') FROM user_sessions WHERE session_token = $1 AND user_id = $2 AND (logged_out_at IS NULL) AND now() < expires_at`, hash, userID).Scan(&sessionActive, &deviceID)
		if err != nil || !sessionActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired session"})
			c.Abort()
			return
		}

		fingerprint := c.GetHeader("X-Device-Fingerprint")
		if fingerprint == "" {
			fingerprint = c.Request.UserAgent()
		}
		// Enforce single active device for non-admin only
		if role != "ADMIN" {
			var currentDevice string
			err = h.pg.QueryRow(c, `SELECT COALESCE((SELECT device_fingerprint FROM user_devices WHERE id = $1), '')`, deviceID).Scan(&currentDevice)
			if err == nil && currentDevice != "" && fingerprint != currentDevice {
				c.JSON(http.StatusConflict, gin.H{"error": "device limit reached; logout other device first"})
				c.Abort()
				return
			}
		}

		// Update device last_seen_at for activity tracking
		_, _ = h.pg.Exec(c, `UPDATE user_devices SET last_seen_at = now() WHERE user_id = $1 AND device_fingerprint = $2`, userID, fingerprint)

		c.Set("user_id", userID)
		c.Set("role", role)
		c.Set("email", email)
		c.Set("token", tokenString)
		c.Set("device_fingerprint", fingerprint)
		c.Next()
	}
}

// AdminMiddleware ensures admin role
func (h *Handlers) AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != "ADMIN" {
			c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}
