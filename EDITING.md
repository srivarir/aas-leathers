# Editing the site

Two kinds of content. Knowing which is which saves most of the trouble.

| | Changed in | Live |
|---|---|---|
| Products, collections | the office, in a browser | immediately |
| Everything else | files in this repo | after a rebuild |

---

## 1. Things you change in the office — no code

Sign in at **`/office`**.

| What | Where |
|---|---|
| Product name, price, description, stock, photos | **Inventory** → Edit |
| Collection name, description, photo, order | **Collections** → Edit |
| Order status, deleting test orders | **Orders** |

Save and it is live. Nothing else to do.

---

## 2. Things you change in the repo

### The loop

1. Open **github.com/srivarir/aas-leathers**
2. Click into the file
3. Click the **pencil** (top right)
4. Make the change
5. Scroll down → **Commit changes**
6. Hostinger rebuilds the storefront. If auto-deploy is off, hPanel → Web App → **Deploy**

Nothing appears until the rebuild finishes. A restart is not enough — the text is compiled into the site.

Broke something? GitHub keeps every version: the file → **History** → open the previous version → revert. Nothing is lost permanently.

---

## 3. Where the text lives

All paths below start from `web/src/`.

### Home page

Everything on the home page is in two files.

| Part of the page | File | Find |
|---|---|---|
| Hero: small line above the title | `components/home/hero.tsx` | `Full-grain · Vegetable-tanned` |
| Hero: the big headline (two lines) | `components/home/hero.tsx` | `Leather that keeps` / `your years.` |
| Hero: button | `components/home/hero.tsx` | `Explore the Collections` |
| "The house position" opening statement | `components/home/sections.tsx` | `The house position` |
| Craftsmanship block | `components/home/sections.tsx` | `Two needles,` |
| Heritage Collection block | `components/home/sections.tsx` | `Carried first,` |
| Material / dark block | `components/home/sections.tsx` | `Tanned by bark.` |
| Travel block | `components/home/sections.tsx` | `Good luggage doesn't retire.` |
| Customer quote | `components/home/sections.tsx` | `From a letter we keep` |
| Journal teaser | `components/home/sections.tsx` | `Notes on leather,` |
| Closing block | `components/home/sections.tsx` | `Begin with one piece.` |

Headlines are written as `lines={["First line,", "second line."]}` — each string is one line on screen. Keep the quotes and commas.

### Other pages

| Page | File |
|---|---|
| About / Our Story | `app/about/page.tsx` |
| Craftsmanship | `app/craftsmanship/page.tsx` |
| Contact details | `app/contact/page.tsx` |
| FAQ questions and answers | `app/faq/page.tsx` — each entry is `q:` and `a:` |
| Journal articles | `lib/data.ts` — the `journalPosts` list |
| Terms | `app/terms/page.tsx` |
| Privacy Policy | `app/privacy-policy/page.tsx` |
| Returns & Refunds | `app/refund-policy/page.tsx` |
| Data & Compliance | `app/data-compliance/page.tsx` |

The four legal pages share one layout: each is a list of `heading:` and `paragraphs:`. Edit the words, leave the structure.

### Site furniture

| What | File |
|---|---|
| Footer statement and link columns | `components/layout/footer.tsx` |
| Menu labels | `components/layout/header.tsx` |
| Cart drawer wording | `components/cart-drawer.tsx` |
| Checkout step wording | `app/checkout/page.tsx` |
| Sign-in / register wording | `components/auth-form.tsx` |

---

## 4. Where the photos live

### Product and collection photos

In the office. Do not touch code for these.

### The hero photo

`components/home/hero.tsx` holds **two** images:

- `/hero-woven-bag.webp` — desktop and tablet
- `/hero-woven-bag-portrait.webp` — phones

Both files sit in **`web/public/`**. Phones need their own version because a wide photo, cropped to a tall phone screen, loses the product entirely.

To swap the hero, replace the files in `web/public/` keeping the same names, or upload new ones and change the two `src=` lines.

### The other site photos

Everything else uses a shared list of image addresses in **`lib/data.ts`**, near the top, called `IMAGES`.

| Name | Used on |
|---|---|
| `workshopTools` | About, Craftsmanship |
| `workshopHands` | Home (craftsmanship block), Craftsmanship |
| `grainMacro` | Home (material block), Craftsmanship |
| `bagTravel` | Home (travel block) |
| `hideCraft`, `wallet`, `satchel`, `heroBag` | Craftsmanship |

**One name can appear on several pages.** Change `workshopHands` and it changes in both places. Check the table above before editing.

### Using your own photo

1. Put the file in **`web/public/`** (on GitHub: open the folder → **Add file → Upload files**)
2. Reference it by name with a leading slash

So a file uploaded as `workshop.webp` becomes:

```
IMAGES.workshopTools   →   "/workshop.webp"
```

Keep the quotes, drop the curly braces. WebP or JPEG, around 2000px wide, under ~300 KB.

---

## 5. Four rules that keep you out of trouble

1. **Only change words inside quotes.** Leave every `"` `,` `{` `}` exactly where it is. Almost every failed build is a deleted quote or comma.
2. **Check the image table before changing an `IMAGES` entry** — several are used on more than one page.
3. **Apostrophes are fine** inside double quotes (`"doesn't"`). A `"` inside a `"..."` string is not — write `\"` or use different wording.
4. **Wait for the rebuild.** The old text stays until it finishes.

---

## 6. Placeholders still to replace

These are invented and must be corrected before real customers arrive:

**Invented contact details** — `workshop@aasleathers.in`, `+91 44 2811 0000`,
and the Chennai workshop address. They appear in five files:
`app/contact/page.tsx`, `app/terms/page.tsx`, `app/privacy-policy/page.tsx`,
`app/refund-policy/page.tsx`, `app/data-compliance/page.tsx`. Search the repo
for `aasleathers.in` to find every one.

**Three bracketed blanks** that need the registered business details:

| Blank | File |
|---|---|
| `[Registered legal name, …]` | `app/data-compliance/page.tsx` |
| `[15-digit GST identification number]` | `app/data-compliance/page.tsx` |
| `[Corporate Identity Number, …]` | `app/data-compliance/page.tsx` |
| `[Name to be appointed]` (Grievance Officer) | `app/privacy-policy/page.tsx` |

**The remaining stock photography,** which is not the client's product. Only
the hero is a real photograph so far.
