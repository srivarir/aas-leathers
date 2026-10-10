import { Hero } from "@/components/home/hero";
import {
  ClosingInvitation,
  Craftsmanship,
  FeaturedCollection,
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
