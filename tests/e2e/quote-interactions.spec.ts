import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    releasePhotoDecodes: () => void;
    pendingPhotoDecodes: number;
    closedPhotoBitmaps: number;
  }
}

const imageBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADklEQVQImWPoAAMGCAUALK4GYSSeFPoAAAAASUVORK5CYII=",
  "base64",
);

function photo(name: string) {
  return { name, mimeType: "image/png", buffer: imageBytes };
}

async function carDetails(page: Page) {
  const form = page.locator("form");
  await form.getByLabel(/^Make/).fill("Toyota");
  await form.getByLabel(/^Model/).fill("Corolla");
  await form.getByLabel(/^Year/).selectOption("2015");
  await form.getByRole("button", { name: "Continue", exact: true }).click();
}

async function contactDetails(page: Page, name = "Original User") {
  const form = page.locator("form");
  await form.getByLabel(/^Name/).fill(name);
  await form.getByLabel(/^Phone/).fill("0400000000");
  await form.getByLabel(/^Suburb/).fill("Toowoomba");
}

async function delayPhotoDecodes(page: Page) {
  await page.addInitScript(() => {
    const original = window.createImageBitmap.bind(window);
    const releases: (() => void)[] = [];
    window.pendingPhotoDecodes = 0;
    window.closedPhotoBitmaps = 0;
    window.releasePhotoDecodes = () => releases.splice(0).forEach((release) => release());
    Object.defineProperty(window, "createImageBitmap", {
      value: async (file: Blob) => {
        window.pendingPhotoDecodes += 1;
        await new Promise<void>((resolve) => releases.push(resolve));
        const bitmap = await original(file);
        const close = bitmap.close.bind(bitmap);
        bitmap.close = () => { window.closedPhotoBitmaps += 1; close(); };
        return bitmap;
      },
    });
  });
}

const confirmedReceipt = {
  status: 202,
  contentType: "application/json",
  body: JSON.stringify({ ok: true, delivered: false, safelyStored: true }),
};

test.beforeEach(async ({ page }) => {
  // All leads and photos below are synthetic. Keep these checks local, including analytics.
  await page.route("**/*", (route) => {
    const hostname = new URL(route.request().url()).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost"
      ? route.continue()
      : route.abort();
  });
});

test("keyboard focus follows steps, field errors and the confirmed receipt", async ({ page }) => {
  await page.route("**/api/quote", (route) => route.fulfill(confirmedReceipt));
  await page.goto("/quote");
  const form = page.locator("form");
  await form.getByRole("button", { name: "Continue", exact: true }).focus();
  await page.keyboard.press("Enter");
  const make = form.getByLabel(/^Make/);
  await expect(make).toBeFocused();
  await expect(make).toHaveAttribute("aria-invalid", "true");
  await expect(make).toHaveAccessibleDescription("Please fill in the make, model and year.");
  await expect(form.getByLabel(/^Model/)).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByLabel(/^Year/)).toHaveAccessibleDescription("Please fill in the make, model and year.");

  await carDetails(page);
  await expect(form.getByRole("heading", { name: "Step 2 of 3: Photos" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByRole("button", { name: "Add car photos" })).toBeFocused();
  await form.getByRole("button", { name: "Skip for now" }).focus();
  await page.keyboard.press("Enter");
  await expect(form.getByLabel(/^Name/)).toBeFocused();

  await contactDetails(page);
  await form.getByLabel(/^Phone/).fill("123");
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect(form.getByLabel(/^Phone/)).toBeFocused();
  await expect(form.getByLabel(/^Phone/)).toHaveAccessibleDescription("That phone number looks too short.");
  await expect(form.getByLabel(/^Name/)).not.toHaveAttribute("aria-invalid");
  await form.getByLabel(/^Phone/).fill("0400000000");
  await form.getByLabel(/^Email/).fill("invalid");
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect(form.getByLabel(/^Email/)).toBeFocused();
  await expect(form.getByLabel(/^Email/)).toHaveAccessibleDescription("Please enter a valid email address, or leave it blank.");
  await form.getByLabel(/^Email/).fill("");
  await form.getByRole("button", { name: "Get my free quote" }).click();

  await expect(page.getByRole("heading", { name: "Thanks, Original! Request received." })).toBeFocused();
  await page.getByRole("button", { name: "Submit another car" }).click();
  await expect(form.getByLabel(/^Make/)).toBeFocused();
  await expect(form.getByLabel(/^Make/)).toHaveValue("");
});

test("overlapping photo selections reserve five slots and block advancing until all photos are ready", async ({ page }) => {
  await delayPhotoDecodes(page);
  let requestBody: string | null = null;
  await page.route("**/api/quote", async (route) => {
    requestBody = route.request().postData();
    await route.fulfill(confirmedReceipt);
  });
  await page.goto("/quote");
  await carDetails(page);
  const form = page.locator("form");
  const input = form.getByLabel("Car photos", { exact: true });
  await input.setInputFiles([photo("one.png"), photo("two.png"), photo("three.png")]);
  await input.setInputFiles([photo("four.png"), photo("five.png"), photo("six.png")]);

  await expect(form.getByRole("status")).toHaveText("Preparing 5 photos. Please wait before continuing.");
  await expect(form.getByRole("button", { name: "Preparing photos…" })).toBeDisabled();
  await expect(form.getByRole("button", { name: "Back", exact: true })).toBeDisabled();
  await expect(form.getByRole("alert")).toHaveText("Only 5 photos can be attached.");
  await form.getByLabel("Anything else we should know?").focus();
  await page.keyboard.press("Control+Enter");
  await form.evaluate((element: HTMLFormElement) => element.requestSubmit());
  await expect(form.getByRole("heading", { name: "Step 2 of 3: Photos" })).toBeAttached();
  expect(requestBody).toBeNull();

  await page.evaluate(() => window.releasePhotoDecodes());
  await expect(form.getByRole("button", { name: /^Remove photo / })).toHaveCount(5);
  await expect(form.getByRole("button", { name: "Continue", exact: true })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.closedPhotoBitmaps)).toBe(5);
  await form.getByRole("button", { name: "Continue", exact: true }).click();
  await contactDetails(page);
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect(page.getByRole("heading", { name: /Request received/ })).toBeVisible();
  const filenames = Array.from((requestBody ?? "").matchAll(/name="photos"; filename="([^"]+)"/g), (match) => match[1]);
  expect(filenames.sort()).toEqual(["five.jpg", "four.jpg", "one.jpg", "three.jpg", "two.jpg"]);
});

