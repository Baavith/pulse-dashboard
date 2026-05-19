// app/api/content/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server-side proxy — keeps ANTHROPIC_API_KEY off the client.
// Endpoint:  POST /api/content
// Body:      { categories: string[] }
// Returns:   { items: ContentItem[] }

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALLOWED_CATS = new Set([
  "Technology", "Sports", "Finance", "Entertainment",
  "Science", "Health", "Politics", "Travel",
]);

export async function POST(req: NextRequest) {
  try {
    /* ── 1. Parse & validate body ── */
    const body = await req.json().catch(() => ({}));
    const rawCats: unknown = body?.categories;

    if (!Array.isArray(rawCats) || rawCats.length === 0) {
      return NextResponse.json(
        { error: "categories must be a non-empty array" },
        { status: 400 }
      );
    }

    const categories = rawCats
      .filter((c): c is string => typeof c === "string" && ALLOWED_CATS.has(c))
      .slice(0, 8); // Hard cap — prevents prompt injection via long arrays

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "No valid categories provided" },
        { status: 400 }
      );
    }

    /* ── 2. Call Anthropic ── */
    const message = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [
        {
          role:    "user",
          content: `Generate a JSON array of exactly 12 realistic content items for a personalized news dashboard (date context: May 2026).
Distribute items across these categories: ${categories.join(", ")}.

Each item MUST have these exact keys:
  id          — unique string (e.g. "ai-1")
  type        — one of: "news" | "movie" | "social" | "recommendation"
  category    — one of the provided list above
  title       — engaging headline, max 85 chars
  description — exactly 2 sentences, realistic and informative
  author      — realistic source or handle (e.g. "BBC News", "@nasa")
  timeAgo     — e.g. "2h ago", "30m ago"
  imageId     — random integer 100–999
  trending    — boolean (roughly 30% true)
  readTime    — e.g. "3 min"

Rules:
- Make all content feel timely, varied in tone, and genuinely interesting.
- Do NOT repeat titles or recycle the same author.
- Return ONLY a valid JSON array. No markdown fences. No extra text before or after.`,
        },
      ],
    });

    /* ── 3. Parse response ── */
    const raw = message.content
      .map(b => ("text" in b ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const items = JSON.parse(raw);

    if (!Array.isArray(items)) {
      throw new Error("Claude did not return an array");
    }

    /* ── 4. Sanitise each item (never trust generated data) ── */
    const safe = items.slice(0, 12).map((item, i) => ({
      id:          String(item.id          ?? `gen-${i}`),
      type:        ["news","movie","social","recommendation"].includes(item.type) ? item.type : "news",
      category:    ALLOWED_CATS.has(item.category) ? item.category : categories[0],
      title:       String(item.title       ?? "Untitled").slice(0, 120),
      description: String(item.description ?? "").slice(0, 400),
      author:      String(item.author      ?? "Unknown").slice(0, 60),
      timeAgo:     String(item.timeAgo     ?? "now").slice(0, 20),
      imageId:     Number.isInteger(item.imageId) ? item.imageId : Math.floor(Math.random() * 900) + 100,
      trending:    Boolean(item.trending),
      readTime:    String(item.readTime    ?? "2 min").slice(0, 15),
    }));

    return NextResponse.json({ items: safe });

  } catch (err: any) {
    console.error("[/api/content]", err.message);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}