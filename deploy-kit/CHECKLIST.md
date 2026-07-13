# AAS Leathers — Go-Live Checklist (Hostinger Business)

Everything is pre-built. Your job is three accounts/forms and two uploads —
about 20 minutes. Do the steps in order.

> The site automatically talks to `api.<your-domain>` — no configuration
> is baked in, so these zips work on any domain unchanged.

---

## ☐ 1. Database — MongoDB Atlas (free), ~8 min

1. Sign up: https://www.mongodb.com/cloud/atlas → create a **free M0 cluster**
   (region: Mumbai).
2. **Database Access** → Add New Database User → username + password
   (write them down).
3. **Network Access** → Add IP Address → **Allow access from anywhere**.
4. **Connect → Drivers** → copy the connection string and put your password
   in it. It looks like:

   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/aas-leathers`

   ✍️ MONGODB_URI = ________________________________________

## ☐ 2. Subdomain, ~2 min

hPanel → **Domains → Subdomains** → create:  `api` . yourdomain.com

## ☐ 3. API app, ~8 min

1. hPanel → **Website → Node.js** → Create application on
   `api.yourdomain.com`:
   - **Startup file:** `src/server.js`
   - **Node version:** 20 or newer
2. Open the app's folder in **File Manager**, upload **`server.zip`**,
   extract it there.
3. In the app's **Environment variables**, add:

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | from step 1 |
   | `JWT_ACCESS_SECRET` | random string A (below) |
   | `JWT_REFRESH_SECRET` | random string B (below) |
   | `CLIENT_URL` | `https://yourdomain.com` |

   Generate the two random strings on your PC (run twice):

   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Click **Install dependencies (npm install)**, then **Start / Restart**.
5. ✅ Check: open `https://api.yourdomain.com/api/health` in a browser —
   you should see `{"ok":true,...}`. The product catalog seeds itself on
   first start.

## ☐ 4. The site, ~4 min

1. hPanel → **File Manager** → open `public_html` → delete the default
   placeholder files.
2. Upload **`site.zip`** → right-click → **Extract** into `public_html`.
3. ✅ Check: open `https://yourdomain.com` — the storefront should load.
   (If SSL isn't active yet: hPanel → Security → SSL → install, it's free.)

## ☐ 5. Two-minute smoke test

- Register an account → you land on "Welcome, …".
- Add a bag to the cart → checkout → place order → order number appears.
- Account page shows the order; **Download Invoice** saves a PDF.

Done — the store is live. 🎉

---

### Later (optional)

- **Real order emails:** add env var
  `SMTP_URL = smtps://orders@yourdomain.com:PASSWORD@smtp.hostinger.com:465`
  (create the mailbox in hPanel → Emails first) and restart the app.
- **Updating the site:** rebuild on your PC (`npm run build` in `web/`),
  re-zip `out/`'s contents, re-upload. API changes: re-upload `src/` into
  the app folder and restart.
- Before real customers: your own product photos, email verification,
  Razorpay (the planned final phase).
