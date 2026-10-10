import { Hero } from "@/components/home/hero";
import { FeaturedCollection } from "@/components/home/featured-collection";
import {
  ClosingInvitation,
  Craftsmanship,
  Lifestyle,
} from "@/components/home/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <Craftsmanship />
      <Lifestyle />
      <ClosingInvitation />
    </>
  );
}
