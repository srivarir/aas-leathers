import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { SearchOverlay } from "@/components/search-overlay";
import { SITE_URL } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Full-grain, vegetable-tanned leather bags and small goods, cut and saddle-stitched by hand. Made slowly in India, built to be carried for decades.";

export const metadata: Metadata = {
  // Without metadataBase, Next resolves Open Graph and canonical URLs against
  // localhost, so shared links break once the site is on a real domain.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AAS Leathers — Leather goods made slowly, in India",
    template: "%s — AAS Leathers",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AAS Leathers",
    title: "AAS Leathers — Leather goods made slowly, in India",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AAS Leathers — Leather goods made slowly, in India",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
        </Providers>
      </body>
    </html>
  );
}
