# NexusDo — Production Deployment Guide

Deploy the NestJS backend + Next.js frontend on a Ubuntu/Debian VPS with Nginx, PM2, and PostgreSQL.

## Architecture

- **Backend** — NestJS REST API, runs on port `3001`
- **Frontend** — Next.js 16 (standalone), runs on port `3000`
- **Database** — PostgreSQL (Neon cloud or self-hosted)
- **Telegram Bot** — Optional, enabled when `TELEGRAM_BOT_TOKEN` is set
- **Reverse Proxy** — Nginx on port 80/443
- **Process Manager** — PM2 keeps both apps alive

```
Browser -> Nginx :80 -> /api/* -> Backend :3001
                      -> /*    -> Frontend :3000
```

---

## 1. Prerequisites on Your VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git curl

# Install Node.js 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify
node -v   # should be v22.x
npm -v    # should be 10.x
pm2 -v
```

---

## 2. Database (PostgreSQL)

### Option A: Neon (Serverless Cloud)

Your existing `DATABASE_URL` points to Neon. No setup needed — the connection string already works from any IP.

```
DATABASE_URL="postgresql://neondb_owner:...@ep-...aws.neon.tech/neondb?sslmode=require"
```

### Option B: Self-Hosted PostgreSQL on the VPS

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo -u postgres psql
```

```sql
-- Inside psql:
CREATE DATABASE nexusdo;
CREATE USER nexusdo_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE nexusdo TO nexusdo_user;
ALTER DATABASE nexusdo OWNER TO nexusdo_user;
\q
```

Then update your `.env`:

```
DATABASE_URL=postgresql://nexusdo_user:your-strong-password@localhost:5432/nexusdo
```

---

## 3. Clone & Configure

```bash
cd /home
git clone https://github.com/YOUR_USER/NexusDo.git
cd NexusDo
```

### Backend Environment

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```
DATABASE_URL="your-postgres-connection-string"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"   # optional, leave empty to disable
PORT=3001
CORS_ORIGIN="https://your-domain.com"           # use your actual domain
```

### Frontend Environment

```bash
nano frontend/.env.production
```

```
# Browser-side API requests go to /api (same origin via nginx)
NEXT_PUBLIC_API_URL=/api
```

**Important:** `NEXT_PUBLIC_API_URL` must be `/api` so the browser calls the backend through Nginx on the same domain. This avoids CORS issues. If you change it, update `CORS_ORIGIN` in the backend `.env` to match.

---

## 4. Build Both Apps

### Backend

```bash
cd backend
npm ci
npm run build
# dist/ folder is created
cd ..
```

### Frontend

```bash
cd frontend
npm ci
npm run build
# .next/standalone/ folder is created
# Copy static assets into standalone (required for Next.js standalone output)
cp -r .next/static .next/standalone/.next/
# Copy public folder if you have one
cp -r public .next/standalone/ 2>/dev/null || true
cd ..
```

---

## 5. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/nexusdo
```

```nginx
server {
    listen 80;
    server_name your-domain.com;    # change this

    client_max_body_size 10m;

    # API -> NestJS backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Everything else -> Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nexusdo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # remove default on fresh VPS
sudo nginx -t
sudo systemctl reload nginx
```

If you don't have a domain yet, use the server's IP as `server_name`. Set `CORS_ORIGIN` in backend `.env` to `http://YOUR_IP`.

---

## 6. Start with PM2

### Backend

```bash
cd /home/NexusDo/backend
pm2 start dist/src/main.js --name nexusdo-backend --node-args="--enable-source-maps"
pm2 save
```

### Frontend

```bash
cd /home/NexusDo/frontend
PORT=3000 HOSTNAME=0.0.0.0 pm2 start .next/standalone/server.js --name nexusdo-frontend
pm2 save
```

### Auto-start on reboot

```bash
pm2 startup
# Follow the printed instructions (copy-paste the sudo command)
pm2 save
```

### Useful PM2 Commands

```bash
pm2 status                # see running processes
pm2 logs nexusdo-backend   # backend logs
pm2 logs nexusdo-frontend  # frontend logs
pm2 restart all            # restart everything
pm2 delete all             # stop and remove all
```

---

## 7. SSL with Certbot (HTTPS)

Once your domain DNS points to the VPS IP:

```bash
sudo certbot --nginx -d your-domain.com
# Follow prompts, select redirect HTTP->HTTPS
```

Certbot auto-renews. Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

After enabling HTTPS, update `CORS_ORIGIN` in backend `.env` to `https://your-domain.com` and restart the backend with `pm2 restart nexusdo-backend`.

---

## 8. Database Migrations (First Time)

Run this once to create the tables:

```bash
cd /home/NexusDo/backend
npx drizzle-kit push
```

Or if you have migration files in `drizzle/`:

```bash
npx drizzle-kit migrate
```

---

## 9. Update / Redeploy

```bash
cd /home/NexusDo
git pull

# Rebuild backend
cd backend
npm ci
npm run build
pm2 restart nexusdo-backend

# Rebuild frontend
cd ../frontend
npm ci
npm run build
pm2 restart nexusdo-frontend
```

---

## Environment Variables Reference

```
# backend/.env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
TELEGRAM_BOT_TOKEN=123:abc              # optional
PORT=3001                               # default
CORS_ORIGIN=https://your-domain.com     # default: http://localhost:3000

# frontend/.env.production (or set at build time)
NEXT_PUBLIC_API_URL=/api                # default: /api
```

---

## Troubleshooting

**Backend won't start?** Check the database URL is reachable:
```bash
pm2 logs nexusdo-backend
```

**CORS errors in browser?** Make sure `CORS_ORIGIN` matches exactly the URL you access the site from (including `https://`).

**API returns 404?** The nginx config strips `/api/` prefix. Backend routes are at root level: `/tasks`, `/todos`, `/auth/login`, etc.

**PM2 processes crash after reboot?** Run `pm2 save` and `pm2 startup` again.

**Frontend shows blank page?** Verify `.next/standalone/server.js` exists. If not, rebuild: `npm run build`.

**Bot not working?** Make sure `TELEGRAM_BOT_TOKEN` is set in `backend/.env` and you've rebuilt the backend. Check logs: `pm2 logs nexusdo-backend`.

**Port already in use?**
```bash
sudo lsof -i :3000
sudo lsof -i :3001
sudo kill -9 PID
```
