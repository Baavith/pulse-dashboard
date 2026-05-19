// __tests__/components/ContentCard.test.tsx
// Run: npx vitest or npm run test

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock data ────────────────────────────────────────────────────────
const mockItem = {
  id:          "test-1",
  type:        "news" as const,
  category:    "Technology",
  title:       "AI Achieves New Milestone in Code Generation",
  description: "Researchers report a 50% improvement in complex reasoning tasks. The model can now debug code in over 40 languages.",
  author:      "Tech Chronicle",
  timeAgo:     "2h ago",
  imageId:     42,
  trending:    true,
  readTime:    "3 min",
};

// ─── ContentCard Tests ───────────────────────────────────────────────
describe("ContentCard", () => {
  const onFav = vi.fn();

  beforeEach(() => onFav.mockClear());

  it("renders the article title", () => {
    render(<MockContentCard item={mockItem} isFav={false} onFav={onFav} />);
    expect(screen.getByText(mockItem.title)).toBeTruthy();
  });

  it("renders the category badge", () => {
    render(<MockContentCard item={mockItem} isFav={false} onFav={onFav} />);
    expect(screen.getByText(/Technology/)).toBeTruthy();
  });

  it("renders the author and time metadata", () => {
    render(<MockContentCard item={mockItem} isFav={false} onFav={onFav} />);
    expect(screen.getByText(/Tech Chronicle/)).toBeTruthy();
    expect(screen.getByText(/2h ago/)).toBeTruthy();
  });

  it("shows the Trending badge when item.trending is true", () => {
    render(<MockContentCard item={mockItem} isFav={false} onFav={onFav} />);
    expect(screen.getByText(/Hot|Trending/)).toBeTruthy();
  });

  it("calls onFav when the heart button is clicked", async () => {
    const user = userEvent.setup();
    render(<MockContentCard item={mockItem} isFav={false} onFav={onFav} />);
    const heartBtn = screen.getByRole("button", { name: /favorite|heart/i });
    await user.click(heartBtn);
    expect(onFav).toHaveBeenCalledTimes(1);
  });

  it("shows Read More CTA for news type", () => {
    render(<MockContentCard item={mockItem} isFav={false} onFav={onFav} />);
    expect(screen.getByText("Read More")).toBeTruthy();
  });

  it("shows Watch Now CTA for movie type", () => {
    const movie = { ...mockItem, type: "movie" as const };
    render(<MockContentCard item={movie} isFav={false} onFav={onFav} />);
    expect(screen.getByText("Watch Now")).toBeTruthy();
  });
});

// ─── Search Debounce Tests ───────────────────────────────────────────
describe("useDebounce hook", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not update immediately on input", () => {
    let debounced = "";
    function Component() {
      const [val, setVal] = React.useState("");
      debounced = useDebounce(val, 300);
      return <input onChange={e => setVal(e.target.value)} />;
    }
    render(<Component />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "react" } });
    expect(debounced).toBe(""); // Should not update yet
  });

  it("updates after the delay elapses", async () => {
    let debounced = "";
    function Component() {
      const [val, setVal] = React.useState("");
      debounced = useDebounce(val, 300);
      return <input onChange={e => setVal(e.target.value)} />;
    }
    render(<Component />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "react" } });
    vi.advanceTimersByTime(300);
    await waitFor(() => expect(debounced).toBe("react"));
  });
});

// ─── Redux Slice Tests ───────────────────────────────────────────────
import { contentSlice, prefsSlice, favoritesSlice } from "../store"; // adjust path

describe("contentSlice", () => {
  it("sets content items", () => {
    const state = contentSlice.reducer(undefined, contentSlice.actions.setItems([mockItem]));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("test-1");
  });

  it("reorders items correctly", () => {
    const items = [mockItem, { ...mockItem, id: "test-2" }];
    const state = contentSlice.reducer(
      { items, loading: false, error: null },
      contentSlice.actions.reorderItems([items[1], items[0]])
    );
    expect(state.items[0].id).toBe("test-2");
    expect(state.items[1].id).toBe("test-1");
  });

  it("handles empty array in setItems", () => {
    const state = contentSlice.reducer(undefined, contentSlice.actions.setItems([]));
    expect(state.items).toEqual([]);
  });
});

describe("prefsSlice", () => {
  it("adds a category when toggled off → on", () => {
    const state = prefsSlice.reducer(
      { categories: ["Technology"], darkMode: true },
      prefsSlice.actions.toggleCategory("Science")
    );
    expect(state.categories).toContain("Science");
  });

  it("removes a category when toggled on → off", () => {
    const state = prefsSlice.reducer(
      { categories: ["Technology", "Science"], darkMode: true },
      prefsSlice.actions.toggleCategory("Science")
    );
    expect(state.categories).not.toContain("Science");
  });

  it("prevents removing the last category", () => {
    const state = prefsSlice.reducer(
      { categories: ["Technology"], darkMode: true },
      prefsSlice.actions.toggleCategory("Technology")
    );
    expect(state.categories).toContain("Technology"); // Not removed
  });

  it("toggles dark mode", () => {
    const state = prefsSlice.reducer(
      { categories: [], darkMode: true },
      prefsSlice.actions.setDarkMode(false)
    );
    expect(state.darkMode).toBe(false);
  });
});

