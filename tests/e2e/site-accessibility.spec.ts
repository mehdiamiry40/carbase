import { expect, test, type Locator, type Page } from "@playwright/test";
import axe from "axe-core";

declare global {
  interface Window {
    axe: typeof axe;
  }
}

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const request = route.request();
    const hostname = new URL(request.url()).hostname;
    if (
      !["localhost", "127.0.0.1"].includes(hostname) ||
      request.resourceType() === "image" ||
      new URL(request.url()).pathname.startsWith("/api/")
    ) {
      return route.abort();
    }
    return route.continue();
  });
});

for (const viewport of [{ width: 667, height: 375 }, { width: 375, height: 480 }]) {
  test(`all mobile navigation actions are reachable at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
    const panel = page.locator("#mobile-navigation");
    const quote = navigation.getByRole("link", { name: "Get a free quote" });

    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    const geometry = await panel.evaluate((element) => ({
      bottom: element.getBoundingClientRect().bottom,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(geometry.bottom).toBeLessThanOrEqual(viewport.height);
    expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
    await quote.scrollIntoViewIfNeeded();
    await expect(quote).toBeInViewport({ ratio: 1 });
    await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    const screenshot = test.info().outputPath("mobile-menu-lower-actions.png");
    await page.screenshot({ path: screenshot });
    await test.info().attach("mobile-menu-lower-actions", { path: screenshot, contentType: "image/png" });
    await quote.click();
    await expect(page).toHaveURL(/\/quote$/);
    await expect(navigation).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
  });
}

test("resizing an open menu to desktop restores scrolling and visible focus", async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto("/");
  await page.evaluate(() => { document.body.style.overflow = "auto"; });
  await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await navigation.getByRole("link", { name: "Cash for cars", exact: true }).focus();

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(navigation).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("auto");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Cash for cars", exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
});

test("the navigation disclosure supports Escape and closes when keyboard focus leaves", async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /navigation$/ });
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(navigation.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Space");
  const links = navigation.getByRole("link");
  for (let i = 0; i < await links.count(); i += 1) {
    await page.keyboard.press("Tab");
    await expect(links.nth(i)).toBeFocused();
  }
  await expect(links.last()).toBeInViewport({ ratio: 1 });
  const focusedBounds = await links.last().evaluate((element) => {
    const outline = getComputedStyle(element);
    const padding = Number.parseFloat(outline.outlineWidth) + Number.parseFloat(outline.outlineOffset);
    const panel = element.closest("#mobile-navigation")!;
    return {
      bottom: element.getBoundingClientRect().bottom + padding,
      availableBottom: panel.getBoundingClientRect().bottom - Number.parseFloat(getComputedStyle(panel).borderBottomWidth),
    };
  });
  expect(focusedBounds.bottom).toBeLessThanOrEqual(focusedBounds.availableBottom);
  await links.last().evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
  });
  const screenshot = test.info().outputPath("keyboard-menu-focus.png");
  await page.screenshot({ path: screenshot });
  await test.info().attach("keyboard-menu-focus", { path: screenshot, contentType: "image/png" });
  await page.keyboard.press("Tab");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("only the expanded FAQ answer is exposed to assistive technology", async ({ page, context }) => {
  await page.goto("/faq");
  const buttons = page.locator("main button[aria-controls]");
  const firstQuestion = (await buttons.nth(0).innerText()).trim();
  const secondQuestion = (await buttons.nth(1).innerText()).trim();
  const session = await context.newCDPSession(page);
  const answerNames = async () => {
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    return nodes.filter((node) => !node.ignored && node.role?.value === "region")
      .map((node) => node.name?.value);
  };

  await expect.poll(answerNames).toEqual([firstQuestion]);
  await buttons.nth(1).click();
  await expect.poll(answerNames).toEqual([secondQuestion]);
  await buttons.nth(1).click();
  await expect.poll(answerNames).toEqual([]);

  // A future link inside a closed answer must not become an invisible tab stop.
  const closedPanel = page.locator("main [role=region]").first();
  await closedPanel.evaluate((element) => {
    const link = document.createElement("a");
    link.href = "/quote";
    link.textContent = "Request a quote from this answer";
    element.querySelector("p")?.append(link);
    link.focus();
  });
  await expect(closedPanel.locator("a")).not.toBeFocused();
  await buttons.nth(0).focus();
  await page.keyboard.press("Tab");
  await expect(buttons.nth(1)).toBeFocused();
});

async function checkSettledContrast(page: Page, targets: Locator, name: string) {
  await targets.first().scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => {})));
  });
  await targets.evaluateAll((elements) => {
    elements.forEach((element) => element.setAttribute("data-contrast-check", ""));
  });
  // The production policy hashes inline scripts, so a test-only script element
  // is refused. The DevTools protocol evaluates axe outside that policy.
  const session = await page.context().newCDPSession(page);
  try {
    const injected = await session.send("Runtime.evaluate", {
      expression: axe.source,
      awaitPromise: true,
    });
    if (injected.exceptionDetails) {
      throw new Error(injected.exceptionDetails.text ?? "Could not evaluate axe");
    }
  } finally {
    await session.detach();
  }
  const result = await page.evaluate(async () => {
    const { violations, incomplete, passes } = await window.axe.run(
      { include: ["[data-contrast-check]"] },
      { runOnly: { type: "rule", values: ["color-contrast"] } },
    );
    return { violations, incomplete, passes };
  });
  await test.info().attach(name, { body: JSON.stringify(result, null, 2), contentType: "application/json" });
  expect(result.violations).toEqual([]);
  expect(result.incomplete).toEqual([]);
  expect(result.passes.flatMap((pass) => pass.nodes)).toHaveLength(await targets.count());
}

test("small homepage labels, process numbers and quote hours meet settled text contrast", async ({ page }) => {
  await page.goto("/");
  const vehicles = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Every make. Every model. Almost every condition." }),
  });
  const labels = vehicles.locator("ul .font-mono");
  await expect(labels).toHaveCount(6);
  await checkSettledContrast(page, labels, "homepage-vehicle-number-contrast");

  await page.goto("/how-it-works");
  const numbers = page.locator("main ol .font-mono");
  await expect(numbers).toHaveCount(4);
  await checkSettledContrast(page, numbers, "process-number-contrast");

  await page.goto("/quote");
  const hours = page.getByText("Rather talk it through?").locator("..").locator("p").last();
  await checkSettledContrast(page, hours, "quote-hours-contrast");
});

test("empty quote inputs retain readable placeholder text", async ({ page }) => {
  await page.goto("/quote");
  const placeholders = page.locator("form input[placeholder]:visible");
  expect(await placeholders.count()).toBeGreaterThan(0);
  const ratios = await placeholders.evaluateAll((inputs) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const color = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const luminance = (rgb: number[]) => rgb.slice(0, 3).reduce((sum, channel, i) => {
      const linear = channel / 255;
      return sum + (linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4)
        * [0.2126, 0.7152, 0.0722][i];
    }, 0);
    return inputs.map((input) => {
      const placeholder = getComputedStyle(input, "::placeholder");
      const foreground = color(placeholder.color);
      const background = color(getComputedStyle(input).backgroundColor);
      const alpha = foreground[3] / 255 * Number(placeholder.opacity);
      const text = luminance(foreground.map((channel, i) => channel * alpha + background[i] * (1 - alpha)));
      const surface = luminance(background);
      return (Math.max(text, surface) + 0.05) / (Math.min(text, surface) + 0.05);
    });
  });
  ratios.forEach((ratio) => expect(ratio).toBeGreaterThanOrEqual(4.5));
});

test("marketing content remains readable when the application scripts fail", async ({ page }) => {
  await page.route("**/_next/static/**/*.js*", (route) => route.abort());
  await page.goto("/how-it-works");
  const content = page.getByRole("heading", { name: "What to have ready at pickup" });
  await content.scrollIntoViewIfNeeded();
  await expect(content).toBeVisible();
  const opacity = await content.evaluate((element) => {
    let result = 1;
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      result *= Number(getComputedStyle(ancestor).opacity);
    }
    return result;
  });
  expect(opacity).toBe(1);
});
