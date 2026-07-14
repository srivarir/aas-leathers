export type Category = "bags" | "briefcases" | "travel" | "small-goods";

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  price: number; // INR
  category: Category;
  collection: string; // collection slug
  images: string[];
  leather: string;
  hardware: string;
  lining: string;
  dimensions: string;
  story: string;
  details: string[];
  care: string;
  inStock: boolean;
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
  // Snapshot taken when added, so the cart shows correct details for any
  // product — including ones added after the site was built. Optional for
  // backward compatibility with carts saved before this field existed.
  name?: string;
  price?: number;
  image?: string;
}
