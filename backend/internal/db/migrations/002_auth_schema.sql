CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- users table
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','USER')),
	name TEXT,
	phone_number TEXT,
	state TEXT,
	is_active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- user_devices table (tracks trusted/active devices per user)
CREATE TABLE IF NOT EXISTS user_devices (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	device_fingerprint TEXT NOT NULL,
	user_agent TEXT,
	ip_address TEXT,
	is_active BOOLEAN NOT NULL DEFAULT true,
	last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (user_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS user_devices_user_idx ON user_devices(user_id);

-- user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	session_token TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	expires_at TIMESTAMPTZ NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT true,
	logged_out_at TIMESTAMPTZ,
	ip_address TEXT,
	user_agent TEXT,
	device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(user_id, is_active);

-- registration requests from public site
CREATE TABLE IF NOT EXISTS user_registration_requests (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	phone_number VARCHAR(30) NOT NULL,
	state VARCHAR(100),
	requested_searches INTEGER NOT NULL CHECK (requested_searches > 0),
	status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
	admin_notes TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	reviewed_at TIMESTAMPTZ,
	reviewed_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS urr_email_idx ON user_registration_requests(email);
CREATE INDEX IF NOT EXISTS urr_status_idx ON user_registration_requests(status);

-- daily usage tracking per user (search quotas)
CREATE TABLE IF NOT EXISTS user_daily_usage (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	usage_date DATE NOT NULL,
	search_count INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (user_id, usage_date)
);

-- trigger helpers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_urr_updated_at ON user_registration_requests;
CREATE TRIGGER trg_urr_updated_at
BEFORE UPDATE ON user_registration_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
