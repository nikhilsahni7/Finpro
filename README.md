# Finpro Deployment (EC2)

## Prereqs

- Ubuntu EC2 with security group allowing 22, 80, 443
- Domain `finpro.nikhilsahni.xyz` A record -> EC2 public IP
- Docker + Docker Compose
- Nginx + certbot
- ClickHouse managed separately; obtain connection details

## Environment

Create `.env` in project root:

```
CH_ADDR=your-clickhouse-host:9000
CH_DATABASE=finpro
CH_USERNAME=youruser
CH_PASSWORD=yourpass
CH_TLS=false
CH_PROTOCOL=native
JWT_SECRET=change-me
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=Finpro <no-reply@finpro.nikhilsahni.xyz>
PUBLIC_BASE_URL=https://finpro.nikhilsahni.xyz
INGEST_MAX_CONCURRENCY=2
```

## Run services (API + Postgres)

```
docker compose pull
docker compose build
docker compose up -d
```

## Nginx + SSL

```
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo tee /etc/nginx/sites-available/finpro.conf >/dev/null <<'CONF'
$(sed -n '1,999p' deploy/nginx/finpro.conf)
CONF
sudo ln -sf /etc/nginx/sites-available/finpro.conf /etc/nginx/sites-enabled/finpro.conf
sudo nginx -t && sudo systemctl reload nginx
# Obtain SSL
sudo certbot --nginx -d finpro.nikhilsahni.xyz --non-interactive --agree-tos -m you@example.com
```

## Verify

- API: `curl -I https://finpro.nikhilsahni.xyz/healthz`
- Login from frontend using `VITE_API_URL=https://finpro.nikhilsahni.xyz`

## CORS

- Backend allows origins via `CORS_ORIGINS` env (comma-separated). For production frontend domain, set:

```
CORS_ORIGINS=https://finpro.nikhilsahni.xyz
```

## Uploads Storage

- Uploads mounted at `/data/uploads` inside API container; persisted in the `uploads` volume.
- Nginx `client_max_body_size 2g` is set to allow large CSVs.

## ClickHouse

- Ensure `backend/internal/ch/schema.sql` executed in your ClickHouse cluster.
- High-latency mitigation: increase server resources or tune CH settings.

## One-command deploy (updates + restart)

```
# on EC2 at /home/ubuntu/finpro
git pull
docker compose build --no-cache
docker compose up -d
sudo nginx -t && sudo systemctl reload nginx
```

## PM2 (optional, if running binary instead of Docker)

If you build the Go binary outside Docker and run directly:

```
# Build
cd backend && go build -o finpro-api ./cmd/api
# PM2
sudo npm i -g pm2
pm2 start ./finpro-api --name finpro-api --update-env -- \
  PG_DSN=postgres://postgres:postgres@127.0.0.1:5432/finpro?sslmode=disable \
  CH_ADDR=$CH_ADDR CH_DATABASE=$CH_DATABASE CH_USERNAME=$CH_USERNAME CH_PASSWORD=$CH_PASSWORD \
  JWT_SECRET=$JWT_SECRET PUBLIC_BASE_URL=https://finpro.nikhilsahni.xyz RESEND_API_KEY=$RESEND_API_KEY RESEND_FROM_EMAIL="$RESEND_FROM_EMAIL"
pm2 save
```

## Troubleshooting

- 502 from Nginx: check `docker logs finpro-api` and `journalctl -u nginx`.
- CORS blocked: set `CORS_ORIGINS` env to your frontend origin.
- Upload timeouts: ensure Nginx timeouts and `client_max_body_size` are applied; verify ClickHouse network.
