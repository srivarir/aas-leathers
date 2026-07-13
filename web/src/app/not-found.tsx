import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-muted">404</p>
      <h1 className="font-display mt-6 max-w-2xl text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.08] tracking-tight">
        This page has wandered off the map.
      </h1>
      <p className="mt-6 max-w-md leading-relaxed text-muted">
        Like good leather, some things go missing on a long journey. The rest
        of the house is exactly where you left it.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/">Return Home</ButtonLink>
        <ButtonLink href="/shop" variant="outline">
          Browse the Pieces
        </ButtonLink>
      </div>
    </div>
  );
}
