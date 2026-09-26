const img = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

/** The four founding collections. Editable in the admin once seeded. */
export const seedCollections = [
  {
    slug: "heritage",
    name: "The Heritage Collection",
    description:
      "Our founding silhouettes, unchanged since the first workshop. Full-grain vegetable-tanned leather that records every year you carry it.",
    image: img("1548036328-c9fa89d128fa", 2200),
    position: 0,
  },
  {
    slug: "voyage",
    name: "Voyage",
    description:
      "Weekenders and carry companions built for a lifetime of departures. Reinforced seams, solid brass, and room for everything that matters.",
    image: img("1575032617751-6ddec2089882"),
    position: 1,
  },
  {
    slug: "atelier",
    name: "Atelier Small Goods",
    description:
      "Wallets, folios and belts cut from the offcuts of our larger pieces — nothing wasted, everything considered.",
    image: img("1594223274512-ad4803739b7c"),
    position: 2,
  },
  {
    slug: "everyday",
    name: "Everyday Carry",
    description:
      "Quiet workhorses for the daily commute. Designed to disappear into your routine and improve with every use.",
    image: img("1620109176813-e91290f6c795"),
    position: 3,
  },
];
