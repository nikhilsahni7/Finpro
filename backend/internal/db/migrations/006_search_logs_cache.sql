CREATE TABLE IF NOT EXISTS user_search_logs (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	device_fingerprint TEXT,
	ip_address TEXT,
	user_agent TEXT,
	params JSONB NOT NULL,
	normalized_key TEXT NOT NULL,
	total_results BIGINT NOT NULL,
	snapshot JSONB,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usl_user_created_idx ON user_search_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS usl_normkey_idx ON user_search_logs(user_id, normalized_key);

CREATE TABLE IF NOT EXISTS user_device_search_cache (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	device_fingerprint TEXT NOT NULL,
	normalized_key TEXT NOT NULL,
	snapshot JSONB,
	total_results BIGINT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (user_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS udsc_normkey_idx ON user_device_search_cache(user_id, normalized_key);
