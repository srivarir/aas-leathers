"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-32 pt-36 lg:px-12">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="eyebrow text-muted">Contact</p>
            <h1 className="font-display mt-4 text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] tracking-tight">
              A person answers.
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              Questions about a piece, an order, a repair, or leather itself —
              write to the workshop. Replies come from the bench, not a bot,
              within one working day.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-14 space-y-8">
              <div>
                <dt className="eyebrow text-muted">Write</dt>
                <dd className="mt-2 font-display text-xl">workshop@aasleathers.in</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted">Call</dt>
                <dd className="mt-2 font-display text-xl">+91 44 2811 0000</dd>
                <dd className="mt-1 text-xs text-muted">Monday to Saturday, 10:00–18:00 IST</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted">Visit</dt>
                <dd className="mt-2 text-sm leading-relaxed text-foreground/75">
                  The Workshop, 14 Leather Lane,
                  <br /> Chennai 600 004, India
                  <br />
                  <span className="text-muted">By appointment — the benches are working.</span>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center border border-line p-12 text-center">
              <p className="font-display text-3xl">Received, with thanks.</p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Your note is on the workshop desk. Expect a reply within one
                working day.
              </p>
            </div>
          ) : (
            <form
              className="space-y-8 border border-line p-8 lg:p-12"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div>
                <label htmlFor="contact-name" className="eyebrow block text-muted">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  className="mt-2 w-full border-b border-line bg-transparent py-3 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="eyebrow block text-muted">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full border-b border-line bg-transparent py-3 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="eyebrow block text-muted">
                  Your message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  className="mt-2 w-full resize-none border-b border-line bg-transparent py-3 transition-colors duration-300 focus:border-foreground focus:outline-none"
                />
              </div>
              <Button type="submit">Send to the Workshop</Button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
