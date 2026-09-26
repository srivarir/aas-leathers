# Deploying AAS Leathers on Hostinger

Both apps run on your existing Hostinger plan — the storefront as a **Web App**
(Next.js is explicitly supported) and the API as a **Node.js app**. Only the
database lives elsewhere, on MongoDB Atlas's free tier.

| Piece | Folder | Where it goes | Cost |
|---|---|---|---|
| Storefront (Next.js) | `web/` | Hostinger **Web App** → `aas-leather-craft-bags.com` | included |
| API (Express) | `server/` | Hostinger **Node.js app** → `api.aas-leather-craft-bags.com` | included |
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

1. hPanel → **Domains → Subdomains** → create `api.aas-leather-craft-bags.com`.
2. hPanel → **Website → Node.js** → create an application on that subdomain:
   - **Startup file:** `src/server.js`
   - **Node version:** 20 or newer
   - **Application root:** where you put the `server/` folder
3. Get the code there — either connect the GitHub repo (preferred, so updates
   are a pull) or upload the `server/` folder via File Manager. **Do not
   upload `node_modules` or `.env`.**
4. Add the **environment variables** (see the reference table below).
5. Run **npm install**, then **Start**.
6. Check `https://api.aas-leather-craft-bags.com/api/health` → `{"ok":true,...}`.
   The catalogue and admin account seed themselves on first boot.

---

## Part 2 — The storefront (Next.js) as a Web App

1. hPanel → **Web Apps** → create an app on `aas-leather-craft-bags.com`, pointing at the
   `web/` folder (or the GitHub repo with `web` as the root directory).
2. It must run in **server mode** — build `npm run build`, start `npm start`.
   This is required: it is what gives products added in the admin their own
   working pages.
3. Set one environment variable:

   ```
   NEXT_PUBLIC_API_URL = https://api.aas-leather-craft-bags.com/api
   ```

4. Deploy, then open `https://aas-leather-craft-bags.com`.

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

On the **API**, set `CLIENT_URL = https://aas-leather-craft-bags.com` and restart. This is
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
| `CLIENT_URL` | `https://aas-leather-craft-bags.com` |
| `JWT_ACCESS_SECRET` | long random string¹ |
| `JWT_REFRESH_SECRET` | a **different** long random string¹ |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your first admin login |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | your mailbox |
| `MAIL_FROM` | `AAS Leathers <orders@aas-leather-craft-bags.com>` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | test keys now, live later |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloudname` — see below |
| `COOKIE_SAMESITE` | `lax` once the API is on `api.aas-leather-craft-bags.com` |
| `NEXT_PUBLIC_SITE_URL` | (storefront) `https://aas-leather-craft-bags.com` |

¹ Generate with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

On the **storefront** (Web App): `NEXT_PUBLIC_API_URL` and
`NEXT_PUBLIC_SITE_URL`. The second one is what canonical links, Open Graph
tags, `robots.txt` and `sitemap.xml` are built from.

> Tip: create a real mailbox (`orders@aas-leather-craft-bags.com`) in hPanel → Emails and
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

## Moving the API off Render

The API runs on Render's free tier. Once `api.aas-leather-craft-bags.com`
exists, move it — the free tier costs three things that matter for a real store:

- **It sleeps.** After 15 minutes idle the next visitor waits 30–50 seconds.
- **It blocks SMTP,** which is why verification and order emails never arrived.
- **Its refresh cookie is third-party,** because the API is on a different
  domain than the store. Safari blocks third-party cookies outright, so on an
  iPhone a page reload signs the customer out. Chrome still allows them, which
  is why this may not have shown up in testing.

All three disappear when the API sits on a subdomain of the store's own domain.

### Step 0 — unbreak the live site first (2 minutes)

The store is already answering on the real domain, but the API still rejects
it, so nothing that needs data works. Do this before anything else, so the site
is healthy while you migrate at your own pace.

On **Render** → the `aas-leathers` service → **Environment** → `CLIENT_URL`:

```
https://aas-leather-craft-bags.com,https://www.aas-leather-craft-bags.com,https://slateblue-goldfinch-352007.hostingersite.com
```

Save, wait for the redeploy, and the live store works again.

