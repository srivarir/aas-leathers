import { Reveal } from "@/components/motion";

export interface EditorialSection {
  heading: string;
  paragraphs?: string[];
  /** Optional bullet list rendered under the paragraphs. */
  list?: string[];
}

/** Shared quiet layout for policy and long-form informational pages. */
export function EditorialPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  footnote,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Human effective date, e.g. "5 July 2026". */
  updated?: string;
  sections: EditorialSection[];
  /** Small print shown below the content — disclaimers, grievance contacts. */
  footnote?: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-32 pt-36">
      <Reveal>
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] tracking-tight">
          {title}
        </h1>
        {updated && (
          <p className="eyebrow mt-6 text-muted">Last updated · {updated}</p>
        )}
        {intro && <p className="mt-6 leading-relaxed text-muted">{intro}</p>}
      </Reveal>

      <div className="mt-16 space-y-12">
        {sections.map((s) => (
          <Reveal key={s.heading}>
            <section>
              <h2 className="font-display text-2xl tracking-tight">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="mt-4 text-sm leading-relaxed text-foreground/75">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-4 space-y-2.5">
                  {s.list.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-foreground/75"
                    >
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cognac"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        ))}
      </div>

      {footnote && footnote.length > 0 && (
        <Reveal>
          <div className="mt-16 border-t border-line pt-8">
            {footnote.map((line, i) => (
              <p key={i} className="mt-3 text-xs leading-relaxed text-muted first:mt-0">
                {line}
              </p>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
