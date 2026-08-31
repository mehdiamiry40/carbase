import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  QuoteImageValidationError,
  normalizeQuotePhotos,
} from "../src/lib/quoteImages.mjs";

test("valid raster input is normalized to a controlled JPEG", async () => {
  const png = await sharp({
    create: {
      width: 24,
      height: 12,
      channels: 4,
      background: { r: 220, g: 20, b: 60, alpha: 0.5 },
    },
  })
    .png()
    .withMetadata({ comment: "private marker" })
    .toBuffer();
  const result = await normalizeQuotePhotos([
    new File([png], "attacker-name.png", { type: "image/png" }),
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].filename, "photo-1.jpg");
  assert.equal(result[0].contentType, "image/jpeg");
  assert.equal(result[0].size, result[0].content.length);
  const metadata = await sharp(result[0].content).metadata();
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.width, 24);
  assert.equal(metadata.height, 12);
  assert.equal(result[0].content.includes(Buffer.from("private marker")), false);
});

test("spoofed image MIME with arbitrary bytes is rejected", async () => {
  await assert.rejects(
    normalizeQuotePhotos([
      new File(["<html><script>alert(1)</script></html>"], "payload.png", {
        type: "image/png",
      }),
    ]),
    QuoteImageValidationError,
  );
});

test("active SVG input is rejected even when declared as an image", async () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
  await assert.rejects(
    normalizeQuotePhotos([
      new File([svg], "payload.svg", { type: "image/svg+xml" }),
    ]),
    /Only valid JPEG, PNG or WebP photos|could not be read/,
  );
});

test("over-pixel images are rejected before normalization", async () => {
  const fakeImage = {
    timeout() {
      return this;
    },
    async metadata() {
      return { format: "png", width: 5_000, height: 5_000, pages: 1 };
    },
  };
  await assert.rejects(
    normalizeQuotePhotos(
      [new File([Buffer.from([1])], "large.png", { type: "image/png" })],
      { imageFactory: () => fakeImage },
    ),
    QuoteImageValidationError,
  );
});
