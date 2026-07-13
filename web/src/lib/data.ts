import type { Collection, JournalPost, Product } from "./types";

/** Unsplash delivery URL at a given width. */
const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMAGES = {
  heroBag: img("1548036328-c9fa89d128fa", 2200),
  duffel: img("1547949003-9792a18a2601"),
  backpack: img("1553062407-98eeb64c6a62"),
  handbagStudio: img("1584917865442-de89df76afd3"),
  handbagWarm: img("1591561954557-26941169b49e"),
  workshopHands: img("1524498250077-390f9e378fc0", 2200),
  workshopTools: img("1517254797898-04edd251bfb3", 2200),
  crossbody: img("1627123424574-724758594e93"),
  toteQuiet: img("1590874103328-eac38a683ce7"),
  wallet: img("1594223274512-ad4803739b7c"),
  satchel: img("1610701596007-11502861dcfa"),
  grainMacro: img("1573227896778-8f378c4029d4", 2200),
  bagField: img("1616627561950-9f746e330187"),
  hideCraft: img("1548863227-3af567fc3b27", 2200),
  bagStreet: img("1566150905458-1bf1fc113f0d"),
  bagDesk: img("1620109176813-e91290f6c795"),
  bagLinen: img("1614179689702-355944cd0918"),
  bagStand: img("1622560480605-d83c853bc5c3"),
  bagTravel: img("1575032617751-6ddec2089882"),
} as const;

export const collections: Collection[] = [
  {
    slug: "heritage",
    name: "The Heritage Collection",
    description:
      "Our founding silhouettes, unchanged since the first workshop. Full-grain vegetable-tanned leather that records every year you carry it.",
    image: IMAGES.heroBag,
  },
  {
    slug: "voyage",
    name: "Voyage",
    description:
      "Weekenders and carry companions built for a lifetime of departures. Reinforced seams, solid brass, and room for everything that matters.",
    image: IMAGES.bagTravel,
  },
  {
    slug: "atelier",
    name: "Atelier Small Goods",
    description:
      "Wallets, folios and belts cut from the offcuts of our larger pieces — nothing wasted, everything considered.",
    image: IMAGES.wallet,
  },
  {
    slug: "everyday",
    name: "Everyday Carry",
    description:
      "Quiet workhorses for the daily commute. Designed to disappear into your routine and improve with every use.",
    image: IMAGES.bagDesk,
  },
];

