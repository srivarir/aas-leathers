# Deploying AAS Leathers on Hostinger

Both apps run on your existing Hostinger plan — the storefront as a **Web App**
(Next.js is explicitly supported) and the API as a **Node.js app**. Only the
database lives elsewhere, on MongoDB Atlas's free tier.

| Piece | Folder | Where it goes | Cost |
|---|---|---|---|
| Storefront (Next.js) | `web/` | Hostinger **Web App** → `yourdomain.com` | included |
| API (Express) | `server/` | Hostinger **Node.js app** → `api.yourdomain.com` | included |
| Database (MongoDB) | — | **MongoDB Atlas** free (M0) | ₹0 |

## Why this is better than the Vercel + Render setup

- **Nothing sleeps.** No 30–50s cold start for your client's visitors.
- **Email just works.** Hostinger allows SMTP, so Gmail/Hostinger mail sends
  normally — no Brevo workaround needed.
- **Uploaded product photos persist.** Hostinger has a real disk, unlike
  Render's free tier which wipes uploads on every redeploy. This removes the
  urgency of moving images to Cloudinary.
- **Commercially clean.** No non-commercial licensing question.
- **₹0 extra** — you already pay for the plan.

---

## Part 0 — Database (MongoDB Atlas, free)

Hostinger doesn't offer MongoDB, so the database stays in the cloud.

1. Sign up at <https://www.mongodb.com/cloud/atlas>, create a **free M0
   cluster** (Mumbai region).
2. **Database Access** → add a user (note the password).
3. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Connect → Drivers** → copy the connection string, insert your password:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/aas-leathers
   ```

   That is your `MONGODB_URI`.

---

## Part 1 — The API (Express) on a subdomain

1. hPanel → **Domains → Subdomains** → create `api.yourdomain.com`.
2. hPanel → **Website → Node.js** → create an application on that subdomain:
   - **Startup file:** `src/server.js`
   - **Node version:** 20 or newer
   - **Application root:** where you put the `server/` folder
3. Get the code there — either connect the GitHub repo (preferred, so updates
   are a pull) or upload the `server/` folder via File Manager. **Do not
   upload `node_modules` or `.env`.**
4. Add the **environment variables** (see the reference table below).
5. Run **npm install**, then **Start**.
6. Check `https://api.yourdomain.com/api/health` → `{"ok":true,...}`.
   The catalogue and admin account seed themselves on first boot.

---

## Part 2 — The storefront (Next.js) as a Web App

1. hPanel → **Web Apps** → create an app on `yourdomain.com`, pointing at the
   `web/` folder (or the GitHub repo with `web` as the root directory).
2. It must run in **server mode** — build `npm run build`, start `npm start`.
   This is required: it is what gives products added in the admin their own
   working pages.
3. Set one environment variable:

   ```
   NEXT_PUBLIC_API_URL = https://api.yourdomain.com/api
   ```

4. Deploy, then open `https://yourdomain.com`.

> **Confirmed supported.** Hostinger documents Next.js as a server-side Node.js
> framework on Business hosting, running as a **persistent server process**
> (unlike static React/Vite deployments). That is exactly what this site needs,
> so no change to the app is required.
>
> If the build runs out of memory on the server, build locally instead
> (`npm run build` in `web/`) and upload the project including the generated
> `.next` folder, then just run the start command.

---

## Part 3 — Introduce them

On the **API**, set `CLIENT_URL = https://yourdomain.com` and restart. This is
what lets the browser call the API (CORS) and keeps logins working.

---

## Part 4 — Smoke test

- Home, shop and a product page load with images.
- Register → the verification email arrives (real email).
- Add to cart → checkout → in the Razorpay window choose **UPI** and enter
  `success@razorpay` → order confirms and appears in your account.
  (Use `failure@razorpay` to test a failed payment.)

  > Do not test with `4111 1111 1111 1111`. Razorpay treats it as an
  > **international** card, and Indian accounts have international payments
  > disabled by default — you will get "International cards are not
  > supported". That is the correct setting for a store selling in India.
  > For card testing, use a current **domestic** test card from Razorpay's
  > own Test Card Details documentation.
- Sign in at `/admin` with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Add a product in the admin → it appears in shop, search, and prices
  correctly at checkout.

---

## Environment variables

Set these on the **API** (Node.js app):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas string |
| `CLIENT_URL` | `https://yourdomain.com` |
| `JWT_ACCESS_SECRET` | long random string¹ |
| `JWT_REFRESH_SECRET` | a **different** long random string¹ |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your first admin login |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | your mailbox |
| `MAIL_FROM` | `AAS Leathers <orders@yourdomain.com>` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | test keys now, live later |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloudname` — see below |

¹ Generate with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

On the **storefront** (Web App): `NEXT_PUBLIC_API_URL` only.

> Tip: create a real mailbox (`orders@yourdomain.com`) in hPanel → Emails and
> use Hostinger's SMTP, so customers stop seeing a personal Gmail address.

---

## Product photos (Cloudinary — required on any PaaS)

Uploaded photos are written to the API's own disk **only when Cloudinary is not
configured**. That is fine on Hostinger, which has a real disk, but on Render,
Railway, Fly and most other PaaS free tiers the filesystem is **ephemeral**:
every restart or redeploy deletes `server/uploads/`, so the catalogue keeps the
image URL while the file behind it 404s. A restart is not rare — Render's free
tier also spins down after 15 minutes of inactivity.

To store photos off the server instead:

1. Sign up free at <https://cloudinary.com> (25 GB storage + 25 GB/month
   bandwidth, no card).
2. **Dashboard** → copy the **API environment variable**, which looks like
   `cloudinary://123456789:abcXYZ@your-cloud-name`.
3. Set it on the **API** as `CLOUDINARY_URL` and restart.

That is the whole change — no code edit. The server logs a warning at boot if it
is running in production without it. Uploads then land in the
`aas-leathers/products` folder on Cloudinary with random filenames, and survive
every redeploy and host move.

> Photos uploaded *before* Cloudinary was configured are gone for good — the
> files were deleted with the old filesystem. Re-upload them in the admin
> (**Products → Edit**) once the variable is set.

---

## Redeploying later

- **Code change:** push to GitHub and pull/redeploy the affected app. The
  storefront must be rebuilt (`npm run build`) for its changes to show.
- **Careful:** if you are *not* using Cloudinary, do not delete
  `server/uploads/` when updating the API — that is where product photos live.

---

## Before real customers

- Switch Razorpay to **Live** keys (needs the client's business KYC).
- Replace the hot-linked Unsplash photos with the client's own product images.
- Fill the bracketed placeholders in Privacy / Terms / Data & Compliance
  (legal entity, GSTIN, grievance officer) and have them reviewed.
- Set up a backup routine for the Atlas database (the free tier has none).
