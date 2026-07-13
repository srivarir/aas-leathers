import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealLines } from "@/components/motion";
import { journalPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes on leather, craft and the long life of things — from the AAS Leathers workshop.",
};

export default function JournalPage() {
  const [lead, ...rest] = journalPosts;

  return (
    <div className="mx-auto max-w-[1500px] px-6 pb-32 pt-36 lg:px-12">
      <div className="max-w-2xl">
        <Reveal>
          <p className="eyebrow text-muted">The Journal</p>
        </Reveal>
        <RevealLines
          as="h1"
          className="font-display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.08] tracking-tight"
          lines={["Notes on leather,", "written slowly."]}
        />
      </div>

      <Reveal className="mt-20">
        <Link href={`/journal/${lead.slug}`} className="group grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[16/10] overflow-hidden bg-bone-soft">
            <Image
              src={lead.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          </div>
          <div>
            <p className="eyebrow text-muted">
              {lead.category} · {lead.date} · {lead.readingTime}
            </p>
            <h2 className="font-display mt-5 text-3xl leading-snug tracking-tight lg:text-5xl">
              {lead.title}
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted">{lead.excerpt}</p>
            <span className="link-underline eyebrow mt-8 inline-block">Read the essay</span>
          </div>
        </Link>
      </Reveal>

      <div className="mt-24 grid gap-12 border-t border-line pt-16 md:grid-cols-2">
        {rest.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.1}>
            <Link href={`/journal/${post.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-bone-soft">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
              <p className="eyebrow mt-6 text-muted">
                {post.category} · {post.date} · {post.readingTime}
              </p>
              <h2 className="font-display mt-3 text-3xl leading-snug tracking-tight">{post.title}</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{post.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
