import sharp from "sharp";

export const MAX_PHOTOS = 5;
export const MAX_INPUT_PHOTO_BYTES = 3_000_000;
export const MAX_RAW_PHOTO_TOTAL_BYTES = 4_200_000;
export const MAX_NORMALIZED_TOTAL_BYTES = 4_200_000;
export const MAX_IMAGE_PIXELS = 20_000_000;
export const MAX_IMAGE_EDGE = 8_192;
export const NORMALIZED_IMAGE_EDGE = 1_600;

const ALLOWED_RASTER_FORMATS = new Set(["jpeg", "png", "webp"]);

export class QuoteImageValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "QuoteImageValidationError";
  }
}

async function normalizeOnePhoto(photo, index, imageFactory) {
  if (!(photo instanceof File) || photo.size <= 0) {
    throw new QuoteImageValidationError("Only image files can be attached.");
  }
  if (photo.size > MAX_INPUT_PHOTO_BYTES) {
    throw new QuoteImageValidationError(
      "Photos are too large — please remove some and retry.",
    );
  }

  const input = Buffer.from(await photo.arrayBuffer());

  try {
    const image = imageFactory(input, {
      animated: false,
      failOn: "error",
      limitInputPixels: MAX_IMAGE_PIXELS,
      sequentialRead: true,
    }).timeout({ seconds: 4 });
    const metadata = await image.metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const pages = metadata.pages ?? 1;

    if (
      !metadata.format ||
      !ALLOWED_RASTER_FORMATS.has(metadata.format) ||
      pages !== 1 ||
      width <= 0 ||
      height <= 0 ||
      width > MAX_IMAGE_EDGE ||
      height > MAX_IMAGE_EDGE ||
      width * height > MAX_IMAGE_PIXELS
    ) {
      throw new QuoteImageValidationError(
        "Only valid JPEG, PNG or WebP photos can be attached.",
      );
    }

    const content = await image
      .rotate()
      .resize({
        width: NORMALIZED_IMAGE_EDGE,
        height: NORMALIZED_IMAGE_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    if (content.length > MAX_INPUT_PHOTO_BYTES) {
      throw new QuoteImageValidationError(
        "Photos are too large — please remove some and retry.",
      );
    }

    return {
      filename: `photo-${index + 1}.jpg`,
      contentType: "image/jpeg",
      size: content.length,
      content,
    };
  } catch (error) {
    if (error instanceof QuoteImageValidationError) throw error;
    throw new QuoteImageValidationError(
      "One or more photos could not be read. Please use JPEG, PNG or WebP images.",
    );
  }
}

export async function normalizeQuotePhotos(
  photos,
  { imageFactory = sharp } = {},
) {
  if (photos.length > MAX_PHOTOS) {
    throw new QuoteImageValidationError(
      `Please attach no more than ${MAX_PHOTOS} photos.`,
    );
  }

  const normalized = [];
  let totalBytes = 0;

  // Keep decoding sequential so a single request cannot fan out native image work.
  for (const [index, photo] of photos.entries()) {
    const result = await normalizeOnePhoto(photo, index, imageFactory);
    totalBytes += result.size;
    if (totalBytes > MAX_NORMALIZED_TOTAL_BYTES) {
      throw new QuoteImageValidationError(
        "Photos are too large — please remove some and retry.",
      );
    }
    normalized.push(result);
  }

  return normalized;
}
