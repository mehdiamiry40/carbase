import assert from "node:assert/strict";
import test from "node:test";
import {
  createQuoteBackupPayload,
  logQuoteBackupCleanupFailure,
  logQuoteBackupFailure,
  logQuoteBackupStored,
  logQuoteBackupUnavailable,
  persistQuoteBackup,
  quoteBackupReceived,
  removeQuoteBackup,
  resolveQuoteBackup,
  runWithTimeout,
} from "../src/lib/quoteBackup.mjs";

const privateLead = {
  make: "Privacy Motors",
  model: "Secret Sedan",
  year: "2017",
  name: "Privacy Test Person",
  phone: "0499 888 777",
  suburb: "Privacy Test Suburb",
  email: "privacy-test@example.com",
};
const submissionId = "c5af64e2-296f-47f0-8666-278a72876c43";

test("backup storage requires an explicit private Blob token", () => {
  assert.equal(resolveQuoteBackup({}), null);
  assert.equal(resolveQuoteBackup({ BLOB_READ_WRITE_TOKEN: "   " }), null);
  assert.deepEqual(
    resolveQuoteBackup({ BLOB_READ_WRITE_TOKEN: "  vercel_blob_token  " }),
    { token: "vercel_blob_token" },
  );
});

test("a safely stored response is truthful about delayed delivery", () => {
  assert.equal(quoteBackupReceived.status, 202);
  assert.deepEqual(quoteBackupReceived.body, {
    ok: true,
    delivered: false,
    safelyStored: true,
    message: "Your quote request was safely received and will be reviewed.",
  });
});

test("backup payload atomically retains the lead and validated photos", async () => {
  const photo = new File([Uint8Array.from([0, 1, 2, 255])], "../private\nphoto.png", {
    type: "image/png",
  });
  const payload = JSON.parse(
    await createQuoteBackupPayload({
      lead: privateLead,
      photos: [photo],
      reason: "resend_failed",
      submissionId,
      receivedAt: new Date("2026-08-28T03:04:05.000Z"),
    }),
  );

  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.kind, "carbase.quote-backup");
  assert.equal(payload.submissionId, submissionId);
  assert.equal(payload.receivedAt, "2026-08-28T03:04:05.000Z");
  assert.deepEqual(payload.delivery, {
    provider: "resend",
    outcome: "resend_failed",
  });
  assert.deepEqual(payload.lead, privateLead);
  assert.deepEqual(payload.photos, [
    {
      filename: ".._private_photo.png",
      contentType: "image/png",
      size: 4,
      contentBase64: "AAEC/w==",
    },
  ]);
});

test("backup writes one deterministic, overwrite-safe private outbox object without PII in its pathname", async () => {
  const calls = [];
  const receivedAt = new Date("2026-08-28T03:04:05.000Z");
  const abortController = new AbortController();
  const result = await persistQuoteBackup({
    lead: privateLead,
    photos: [],
    reason: "resend_unavailable",
    submissionId,
    token: "vercel_blob_token",
    receivedAt,
    abortSignal: abortController.signal,
    upload: async (pathname, body, options) => {
      calls.push({ pathname, body, options });
      return { pathname, url: "private-test-url" };
    },
  });

  assert.equal(
    result.pathname,
    `quote-lead-backups/2026-08-28/lead-${submissionId}.json`,
  );
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].pathname,
    `quote-lead-backups/2026-08-28/lead-${submissionId}.json`,
  );
  assert.deepEqual(calls[0].options, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    abortSignal: abortController.signal,
    cacheControlMaxAge: 60,
    contentType: "application/json",
    token: "vercel_blob_token",
  });

  for (const privateValue of Object.values(privateLead)) {
    assert.doesNotMatch(calls[0].pathname, new RegExp(privateValue));
  }
  const storedPayload = JSON.parse(calls[0].body);
  assert.equal(storedPayload.submissionId, submissionId);
  assert.deepEqual(storedPayload.lead, privateLead);
});

test("backup rejects a non-UUID pathname identifier", async () => {
  await assert.rejects(
    persistQuoteBackup({
      lead: privateLead,
      photos: [],
      reason: "resend_failed",
      submissionId: "../../customer-name",
      token: "vercel_blob_token",
      upload: async () => {
        throw new Error("must not upload");
      },
    }),
    /UUID submission ID/,
  );
});

test("confirmed email cleanup deletes only the staged private pathname", async () => {
  const calls = [];
  const abortController = new AbortController();
  await removeQuoteBackup({
    pathname: `quote-lead-backups/2026-08-28/lead-${submissionId}.json`,
    token: "vercel_blob_token",
    abortSignal: abortController.signal,
    remove: async (pathname, options) => calls.push({ pathname, options }),
  });

  assert.deepEqual(calls, [
    {
      pathname: `quote-lead-backups/2026-08-28/lead-${submissionId}.json`,
      options: {
        token: "vercel_blob_token",
        abortSignal: abortController.signal,
      },
    },
  ]);
});

test("provider operations are bounded", async () => {
  await assert.rejects(
    runWithTimeout(() => new Promise(() => {}), 5),
    /Provider operation timed out/,
  );
});

test("backup alert events are structured and contain no submission data or secrets", () => {
  const messages = [];
  const logger = {
    warn: (message) => messages.push(message),
    error: (message) => messages.push(message),
  };

  logQuoteBackupStored("resend_failed", submissionId, logger);
  logQuoteBackupUnavailable(logger);
  logQuoteBackupFailure("pre_delivery", logger);
  logQuoteBackupCleanupFailure(submissionId, logger);

  assert.deepEqual(messages.map((message) => JSON.parse(message)), [
    {
      component: "quote-api",
      event: "quote.backup.stored",
      reason: "resend_failed",
      submissionId,
    },
    { component: "quote-api", event: "quote.backup.unavailable" },
    {
      component: "quote-api",
      event: "quote.backup.failed",
      phase: "pre_delivery",
    },
    {
      component: "quote-api",
      event: "quote.backup.cleanup_failed",
      submissionId,
    },
  ]);

  const output = messages.join(" ");
  for (const privateValue of [
    ...Object.values(privateLead),
    "vercel_blob_token",
  ]) {
    assert.doesNotMatch(output, new RegExp(privateValue));
  }
});
