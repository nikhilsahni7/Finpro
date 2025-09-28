package server

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"encoding/json"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Email             string `json:"email"`
	Password          string `json:"password"`
	DeviceFingerprint string `json:"deviceFingerprint"`
}

type loginResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expiresAt"`
	User      struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Role  string `json:"role"`
		Name  string `json:"name"`
	} `json:"user"`
}

func (h *Handlers) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	var (
		userID     uuid.UUID
		email      string
		passHash   string
		role       string
		name       *string
		isActive   bool
		expiresAt  *time.Time
		dailyLimit int
	)
	err := h.pg.QueryRow(c, `SELECT id, email, password_hash, role, name, is_active, expires_at, daily_search_limit FROM users WHERE email = $1`, req.Email).Scan(&userID, &email, &passHash, &role, &name, &isActive, &expiresAt, &dailyLimit)
	if err != nil || !isActive {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(passHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if expiresAt != nil && expiresAt.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "account expired"})
		return
	}

	ip := c.ClientIP()
	ua := c.Request.UserAgent()
	fingerprint := req.DeviceFingerprint
	if fingerprint == "" {
		fingerprint = c.GetHeader("X-Device-Fingerprint")
	}
	if fingerprint == "" {
		fingerprint = ua
	}

	// Enforce single device for non-admin users only
	if role != "ADMIN" {
		// Only block if there exists an active session bound to a different device
		var activeOther int
		_ = h.pg.QueryRow(c, `
			SELECT count(*)
			FROM user_sessions us
			LEFT JOIN user_devices ud ON ud.id = us.device_id
			WHERE us.user_id = $1
			  AND us.is_active = true
			  AND us.logged_out_at IS NULL
			  AND now() < us.expires_at
			  AND ud.device_fingerprint IS NOT NULL
			  AND ud.device_fingerprint <> $2
		`, userID, fingerprint).Scan(&activeOther)
		if activeOther > 0 {
			rows, _ := h.pg.Query(c, `
				SELECT us.id::text, us.ip_address, us.user_agent, ud.device_fingerprint, ud.last_seen_at, us.created_at, us.expires_at
				FROM user_sessions us
				LEFT JOIN user_devices ud ON ud.id = us.device_id
				WHERE us.user_id = $1
				  AND us.is_active = true
				  AND us.logged_out_at IS NULL
				  AND now() < us.expires_at
				  AND ud.device_fingerprint IS NOT NULL
				  AND ud.device_fingerprint <> $2
				ORDER BY us.created_at DESC
				LIMIT 10`, userID, fingerprint)
			defer func() {
				if rows != nil {
					rows.Close()
				}
			}()
			sessions := make([]gin.H, 0)
			for rows != nil && rows.Next() {
				var sid, ip2, agent, dfp string
				var lastSeen, createdAt, exp time.Time
				_ = rows.Scan(&sid, &ip2, &agent, &dfp, &lastSeen, &createdAt, &exp)
				sessions = append(sessions, gin.H{"id": sid, "ip": ip2, "user_agent": agent, "device_type": deviceKind(agent), "last_seen_at": lastSeen, "created_at": createdAt, "expires_at": exp})
			}
			c.JSON(http.StatusConflict, gin.H{"error": "device limit reached; logout other device first", "sessions": sessions})
			return
		}
	}

	// Upsert device
	var deviceID uuid.UUID
	err = h.pg.QueryRow(c, `INSERT INTO user_devices (user_id, device_fingerprint, user_agent, ip_address, is_active, last_seen_at)
		VALUES ($1,$2,$3,$4,true,now())
		ON CONFLICT (user_id, device_fingerprint) DO UPDATE SET user_agent = EXCLUDED.user_agent, ip_address = EXCLUDED.ip_address, is_active = true, last_seen_at = now()
		RETURNING id`, userID, fingerprint, ua, ip).Scan(&deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed device register"})
		return
	}

	// Create JWT and session
	token, exp, err := h.generateJWT(userID.String(), email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed token"})
		return
	}
	hash := sha256.Sum256([]byte(token))
	_, err = h.pg.Exec(c, `INSERT INTO user_sessions (user_id, session_token, created_at, expires_at, is_active, ip_address, user_agent, device_id)
		VALUES ($1,$2,now(),$3,true,$4,$5,$6)`, userID, hex.EncodeToString(hash[:]), exp, ip, ua, deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed session"})
		return
	}

	var resp loginResponse
	resp.Token = token
	resp.ExpiresAt = exp
	resp.User.ID = userID.String()
	resp.User.Email = email
	resp.User.Role = role
	if name != nil {
		resp.User.Name = *name
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handlers) Logout(c *gin.Context) {
	tokenAny, ok := c.Get("token")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	token := tokenAny.(string)
	hash := sha256.Sum256([]byte(token))
	_, err := h.pg.Exec(c, `UPDATE user_sessions SET is_active = false, logged_out_at = now() WHERE session_token = $1`, hex.EncodeToString(hash[:]))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *Handlers) generateJWT(userID, email, role string) (string, time.Time, error) {
	exp := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     exp.Unix(),
		"iat":     time.Now().Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := t.SignedString(getJWTSecret())
	return token, exp, err
}

