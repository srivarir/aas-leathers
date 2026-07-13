# Deploying AAS Leathers

This guide takes the store from your laptop to the internet — **twice**:

- **Scenario A — no domain (client showcase):** live on free URLs like
  `aas-leathers.vercel.app`. ~30 minutes, ₹0.
- **Scenario B — your real domain:** the same deployment, re-pointed at
  `aasleathers.in` (or whatever you buy). ~15 more minutes, later.

The clever part: **you don't redeploy for Scenario B.** You deploy once on free
URLs, show your client, and when the domain is ready you just attach it and
update a couple of settings.

---

## How the app is shaped

Three independent pieces, each hosted on a service that suits it best:

| Piece | Folder | Hosted on | Free? |
|---|---|---|---|
| Storefront + admin (Next.js) | `web/` | **Vercel** | Yes |
| API (Express) | `server/` | **Render** | Yes |
| Database (MongoDB) | — | **MongoDB Atlas** | Yes (M0) |

All three have generous free tiers and give you a public HTTPS URL with no
domain required. Everything auto-redeploys when you push to GitHub.

> **Why not Hostinger?** Your Business plan *can* run Node apps, but a Next.js
> server app is finicky there. Vercel is purpose-built for Next.js and free, and
> Render runs the API with one click. When you buy a domain (likely via
> Hostinger), you just point its DNS at Vercel/Render — covered in Scenario B.

---

# Part 0 — One-time setup (do this once)

### 0.1 Put the code on GitHub

The project is already a git repo with an initial commit. Create an empty repo
on GitHub (e.g. `aas-leathers`), then from the project folder:

```bash
cd "C:\Sham\Project\AAS leathers"
git remote add origin https://github.com/YOUR_USERNAME/aas-leathers.git
git branch -M main
git push -u origin main
```

> Your `.env` files are git-ignored, so **no secrets are uploaded** — you set
> those directly on Render/Vercel instead.

### 0.2 Create the database (MongoDB Atlas)

1. Sign up at <https://www.mongodb.com/cloud/atlas> and create a **free M0
   cluster** (choose the **Mumbai** region).
2. **Database Access** → add a database user (username + a strong password).
3. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`) — cloud
   hosts don't have a fixed IP.
4. **Connect → Drivers** → copy the connection string and drop your password in.
   It looks like:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/aas-leathers
   ```

   Keep this — it's your `MONGODB_URI`.

---

# Scenario A — Go live without a domain

### A.1 Deploy the API on Render

1. Sign in at <https://render.com> with GitHub.
2. **New → Web Service** → pick your `aas-leathers` repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add **Environment Variables** (Advanced → Add):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas string from 0.2 |
   | `JWT_ACCESS_SECRET` | a long random string¹ |
   | `JWT_REFRESH_SECRET` | a **different** long random string¹ |
   | `CLIENT_URL` | `https://TEMP` (fixed in A.3) |
   | `ADMIN_EMAIL` | your admin login email |
   | `ADMIN_PASSWORD` | a strong admin password |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | your Gmail address |
   | `SMTP_PASS` | your Gmail App Password |
   | `MAIL_FROM` | `AAS Leathers <your@gmail.com>` |
   | `RAZORPAY_KEY_ID` | your `rzp_test_…` key |
   | `RAZORPAY_KEY_SECRET` | your Razorpay test secret |

   ¹ Generate each with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

5. **Create Web Service.** When it finishes, note the URL, e.g.
   `https://aas-leathers-api.onrender.com`.
6. Check `https://aas-leathers-api.onrender.com/api/health` → `{"ok":true,…}`.
   (The catalogue and admin account seed themselves on first boot.)

### A.2 Deploy the storefront on Vercel

1. Sign in at <https://vercel.com> with GitHub → **Add New → Project** → import
   `aas-leathers`.
2. Settings:
   - **Root Directory:** `web`
   - **Framework Preset:** Next.js (auto-detected)
3. Add an **Environment Variable**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://aas-leathers-api.onrender.com/api` |

   (Use *your* Render URL from A.1, with `/api` on the end.)
4. **Deploy.** You'll get a URL like `https://aas-leathers.vercel.app`.

