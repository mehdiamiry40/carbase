import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // A production build may include the real analytics ID. Keep test visits and
  // synthetic receipt events inside the local verification environment.
  await page.route("**/*", (route) => {
    const hostname = new URL(route.request().url()).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost"
      ? route.continue()
      : route.abort();
  });
});

async function completeQuote(page: Page) {
  const form = page.locator("form");
  await form.getByLabel(/Make/).fill("Toyota");
  await form.getByLabel(/Model/).fill("Corolla");
  await form.locator("select").first().selectOption("2015");
  await form.getByRole("button", { name: "Continue" }).click();
  await form.getByRole("button", { name: "Skip for now" }).click();
  await form.getByLabel(/Name/).fill("Test User");
  await form.getByLabel(/Phone/).fill("0400000000");
  await form.getByLabel(/Suburb/).fill("Toowoomba");
  await form.getByRole("button", { name: "Get my free quote" }).click();
}

test("an unconfirmed 2xx never renders the receipt screen", async ({ page }) => {
  await page.route("**/api/quote", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
  );
  await page.goto("/quote");
  await completeQuote(page);

  await expect(
    page.getByText("We could not confirm that your request was received."),
  ).toBeVisible();
  await expect(page.getByText("Request received")).toHaveCount(0);
});

test("a safely stored response renders the confirmed receipt screen", async ({ page }) => {
  await page.route("**/api/quote", (route) =>
    route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        delivered: false,
        safelyStored: true,
      }),
    }),
  );
  await page.goto("/quote");
  await completeQuote(page);

  await expect(page.getByText("Request received")).toBeVisible();
});
