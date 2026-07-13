"use client";

import { CheckIcon } from "@/components/icons";

export interface StatusEntry {
  status: string;
  at: string;
}

/**
 * The customer-facing journey. "in-transit" progresses within the Shipped
 * stage and "completed" sits past Delivered, so both map onto these six
 * stops rather than adding noise.
 */
const JOURNEY = [
  { key: "confirmed", label: "Confirmed", detail: "At the bench" },
  { key: "processing", label: "In the making", detail: "Being prepared and inspected" },
  { key: "packed", label: "Packed", detail: "Boxed with dust bag and care balm" },
  { key: "shipped", label: "Shipped", detail: "With the courier" },
  { key: "out-for-delivery", label: "Out for delivery", detail: "Arriving today" },
  { key: "delivered", label: "Delivered", detail: "In your hands" },
] as const;

const STAGE_INDEX: Record<string, number> = {
  pending: -1,
  confirmed: 0,
  processing: 1,
  packed: 2,
  shipped: 3,
  "in-transit": 3,
  "out-for-delivery": 4,
  delivered: 5,
  completed: 5,
};

const TERMINAL: Record<string, string> = {
  cancelled: "This order was cancelled. If a payment was taken, its refund is on the way.",
  returned: "This order has been returned to the workshop.",
  refunded: "This order was refunded to the original payment method.",
  failed: "This order could not be completed. Nothing has been charged.",
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function OrderTimeline({
  status,
  history,
}: {
  status: string;
  history: StatusEntry[];
}) {
  if (status in TERMINAL) {
    return (
      <p className="border-l-2 border-line py-1 pl-4 text-sm leading-relaxed text-muted">
        {TERMINAL[status]}
      </p>
    );
  }

  const current = STAGE_INDEX[status] ?? 0;

  // Latest recorded time for each journey stage, so passed stops show
  // when they actually happened.
  const timeFor = (stageIdx: number) => {
    const entry = [...history]
      .reverse()
      .find((h) => (STAGE_INDEX[h.status] ?? -1) === stageIdx);
    return entry ? dateFmt.format(new Date(entry.at)) : null;
  };

  return (
    <ol className="space-y-0">
      {JOURNEY.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === JOURNEY.length - 1;
        return (
          <li key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-[9px] top-5 h-full w-px ${
                  done ? "bg-cognac" : "bg-line"
                }`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                done
                  ? "border-cognac bg-cognac text-bone"
                  : active
                    ? "border-cognac bg-surface"
                    : "border-line bg-surface"
              }`}
            >
              {done && <CheckIcon width={11} height={11} />}
              {active && <span className="h-2 w-2 rounded-full bg-cognac" />}
            </span>
            <span className="flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  className={`text-sm ${
                    active
                      ? "font-medium text-foreground"
                      : done
                        ? "text-foreground/80"
                        : "text-muted"
                  }`}
                >
                  {stage.label}
                </span>
                {(done || active) && timeFor(i) && (
                  <span className="text-xs tabular-nums text-muted">{timeFor(i)}</span>
                )}
              </span>
              {active && (
                <span className="mt-0.5 block text-xs text-muted">{stage.detail}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
