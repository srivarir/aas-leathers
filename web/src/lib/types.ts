export interface ProductColor {
  name: string;
  hex: string;
  /** Photographs of this finish. Empty means fall back to the piece's own. */
  images?: string[];
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  price: number; // INR
  collection: string; // collection slug
  images: string[];
  /** The finishes a piece can be ordered in. May be empty. */
  colors?: ProductColor[];
  leather: string;
  hardware: string;
  lining: string;
  dimensions: string;
  story: string;
  details: string[];
  care: string;
  featured?: boolean;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  image: string;
  body: string[];
}

export interface CartItem {
  slug: string;
  qty: number;
  /** Chosen finish. Undefined for pieces offered in one colour only. */
  color?: string;
  // Snapshot taken when added, so the cart shows correct details for any
  // product — including ones added after the site was built. Optional for
  // backward compatibility with carts saved before this field existed.
  name?: string;
  price?: number;
  image?: string;
}
