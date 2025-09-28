CREATE DATABASE IF NOT EXISTS finpro;

CREATE TABLE IF NOT EXISTS finpro.contacts (
	name String,
	email String,
	phone String,
	linkedin String,
	position String,
	company String,
	company_phone String,
	website String,
	domain String,
	facebook String,
	twitter String,
	linkedin_company_page String,
	country String,
	state String,
	file_id UInt64,
	created_at DateTime DEFAULT now(),

	name_lc String MATERIALIZED lowerUTF8(name),
	email_lc String MATERIALIZED lowerUTF8(email),
	linkedin_lc String MATERIALIZED lowerUTF8(linkedin),
	position_lc String MATERIALIZED lowerUTF8(position),
	company_lc String MATERIALIZED lowerUTF8(company),
	website_lc String MATERIALIZED lowerUTF8(website),
	domain_lc String MATERIALIZED lowerUTF8(domain),
	facebook_lc String MATERIALIZED lowerUTF8(facebook),
	twitter_lc String MATERIALIZED lowerUTF8(twitter),
	linkedin_company_page_lc String MATERIALIZED lowerUTF8(linkedin_company_page),
	country_lc String MATERIALIZED lowerUTF8(country),
	state_lc String MATERIALIZED lowerUTF8(state),

	INDEX idx_name name_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
	INDEX idx_email email_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
	INDEX idx_company company_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
	INDEX idx_position position_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
	INDEX idx_domain domain_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
	INDEX idx_linkedin linkedin_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1,
	INDEX idx_state state_lc TYPE ngrambf_v1(3, 256, 2, 0) GRANULARITY 1
) ENGINE = MergeTree
ORDER BY (created_at, email_lc)
SETTINGS index_granularity = 8192;
