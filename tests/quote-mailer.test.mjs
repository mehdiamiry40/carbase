import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyResendError,
  createResendQuoteMailer,
} from "../src/lib/quoteMailer.mjs";

const record = {
  submissionId: "11111111-1111-4111-8111-111111111111",
  lead: {
    make: "Toyota",
    model: "Corolla",
    year: "2015",
    name: "Test User",
    phone: "0400000000",
    suburb: "Toowoomba",
  },
  photos: [],
};

test("ambiguous Resend transport and server errors are never marked retry-safe", () => {
  for (const name of [
    "application_error",
    "internal_server_error",
    "rate_limit_exceeded",
    "concurrent_idempotent_requests",
    "future_unknown_error",
  ]) {
    assert.deepEqual(classifyResendError({ name }), {
      status: "unknown",
      reason: "provider_ambiguous",
    });
  }
});

test("only definite Resend request rejections are marked retryable", () => {
  for (const name of [
    "missing_required_field",
    "invalid_parameter",
    "invalid_from_address",
    "validation_error",
  ]) {
    assert.deepEqual(classifyResendError({ name }), {
      status: "rejected",
      reason: "provider_rejected",
    });
  }
});

test("the Resend adapter retains application errors as ambiguous with a stable key", async () => {
  let requestOptions;
  class FakeResend {
    constructor() {
      this.emails = {
        send: async (_message, options) => {
          requestOptions = options;
          return {
            data: null,
            error: { name: "application_error", message: "ambiguous" },
          };
        },
      };
    }
  }

  const mailer = createResendQuoteMailer({
    apiKey: "test-key",
    destination: "quotes@example.com",
    sender: "Carbase <sender@example.com>",
    ResendClient: FakeResend,
    timeout: (operation) => operation(new AbortController().signal),
  });

  assert.deepEqual(await mailer.send(record), {
    status: "unknown",
    reason: "provider_ambiguous",
  });
  assert.equal(
    requestOptions.idempotencyKey,
    `carbase-quote-${record.submissionId}`,
  );
});
