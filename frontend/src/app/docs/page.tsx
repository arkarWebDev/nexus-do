'use client';

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-mono text-sm leading-relaxed">
      <style>{`
        .docs h1 { font-size: 1.5rem; font-weight: 700; margin: 2.5rem 0 0.5rem; letter-spacing: -0.02em; }
        .docs h1:first-child { margin-top: 0; }
        .docs h2 { font-size: 1.15rem; font-weight: 600; margin: 2rem 0 0.35rem; letter-spacing: -0.01em; }
        .docs p { margin: 0.4rem 0; opacity: 0.85; }
        .docs ul, .docs ol { padding-left: 1.25rem; margin: 0.35rem 0; }
        .docs li { margin: 0.2rem 0; opacity: 0.85; }
        .docs code { background: rgba(128,128,128,0.12); padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
        .docs pre { background: rgba(128,128,128,0.08); padding: 0.9em 1em; border-radius: 6px; overflow-x: auto; margin: 0.5rem 0; font-size: 0.85rem; }
        .docs pre code { background: none; padding: 0; }
        .docs hr { border: none; border-top: 1px solid rgba(128,128,128,0.15); margin: 2rem 0; }
        .docs .note { background: rgba(59,130,246,0.08); border-left: 3px solid #3b82f6; padding: 0.6em 1em; border-radius: 0 6px 6px 0; margin: 0.75rem 0; font-size: 0.9em; }
        .docs .warn { background: rgba(234,179,8,0.08); border-left: 3px solid #eab308; padding: 0.6em 1em; border-radius: 0 6px 6px 0; margin: 0.75rem 0; font-size: 0.9em; }
      `}</style>

      <div className="docs">
        <h1>NexusDo — Production Deployment Guide</h1>
        <p>Deploy the NestJS backend + Next.js frontend on a Ubuntu/Debian VPS with Nginx, PM2, and PostgreSQL.</p>

        <hr />

        <h2>Architecture Overview</h2>
        <ul>
          <li><strong>Backend</strong> — NestJS REST API, runs on port <code>3001</code></li>
          <li><strong>Frontend</strong> — Next.js 16 (standalone), runs on port <code>3000</code></li>
          <li><strong>Database</strong> — PostgreSQL (Neon cloud or self-hosted)</li>
          <li><strong>Telegram Bot</strong> — Optional, enabled when <code>TELEGRAM_BOT_TOKEN</code> is set</li>
          <li><strong>Reverse Proxy</strong> — Nginx on port 80/443</li>
          <li><strong>Process Manager</strong> — PM2 keeps both apps alive</li>
        </ul>

        <pre><code>{`Browser -> Nginx :80 -> /api/* -> Backend :3001
                 -> /*    -> Frontend :3000`}</code></pre>

        <hr />

        <h2>1. Prerequisites on Your VPS</h2>
        <pre><code>{`sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git curl

# Install Node.js 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify
node -v   # should be v22.x
npm -v    # should be 10.x
pm2 -v`}</code></pre>

        <hr />

        <h2>2. Database (PostgreSQL)</h2>

        <p>You have two options:</p>

        <h3>Option A: Neon (Serverless Cloud) — already in your .env</h3>
        <p>Your existing <code>DATABASE_URL</code> points to Neon. No setup needed — the connection string already works from any IP.</p>
        <pre><code>{`DATABASE_URL="postgresql://neondb_owner:...@ep-...aws.neon.tech/neondb?sslmode=require"`}</code></pre>
        <div className="note">Neon is already configured. Skip to Step 3 if you&apos;re keeping it.</div>

        <h3>Option B: Self-Hosted PostgreSQL on the VPS</h3>
        <p>If you prefer running your own database:</p>
        <pre><code>{`sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo -u postgres psql`}</code></pre>
        <pre><code>{`-- Inside psql:
CREATE DATABASE nexusdo;
CREATE USER nexusdo_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE nexusdo TO nexusdo_user;
ALTER DATABASE nexusdo OWNER TO nexusdo_user;
\\q`}</code></pre>
        <p>Then update your <code>.env</code>:</p>
        <pre><code>{`DATABASE_URL=postgresql://nexusdo_user:your-strong-password@localhost:5432/nexusdo`}</code></pre>

        <hr />

        <h2>3. Clone &amp; Configure</h2>
        <pre><code>{`cd /home
git clone https://github.com/YOUR_USER/NexusDo.git
cd NexusDo`}</code></pre>

        <h3>Backend Environment</h3>
        <pre><code>{`cp backend/.env.example backend/.env
nano backend/.env`}</code></pre>
        <pre><code>{`DATABASE_URL="your-postgres-connection-string"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"   # optional, leave empty to disable
PORT=3001
CORS_ORIGIN="https://your-domain.com"           # use your actual domain`}</code></pre>

        <h3>Frontend Environment</h3>
        <pre><code>{`nano frontend/.env.production`}</code></pre>
        <pre><code>{`# Browser-side API requests go to /api (same origin via nginx)
NEXT_PUBLIC_API_URL=/api`}</code></pre>

        <div className="warn">
          <strong>Important:</strong> <code>NEXT_PUBLIC_API_URL</code> must be <code>/api</code> so the browser calls the backend through Nginx on the same domain. This avoids CORS issues. If you change it, update <code>CORS_ORIGIN</code> in the backend <code>.env</code> to match.
        </div>

        <hr />

        <h2>4. Build Both Apps</h2>

        <h3>Backend</h3>
        <pre><code>{`cd backend
npm ci
npm run build
# dist/ folder is created
cd ..`}</code></pre>

        <h3>Frontend</h3>
        <pre><code>{`cd frontend
npm ci
npm run build
# .next/standalone/ folder is created
# Copy static assets into standalone (required for Next.js standalone output)
cp -r .next/static .next/standalone/.next/
# Copy public folder if you have one
cp -r public .next/standalone/ 2>/dev/null || true
cd ..`}</code></pre>

        <hr />

        <h2>5. Nginx Configuration</h2>
        <pre><code>{`sudo nano /etc/nginx/sites-available/nexusdo`}</code></pre>
        <pre><code>{`server {
    listen 80;
    server_name your-domain.com;    # change this

    client_max_body_size 10m;

    # API -> NestJS backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
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
}`}</code></pre>

        <pre><code>{`# Enable the site
sudo ln -s /etc/nginx/sites-available/nexusdo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # remove default on fresh VPS
sudo nginx -t
sudo systemctl reload nginx`}</code></pre>

        <div className="note">
          If you don&apos;t have a domain yet, use the server&apos;s IP as <code>server_name</code>. Set <code>CORS_ORIGIN</code> in backend <code>.env</code> to <code>http://YOUR_IP</code>.
        </div>

        <hr />

        <h2>6. Start with PM2</h2>

        <h3>Backend</h3>
        <pre><code>{`cd /home/NexusDo/backend
pm2 start dist/src/main.js --name nexusdo-backend --node-args="--enable-source-maps"
pm2 save`}</code></pre>

        <h3>Frontend</h3>
        <pre><code>{`cd /home/NexusDo/frontend
PORT=3000 HOSTNAME=0.0.0.0 pm2 start .next/standalone/server.js --name nexusdo-frontend
pm2 save`}</code></pre>

        <h3>Auto-start on reboot</h3>
        <pre><code>{`pm2 startup
# Follow the printed instructions (copy-paste the sudo command)
pm2 save`}</code></pre>

        <h3>Useful PM2 Commands</h3>
        <pre><code>{`pm2 status                # see running processes
pm2 logs nexusdo-backend   # backend logs
pm2 logs nexusdo-frontend  # frontend logs
pm2 restart all            # restart everything
pm2 delete all             # stop and remove all`}</code></pre>

        <hr />

        <h2>7. SSL with Certbot (HTTPS)</h2>
        <p>Once your domain DNS points to the VPS IP:</p>
        <pre><code>{`sudo certbot --nginx -d your-domain.com
# Follow prompts, select redirect HTTP->HTTPS`}</code></pre>
        <p>Certbot auto-renews. Verify auto-renewal:</p>
        <pre><code>{`sudo certbot renew --dry-run`}</code></pre>

        <div className="note">
          After enabling HTTPS, update <code>CORS_ORIGIN</code> in backend <code>.env</code> to <code>https://your-domain.com</code> and restart the backend with <code>pm2 restart nexusdo-backend</code>.
        </div>

        <hr />

        <h2>8. Database Migrations (First Time)</h2>
        <p>Run this once to create the tables:</p>
        <pre><code>{`cd /home/NexusDo/backend
npx drizzle-kit push`}</code></pre>
        <p>Or if you have migration files in <code>drizzle/</code>:</p>
        <pre><code>{`npx drizzle-kit migrate`}</code></pre>

        <hr />

        <h2>9. Update / Redeploy</h2>
        <pre><code>{`cd /home/NexusDo
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
pm2 restart nexusdo-frontend`}</code></pre>

        <hr />

        <h2>Environment Variables Reference</h2>
        <pre><code>{`# backend/.env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
TELEGRAM_BOT_TOKEN=123:abc              # optional
PORT=3001                               # default
CORS_ORIGIN=https://your-domain.com     # default: http://localhost:3000

# frontend/.env.production (or set at build time)
NEXT_PUBLIC_API_URL=/api                # default: /api`}</code></pre>

        <hr />

        <h2>Troubleshooting</h2>

        <p><strong>Backend won&apos;t start?</strong> Check the database URL is reachable:</p>
        <pre><code>{`pm2 logs nexusdo-backend`}</code></pre>

        <p><strong>CORS errors in browser?</strong> Make sure <code>CORS_ORIGIN</code> matches exactly the URL you access the site from (including <code>https://</code>).</p>

        <p><strong>API returns 404?</strong> The nginx config strips <code>/api/</code> prefix. Backend routes are at root level: <code>/tasks</code>, <code>/todos</code>, <code>/auth/login</code>, etc.</p>

        <p><strong>PM2 processes crash after reboot?</strong> Run <code>pm2 save</code> and <code>pm2 startup</code> again.</p>

        <p><strong>Frontend shows blank page?</strong> Verify <code>.next/standalone/server.js</code> exists. If not, rebuild: <code>npm run build</code>.</p>

        <p><strong>Port already in use?</strong></p>
        <pre><code>{`sudo lsof -i :3000
sudo lsof -i :3001
sudo kill -9 PID`}</code></pre>
      </div>
    </div>
  );
}
