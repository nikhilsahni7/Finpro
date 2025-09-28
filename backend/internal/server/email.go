package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type resendEmail struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

func sendVerificationEmail(to, link string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("RESEND_FROM_EMAIL")
	if from == "" {
		from = "no-reply@finpro.local"
	}
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}
	body := resendEmail{From: from, To: []string{to}, Subject: "Verify your email", Html: "<p>Click to verify: <a href='" + link + "'>Verify Email</a></p>"}
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		msg, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend failed: %d %s", resp.StatusCode, string(msg))
	}
	return nil
}
