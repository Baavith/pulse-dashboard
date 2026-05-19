import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const categories = body?.categories || ["Technology"];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: `Generate a JSON array of exactly 12 realistic content items for a personalized news dashboard (May 2026). Distribute across these categories: ${categories.join(", ")}. Each item needs: id (unique string), type ("news"|"movie"|"social"|"recommendation"), category, title (max 85 chars), description (exactly 2 sentences), author, timeAgo, imageId (integer 100-999), trending (boolean), readTime. Return ONLY a raw JSON array, no markdown.`,
        }],
      }),
    });

    const data = await res.json();
    const txt = (data.content || []).map((b: any) => b.text || "").join("").replace(/```json|```/g, "").trim();
    const items = JSON.parse(txt);

    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}