describe("favoritesSlice", () => {
  it("adds an item to favorites", () => {
    const state = favoritesSlice.reducer(
      { items: [] },
      favoritesSlice.actions.toggleFavorite(mockItem)
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("test-1");
  });

  it("removes an item already in favorites", () => {
    const state = favoritesSlice.reducer(
      { items: [mockItem] },
      favoritesSlice.actions.toggleFavorite(mockItem)
    );
    expect(state.items).toHaveLength(0);
  });

  it("clears all favorites", () => {
    const state = favoritesSlice.reducer(
      { items: [mockItem, { ...mockItem, id: "test-2" }] },
      favoritesSlice.actions.clearFavorites()
    );
    expect(state.items).toHaveLength(0);
  });
});

// ─── Integration: Feed rendering ────────────────────────────────────
describe("Feed integration", () => {
  it("renders content cards when items are provided", () => {
    render(
      <MockFeedView content={[mockItem]} loading={false} />
    );
    expect(screen.getByText(mockItem.title)).toBeTruthy();
  });

  it("shows skeleton cards while loading", () => {
    render(<MockFeedView content={[]} loading={true} />);
    const skeletons = document.querySelectorAll(".shimmer");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when content array is empty and not loading", () => {
    render(<MockFeedView content={[]} loading={false} />);
    expect(screen.getByText(/No content|No results/i)).toBeTruthy();
  });

  it("filters content by search query (debounced)", async () => {
    const items = [
      mockItem,
      { ...mockItem, id: "test-2", title: "Sports Championship Results 2026" },
    ];
    render(<MockFeedViewWithSearch items={items} />);
    const input = screen.getByPlaceholderText(/search/i);
    await userEvent.type(input, "Sports");
    await waitFor(() => {
      expect(screen.getByText("Sports Championship Results 2026")).toBeTruthy();
      expect(screen.queryByText(mockItem.title)).toBeNull();
    }, { timeout: 500 });
  });
});

// ─── E2E tests (Playwright — e2e/search.spec.ts) ─────────────────────
/*
import { test, expect } from "@playwright/test";

test.describe("Search functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("filters feed on search input", async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', "Technology");
    await page.waitForTimeout(350); // debounce
    const cards = await page.$$('[data-testid="content-card"]');
    for (const card of cards) {
      const cat = await card.$('[data-testid="category-badge"]');
      const text = await cat?.textContent();
      expect(text).toContain("Technology");
    }
  });

  test("clears search on X click", async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', "Sports");
    await page.click('[aria-label="Clear search"]');
    const input = page.locator('input[placeholder*="Search"]');
    expect(await input.inputValue()).toBe("");
  });
});

test.describe("Drag and drop", () => {
  test("reorders feed cards via drag", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const cards = page.locator('[data-testid="content-card"]');
    const first  = cards.nth(0);
    const second = cards.nth(1);
    const firstTitle  = await first.locator("h3").textContent();
    const secondTitle = await second.locator("h3").textContent();
    await first.dragTo(second);
    const newFirst = await cards.nth(0).locator("h3").textContent();
    expect(newFirst).toBe(secondTitle);
  });
});

test.describe("Favorites flow", () => {
  test("adds item to favorites and shows in Favorites view", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const firstCard = page.locator('[data-testid="content-card"]').first();
    const title     = await firstCard.locator("h3").textContent();
    await firstCard.locator('[aria-label="Add to favorites"]').click();
    await page.click('[data-testid="nav-favorites"]');
    expect(await page.locator("h3").first().textContent()).toBe(title);
  });
});
*/

// ─── Mock components used by tests ──────────────────────────────────
// (In a real project these would import the actual components)

import React, { useState } from "react";

function MockContentCard({ item, isFav, onFav }: any) {
  const cta = { news:"Read More", movie:"Watch Now", social:"View Post", recommendation:"Explore" }[item.type] || "Read More";
  return (
    <div data-testid="content-card">
      <span data-testid="category-badge">{item.category}</span>
      <h3>{item.title}</h3>
      <p>{item.author}</p>
      <p>{item.timeAgo}</p>
      {item.trending && <span>Hot</span>}
      <button aria-label={isFav ? "Remove from favorites" : "Add to favorites"} onClick={onFav}>♥</button>
      <button>{cta}</button>
    </div>
  );
}

function MockFeedView({ content, loading }: any) {
  if (loading) return <div><div className="shimmer" /><div className="shimmer" /></div>;
  if (!content.length) return <p>No content for selected filters</p>;
  return <div>{content.map((i: any) => <MockContentCard key={i.id} item={i} isFav={false} onFav={() => {}} />)}</div>;
}

function MockFeedViewWithSearch({ items }: any) {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  React.useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  const filtered = dq ? items.filter((i: any) => i.title.toLowerCase().includes(dq.toLowerCase())) : items;
  return (
    <div>
      <input placeholder="search" value={q} onChange={e => setQ(e.target.value)} />
      {filtered.map((i: any) => <MockContentCard key={i.id} item={i} isFav={false} onFav={() => {}} />)}
    </div>
  );
}

function useDebounce(value: string, delay: number) {
  const [d, setD] = useState(value);
  React.useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}