import assert from "node:assert/strict";
import test from "node:test";
import {
  logQuoteOperationalEvent,
  quoteBackupReceived,
  resolveQuoteBackup,
  runWithTimeout,
} from "../src/lib/quoteBackup.mjs";

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

test("provider operations are bounded", async () => {
  await assert.rejects(
    runWithTimeout(() => new Promise(() => {}), 5),
    /Provider operation timed out/,
  );
});

test("operational logs allowlist fields and redact arbitrary provider or lead data", () => {
  const messages = [];
  const logger = {
    error: (message) => messages.push(message),
    warn: (message) => messages.push(message),
  };
  logQuoteOperationalEvent(
    "quote.backup.failed",
    {
      phase: "pre_delivery",
      submissionId: "c5af64e2-296f-47f0-8666-278a72876c43",
      customerName: "Private Person",
      providerError: "SECRET_PROVIDER_SENTINEL",
    },
    { level: "error", logger },
  );

  const output = messages.join(" ");
  assert.match(output, /quote\.backup\.failed/);
  assert.match(output, /pre_delivery/);
  assert.doesNotMatch(output, /Private Person|SECRET_PROVIDER_SENTINEL/);
});
