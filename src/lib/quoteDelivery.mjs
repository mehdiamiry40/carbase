export const quoteDeliveryUnavailable = Object.freeze({
  status: 503,
  body: Object.freeze({
    ok: false,
    error: "Online quote requests are temporarily unavailable. Please call us instead.",
  }),
});

/**
 * Resolve the delivery settings without ever accepting customer data.
 *
 * @param {Record<string, string | undefined>} env
 * @param {string} defaultDestination
 */
export function resolveQuoteDelivery(env, defaultDestination) {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    destination: env.QUOTE_TO_EMAIL?.trim() || defaultDestination,
    sender:
      env.QUOTE_FROM_EMAIL?.trim() ||
      "Carbase Website <onboarding@resend.dev>",
  };
}

/** @param {Pick<Console, "warn">} logger */
export function logQuoteDeliveryUnavailable(logger = console) {
  logger.warn("[quote] Email delivery is not configured. Set RESEND_API_KEY.");
}

/** @param {Pick<Console, "error">} logger */
export function logQuoteDeliveryFailure(logger = console) {
  logger.error("[quote] Delivery failed.");
}
