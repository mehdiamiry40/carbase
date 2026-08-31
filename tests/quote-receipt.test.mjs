import assert from "node:assert/strict";
import test from "node:test";
import {
  createQuoteSubmissionSession,
  isConfirmedQuoteReceipt,
  isQuoteSubmissionId,
} from "../src/lib/quoteReceipt.mjs";

test("only exact delivered and safely-stored contracts confirm receipt", () => {
  assert.equal(
    isConfirmedQuoteReceipt(200, { ok: true, delivered: true }),
    true,
  );
  assert.equal(
    isConfirmedQuoteReceipt(202, {
      ok: true,
      delivered: false,
      safelyStored: true,
    }),
    true,
  );

  for (const [status, value] of [
    [200, { ok: true }],
    [202, { ok: true, safelyStored: true }],
    [200, { ok: true, safelyStored: true }],
    [202, { ok: true, delivered: true }],
    [204, null],
    [200, null],
    [400, { ok: false }],
  ]) {
    assert.equal(isConfirmedQuoteReceipt(status, value), false);
  }
});

test("submission session retains one UUID through retries and rotates explicitly", () => {
  const generated = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ];
  const session = createQuoteSubmissionSession(() => generated.shift());

  assert.equal(session.current(), "11111111-1111-4111-8111-111111111111");
  assert.equal(session.current(), "11111111-1111-4111-8111-111111111111");
  assert.equal(session.rotate(), "22222222-2222-4222-8222-222222222222");
  assert.equal(session.current(), "22222222-2222-4222-8222-222222222222");
});

test("submission ID validation accepts UUIDv4 only", () => {
  assert.equal(
    isQuoteSubmissionId("11111111-1111-4111-8111-111111111111"),
    true,
  );
  assert.equal(
    isQuoteSubmissionId("11111111-1111-1111-8111-111111111111"),
    false,
  );
  assert.equal(isQuoteSubmissionId("not-a-uuid"), false);
});
