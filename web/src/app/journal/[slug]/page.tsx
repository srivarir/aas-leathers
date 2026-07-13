import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion";
import { ArrowRightIcon } from "@/components/icons";
import { getPost, journalPosts } from "@/lib/data";

export function generateStaticParams() {
  return journalPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const next = journalPosts.find((p) => p.slug !== slug);

  return (
    <article className="pb-32 pt-36">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="eyebrow text-muted">
            {post.category} · {post.date} · {post.readingTime}
          </p>
          <h1 className="font-display mt-6 text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.08] tracking-tight">
            {post.title}
          </h1>
          <p className="font-display mx-auto mt-6 max-w-xl text-lg italic leading-relaxed text-muted">
            {post.excerpt}
          </p>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-16 max-w-5xl px-6">
        <div className="relative aspect-[16/9] overflow-hidden bg-bone-soft">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </Reveal>

      <div className="mx-auto mt-16 max-w-2xl space-y-7 px-6">
        {post.body.map((para, i) => (
          <Reveal key={i} delay={0.05}>
            <p
              className={
                i === 0
                  ? "font-display text-xl leading-relaxed text-foreground/90 first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:leading-[0.85]"
                  : "leading-relaxed text-foreground/80"
              }
            >
              {para}
            </p>
          </Reveal>
        ))}
      </div>

      {next && (
        <div className="mx-auto mt-24 max-w-2xl border-t border-line px-6 pt-12">
          <p className="eyebrow text-muted">Read next</p>
          <Link
            href={`/journal/${next.slug}`}
            className="group mt-4 flex items-center justify-between gap-6"
          >
            <span className="font-display text-2xl leading-snug tracking-tight lg:text-3xl">
              {next.title}
            </span>
            <ArrowRightIcon className="shrink-0 transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </div>
      )}
    </article>
  );
}