### A.3 Introduce them to each other

The API must trust the storefront's origin (for CORS + the login cookie):

1. Back on **Render → your API → Environment**, set
   `CLIENT_URL = https://aas-leathers.vercel.app` (your real Vercel URL).
2. Save — Render redeploys automatically.

### A.4 Smoke test the live site

Open your Vercel URL and check:

- Home, shop, and a product page load with images.
- Register an account → the verification email arrives (real, via Gmail).
- Add to cart → checkout → pay with test card `4111 1111 1111 1111` (any
  future expiry/CVV) → order confirms and shows in your account.
- Sign in to `/admin` with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

That's it — send the Vercel link to your client.

---

# Scenario B — Attach your real domain

When you've bought the domain (e.g. from Hostinger), no redeploy is needed —
just point DNS and update two settings.

### B.1 Point the storefront domain at Vercel

1. **Vercel → your project → Settings → Domains** → add `yourdomain.com` and
   `www.yourdomain.com`.
2. Vercel shows the DNS records to add. In **Hostinger → DNS Zone Editor** for
   your domain, add them (usually an `A` record for the apex and a `CNAME` for
   `www` pointing to Vercel).

### B.2 Point the API subdomain at Render

1. **Render → your API → Settings → Custom Domains** → add
   `api.yourdomain.com`.
2. In **Hostinger DNS**, add the `CNAME` Render gives you for `api`.

### B.3 Update the environment to the new addresses

| Where | Key | New value |
|---|---|---|
| Render | `CLIENT_URL` | `https://yourdomain.com` |
| Vercel | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api` |

Save on Render (auto-redeploys). On Vercel, **redeploy** so the new API URL is
baked into the build (Deployments → ⋯ → Redeploy).

### B.4 Update Razorpay

When you're ready for **real** payments, switch the Razorpay dashboard to Live
mode, complete KYC, generate **Live** keys, and replace `RAZORPAY_KEY_ID` /
`RAZORPAY_KEY_SECRET` on Render. Keep test keys until then.

Optionally add a webhook: Razorpay Dashboard → Webhooks →
`https://api.yourdomain.com/api/payments/razorpay/webhook`, set a secret, and
add it as `RAZORPAY_WEBHOOK_SECRET` on Render.

---

# Environment variables — full reference

| Key | Needed | Notes |
|---|---|---|
| `NODE_ENV` | prod | `production` |
| `MONGODB_URI` | prod | Atlas connection string |
| `CLIENT_URL` | yes | Storefront origin (CORS + cookie) |
| `JWT_ACCESS_SECRET` | yes | Long random; must differ from refresh |
| `JWT_REFRESH_SECRET` | yes | Long random |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | prod | Creates the first admin on boot |
| `SMTP_HOST/PORT/USER/PASS` | for email | Gmail or any SMTP |
| `MAIL_FROM` | for email | Sender shown to customers |
| `RAZORPAY_KEY_ID` / `_SECRET` | for payments | Test now, Live later |
| `RAZORPAY_WEBHOOK_SECRET` | optional | Enables the webhook |
| `NEXT_PUBLIC_API_URL` | Vercel | API base URL, ending in `/api` |

---

# Things to know before real customers

- **Free-tier cold start.** Render's free API sleeps after ~15 min idle; the
  first request then takes ~30–50s to wake. Fine for a showcase; upgrade
  Render's instance (or add a keep-alive ping) for production.
- **Uploaded images are temporary on Render.** Its disk is wiped on each
  redeploy, so product photos you upload via the admin won't persist. The seed
  catalogue (hosted Unsplash images) is unaffected. Before launch, move uploads
  to **Cloudinary** (a small change — ask me when ready).
- **Redeploys are automatic.** Every `git push` to `main` rebuilds both Vercel
  and Render.
- **Fill in the legal placeholders.** The Privacy/Terms/Data pages contain
  bracketed placeholders (business name, GSTIN, grievance officer) — replace
  them and have a lawyer review before taking real orders.
- **Keep secrets in the dashboards, never in git.** `.env` is git-ignored on
  purpose; production values live only on Render/Vercel.
