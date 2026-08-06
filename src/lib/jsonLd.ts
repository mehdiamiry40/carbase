/**
 * Serialize structured data without leaving a literal `<` in the script body.
 *
 * JSON-LD is data rather than executable JavaScript, but it is still rendered
 * inside a script element. Escaping `<` prevents an unexpected value from
 * terminating that element if content becomes CMS-managed in the future.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
