# Deploying AAS Leathers on Hostinger (Business plan)

Three pieces, deployed independently:

| Piece | Where | URL |
|---|---|---|
| Storefront (`web/`, static export) | `public_html` of your domain | `https://yourdomain.com` |
| API (`server/`, Node.js app) | hPanel Node.js app on a subdomain | `https://api.yourdomain.com` |
| Database | MongoDB Atlas (free M0) | connection string |

Keeping the API on a **subdomain of the same domain** matters: the login
cookie is `SameSite=Lax`, which works across subdomains of one domain but
not across unrelated domains. No code changes needed with this layout.

---

## 1. Database — MongoDB Atlas (10 min)

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and a free
   **M0 cluster** (pick a Mumbai/Singapore region for Indian customers).
2. Database Access → add a database user (username + strong password).
3. Network Access → "Allow access from anywhere" (0.0.0.0/0) — shared
   hosting has no fixed IP.
4. Copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/aas-leathers`

## 2. API — hPanel Node.js app (15 min)

1. hPanel → **Domains → Subdomains** → create `api.yourdomain.com`.
2. hPanel → **Website → Node.js** (Application Manager) → Create application:
   - Application root: upload the `server/` folder (zip it, upload via File
     Manager, extract) — everything except `node_modules`.
   - Startup file: `src/server.js`
   - Node version: 20+
3. Set **environment variables** in the app settings:

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | the Atlas string from step 1 |
   | `JWT_ACCESS_SECRET` | long random string¹ |
   | `JWT_REFRESH_SECRET` | different long random string¹ |
   | `CLIENT_URL` | `https://yourdomain.com` |
   | `SMTP_URL` | *(optional, for real emails)* `smtps://user:pass@smtp.hostinger.com:465` |
   | `MAIL_FROM` | `AAS Leathers <orders@yourdomain.com>` |

   ¹ Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

4. Run `npm install` from the app panel (production deps only — the
   in-memory dev database is a devDependency and won't be installed).
5. Start the app, then open `https://api.yourdomain.com/api/health` —
   you should see `{"ok":true,"service":"aas-leathers-api"}`.
   First start seeds the 11-product catalog into Atlas automatically.

> Hostinger's Node.js runner proxies your app; it provides `PORT` itself,
> which the server already reads. If SMTP is unset, order emails are logged,
> not sent.

## 3. Storefront — static upload (10 min)

1. On your PC, build the export with the API URL baked in:

   ```powershell
   cd "C:\Sham\Project\AAS leathers\web"
   $env:NEXT_PUBLIC_API_URL = "https://api.yourdomain.com/api"
   npm run build
   ```

2. The finished site is the **contents of the `out/` folder** (~5 MB,
   includes a ready `.htaccess`). Zip the contents (not the folder itself).
3. hPanel → **File Manager** → open `public_html` → delete the default
   files → upload the zip → extract → done.
4. Visit `https://yourdomain.com` — enable SSL in hPanel if not already on
   (Business plans include it free).

## 4. Smoke test in production

- Home page loads with images and animations.
- Register an account → land on the account page.
- Add a piece to the cart → checkout → place order → order number appears.
- Account page lists the order; "Download Invoice" saves a PDF.
- Data survives an API restart (it's in Atlas now, not in memory).

## Redeploying after changes

- **Frontend change:** rebuild locally (step 3.1) and re-upload `out/`.
- **API change:** re-upload the changed `server/src` files and restart the
  app from hPanel.

## Before treating it as a real store

- Replace hot-linked Unsplash photos with your own product photography
  (Cloudinary is the planned home for them).
- Add email verification (today, guest orders are claimable by whoever
  registers that email address).
- Razorpay integration (planned last) — until then orders record payment
  as "pending".
