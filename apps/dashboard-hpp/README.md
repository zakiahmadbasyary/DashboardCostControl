# Panduan Hosting & Deployment Dashboard HPP (Monorepo)

Dokumen ini berisi panduan alur langkah demi langkah untuk mempublikasikan (*deploy*) aplikasi **Dashboard HPP** di server VPS yang menggunakan arsitektur **Monorepo (Turborepo + PM2)**.

---

## 1. Pemahaman Arsitektur (PM2 vs Database)

- **PM2**: Berguna sebagai *Process Manager* khusus untuk menjalankan aplikasi **Node.js / Next.js** (seperti `portal`, `admin`, `dashboard-wip`, dan `dashboard-hpp`) di background (*daemonized*) agar otomatis *restart* apabila VPS reboot atau mengalami crash.
- **Database (PostgreSQL)**: Berjalan sebagai *System Service OS* tersendiri di VPS (misal via `systemctl start postgresql` atau kontainer *Docker*), **bukan** di dalam PM2.

---

## 2. Langkah-Langkah Deployment di VPS

### **A. Update Source Code & Environment**
1. Masuk ke SSH server VPS Anda.
2. Pindah ke direktori root monorepo di VPS (misal: `/var/www/dashboard-platform`).
3. Tarik pembaruan kode terbaru dari Git:
   ```bash
   git pull origin feature/dashboard-hpp
   ```
4. Pastikan file `.env` di VPS (`apps/dashboard-hpp/.env` atau `.env` root) sudah diatur dengan `DATABASE_URL` PostgreSQL VPS:
   ```env
   DATABASE_URL="postgresql://user_db:password_db@localhost:5432/nama_database_hpp?schema=public"
   ```

---

### **B. Install Dependencies & Migrasi Database**
1. **Install dependensi terbaru:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client untuk Dashboard HPP:**
   ```bash
   npx prisma generate --schema=apps/dashboard-hpp/prisma/schema.prisma
   ```

3. **Migrasi Schema ke Database VPS:**
   ```bash
   npx prisma db push --schema=apps/dashboard-hpp/prisma/schema.prisma
   ```
   *(Opsional)* Pengisian data awal (*seeding*):
   ```bash
   npx prisma db seed --schema=apps/dashboard-hpp/prisma/schema.prisma
   ```

4. **Build Khusus Aplikasi Dashboard HPP:**
   Menggunakan Turborepo filter agar tidak me-rebuild aplikasi monorepo lainnya:
   ```bash
   npx turbo build --filter=dashboard-hpp
   ```

---

### **C. Menjalankan Aplikasi dengan PM2**

Aplikasi `dashboard-hpp` secara bawaan berjalan pada **Port 3002** (`next start -p 3002`).

#### **Opsi 1: Command PM2 Langsung**
Jalankan dari root monorepo:
```bash
pm2 start "npm run start --workspace=apps/dashboard-hpp" --name "dashboard-hpp"
```

#### **Opsi 2: Menggunakan Configuration File `ecosystem.config.js`**
Tambahkan konfigurasi `dashboard-hpp` ke file `ecosystem.config.js` di root monorepo:

```javascript
module.exports = {
  apps: [
    {
      name: "portal",
      script: "npm",
      args: "run start --workspace=apps/portal",
      env: { PORT: 3000, NODE_ENV: "production" }
    },
    {
      name: "admin",
      script: "npm",
      args: "run start --workspace=apps/admin",
      env: { PORT: 3001, NODE_ENV: "production" }
    },
    {
      name: "dashboard-wip",
      script: "npm",
      args: "run start --workspace=apps/dashboard-wip",
      env: { PORT: 3005, NODE_ENV: "production" }
    },
    {
      name: "dashboard-hpp",
      script: "npm",
      args: "run start --workspace=apps/dashboard-hpp",
      env: { PORT: 3002, NODE_ENV: "production" }
    }
  ]
};
```

Jalankan & simpan status PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

### **D. Konfigurasi Reverse Proxy Nginx**

Arahkan Nginx di VPS ke port local `3002`.

Contoh blok konfigurasi Nginx (`/etc/nginx/sites-available/default`):

```nginx
server {
    server_name hpp.domain-anda.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reload service Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 3. Cheat Sheet Ringkasan Command Deploy VPS

```bash
# 1. Update Code
git pull origin feature/dashboard-hpp
npm install

# 2. Sync Database & Generate Prisma
npx prisma generate --schema=apps/dashboard-hpp/prisma/schema.prisma
npx prisma db push --schema=apps/dashboard-hpp/prisma/schema.prisma

# 3. Build Turborepo
npx turbo build --filter=dashboard-hpp

# 4. Running PM2 Process
pm2 start "npm run start --workspace=apps/dashboard-hpp" --name "dashboard-hpp"
pm2 save
```
