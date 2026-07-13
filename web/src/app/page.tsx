import { Hero } from "@/components/home/hero";
import {
  ClosingInvitation,
  Craftsmanship,
  FeaturedCollection,
  JournalPreview,
  LeatherStory,
  Lifestyle,
  Statement,
  Testimonial,
} from "@/components/home/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Craftsmanship />
      <FeaturedCollection />
      <LeatherStory />
      <Lifestyle />
      <Testimonial />
      <JournalPreview />
      <ClosingInvitation />
    </>
  );
}