export const products: Product[] = [
  {
    slug: "madras-tote",
    name: "The Madras Tote",
    tagline: "A carryall that ages into an heirloom",
    price: 24500,
    category: "bags",
    collection: "heritage",
    images: [IMAGES.heroBag, IMAGES.grainMacro, IMAGES.toteQuiet],
    leather: "Full-grain, vegetable-tanned cowhide from Tamil Nadu tanneries",
    hardware: "Solid brass, hand-polished",
    lining: "Unlined interior — leather against leather",
    dimensions: "40 × 32 × 14 cm",
    story:
      "The Madras Tote began as a single commission for a bookseller who wanted a bag that would outlive his shop. Twelve years later, his original still carries. Every tote is cut from a single hide so the grain flows unbroken around the body.",
    details: [
      "Cut from a single hide for continuous grain",
      "Saddle-stitched by hand with waxed linen thread",
      "Burnished edges, sealed with beeswax",
      "Interior slip pocket sized for an A5 notebook",
    ],
    care: "Wipe with a dry cloth. Condition with our balm twice a year. Let rain dry naturally — never near heat.",
    inStock: true,
    featured: true,
  },
  {
    slug: "cathedral-briefcase",
    name: "The Cathedral Briefcase",
    tagline: "Structured, unhurried, permanent",
    price: 38000,
    category: "briefcases",
    collection: "heritage",
    images: [IMAGES.satchel, IMAGES.bagDesk, IMAGES.grainMacro],
    leather: "Bridle leather, drum-dyed espresso",
    hardware: "Solid brass turn-locks",
    lining: "Natural cotton drill",
    dimensions: "42 × 30 × 10 cm",
    story:
      "Named for the arched frame that holds its shape decades in, the Cathedral is our most structured piece. The frame is skived, folded and stitched entirely by hand — a full day's work for one craftsman.",
    details: [
      "Hand-formed arch frame holds shape for decades",
      "Twin turn-lock closure in solid brass",
      "Padded sleeve fits a 15-inch laptop",
      "Signature-stamped and numbered by its maker",
    ],
    care: "Condition the bridle leather when it lifts a light bloom. Polish brass with a soft cloth.",
    inStock: true,
    featured: true,
  },
  {
    slug: "deccan-weekender",
    name: "The Deccan Weekender",
    tagline: "Three days, one bag, no compromises",
    price: 42500,
    category: "travel",
    collection: "voyage",
    images: [IMAGES.duffel, IMAGES.bagTravel, IMAGES.hideCraft],
    leather: "Full-grain cowhide, hot-stuffed with tallows",
    hardware: "Brass zip with rawhide pull",
    lining: "Waxed canvas",
    dimensions: "55 × 30 × 26 cm",
    story:
      "Built after our founder's grandfather's railway trunk — scaled to the overhead rack. The base is double-layered and the handles wrap fully around the body, so the weight is carried by the whole bag, not a seam.",
    details: [
      "Handles wrap the full circumference of the body",
      "Double-layer base with brass feet",
      "Cabin-sized for Indian and international carriers",
      "Detachable shoulder strap in matching leather",
    ],
    care: "Wax annually with the included tin. Scuffs polish out with a warm cloth — or leave them; they suit it.",
    inStock: true,
    featured: true,
  },
  {
    slug: "clerk-satchel",
    name: "The Clerk Satchel",
    tagline: "The everyday bag, perfected slowly",
    price: 19800,
    category: "bags",
    collection: "everyday",
    images: [IMAGES.crossbody, IMAGES.bagStreet, IMAGES.grainMacro],
    leather: "Pull-up leather, hand-rubbed tan",
    hardware: "Antiqued brass buckles",
    lining: "Unlined",
    dimensions: "34 × 26 × 9 cm",
    story:
      "Our quietest bestseller. The Clerk was designed by subtraction — every revision removed something until only the essential bag remained. What's left weighs under a kilogram and carries a working day.",
    details: [
      "Weighs 940 g — our lightest full-leather bag",
      "Pull-up leather lightens at every fold and touch",
      "Two-position buckle for laptop days",
      "Back slip pocket for tickets and phone",
    ],
    care: "Pull-up leather self-heals from light scratches with a rub of the thumb. Condition yearly.",
    inStock: true,
    featured: true,
  },
  {
    slug: "verandah-handbag",
    name: "The Verandah Handbag",
    tagline: "Small in the hand, generous inside",
    price: 27500,
    category: "bags",
    collection: "heritage",
    images: [IMAGES.handbagStudio, IMAGES.handbagWarm, IMAGES.toteQuiet],
    leather: "Milled full-grain calf, cognac",
    hardware: "Cast brass ring fittings",
    lining: "Dyed-to-match suede",
    dimensions: "28 × 20 × 12 cm",
    story:
      "The Verandah's rolled handles are wet-moulded around a wooden dowel and left to dry for two days before stitching. It is the slowest handle we make, and the reason this bag sits the way it does.",
    details: [
      "Wet-moulded rolled handles, dried on the dowel",
      "Suede-lined with a zipped privacy pocket",
      "Feet of stacked, burnished leather",
      "Fits a 11-inch tablet, flat",
    ],
    care: "Avoid prolonged direct sun to keep the cognac even. Store stuffed, in its dust bag.",
    inStock: true,
  },
  {
    slug: "cartographer-backpack",
    name: "The Cartographer Backpack",
    tagline: "For the long way to work",
    price: 32000,
    category: "travel",
    collection: "voyage",
    images: [IMAGES.backpack, IMAGES.bagField, IMAGES.hideCraft],
    leather: "Oiled full-grain cowhide, field brown",
    hardware: "Brass roller buckles",
    lining: "Waxed canvas with felt laptop bed",
    dimensions: "45 × 30 × 15 cm",
    story:
      "Drawn from surveyors' packs of the 1940s, the Cartographer trades plastic clips and mesh for two roller buckles and a drawcord throat. Nothing on it can snap, because nothing on it is plastic.",
    details: [
      "No plastic components anywhere on the bag",
      "Drawcord throat expands by six litres",
      "Felt-bedded sleeve fits a 16-inch laptop",
      "Shoulder straps lined with vegetable-tanned splits",
    ],
    care: "Re-oil lightly when the leather pales at the flex points. The canvas can be re-waxed with any paraffin bar.",
    inStock: true,
  },
  {
    slug: "ledger-wallet",
    name: "The Ledger Wallet",
    tagline: "Eight cards, a decade of use",
    price: 6500,
    category: "small-goods",
    collection: "atelier",
    images: [IMAGES.wallet, IMAGES.grainMacro],
    leather: "Bridle leather offcuts from the Cathedral",
    hardware: "None — stitched construction only",
    lining: "Unlined",
    dimensions: "11 × 9 cm, folded",
    story:
      "Every Ledger is cut from the offcuts of our briefcase panels — the same leather, at a fraction of the price. It leaves the workshop stiff, breaks in over a month, and then holds its shape for years.",
    details: [
      "Cut from Cathedral Briefcase offcuts",
      "Eight card slots, two note sleeves",
      "Corners rounded, edges hand-burnished",
      "Breaks in to your carry within a month",
    ],
    care: "It will burnish naturally from your pocket. No conditioning needed for the first two years.",
    inStock: true,
  },
  {
    slug: "meridian-folio",
    name: "The Meridian Folio",
    tagline: "Paper deserves better than plastic",
    price: 12500,
    category: "small-goods",
    collection: "atelier",
    images: [IMAGES.bagLinen, IMAGES.workshopTools],
    leather: "Smooth calf, ink black",
    hardware: "Brass zip, YKK Excella",
    lining: "Natural cotton drill",
    dimensions: "35 × 26 × 2 cm",
    story:
      "A single sheet of calf, folded once, stitched twice. The Meridian holds an A4 document flat and a passport hidden. It was designed for signatures that matter.",
    details: [
      "Holds A4 documents perfectly flat",
      "Hidden passport pocket behind the spine",
      "Pen loop sized for a fountain pen",
      "Lies flat when open, stands when full",
    ],
    care: "Smooth calf shows care: wipe weekly, condition sparingly, keep dry.",
    inStock: true,
  },
  {
    slug: "sonnet-crossbody",
    name: "The Sonnet Crossbody",
    tagline: "Everything you need, nothing you don't",
    price: 16800,
    category: "bags",
    collection: "everyday",
    images: [IMAGES.bagStand, IMAGES.bagStreet],
    leather: "Milled calf, saddle tan",
    hardware: "Brass rings and snap hooks",
    lining: "Dyed-to-match suede",
    dimensions: "24 × 18 × 7 cm",
    story:
      "The Sonnet holds a phone, a Ledger wallet, keys, and one paperback. That constraint is the design. The strap is cut long and punched for nine positions, because bodies differ and bags should admit it.",
    details: [
      "Nine-position strap, cut for all heights",
      "Magnetic closure under a leather storm flap",
      "Paperback-sized — by design",
      "Suede-lined phone pocket, scratch-safe",
    ],
    care: "Condition twice a year. The saddle tan will deepen two shades in its first year of sun.",
    inStock: true,
  },
  {
    slug: "gharana-duffel",
    name: "The Gharana Duffel",
    tagline: "The grand tour, shouldered",
    price: 48000,
    category: "travel",
    collection: "voyage",
    images: [IMAGES.bagTravel, IMAGES.duffel, IMAGES.hideCraft],
    leather: "Hot-stuffed full-grain, dark umber",
    hardware: "Cast brass, saddler's rivets",
    lining: "Waxed canvas, storm flap throat",
    dimensions: "60 × 32 × 30 cm",
    story:
      "Our largest and most patient build — sixty hours across three benches. The Gharana is over-engineered on purpose: the strap anchors are riveted through brass plates, and the handles are stitched around a rawhide core.",
    details: [
      "Sixty hours of bench time per bag",
      "Rawhide-cored handles, riveted anchors",
      "Storm-flap throat keeps weather out",
      "Numbered edition — twelve made each season",
    ],
    care: "An annual wax is all it asks. Everything else it handles itself.",
    inStock: false,
  },
  {
    slug: "quill-belt",
    name: "The Quill Belt",
    tagline: "One piece of bridle, one brass buckle",
    price: 5800,
    category: "small-goods",
    collection: "atelier",
    images: [IMAGES.hideCraft, IMAGES.workshopTools],
    leather: "Bridle butt, 4 mm, espresso or tan",
    hardware: "Solid cast brass buckle",
    lining: "None — a single thickness of leather",
    dimensions: "38 mm width, cut to your waist",
    story:
      "No laminations, no filler, no stitching to fail. The Quill is one 4 mm thickness of bridle butt with a cast buckle, and it is the last belt most customers buy.",
    details: [
      "Single 4 mm thickness — no laminations",
      "Cut and punched to your exact waist",
      "Buckle swaps with a simple chicago screw",
      "Edges burnished with beeswax and canvas",
    ],
    care: "Nothing required. It will outlast the trousers.",
    inStock: true,
  },
];