### Step 1 — copy the current settings

On Render, open **Environment** and copy every value somewhere safe. You need:

`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
`RAZORPAY_WEBHOOK_SECRET` if you set one.

> **Copy the two JWT secrets exactly.** Generating new ones invalidates every
> refresh token, which signs every customer out the moment you switch over.
>
> **`MONGODB_URI` must be the same Atlas string.** Point the new API at a
> different database and every account, order and product will look deleted.

### Step 2 — get the code onto Hostinger

In hPanel, use the **Git** tool to clone `https://github.com/srivarir/aas-leathers`
(branch `main`) into a directory — for example `/domains/aas-leather-craft-bags.com/api`.

This repository holds both apps, so the Node app's root must point at the
`server` subfolder, not the top of the repo. Never upload `.env` or
`node_modules`; secrets live in the panel and dependencies get installed there.

### Step 3 — create the Node.js application

hPanel → the **Node.js** app tool → create an application:

| Setting | Value |
|---|---|
| Node version | 20 or newer |
| Application root | the cloned directory **+ `/server`** |
| Application URL | `api.aas-leather-craft-bags.com` |
| Startup file | `src/server.js` |

Leave the port alone — Hostinger assigns one and the API reads it from `PORT`.

### Step 4 — set the environment variables, before the first start

The API **refuses to boot in production without `MONGODB_URI`**, and it will
also refuse if the two JWT secrets are missing, identical, or still the
development defaults. Set everything first, then start it.

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | the same Atlas string from Step 1 |
| `CLIENT_URL` | `https://aas-leather-craft-bags.com,https://www.aas-leather-craft-bags.com` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | copied verbatim from Step 1 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | same as before |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | same as before |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `orders@aas-leather-craft-bags.com` |
| `SMTP_PASS` | that mailbox's password |
| `MAIL_FROM` | `AAS Leathers <orders@aas-leather-craft-bags.com>` |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloudname` |

Two things **not** to set yet:

- **`COOKIE_SAMESITE`** — leave it unset until Step 7. Setting it to `lax` while
  the storefront still calls the Render API breaks sign-in immediately.
- **`BREVO_API_KEY`** — if present it takes priority over SMTP. Leave it off so
  mail goes through the Hostinger mailbox you just configured.

Create the mailbox first, under hPanel → **Emails**, or SMTP will fail to
authenticate.

### Step 5 — install and start

Run **npm install** from the Node app panel, then **Start**. Then check:

```
https://api.aas-leather-craft-bags.com/api/health
```

It must return `{"ok":true,"service":"aas-leathers-api"}`. A Hostinger
"Default page" means the app is not running or the URL is not bound to it; read
the app's log before changing anything else.

Nothing is live on the new API yet — the store is still talking to Render — so
take as long as you need here.

### Step 6 — point the storefront at the new API

On the storefront **Web App**, set:

```
NEXT_PUBLIC_API_URL = https://api.aas-leather-craft-bags.com/api
```

> `NEXT_PUBLIC_*` values are baked into the JavaScript **at build time**, so a
> restart is not enough — the storefront must be **rebuilt and redeployed** for
> this to take effect.

Then test on the live domain: sign in, browse a product page, add to cart,
reach checkout, and open `/admin`.

### Step 7 — make the cookie first-party

Only now, on the **API**, add `COOKIE_SAMESITE=lax` and restart. The refresh
cookie stops being third-party, so iPhone and Safari customers stay signed in.
Sign in once more afterwards to confirm.

### Step 8 — retire Render

Leave the Render service running but idle for a few days as a fallback. Once
you are confident, suspend it. Do not delete the Atlas database — the new API
is using it.

---

## Before real customers

- Switch Razorpay to **Live** keys (needs the client's business KYC), add
  `aas-leather-craft-bags.com` to the account's authorised domains, and set
  the webhook to
  `https://api.aas-leather-craft-bags.com/api/payments/razorpay/webhook`.
- Replace the hot-linked Unsplash photos with the client's own product images.
- Fill the bracketed placeholders in Privacy / Terms / Data & Compliance
  (legal entity, GSTIN, grievance officer) and have them reviewed.
- Set up a backup routine for the Atlas database (the free tier has none).
