# HEAT  Backend & Infrastructure

I built this backend using _Node.js (Express 5)_ and raw _MySQL 8_ without any ORM (like Prisma or Drizzle) or BaaS (like Supabase or Firebase). I wanted to write every query, transaction, auth check, and server config myself to understand how production systems actually work.

It runs on an unmanaged Ubuntu VPS on Hetzner that I set up and maintain myself.

### Quick Navigation

- [Architecture & Request Flow](#architecture--request-flow)
- [Database & Query Highlights](#database--query-highlights)
- [Auth & Security Choices](#auth--security-choices)
- [Hetzner VPS & Production Setup](#hetzner-vps--production-setup)
- [Run Locally](#run-locally)

---

## Architecture & Request Flow

- **Express 5:** Uses Express 5.2 for native async error handling (no try/catch wrapper boilerplate needed around async route handlers).
- **Same-Origin Reverse Proxy:** Nginx receives all HTTPS traffic on port 443. Requests starting with `/api/` get proxied internally to Node running on `127.0.0.1:3000`. This allows the browser to automatically include HTTP-only cookies without dealing with third-party cookie restrictions.
- **In-Process Cron:** A `node-cron` job ([`jobs/subscriptionCron.js`](jobs/subscriptionCron.js)) runs daily at midnight UTC to process recurring subscription renewals inside an ACID database transaction.

---

## Database & Query Highlights

- **No ORM / Raw Queries:** All queries use `mysql2/promise` with a connection pool.
- **Database-Level Aggregation:** Spending category totals and payment method breakdowns are calculated directly in MySQL using `GROUP BY`, `SUM()`, and `COUNT()` instead of sending thousands of rows to the frontend for JavaScript to process.
- **Atomic Balance Updates:** When editing a spending or subscription, the client sends both `currentAmount` and `amount`. Since this is a personal finance tracker, tampering only affects the user's own numbers. This design choice lets me calculate the balance delta directly in a single `UPDATE` query without locking the row with an extra `SELECT FOR UPDATE`.
- **Transactions for Recurring Bills:** When a subscription renews, the daily cron ([`jobs/subscriptionCron.js`](jobs/subscriptionCron.js)) wraps the next billing date update, spending record insertion, and user balance deduction inside a single MySQL transaction (`START TRANSACTION` / `COMMIT`) with automatic rollback on error.

---

## Auth & Security Choices

- **HTTP-Only Cookies:** JWTs are stored in an `httpOnly` cookie (`access_token`) with `sameSite: 'lax'` and `secure: true` in production, protecting auth tokens from XSS theft.
- **Timing Attack Prevention:** When someone tries to log in with an email that doesn't exist, the server still runs a dummy `bcrypt.compare()` against a dummy hash. The response time remains consistent so attackers can't enumerate valid email accounts.
- **Instant Token Revocation:** JWTs contain an `iat` (issued-at) timestamp. Whenever a user logs out or changes their password, the database updates `logged_out_at` or `password_changed_at`. The auth middleware checks this on every request, immediately invalidating old tokens even before their 7-day expiration.
- **Rate Limiting:** Auth routes are capped at 50 requests per 15 minutes, and email triggers (verification / password reset) are capped at 10 requests per hour.

---

## Hetzner VPS & Production Setup

- **Server:** Unmanaged Ubuntu 24.04 LTS VPS on Hetzner Cloud.
- **SSH Hardening:** Key-only authentication (Ed25519), password authentication disabled, and direct root login disabled.
- **UFW Firewall:** Only ports `22` (SSH), `80` (HTTP), and `443` (HTTPS) are exposed. MySQL (`3306`) and the Node app (`3000`) are bound strictly to `127.0.0.1`.
- **Process Supervisor:** `systemd` manages the Node service (`heat.service`), ensuring automatic restarts on failure and zero-downtime boots.
- **Automated Backups:** A nightly cron runs [`scripts/backup.sh`](../scripts/backup.sh) at 03:00 UTC. It dumps MySQL with `--single-transaction`, compresses it, applies a 14-day retention policy, and sends an alert email via Resend if the backup fails.

---

## Run Locally

### 1. Database setup

```bash
# Create database and import tables from schema.sql
mysql -u root -p -e "CREATE DATABASE heat;"
mysql -u root -p heat < schema.sql
```

### 2. Install & start

```bash
# Create your .env file from the template (.env.example)
cp .env.example .env

# Install dependencies and start development server
npm install
npm run dev
```

---

## Other Docs

- ⚙️ [**Root README (Project Overview)**](../README.md)
- 📖 [**API Documentation**](../docs/api.md)
- 💻 [**Frontend README**](../client/README.md)
