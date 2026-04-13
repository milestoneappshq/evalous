# Deployment Guide: Evalous on InterWorx (EL9)

This guide is optimized for an **Enterprise Linux 9 (EL9)** environment (AlmaLinux 9 / Rocky Linux 9) managed by **InterWorx/SiteWorx**. It leverages our professional `deploy.sh` script for atomic builds and persistence.

---

## 🏗️ Step 1: Server Preparation

### 1. Node.js on EL9
Ensure Node.js 20+ is installed on the server (Root access required once):
```bash
sudo dnf module enable nodejs:20 -y
sudo dnf install nodejs -y
```

### 2. Install PM2 (Process Manager)
PM2 will keep the app running and restart it if the server reboots:
```bash
sudo npm install -p pm2 -g
```

---

## 🚀 Step 2: SiteWorx Deployment

1.  **SSH into the Server** as your SiteWorx user (`evalous`).
2.  **Clone/Upload the Code**:
    ```bash
    cd /home/evalous/evalous.milestoneapps.com/html
    # Clone your repo here or upload via SFTP
    ```
3.  **Configure Environment Variables**:
    Create the `.env` file in the root directory:
    ```bash
    nano .env
    ```
    Paste your Supabase credentials (`DATABASE_URL`, `DIRECT_URL`) and the `AUTH_SECRET`. 

4.  **Execute the One-Click Deploy**:
    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```
    This script will:
    - Create a persistent data folder at `~/evalous_data/`.
    - Symlink it to `public/uploads`.
    - Sync the database schema to Supabase.
    - Build and launch the app via PM2.

---

## 🌐 Step 3: Apache Reverse Proxy

SiteWorx uses Apache on port 80/443. We need to proxy traffic to our Next.js app on port 3000.

1.  Log in to **SiteWorx Control Panel**.
2.  Go to **Hosting Features** > **Web Server** > **Apache Directives**.
3.  Paste the following at the bottom of the VirtualHost config:

```apache
ProxyRequests Off
ProxyPreserveHost On
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

4.  **SSL**: Go to **Hosting Features** > **SSL Certificates** and enable **Let's Encrypt** for `evalous.milestoneapps.com`.

---

## 🛡️ Maintenance & Logs
*   **Check Logs**: `pm2 logs evalous-app`
*   **Monitor App**: `pm2 monit`
*   **Redeploy**: Simply run `./deploy.sh` inside the folder whenever you push new code.

---
*Status: Professional Cloud-Hybrid Deployment Guide Finalized.*
