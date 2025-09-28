-- Seed default admin if not exists
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN') THEN
		INSERT INTO users (email, password_hash, role, name, daily_search_limit, is_active)
		VALUES (
			COALESCE(NULLIF(current_setting('app.seed_admin_email', true), ''), 'admin@finpro.local'),
			crypt(COALESCE(NULLIF(current_setting('app.seed_admin_password', true), ''), 'Admin123!'), gen_salt('bf', 12)),
			'ADMIN',
			'Administrator',
			1000,
			true
		);
	END IF;
END$$;
