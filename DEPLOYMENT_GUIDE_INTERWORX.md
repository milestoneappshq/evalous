# Deployment Guide: Evalous on InterWorx (EL9)

This guide is tailored for an **Enterprise Linux 9 (EL9)** environment (AlmaLinux 9 / Rocky Linux 9) managed by **InterWorx/SiteWorx**, using **Apache** as the web server and **Supervisord** as the process manager.

## 🏗️ Environment Prerequisites

### 1. Node.js on EL9
LiquidWeb's EL9 environment may not have Node.js installed by default. Install it for all users via `dnf`:
```bash
sudo dnf module enable nodejs:18 -y
sudo dnf install nodejs -y
```

### 2. PostgreSQL (Database)
InterWorx usually bundles MariaDB. Since **Evalous** requires PostgreSQL, you'll need to install it:
```bash
sudo dnf install postgresql-server postgresql-contrib -y
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
```
*Alternatively, use a managed database like [Supabase](https://supabase.com) or [Neon](https://neon.tech) and use their connection string.*

---

## 🚀 Step 1: SiteWorx Service Configuration

Create a new SiteWorx account for `evalous.yourdomain.com`.
The app will reside in `/home/[user]/evalous.yourdomain.com/`.

1.  **SSH as the Siteworx User**.
2.  **Clone the Repository**:
    ```bash
    cd /home/[user]/evalous.yourdomain.com/
    git clone <your-repo> .
    npm install
    ```
3.  **App Configuration**:
    Create the `.env.production` file:
    ```bash
    cp .env.example .env.production
    nano .env.production
    ```
    Ensure `NEXTAUTH_URL` is set to `https://evalous.yourdomain.com`.

---

## 🛠️ Step 2: Build & Database Initialization

Generate the Prisma client and build the Next.js production bundle:
```bash
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run build
```

---

## ⚙️ Step 3: Supervisord Process Configuration

Since **Evalous** is a Node.js app, we need **Supervisord** to keep it running in the background.

Create a new config file as **root**:
```bash
sudo nano /etc/supervisord.d/evalous.ini
```

**Insert the following configuration**:
```ini
[program:evalous]
directory=/home/[user]/evalous.yourdomain.com/
command=npm start
user=[user]
autostart=true
autorestart=true
stderr_logfile=/var/log/evalous.err.log
stdout_logfile=/var/log/evalous.out.log
environment=NODE_ENV="production",PORT="3000"
```

**Restart Supervisord**:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status evalous
```

---

## 🌐 Step 4: Apache Reverse Proxy (.htaccess)

Since Apache is the primary web server on port 80/443, we need to proxy traffic to the Node.js process on port 3000. 

**Recommended**: Use the `.htaccess` file in your `html` directory or the SiteWorx Apache Directives.

Create/Edit `/home/[user]/evalous.yourdomain.com/html/.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

ProxyPassReverse / http://127.0.0.1:3000/
ProxyPreserveHost On
```

> [!IMPORTANT]
> Ensure **mod_proxy** and **mod_proxy_http** are enabled in Apache. On EL9, this is standard, but you may need to check `/etc/httpd/conf.modules.d/`.

---

## 🔐 SSL & Security
- **SiteWorx Let's Encrypt**: Use the built-in SiteWorx tool to generate an SSL certificate for your domain. 
- **Firewall**: Ensure port 3000 is NOT exposed to the public; only Apache should access it locally.

---
*Status: Specialized InterWorx Configuration Finalized.*
