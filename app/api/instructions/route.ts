// Returns the instruction text for a mode + language, used when the senior changes
// language or mode in the middle of a call (sent to OpenAI as session.update).
import { NextResponse } from "next/server";
import { LANGUAGES, MODES, type KakiLanguage, type KakiMode } from "@/lib/kakiConfig";
import { buildInstructions } from "@/lib/kakiPrompt";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = url.searchParams.get("mode");
  const l = url.searchParams.get("language");
  const mode: KakiMode = MODES.some((x) => x.id === m) ? (m as KakiMode) : "ask";
  const language: KakiLanguage = LANGUAGES.some((x) => x.id === l) ? (l as KakiLanguage) : "auto";
  return NextResponse.json({ instructions: buildInstructions(mode, language) });
}
