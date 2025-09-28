-- uploads tracking
CREATE TABLE IF NOT EXISTS uploads (
	id BIGSERIAL PRIMARY KEY,
	original_filename TEXT NOT NULL,
	safe_name TEXT NOT NULL,
	serial_number INTEGER,
	status TEXT NOT NULL DEFAULT 'pending',
	size_bytes BIGINT,
	sha256 TEXT,
	row_count BIGINT DEFAULT 0,
	uploader_id BIGINT,
	error TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uploads_status_idx ON uploads(status);
