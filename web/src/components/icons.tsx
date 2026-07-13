import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const SearchIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const HeartIcon = ({
  filled,
  ...p
}: Props & { filled?: boolean }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"} aria-hidden="true">
    <path d="M12 20.5C7 16.6 3.5 13.4 3.5 9.6 3.5 7 5.6 5 8.1 5c1.5 0 3 .7 3.9 2 .9-1.3 2.4-2 3.9-2 2.5 0 4.6 2 4.6 4.6 0 3.8-3.5 7-8.5 10.9Z" />
  </svg>
);

export const BagIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5.5 8h13l-.9 12a1.5 1.5 0 0 1-1.5 1.4H7.9A1.5 1.5 0 0 1 6.4 20L5.5 8Z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </svg>
);

export const MenuIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 8h16M4 16h16" />
  </svg>
);

export const CloseIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const ArrowRightIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 12h16m0 0-6-6m6 6-6 6" />
  </svg>
);

export const ChevronDownIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const MinusIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);

export const PlusIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const UserIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" />
  </svg>
);

export const CheckIcon = (p: Props) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
);
