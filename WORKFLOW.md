# Sociapa Ads Dashboard — End-to-End Workflow Guide

> **Version:** April 2026 | **Stack:** Next.js · MongoDB · bcryptjs · Recharts · Nodemailer

---

## 🔑 Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Super Admin** | `admin` | `sociapa` | Full access — users, integrations, all data |
| Manager | Create via `/users` | Set on creation | View + export + schedule reports |
| Viewer | Create via `/users` | Set on creation | Read-only dashboards |
| Client Portal | Create via `/users` (role = Client) | Set on creation | Client portal only |

> **Quick tip:** The login page shows demo credential shortcuts — click to auto-fill.

---

## 🚀 Step-by-Step: How to Operate the Site

### Step 1 — Start the Dev Server
```bash
cd /Users/divyanshsrivastava/Downloads/ads-dashboard-divyansh
npm run dev
# → Open http://localhost:3000
```

### Step 2 — Login
1. Navigate to `http://localhost:3000/login`
2. Enter `admin` / `sociapa` (or click the demo credential button)
3. Click **Sign In** → redirected to **Analytics Dashboard**

---

### Step 3 — Create a Client
1. Sidebar → **Clients → New Client**
2. Fill in: Company Name, Industry, Contact Email
3. Click **Create Client**

---

### Step 4 — Upload Campaign Data
1. Sidebar → **Campaigns → Upload Excel**
2. Select the client you created
3. Upload an `.xlsx` file (Facebook Ads Manager / Google Ads export format)
4. Columns auto-detected: `Impressions`, `Amount spent (INR)`, `Clicks (all)`, `Platform`, `Reporting starts`

**Sample file format:**
| Reporting starts | Platform | Amount spent (INR) | Impressions | Clicks (all) |
|-----------------|----------|--------------------|-------------|--------------|
| 2026-03-01 | Facebook | 12500 | 450000 | 3200 |

---

### Step 5 — View Analytics
Navigate to **Analytics →**

| Page | URL | What it shows |
|------|-----|---------------|
| Dashboard | `/analytics/dashboard` | Impressions, clicks, CPM, CPC, platform breakdown, line charts |
| ROAS & ROI | `/analytics/roas` | Return on ad spend, revenue estimation, target meter |
| Budget Pacing | `/analytics/budget-pacing` | Live spend vs budget per platform with overspend alerts |
| Cross-Platform Grid | `/analytics/cross-platform` | Side-by-side comparison table — Meta vs Google vs LinkedIn |
| Chart Annotations | `/analytics/annotations` | Add notes to data spikes (e.g., "Holiday sale started") |

---

### Step 6 — Send Email Report
1. Sidebar → **Reports → Email Reports**
2. Select client, enter recipient email
3. Choose period: `weekly` / `monthly`
4. Click **Send Report**

> **Setup needed:** Add `EMAIL_USER` and `EMAIL_PASS` to `.env` for live delivery. In dev mode, the report is logged to the terminal console.

---

### Step 7 — Export PDF Report
1. Sidebar → **Reports → PDF Builder**
2. Select client → Click **Generate PDF**
3. Download branded Sociapa report

> Also reachable from ROAS and Budget Pacing pages via the **📥 Export PDF** button.

---

### Step 8 — Manage Users (Super Admin only)
1. Sidebar → **User Management**
2. Click **New User** → set username, password, role
3. For **Client role** users → link them to a specific client
4. They can then log in at `/client-portal/login` to see **only their own data**

---

### Step 9 — Dark / Light Mode
- Click the 🌙 / ☀️ icon in the **top-right header**
- Preference is saved to `localStorage` — persists across sessions

---

### Step 10 — Monitor Audit Log (Admin/Manager)
- Sidebar → **Audit Log**
- See all logins, uploads, user creation/deletion events
- Filter by action type (LOGIN, CAMPAIGN_UPLOAD, etc.)

---

## 👤 RBAC Role Matrix

| Feature | Super Admin | Manager | Viewer | Client |
|---------|:-----------:|:-------:|:------:|:------:|
| View Analytics Dashboard | ✅ | ✅ | ✅ | ✅ (own only) |
| Upload Campaigns | ✅ | ✅ | ❌ | ❌ |
| Manage Clients | ✅ | ✅ | ❌ | ❌ |
| Send Email Reports | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Audit Log | ✅ | ✅ | ❌ | ❌ |
| Manage Integrations | ✅ | ❌ | ❌ | ❌ |
| Client Portal Access | ❌ | ❌ | ❌ | ✅ |

---

## 🌐 Client Portal (Separate Login)
- URL: `http://localhost:3000/client-portal/login`
- Clients log in with their own credentials
- They see **only** their own campaign data, not other clients

---

## 📋 Environment Variables (`.env`)
```env
MONGODB_URI=mongodb+srv://...
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🔗 All Routes at a Glance
| Route | Description |
|-------|-------------|
| `/` | Home dashboard — KPI cards + quick links |
| `/login` | Admin login |
| `/client-portal/login` | Client-only portal |
| `/analytics/dashboard` | Main analytics with client selector |
| `/analytics/roas` | ROAS & ROI tracking |
| `/analytics/budget-pacing` | Budget pacing + overspend alerts |
| `/analytics/cross-platform` | Cross-platform comparison grid |
| `/analytics/annotations` | Chart annotations |
| `/campaigns/create` | Upload Excel |
| `/campaigns/manual-entry` | Manual data entry |
| `/campaigns/all` | View / delete campaigns |
| `/clients/all` | View all clients |
| `/clients/create` | Create new client |
| `/reports/email` | Send email reports |
| `/reports/scheduled` | Scheduled report manager |
| `/reports/pdf` | PDF builder |
| `/users` | User management (Super Admin) |
| `/audit-log` | Audit log (Admin/Manager) |
| `/notifications` | Notification centre |
| `/search` | Global search |
| `/roadmap` | 30-day sprint roadmap |
