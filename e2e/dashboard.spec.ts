// e2e/search.spec.ts
import { test, expect, Page } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function goToDashboard(page: Page) {
  await page.goto("/");
  await page.waitForSelector('[data-testid="content-card"]', { timeout: 10_000 });
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. SEARCH FUNCTIONALITY
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Search functionality", () => {
  test.beforeEach(async ({ page }) => goToDashboard(page));

  test("search bar is visible and focusable", async ({ page }) => {
    const input = page.locator('[placeholder*="Search"]');
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  });

  test("typing filters cards after 300ms debounce", async ({ page }) => {
    const allCards = page.locator('[data-testid="content-card"]');
    const initialCount = await allCards.count();

    await page.fill('[placeholder*="Search"]', "Technology");
    await page.waitForTimeout(400);

    const filteredCount = await allCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    for (const card of await allCards.all()) {
      const text = await card.textContent();
      expect(text?.toLowerCase()).toContain("technology");
    }
  });

  test("empty state shows when query has no matches", async ({ page }) => {
    await page.fill('[placeholder*="Search"]', "xyzzznotexist9999");
    await page.waitForTimeout(400);
    await expect(page.locator("text=/No results|No content/")).toBeVisible();
  });

  test("clear (X) button resets search", async ({ page }) => {
    const allCards = page.locator('[data-testid="content-card"]');
    const initialCount = await allCards.count();

    await page.fill('[placeholder*="Search"]', "Science");
    await page.waitForTimeout(400);

    await page.click('[aria-label="Clear search"]');
    await page.waitForTimeout(400);

    await expect(page.locator('[placeholder*="Search"]')).toHaveValue("");
    expect(await allCards.count()).toBe(initialCount);
  });

  test("search persists when switching tabs and back", async ({ page }) => {
    await page.fill('[placeholder*="Search"]', "Finance");
    await page.waitForTimeout(400);

    await page.click('[data-testid="nav-trending"]');
    await page.click('[data-testid="nav-feed"]');
    await page.waitForTimeout(400);

    // Search query should still be applied
    await expect(page.locator('[placeholder*="Search"]')).toHaveValue("Finance");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. DRAG-AND-DROP REORDERING
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Drag-and-drop reordering", () => {
  test.beforeEach(async ({ page }) => goToDashboard(page));

  test("drags first card to second position", async ({ page }) => {
    const cards = page.locator('[data-testid="content-card"]');

    const firstTitle  = await cards.nth(0).locator("h3").textContent();
    const secondTitle = await cards.nth(1).locator("h3").textContent();

    // Simulate drag using mouse events
    const src  = await cards.nth(0).boundingBox();
    const dest = await cards.nth(1).boundingBox();

    if (!src || !dest) throw new Error("Cards not visible");

    await page.mouse.move(src.x + src.width / 2,  src.y  + src.height / 2);
    await page.mouse.down();
    await page.mouse.move(dest.x + dest.width / 2, dest.y + dest.height / 2, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(200);

    const newFirstTitle = await cards.nth(0).locator("h3").textContent();
    // Order should have changed
    expect(newFirstTitle).not.toBe(firstTitle);
  });

  test("drag hint text is visible in feed view", async ({ page }) => {
    await expect(page.locator("text=/Drag|reorder/i")).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. FAVORITES FLOW
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Favorites functionality", () => {
  test.beforeEach(async ({ page }) => goToDashboard(page));

  test("favoriting a card adds it to Favorites view", async ({ page }) => {
    const firstCard = page.locator('[data-testid="content-card"]').first();
    const title     = await firstCard.locator("h3").textContent();

    // Heart the first card
    await firstCard.locator('[aria-label*="favorite"]').click();

    // Navigate to Favorites
    await page.click('[data-testid="nav-favorites"]');
    await page.waitForTimeout(200);

    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test("un-favoriting removes item from Favorites view", async ({ page }) => {
    // Favorite then unfavorite
    const firstCard = page.locator('[data-testid="content-card"]').first();
    const title     = await firstCard.locator("h3").textContent();

    await firstCard.locator('[aria-label*="favorite"]').click();
    await page.click('[data-testid="nav-favorites"]');
    await page.waitForTimeout(200);

    await page.locator(`text=${title}`).locator("..").locator('[aria-label*="favorite"]').click();
    await page.waitForTimeout(200);

    await expect(page.locator(`text=${title}`)).not.toBeVisible();
  });

  test("favorites count updates in nav badge", async ({ page }) => {
    const badge = page.locator('[data-testid="nav-favorites"]');

    // Initially no number or (0)
    const firstCard = page.locator('[data-testid="content-card"]').first();
    await firstCard.locator('[aria-label*="favorite"]').click();
    await page.waitForTimeout(200);

    await expect(badge).toContainText("1");
  });

  test("favorites persist after page reload", async ({ page }) => {
    const firstCard = page.locator('[data-testid="content-card"]').first();
    const title     = await firstCard.locator("h3").textContent();
    await firstCard.locator('[aria-label*="favorite"]').click();

    await page.reload();
    await page.waitForSelector('[data-testid="content-card"]', { timeout: 10_000 });

    await page.click('[data-testid="nav-favorites"]');
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. DARK MODE
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Dark mode toggle", () => {
  test.beforeEach(async ({ page }) => goToDashboard(page));

  test("toggles theme class on root element", async ({ page }) => {
    const toggle = page.locator('[aria-label*="dark mode"], [aria-label*="light mode"]').first();
    const root   = page.locator("html, body").first();

    await toggle.click();
    await page.waitForTimeout(150);

    // After one click, some theme attribute/class should change
    const after = await root.evaluate(el =>
      el.getAttribute("data-theme") ?? el.className
    );
    expect(after).toBeTruthy();
  });

  test("dark mode persists after reload", async ({ page }) => {
    // Click toggle to switch to light mode (default is dark)
    await page.click('[aria-label*="mode"]');
    await page.reload();
    await page.waitForSelector('[data-testid="content-card"]', { timeout: 10_000 });

    // The body background should NOT be the dark color
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // Dark mode bg is approximately rgb(11, 15, 26)
    expect(bg).not.toBe("rgb(11, 15, 26)");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. SETTINGS — CATEGORY PREFERENCES
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Settings — category preferences", () => {
  test.beforeEach(async ({ page }) => goToDashboard(page));

  test("deselecting a category removes its cards from feed", async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="nav-settings"]');
    await page.waitForTimeout(200);

    // Deselect "Technology" (should be selected by default)
    await page.click('[data-testid="category-btn-Technology"]');
    await page.waitForTimeout(200);

    // Go back to feed
    await page.click('[data-testid="nav-feed"]');
    await page.waitForTimeout(300);

    const cards = await page.locator('[data-testid="content-card"]').all();
    for (const card of cards) {
      const cat = await card.locator('[data-testid="category-badge"]').textContent();
      expect(cat).not.toContain("Technology");
    }
  });

  test("cannot deselect all categories (minimum 1)", async ({ page }) => {
    await page.click('[data-testid="nav-settings"]');

    // Get all selected categories
    const selected = await page.locator('[data-testid^="category-btn-"][aria-pressed="true"]').all();

    // Click all but one
    for (let i = 0; i < selected.length - 1; i++) {
      await selected[i].click();
      await page.waitForTimeout(100);
    }

    // Try to click the last one — should stay selected
    await selected[selected.length - 1].click();
    await page.waitForTimeout(100);
    await expect(selected[selected.length - 1]).toHaveAttribute("aria-pressed", "true");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. AI CONTENT REFRESH
// ═════════════════════════════════════════════════════════════════════════════
test.describe("AI content refresh", () => {
  test.beforeEach(async ({ page }) => goToDashboard(page));

  test("clicking AI Refresh shows loading state then new content", async ({ page }) => {
    await page.click('button:has-text("AI Refresh")');

    // Loading indicator should appear
    await expect(page.locator("text=/Refreshing|Loading/i")).toBeVisible({ timeout: 3_000 });

    // Should eventually resolve (wait up to 30s for API)
    await expect(page.locator('[data-testid="content-card"]').first()).toBeVisible({ timeout: 30_000 });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. RESPONSIVE LAYOUT
// ═════════════════════════════════════════════════════════════════════════════
test.describe("Responsive layout", () => {
  test("sidebar collapses on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goToDashboard(page);

    const sidebar = page.locator("aside");
    const width   = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    // Should be icon-only width (~60px) on mobile
    expect(width).toBeLessThan(100);
  });

  test("content grid is single-column on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goToDashboard(page);

    const cards = await page.locator('[data-testid="content-card"]').all();
    if (cards.length < 2) return;

    const box0 = await cards[0].boundingBox();
    const box1 = await cards[1].boundingBox();
    // Single column — cards should stack vertically (same x, different y)
    expect(Math.abs((box0?.x ?? 0) - (box1?.x ?? 0))).toBeLessThan(20);
  });
});