import type { SVGProps } from "react";
import {
  LOGO_BASE_RECT,
  LOGO_CAR_PATH,
  LOGO_VIEWBOX,
  logoColors,
} from "@/lib/logo";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg
      {...base({ ...props, fill: "currentColor", stroke: "none" })}
      strokeWidth={0}
    >
      <path d="M12 2l2.94 6.26 6.87.84-5.07 4.73 1.32 6.79L12 17.27l-6.06 3.35 1.32-6.79-5.07-4.73 6.87-.84L12 2z" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 8h4l3 4v5a1 1 0 0 1-1 1h-1" />
      <circle cx="7.5" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
      <path d="M9.5 18H15" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function BanknoteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 17h2a1 1 0 0 0 1-1v-3a2 2 0 0 0-1.7-1.98L17 10.5l-2.2-3.3A2 2 0 0 0 13.14 6H8.86a2 2 0 0 0-1.66 1.2L5 10.5l-2.3.52A2 2 0 0 0 1 13v3a1 1 0 0 0 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

export function QuoteMarkIcon(props: IconProps) {
  return (
    <svg
      {...base({ ...props, fill: "currentColor", stroke: "none" })}
      strokeWidth={0}
    >
      <path d="M10 8c-3 0-5 2.2-5 5.2 0 2 1.4 3.6 3.3 3.6 1.7 0 3-1.3 3-3 0-1.6-1.1-2.8-2.7-2.8h-.4c.3-1.2 1.3-2 2.8-2.2V8zm9 0c-3 0-5 2.2-5 5.2 0 2 1.4 3.6 3.3 3.6 1.7 0 3-1.3 3-3 0-1.6-1.1-2.8-2.7-2.8h-.4c.3-1.2 1.3-2 2.8-2.2V8z" />
    </svg>
  );
}

/* ── Vehicle silhouettes (side profiles, 64×32) ─────────────────────── */

function vehicleBase(props: IconProps): IconProps {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 64 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function SedanIcon(props: IconProps) {
  return (
    <svg {...vehicleBase(props)}>
      <path d="M5 23c-1.6 0-2.6-1.2-2.4-2.8l.5-3.2c.2-1.5 1.4-2.6 2.9-2.9l8-1.5 6.5-5.4c1-.8 2.2-1.2 3.5-1.2h8.6c1.5 0 3 .7 4 1.8l4.4 4.8 12.5 1.9c1.7.3 3 1.7 3 3.4v2.6c0 1.4-1.1 2.5-2.5 2.5h-2.5" />
      <path d="M23 23h18M27 6.5 25 13h22" />
      <circle cx="16.5" cy="23" r="4.5" />
      <circle cx="47.5" cy="23" r="4.5" />
    </svg>
  );
}

export function SuvIcon(props: IconProps) {
  return (
    <svg {...vehicleBase(props)}>
      <path d="M5.5 23c-1.7 0-3-1.3-3-3v-5.4c0-1.5 1-2.7 2.4-3l7.6-1.6 5-5.5c.9-1 2.2-1.5 3.5-1.5H41c1.4 0 2.7.6 3.6 1.7l4.6 5.3h8.3c2 0 3.5 1.6 3.5 3.5V20c0 1.7-1.3 3-3 3h-2" />
      <path d="M23 23h18M25.5 4.5 22 12.5h27" />
      <circle cx="16.5" cy="23" r="4.5" />
      <circle cx="47.5" cy="23" r="4.5" />
    </svg>
  );
}

export function UteIcon(props: IconProps) {
  return (
    <svg {...vehicleBase(props)}>
      <path d="M5.5 23c-1.7 0-3-1.3-3-3v-4.6c0-1.6 1.2-2.9 2.8-3l6.7-.6 5.5-6.3c.9-1 2.1-1.5 3.4-1.5h8.3c1.7 0 3 1.3 3 3v5h26c1.9 0 3.3 1.5 3.3 3.4V20c0 1.7-1.3 3-3 3h-2.3" />
      <path d="M23 23h18M28 4.2 24.5 12H32" />
      <circle cx="16.5" cy="23" r="4.5" />
      <circle cx="47.5" cy="23" r="4.5" />
    </svg>
  );
}

export function VanIcon(props: IconProps) {
  return (
    <svg {...vehicleBase(props)}>
      <path d="M5.5 23c-1.7 0-3-1.3-3-3V9.6C2.5 6.5 5 4 8.1 4h33.4c1.9 0 3.7.8 4.9 2.3l7.8 9.2 4 .9c1.6.3 2.8 1.8 2.8 3.4v.2c0 1.7-1.3 3-3 3h-2.5" />
      <path d="M23 23h18M38 4v9h13M12 4v9" />
      <circle cx="16.5" cy="23" r="4.5" />
      <circle cx="47.5" cy="23" r="4.5" />
    </svg>
  );
}

export function FourWdIcon(props: IconProps) {
  return (
    <svg {...vehicleBase(props)}>
      <path d="M6 22.5c-1.9 0-3.4-1.5-3.4-3.4v-6.5c0-1.7 1.2-3 2.9-3.3l6-1 4.5-4.1c1-.9 2.2-1.4 3.6-1.4h20.8c1.4 0 2.7.5 3.6 1.5l4.3 4.4 7.4 1.2c1.6.3 2.8 1.7 2.8 3.3v6.3c0 1.7-1.3 3-3 3h-1.9" />
      <path d="M22.5 22.5h19M23.5 3.5 20 11.8h27M14 2.8h34" />
      <circle cx="16" cy="22.5" r="5" />
      <circle cx="48" cy="22.5" r="5" />
    </svg>
  );
}

export function LightTruckIcon(props: IconProps) {
  return (
    <svg {...vehicleBase(props)}>
      <path d="M5.5 23c-1.7 0-3-1.3-3-3V8c0-1.7 1.3-3 3-3h14c1.7 0 3 1.3 3 3v3.5l4.5-5c.7-.8 1.7-1.2 2.8-1.2h6c1.6 0 2.9 1.3 2.9 2.9V20c0 1.7-1.3 3-3 3h-.5" />
      <path d="M22.5 11.5h16M22 23h4M39 12V5.3M43 23h8.5c1.7 0 3-1.3 3-3v-7.5h-15" />
      <circle cx="14" cy="23" r="4.5" />
      <circle cx="34" cy="23" r="4.5" />
    </svg>
  );
}

/* ── Logo ────────────────────────────────────────────────────────────── */

/**
 * Carbase mark — a squared "C" split into a white upper form (CAR) sitting on
 * a red base (BASE), set in a navy tile. See `lib/logo.ts` for the geometry.
 */
export function LogoMark({
  onLight = false,
  className = "size-10",
}: {
  onLight?: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOGO_VIEWBOX}
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect
        width="48"
        height="48"
        fill={onLight ? logoColors.tile : logoColors.tileOnDark}
      />
      <path fill={logoColors.car} d={LOGO_CAR_PATH} />
      <rect {...LOGO_BASE_RECT} fill={logoColors.base} />
    </svg>
  );
}

/** Carbase lockup: mark + wordmark for light or dark bands. */
export function Logo({ onLight = false }: { onLight?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark onLight={onLight} className="size-10 shrink-0" />
      <span
        className={`font-display text-[1.6rem] leading-none font-bold tracking-[0.07em] ${onLight ? "text-ink-900" : "text-white"}`}
      >
        CAR
        <span className={onLight ? "text-brand-700" : "text-brand-300"}>
          BASE
        </span>
      </span>
    </span>
  );
}
