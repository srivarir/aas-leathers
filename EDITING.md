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

Three files in **`web/public/`**, and only one of them is yours to replace:

| File | What it is |
|---|---|
| `hero-woven-bag.webp` | **the original — replace this one** |
| `hero-woven-bag-wide.webp` | built from it, shown on landscape screens |
| `hero-woven-bag-portrait.webp` | built from it, shown on portrait screens |

One photograph cannot survive every screen shape. The browser fills the whole
hero with it, so a wide short window crops the top and bottom off, and a tall
phone screen crops the sides off. The two built files are the same photograph
composed with enough margin around the bag that it stays whole either way, and
the page picks between them by screen orientation.

**To change the hero:** replace `hero-woven-bag.webp` and ask for the other two
to be regenerated. Replacing it on its own will not change what anyone sees —
the page never shows that file directly.

### The logo

| Where it appears | File |
|---|---|
| Browser tab and phone home screen | `web/src/app/icon.png` (32px), `icon1.png` (192px), `icon2.png` (512px), `apple-icon.png` (180px) |
| Link previews when the site is shared | `web/src/app/opengraph-image.png` |
| Footer | `web/public/logo-bone.webp` |
| Order and verification emails | `web/public/logo-email.png` |
| Invoice PDFs | `server/src/assets/logo.png` |

The originals are kept in **`brand/`** at the top of the repo, outside the
website, so every file above can be rebuilt from them.

The tab icon is the **gold-on-green** seal as a round medallion with
transparent corners, so it sits on the tab strip whatever colour that strip is.
Several sizes are supplied rather than one large file, because a browser asked
to squash a 512px image down to 16 does it badly. At 16 pixels the detail is
gone and it reads as a gold-rimmed green disc — the colour and the round shape
are what identify it at that size.

The iOS home-screen icon (`apple-icon.png`) is the one that is **not**
transparent: iOS fills transparent areas with black. It is flattened onto the
seal's own green instead.

> A logo file showing a grey-and-white checkerboard is **not** transparent —
> that is how an editor draws emptiness, and if the file has no alpha channel
> those squares are real pixels. The transparent master lives at
> `brand/logo-gold-transparent.png`.

Elsewhere on the site the seal is used in the bone-on-espresso colouring that
matches the rest of the design.

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