export const journalPosts: JournalPost[] = [
  {
    slug: "reading-the-grain",
    title: "Reading the Grain",
    excerpt:
      "Before a single cut is made, a hide is read like a map — every scar, wrinkle and pore deciding what it will become.",
    category: "Craft",
    date: "June 2026",
    readingTime: "6 min",
    image: IMAGES.grainMacro,
    body: [
      "A full hide arrives at the workshop rolled like a carpet and smelling faintly of oak bark. Before it meets a blade, it is unrolled across the cutting table and read — slowly, by hand and eye — the way a carpenter reads timber.",
      "The back and shoulders carry the tightest grain, so they become panels that must hold a shape for decades: briefcase fronts, tote bodies, belt lengths. The softer belly flexes, so it becomes gussets and pockets — places where movement is the job.",
      "Scars are not defects. A healed scratch from a thorn fence is proof of a life outdoors, and left in the right place it becomes the signature of the piece. What we avoid are weaknesses: loose fibre, thin patches, the shine of over-stretching.",
      "This reading takes half a morning for a single hide. It is the least visible work we do, and the most important. Every bag that lasts twenty years lasts because of decisions made in those first slow hours.",
    ],
  },
  {
    slug: "the-case-for-patina",
    title: "The Case for Patina",
    excerpt:
      "New leather is a beginning, not a finish. On why our bags are meant to darken, soften and record their owners.",
    category: "Materials",
    date: "May 2026",
    readingTime: "5 min",
    image: IMAGES.heroBag,
    body: [
      "There is a moment, around the eighth month, when a vegetable-tanned bag stops looking new and starts looking yours. The handles darken where your hand falls. The flap creases along the line of your reach. Sun deepens the tan unevenly, honestly.",
      "Chrome-tanned leather — the industry default — is engineered to resist this. It stays uniform, plasticised, frozen at the moment of purchase. We tan with bark and time instead, precisely because the material stays alive.",
      "Patina is the argument against replacing things. A bag that records ten years of your life cannot be substituted by a new one; it can only be continued. That is the quiet economics of buying once.",
      "So we ask our customers not to baby their bags. Take it into the rain occasionally. Let it ride the overhead rack. The marks are the point.",
    ],
  },
  {
    slug: "sixty-hours-of-the-gharana",
    title: "Sixty Hours of the Gharana",
    excerpt:
      "A season of the Gharana Duffel is twelve bags. We followed one of them from raw hide to numbered stamp.",
    category: "Workshop",
    date: "April 2026",
    readingTime: "8 min",
    image: IMAGES.workshopHands,
    body: [
      "The Gharana is built across three benches, and no bag moves to the next bench until the maker at the current one signs against its number. Bag seven of this season took sixty-three hours — three over estimate, because the rawhide core of the second handle refused to sit true and was remade from scratch.",
      "Bench one is cutting and skiving: two full days of blade work before anything resembles a bag. Bench two is assembly — the saddle stitching alone runs to eleven metres of waxed linen thread, every stitch set by two needles crossing inside the same awl hole.",
      "Bench three is finishing, and it is where patience is most visible. Edges are sanded, dyed, waxed and burnished five separate times. Brass is polished, then deliberately dulled one grade, because new brass should whisper, not shout.",
      "Bag seven passed final inspection on a Thursday evening and was stamped 07/12. It left for Bombay the next morning. We expect to see it again — our repairs bench sees every bag eventually, usually decades in, usually for a new zip and a story.",
    ],
  },
];

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getCollection = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const getPost = (slug: string) =>
  journalPosts.find((p) => p.slug === slug);

export const productsInCollection = (slug: string) =>
  products.filter((p) => p.collection === slug);

export const relatedProducts = (product: Product, count = 4) =>
  products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.collection === product.collection || p.category === product.category),
    )
    .slice(0, count);

export const categoryLabels: Record<string, string> = {
  bags: "Bags",
  briefcases: "Briefcases",
  travel: "Travel",
  "small-goods": "Small Goods",
};
