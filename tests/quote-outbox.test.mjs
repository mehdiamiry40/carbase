import assert from "node:assert/strict";
import test from "node:test";
import {
  createQuoteOutboxRecord,
  createQuoteReceipt,
  createVercelQuoteStore,
  quoteOutboxPath,
  quotePayloadDigest,
} from "../src/lib/quoteOutbox.mjs";

const ID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2026-08-31T00:00:00.000Z");
const lead = { make: "Toyota", model: "Corolla", year: "2015" };
const photos = [
  {
    filename: "photo-1.jpg",
    contentType: "image/jpeg",
    size: 3,
    content: Buffer.from([1, 2, 3]),
  },
];

test("outbox identity and digest are stable across dates and object key order", () => {
  assert.equal(
    quoteOutboxPath(ID),
    `quote-lead-backups/v2/lead-${ID}.json`,
  );
  assert.equal(
    quotePayloadDigest(lead, photos),
    quotePayloadDigest({ year: "2015", model: "Corolla", make: "Toyota" }, photos),
  );

  const record = createQuoteOutboxRecord({
    lead,
    photos,
    submissionId: ID,
    receivedAt: NOW,
    retentionDays: 30,
  });
  assert.equal(record.state, "staged");
  assert.equal(record.receivedAt, NOW.toISOString());
  assert.equal(record.expiresAt, "2026-09-30T00:00:00.000Z");
  assert.equal(record.photos[0].contentBase64, "AQID");
});

test("receipt contains no lead or photo payload", () => {
  const record = createQuoteOutboxRecord({
    lead,
    photos,
    submissionId: ID,
    receivedAt: NOW,
  });
  const receipt = createQuoteReceipt({
    record,
    providerMessageId: "email_123",
    deliveredAt: NOW,
  });
  const serialized = JSON.stringify(receipt);

  assert.equal(receipt.payloadDigest, record.payloadDigest);
  assert.equal("lead" in receipt, false);
  assert.equal("photos" in receipt, false);
  assert.equal(serialized.includes("Toyota"), false);
  assert.equal(serialized.includes("AQID"), false);
});

test("retention configuration can never exceed the published 30-day maximum", () => {
  const record = createQuoteOutboxRecord({
    lead,
    photos: [],
    submissionId: ID,
    receivedAt: new Date("2026-08-01T00:00:00.000Z"),
    retentionDays: 365,
  });

  assert.equal(record.expiresAt, "2026-08-31T00:00:00.000Z");
});

test("Blob adapter uses non-overwriting create and ETag-guarded update/delete", async () => {
  const calls = [];
  let revision = 0;
  const store = createVercelQuoteStore({
    token: "private-token",
    async putBlob(pathname, body, options) {
      calls.push({ operation: "put", pathname, options, body: JSON.parse(body) });
      return { pathname, etag: `etag-${++revision}` };
    },
    async getBlob() {
      return null;
    },
    async deleteBlob(pathname, options) {
      calls.push({ operation: "delete", pathname, options });
    },
    async listBlobs() {
      return { blobs: [], hasMore: false };
    },
  });
  const record = createQuoteOutboxRecord({
    lead,
    photos,
    submissionId: ID,
    receivedAt: NOW,
  });
  const created = await store.create(record);
  const updated = await store.update(
    created.stored,
    { state: "delivery_rejected" },
    NOW,
  );
  await store.remove(updated);

  assert.equal(calls[0].options.allowOverwrite, false);
  assert.equal(calls[1].options.allowOverwrite, true);
  assert.equal(calls[1].options.ifMatch, "etag-1");
  assert.equal(calls[2].options.ifMatch, "etag-2");
});
