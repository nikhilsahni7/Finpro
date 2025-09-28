ALTER TABLE user_registration_requests
	ADD COLUMN IF NOT EXISTS verification_token TEXT,
	ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
