// ─────────────────────────────────────────────────────────────────────────
//  Carbase brand mark.
//
//  A squared "C" split into two tones: the white upper form (CAR) resting on
//  a solid red base (BASE) — the same split the wordmark makes. The chamfered
//  top-right terminal gives the letter the rake of a windscreen.
//
//  Three shapes, no hairlines, so it still reads in a 16px browser tab. The
//  geometry lives here because the mark is drawn in three places: the React
//  components in `components/icons.tsx`, the Open Graph card, and the static
//  favicon at `app/icon.svg` — that one has to be a real file for Next.js to
//  pick it up, so keep its path data matching the constants below.
// ─────────────────────────────────────────────────────────────────────────

export const logoColors = {
  /** Tile on light backgrounds. */
  tile: "#0a2f68",
  /** Tile on the ink-900 footer — a shade deeper, so the block still reads. */
  tileOnDark: "#061a39",
  /** The "CAR" half of the letter. */
  car: "#ffffff",
  /** The base it sits on. */
  base: "#dc1f4b",
} as const;

/** Every measurement below is drawn against this box. */
export const LOGO_VIEWBOX = "0 0 48 48";

/** Upper form: top arm with a chamfered terminal, plus the stem. */
export const LOGO_CAR_PATH = "M8 8H33L40 16H16V31H8Z";

/** The base bar the letter rests on. */
export const LOGO_BASE_RECT = { x: 8, y: 31, width: 32, height: 9 } as const;

/**
 * The mark as a standalone SVG string, for renderers that can't take JSX —
 * the Open Graph card goes through Satori, which rasterises images but not
 * arbitrary SVG elements.
 */
export function logoMarkSvg(tile: string = logoColors.tile) {
  const { x, y, width, height } = LOGO_BASE_RECT;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}">`,
    `<rect width="48" height="48" fill="${tile}"/>`,
    `<path fill="${logoColors.car}" d="${LOGO_CAR_PATH}"/>`,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${logoColors.base}"/>`,
    `</svg>`,
  ].join("");
}
