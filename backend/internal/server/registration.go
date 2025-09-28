package server

import (
	"crypto/sha256"
	"encoding/hex"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type registrationRequestInput struct {
	Name              string `json:"name"`
	Email             string `json:"email"`
	PhoneNumber       string `json:"phone_number"`
	State             string `json:"state"`
	RequestedSearches int    `json:"requested_searches"`
}

func (h *Handlers) CreateRegistrationRequest(c *gin.Context) {
	var in registrationRequestInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if in.Name == "" || in.Email == "" || in.PhoneNumber == "" || in.RequestedSearches <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing fields"})
		return
	}
	// If a PENDING request already exists, return friendly message
	var existingID uuid.UUID
	var existingStatus string
	_ = h.pg.QueryRow(c, `SELECT id, status FROM user_registration_requests WHERE email = $1 LIMIT 1`, in.Email).Scan(&existingID, &existingStatus)
	if existingStatus == "PENDING" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Your request is under review. Try another email or wait for admin response."})
		return
	}
	// If a user already exists with this email, block creating a request
	var dummy string
	h.pg.QueryRow(c, `SELECT email FROM users WHERE email = $1 LIMIT 1`, in.Email).Scan(&dummy)
	if dummy != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account already exists with this email. Please sign in."})
		return
	}
	// generate token and either INSERT or UPDATE existing non-pending record
	sum := sha256.Sum256([]byte(in.Email + time.Now().String()))
	token := hex.EncodeToString(sum[:])
	if existingStatus == "REJECTED" || (existingStatus != "" && existingStatus != "APPROVED") {
		_, err := h.pg.Exec(c, `UPDATE user_registration_requests SET name=$1, phone_number=$2, state=$3, requested_searches=$4, status='PENDING', verification_token=$5, email_verified_at=NULL, updated_at=now() WHERE id=$6`, in.Name, in.PhoneNumber, in.State, in.RequestedSearches, token, existingID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "could not update request"})
			return
		}
	} else if existingStatus == "APPROVED" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request already approved. Please use the credentials provided or contact admin."})
		return
	} else {
		_, err := h.pg.Exec(c, `INSERT INTO user_registration_requests (name,email,phone_number,state,requested_searches,status,verification_token) VALUES ($1,$2,$3,$4,$5,'PENDING',$6)`, in.Name, in.Email, in.PhoneNumber, in.State, in.RequestedSearches, token)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "could not create request"})
			return
		}
	}
	base := os.Getenv("PUBLIC_BASE_URL")
	if base == "" {
		base = "http://localhost:8080"
	}
	link := base + "/register/verify?token=" + token
	if err := sendVerificationEmail(in.Email, link); err != nil {
		log.Printf("sendVerificationEmail error: %v", err)
	}
	c.JSON(http.StatusCreated, gin.H{"message": "registration request submitted; please verify your email"})
}

type updateRegistrationInput struct {
	Status     string  `json:"status"`
	AdminNotes *string `json:"admin_notes"`
}

func (h *Handlers) ListRegistrationRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	offset := (page - 1) * limit
	rows, err := h.pg.Query(c, `SELECT id, name, email, phone_number, state, requested_searches, status, admin_notes, created_at, updated_at, email_verified_at FROM user_registration_requests ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	list := []gin.H{}
	for rows.Next() {
		var (
			id                                uuid.UUID
			name, email, phone, state, status string
			requested                         int
			adminNotes                        *string
			createdAt, updatedAt              time.Time
			emailVerifiedAt                   *time.Time
		)
		if err := rows.Scan(&id, &name, &email, &phone, &state, &requested, &status, &adminNotes, &createdAt, &updatedAt, &emailVerifiedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		list = append(list, gin.H{"id": id.String(), "name": name, "email": email, "phone_number": phone, "state": state, "requested_searches": requested, "status": status, "admin_notes": adminNotes, "created_at": createdAt, "updated_at": updatedAt, "email_verified_at": emailVerifiedAt})
	}
	var total int
	h.pg.QueryRow(c, `SELECT count(*) FROM user_registration_requests`).Scan(&total)
	c.JSON(http.StatusOK, gin.H{"requests": list, "total_count": total, "page": page, "limit": limit})
}

func (h *Handlers) UpdateRegistrationRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var in updateRegistrationInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if in.Status != "APPROVED" && in.Status != "REJECTED" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}
	// Require email verified for approval
	if in.Status == "APPROVED" {
		var verifiedAt *time.Time
		if err := h.pg.QueryRow(c, `SELECT email_verified_at FROM user_registration_requests WHERE id = $1`, id).Scan(&verifiedAt); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "request not found"})
			return
		}
		if verifiedAt == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email not verified; cannot approve."})
			return
		}
	}
	_, err = h.pg.Exec(c, `UPDATE user_registration_requests SET status = $1, admin_notes = $2, reviewed_at = now() WHERE id = $3`, in.Status, in.AdminNotes, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not update"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *Handlers) VerifyRegistrationEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing token"})
		return
	}
	res, err := h.pg.Exec(c, `UPDATE user_registration_requests SET email_verified_at = now() WHERE verification_token = $1`, token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not verify"})
		return
	}
	if res.RowsAffected() == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "email verified"})
}
