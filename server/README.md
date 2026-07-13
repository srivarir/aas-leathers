# AAS Leathers API

Express + MongoDB backend for the AAS Leathers storefront.

## Run

```bash
npm install
npm start        # or: npm run dev (file-watching restarts)
```

Without `MONGODB_URI` set, development uses an **in-memory MongoDB** (data
resets on restart) and auto-seeds the 11-product catalog. For persistent data,
copy `.env.example` to `.env` and point `MONGODB_URI` at a real MongoDB.

> Note: `npm run dev` uses `node --watch`, which can restart while the
> in-memory MongoDB writes files. Prefer `npm start` unless you're editing
> server code against a real MongoDB.

## Auth model

- Short-lived JWT access token (15 min), returned in JSON, held in memory by
  the frontend.
- Refresh token (30 days) in an `httpOnly` cookie scoped to `/api/auth`,
  stored **hashed** server-side, **rotated on every refresh**; presenting a
  rotated-out token revokes nothing further and returns 401.
- Roles: `customer`, `admin`, `super-admin`, `inventory-manager`,
  `content-manager`, `customer-support` — enforced by `requireRole`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Liveness |
| POST | `/api/auth/register` | — | Create account (rate-limited) |
| POST | `/api/auth/login` | — | Sign in (rate-limited) |
| POST | `/api/auth/refresh` | cookie | Rotate refresh, new access token |
| POST | `/api/auth/logout` | cookie | Revoke session |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/products` | — | List (`category`, `collection`, `search`, `sort`) |
| GET | `/api/products/:slug` | — | Detail |
| POST/PATCH/DELETE | `/api/products…` | staff roles | Catalog management (delete = archive) |
| POST | `/api/orders` | Bearer | Create order — prices from DB, atomic stock decrement |
| GET | `/api/orders/mine` | Bearer | Own order history |
| GET | `/api/orders/:id` | Bearer | Owner or support staff |
| GET | `/api/orders` | staff roles | All orders |

## Security

helmet, CORS locked to `CLIENT_URL` with credentials, JSON body limit,
global + auth rate limits, bcrypt(12), uniform login errors, server-side
pricing, stock can never go negative (conditional `$inc`), operational vs
unexpected error separation with no stack leaks in production.

## Next phase

Razorpay order + webhook signature verification (`payment` subdocument is
ready), Nodemailer transactional emails, invoice PDFs, admin dashboard.