test("cancelled decoding cannot insert a stale photo after a receipt and reset", async ({ page }) => {
  await delayPhotoDecodes(page);
  let requestBody = "";
  await page.route("**/api/quote", async (route) => {
    requestBody = route.request().postData() ?? "";
    await route.fulfill(confirmedReceipt);
  });
  await page.goto("/quote");
  await carDetails(page);
  const form = page.locator("form");
  await form.getByLabel("Car photos", { exact: true }).setInputFiles(photo("late.png"));
  await expect(form.getByRole("status")).toContainText("Preparing 1 photo");
  await form.getByRole("button", { name: "Cancel photo processing" }).click();
  await form.getByRole("button", { name: "Skip for now" }).click();
  await contactDetails(page);
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await page.getByRole("button", { name: "Submit another car" }).click();
  await page.evaluate(() => window.releasePhotoDecodes());
  await expect.poll(() => page.evaluate(() => window.closedPhotoBitmaps)).toBe(1);
  await carDetails(page);
  await expect(form.getByRole("button", { name: /^Remove photo / })).toHaveCount(0);
  await expect(form.getByRole("button", { name: "Skip for now" })).toBeEnabled();
  expect(requestBody).not.toContain('name="photos"');
});

test("leaving the form cleans up a delayed photo decode without sending a request", async ({ page }) => {
  await delayPhotoDecodes(page);
  let requests = 0;
  await page.route("**/api/quote", (route) => {
    requests += 1;
    return route.fulfill(confirmedReceipt);
  });
  await page.goto("/quote");
  await carDetails(page);
  await page.getByLabel("Car photos", { exact: true }).setInputFiles(photo("leaving.png"));
  await expect(page.locator("form").getByRole("status")).toContainText("Preparing 1 photo");
  await page.locator('header a[href="/about"]').first().click();
  await expect(page).toHaveURL(/\/about$/);
  await page.evaluate(() => window.releasePhotoDecodes());
  await expect.poll(() => page.evaluate(() => window.closedPhotoBitmaps)).toBe(1);
  await expect(page.locator("form")).toHaveCount(0);
  expect(requests).toBe(0);
});

test("a delayed request locks editing and navigation and keeps the submitted receipt details", async ({ page }) => {
  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => { releaseResponse = resolve; });
  let requestBody = "";
  await page.route("**/api/quote", async (route) => {
    requestBody = route.request().postData() ?? "";
    await responseGate;
    await route.fulfill(confirmedReceipt);
  });
  await page.goto("/quote");
  await carDetails(page);
  const form = page.locator("form");
  await form.getByRole("button", { name: "Skip for now" }).click();
  await contactDetails(page);
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect.poll(() => requestBody).toContain("Original User");
  await expect(form.getByLabel(/^Name/)).toBeDisabled();
  await expect(form.getByLabel(/^Phone/)).toBeDisabled();
  await expect(form.getByLabel(/^Email/)).toBeDisabled();
  await expect(form.getByLabel(/^Suburb/)).toBeDisabled();
  await expect(form.getByRole("button", { name: "Back", exact: true })).toBeDisabled();
  await expect(form.getByRole("button", { name: "Sending…" })).toBeDisabled();
  await expect(form.getByRole("status")).toHaveText("Sending your quote request. Please wait.");
  releaseResponse();
  await expect(page.getByRole("heading", { name: "Thanks, Original! Request received." })).toBeFocused();
  await expect(page.getByText("2015 Toyota Corolla", { exact: true })).toBeVisible();
});

test("unchanged retries keep their submission ID and editing rotates it", async ({ page }) => {
  const submissionIds: string[] = [];
  await page.route("**/api/quote", (route) => {
    const body = route.request().postData() ?? "";
    submissionIds.push(body.match(/name="submissionId"\r\n\r\n([^\r]+)/)?.[1] ?? "");
    return route.fulfill(submissionIds.length < 3
      ? { status: 503, contentType: "application/json", body: JSON.stringify({ error: "Please retry." }) }
      : confirmedReceipt);
  });
  await page.goto("/quote");
  await carDetails(page);
  const form = page.locator("form");
  await form.getByRole("button", { name: "Skip for now" }).click();
  await contactDetails(page);
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect(form.getByRole("alert")).toContainText("Please retry.");
  await form.getByRole("button", { name: "Back", exact: true }).click();
  await form.getByRole("button", { name: "Skip for now" }).click();
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect.poll(() => submissionIds.length).toBe(2);
  await expect(form.getByRole("button", { name: "Get my free quote" })).toBeEnabled();
  await form.getByLabel(/^Name/).fill("Updated User");
  await form.getByRole("button", { name: "Get my free quote" }).click();
  await expect(page.getByRole("heading", { name: "Thanks, Updated! Request received." })).toBeVisible();
  expect(submissionIds[0]).toMatch(/^[a-f0-9-]{36}$/);
  expect(submissionIds[1]).toBe(submissionIds[0]);
  expect(submissionIds[2]).not.toBe(submissionIds[1]);
});
