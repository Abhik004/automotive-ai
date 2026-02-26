import { NextRequest, NextResponse } from "next/server";
import { getCarSuggestions } from "../../../lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();
    if (!theme) return NextResponse.json({ error: "Theme required" }, { status: 400 });
    const suggestions = await getCarSuggestions(theme.trim());
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}