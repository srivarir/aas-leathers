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
}
