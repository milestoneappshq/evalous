# Deployment Guide: Hosting Evalous on a Linux VPS

This guide provides a professional, production-ready workflow for deploying the **Evalous** platform on a Linux VPS (Ubuntu 22.04+ recommended).

## 🛠️ Infrastructure Prerequisites

Ensure your VPS has the following installed:
- **Node.js**: v18.17.0 or higher
- **PostgreSQL**: v14 or higher (or a managed database like Supabase/Neon)
- **Git**: For cloning the repository
- **Nginx**: As a reverse proxy
- **PM2**: To keep the Node.js process alive

---

## 1. Initial Server Setup

Update your system and install fundamental dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib
```

Install Node.js (via NodeSource):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

---

## 2. Environment Configuration

Clone your repository to the `/var/www/` directory and set up your environment variables:

```bash
cd /var/www
git clone <your-repo-url> evalous
cd evalous
npm install
```

Create a `.env.production` file:
```bash
nano .env.production
```

> [!IMPORTANT]
> Ensure your production environment variables are configured correctly for Auth and Database:
> ```env
> DATABASE_URL="postgresql://user:password@localhost:5432/evalous?schema=public"
> NEXTAUTH_SECRET="your-random-secret-here"
> NEXTAUTH_URL="https://evalous.com"
> EMAIL_SERVER_HOST="smtp.provider.com"
> EMAIL_SERVER_PORT=587
> EMAIL_SERVER_USER="user@evalous.com"
> EMAIL_SERVER_PASSWORD="password"
> EMAIL_FROM="noreply@evalous.com"
> ```

---

## 3. Database & Build Process

Run the Prisma migrations and build the Next.js application:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to the production database
npx prisma migrate deploy

# Run the seed script if this is a fresh setup
npm run prisma:seed

# Build the production bundle
npm run build
```

---

## 4. Process Management (PM2)

Start the application using PM2 to ensure it restarts automatically if the server reboots:

```bash
pm2 start npm --name "evalous" -- start
pm2 save
pm2 startup
```

---

## 5. Nginx Reverse Proxy (SSL)

Configure Nginx to route traffic from port 80/443 to your Next.js app (default port 3000).

Create a new Nginx config:
```bash
sudo nano /etc/nginx/sites-available/evalous
```

Insert the following configuration:
```nginx
server {
    listen 80;
    server_name evalous.com www.evalous.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/evalous /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 🔐 SSL with Certbot
Install Certbot to enable HTTPS automatically:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d evalous.com -d www.evalous.com
```

---

## 🚀 Post-Deployment Verification

1.  **Check Status**: `pm2 status evalous`
2.  **View Logs**: `pm2 logs evalous`
3.  **App Health**: Navigate to `https://evalous.com` and verify the Evaluate Landing page loads.
4.  **Auth**: Test the Candidate Login and Org Dashboard flows.

---
*Status: Ready for Production.*