// AdminCreateUserInput represents admin user creation
type AdminCreateUserInput struct {
	Email            string `json:"email"`
	Password         string `json:"password"`
	Role             string `json:"role"`
	Name             string `json:"name"`
	DailySearchLimit *int   `json:"dailySearchLimit"`
	PhoneNumber      string `json:"phone_number"`
	IsActive         *bool  `json:"is_active"`
}

func (h *Handlers) AdminCreateUser(c *gin.Context) {
	var in AdminCreateUserInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if in.Email == "" || in.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password required"})
		return
	}
	if in.Role == "" {
		in.Role = "USER"
	}
	if in.Role != "USER" && in.Role != "ADMIN" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role"})
		return
	}
	// Pre-check for duplicate email to return friendly error
	var exists string
	_ = h.pg.QueryRow(c, `SELECT email FROM users WHERE email = $1`, in.Email).Scan(&exists)
	if exists != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User with this email already exists"})
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	var id uuid.UUID
	limit := 100
	if in.DailySearchLimit != nil {
		limit = *in.DailySearchLimit
	}
	isActive := true
	if in.IsActive != nil {
		isActive = *in.IsActive
	}
	err := h.pg.QueryRow(c, `INSERT INTO users (email, password_hash, role, name, phone_number, is_active, daily_search_limit) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, in.Email, string(hash), in.Role, in.Name, in.PhoneNumber, isActive, limit).Scan(&id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not create user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id.String()})
}

// Utility to require role
func requireRole(c *gin.Context, want string) error {
	role, _ := c.Get("role")
	if role != want {
		return errors.New("forbidden")
	}
	return nil
}

type AdminUpdateUserInput struct {
	Name             *string `json:"name"`
	Role             *string `json:"role"`
	DailySearchLimit *int    `json:"dailySearchLimit"`
	IsActive         *bool   `json:"is_active"`
	Password         *string `json:"password"`
}

func (h *Handlers) AdminListUsers(c *gin.Context) {
	rows, err := h.pg.Query(c, `SELECT id::text, email, role, name, daily_search_limit, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 200`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	out := []gin.H{}
	for rows.Next() {
		var id, email, role, name string
		var limit int
		var isActive bool
		var createdAt time.Time
		_ = rows.Scan(&id, &email, &role, &name, &limit, &isActive, &createdAt)
		out = append(out, gin.H{"id": id, "email": email, "role": role, "name": name, "dailySearchLimit": limit, "is_active": isActive, "created_at": createdAt})
	}
	c.JSON(http.StatusOK, gin.H{"users": out})
}

func (h *Handlers) AdminUpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	_, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var in AdminUpdateUserInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if in.Role != nil && *in.Role != "ADMIN" && *in.Role != "USER" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role"})
		return
	}
	// Build dynamic UPDATE
	set := []string{}
	args := []any{}
	idx := 1
	if in.Name != nil {
		set = append(set, "name = $"+itoa(idx))
		args = append(args, *in.Name)
		idx++
	}
	if in.Role != nil {
		set = append(set, "role = $"+itoa(idx))
		args = append(args, *in.Role)
		idx++
	}
	if in.DailySearchLimit != nil {
		set = append(set, "daily_search_limit = $"+itoa(idx))
		args = append(args, *in.DailySearchLimit)
		idx++
	}
	if in.IsActive != nil {
		set = append(set, "is_active = $"+itoa(idx))
		args = append(args, *in.IsActive)
		idx++
	}
	if in.Password != nil && *in.Password != "" {
		h, _ := bcrypt.GenerateFromPassword([]byte(*in.Password), bcrypt.DefaultCost)
		set = append(set, "password_hash = $"+itoa(idx))
		args = append(args, string(h))
		idx++
	}
	if len(set) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nothing to update"})
		return
	}
	args = append(args, idStr)
	query := "UPDATE users SET " + strings.Join(set, ", ") + " WHERE id = $" + itoa(idx)
	_, err = h.pg.Exec(c, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func itoa(i int) string { return fmt.Sprintf("%d", i) }

// Admin endpoints for sessions insight
func (h *Handlers) AdminListUserSessions(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	rows, err := h.pg.Query(c, `SELECT us.id::text, us.ip_address, us.user_agent, ud.device_fingerprint, ud.last_seen_at, us.created_at, us.expires_at, us.is_active, us.logged_out_at FROM user_sessions us LEFT JOIN user_devices ud ON ud.id = us.device_id WHERE us.user_id = $1 ORDER BY us.created_at DESC LIMIT 50`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var sessions []gin.H
	for rows.Next() {
		var sid, ip, agent, dfp string
		var lastSeenAt, createdAt, exp time.Time
		var isActive bool
		var loggedOutAt *time.Time
		_ = rows.Scan(&sid, &ip, &agent, &dfp, &lastSeenAt, &createdAt, &exp, &isActive, &loggedOutAt)
		sessions = append(sessions, gin.H{"id": sid, "ip": ip, "user_agent": agent, "device_type": deviceKind(agent), "device_fingerprint": dfp, "last_seen_at": lastSeenAt, "created_at": createdAt, "expires_at": exp, "is_active": isActive, "logged_out_at": loggedOutAt})
	}
	c.JSON(http.StatusOK, gin.H{"sessions": sessions})
}

func (h *Handlers) AdminLogoutSession(c *gin.Context) {
	sidStr := c.Param("sid")
	sid, err := uuid.Parse(sidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}
	_, err = h.pg.Exec(c, `UPDATE user_sessions SET is_active=false, logged_out_at=now() WHERE id=$1`, sid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// Public: logout a session by verifying user credentials (for device conflict flow before JWT)
type logoutByCreds struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handlers) LogoutSessionByCredentials(c *gin.Context) {
	sidStr := c.Param("sid")
	sid, err := uuid.Parse(sidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}
	var req logoutByCreds
	if err := c.ShouldBindJSON(&req); err != nil || req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	// find user by email
	var uid uuid.UUID
	var passHash string
	if err := h.pg.QueryRow(c, `SELECT id, password_hash FROM users WHERE email = $1 AND is_active = true`, req.Email).Scan(&uid, &passHash); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(passHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	// ensure session belongs to user
	var owner uuid.UUID
	if err := h.pg.QueryRow(c, `SELECT user_id FROM user_sessions WHERE id = $1 AND is_active = true AND logged_out_at IS NULL`, sid).Scan(&owner); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}
	if owner != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
		return
	}
	_, err = h.pg.Exec(c, `UPDATE user_sessions SET is_active=false, logged_out_at=now() WHERE id=$1`, sid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *Handlers) AdminDeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	_, err = h.pg.Exec(c, `DELETE FROM users WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func deviceKind(agent string) string {
	ag := strings.ToLower(agent)
	if strings.Contains(ag, "android") {
		return "Android"
	}
	if strings.Contains(ag, "iphone") || strings.Contains(ag, "ipad") || strings.Contains(ag, "ios") {
		return "iOS"
	}
	if strings.Contains(ag, "windows") {
		return "Windows"
	}
	if strings.Contains(ag, "mac os") || strings.Contains(ag, "macintosh") {
		return "macOS"
	}
	if strings.Contains(ag, "linux") {
		return "Linux"
	}
	if strings.Contains(ag, "mobile") {
		return "Mobile"
	}
	return "Web Browser"
}

func (h *Handlers) Me(c *gin.Context) {
	uidAny, _ := c.Get("user_id")
	emailAny, _ := c.Get("email")
	roleAny, _ := c.Get("role")
	userID := fmt.Sprintf("%v", uidAny)
	email := fmt.Sprintf("%v", emailAny)
	role := fmt.Sprintf("%v", roleAny)
	var name *string
	var dailyLimit int
	if err := h.pg.QueryRow(c, `SELECT name, daily_search_limit FROM users WHERE id = $1`, userID).Scan(&name, &dailyLimit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load profile"})
		return
	}
	var used int
	_ = h.pg.QueryRow(c, `SELECT search_count FROM user_daily_usage WHERE user_id = $1 AND usage_date = CURRENT_DATE`, userID).Scan(&used)
	c.JSON(http.StatusOK, gin.H{
		"id":    userID,
		"email": email,
		"role":  role,
		"name": func() string {
			if name != nil {
				return *name
			}
			return ""
		}(),
		"searches_today": used,
		"daily_limit":    dailyLimit,
	})
}

func (h *Handlers) UserHistory(c *gin.Context) {
	uidAny, _ := c.Get("user_id")
	userID := fmt.Sprintf("%v", uidAny)
	page := 1
	limit := 25
	if v := c.Query("page"); v != "" {
		fmt.Sscanf(v, "%d", &page)
	}
	if v := c.Query("limit"); v != "" {
		fmt.Sscanf(v, "%d", &limit)
	}
	if page < 1 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 25
	}
	offset := (page - 1) * limit
	rows, err := h.pg.Query(c, `SELECT id::text, params::text, total_results, created_at FROM user_search_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	list := []gin.H{}
	for rows.Next() {
		var id string
		var params string
		var total int64
		var created time.Time
		_ = rows.Scan(&id, &params, &total, &created)
		list = append(list, gin.H{"id": id, "params": params, "total": total, "created_at": created})
	}
	var count int
	_ = h.pg.QueryRow(c, `SELECT count(*) FROM user_search_logs WHERE user_id=$1`, userID).Scan(&count)
	c.JSON(http.StatusOK, gin.H{"items": list, "total_count": count, "page": page, "limit": limit})
}

func (h *Handlers) UserLastSearch(c *gin.Context) {
	uidAny, _ := c.Get("user_id")
	userID := fmt.Sprintf("%v", uidAny)
	fingerAny, _ := c.Get("device_fingerprint")
	finger := fmt.Sprintf("%v", fingerAny)
	var snap []byte
	var total int64
	var normKey string
	var paramsJSON []byte
	err := h.pg.QueryRow(c, `SELECT snapshot, total_results, normalized_key, COALESCE(params::text,'') FROM user_device_search_cache WHERE user_id=$1 AND device_fingerprint=$2`, userID, finger).Scan(&snap, &total, &normKey, &paramsJSON)
	if err != nil || snap == nil {
		c.JSON(http.StatusOK, gin.H{"rows": []gin.H{}, "total": 0, "params": gin.H{}})
		return
	}
	// prefer params from cache; fall back to logs
	var paramsText string
	if len(paramsJSON) > 0 {
		paramsText = string(paramsJSON)
	} else {
		_ = h.pg.QueryRow(c, `SELECT params::text FROM user_search_logs WHERE user_id=$1 AND normalized_key=$2 ORDER BY created_at DESC LIMIT 1`, userID, normKey).Scan(&paramsText)
	}
	c.JSON(http.StatusOK, gin.H{"rows": jsonRaw(snap), "total": total, "params": jsonText(paramsText)})
}

// helpers to embed raw json safely
func jsonRaw(b []byte) any { var v any; _ = json.Unmarshal(b, &v); return v }
func jsonText(s string) any {
	var v any
	if s == "" {
		return gin.H{}
	}
	_ = json.Unmarshal([]byte(s), &v)
	if v == nil {
		return gin.H{}
	}
	return v
}

func (h *Handlers) AdminUserSearches(c *gin.Context) {
	idStr := c.Param("id")
	_, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	page := 1
	limit := 25
	if v := c.Query("page"); v != "" {
		fmt.Sscanf(v, "%d", &page)
	}
	if v := c.Query("limit"); v != "" {
		fmt.Sscanf(v, "%d", &limit)
	}
	if page < 1 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 25
	}
	offset := (page - 1) * limit
	rows, err := h.pg.Query(c, `SELECT id::text, device_fingerprint, ip_address, user_agent, params::text, total_results, created_at FROM user_search_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, idStr, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	list := []gin.H{}
	for rows.Next() {
		var id, dfp, ip, agent, params string
		var total int64
		var created time.Time
		_ = rows.Scan(&id, &dfp, &ip, &agent, &params, &total, &created)
		list = append(list, gin.H{"id": id, "device": dfp, "ip": ip, "agent": agent, "params": jsonText(params), "total": total, "created_at": created})
	}
	var count int
	_ = h.pg.QueryRow(c, `SELECT count(*) FROM user_search_logs WHERE user_id=$1`, idStr).Scan(&count)
	c.JSON(http.StatusOK, gin.H{"items": list, "total_count": count, "page": page, "limit": limit})
}
