// Creates a short-lived ephemeral key for the OpenAI Realtime API (WebRTC).
// The real OPENAI_API_KEY stays on the server and is never sent to the browser.
import { NextResponse } from "next/server";
import { KAKI_TOOLS, LANGUAGES, MODES, type KakiLanguage, type KakiMode } from "@/lib/kakiConfig";
import { buildInstructions } from "@/lib/kakiPrompt";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server. Kaki is running in typed demo mode." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const mode: KakiMode = MODES.some((m) => m.id === body.mode) ? body.mode : "ask";
  const language: KakiLanguage = LANGUAGES.some((l) => l.id === body.language) ? body.language : "auto";

  const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime",
        instructions: buildInstructions(mode, language),
        audio: {
          input: { transcription: { model: "gpt-4o-mini-transcribe" } },
          output: { voice: "marin" },
        },
        tools: KAKI_TOOLS,
        tool_choice: "auto",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI client_secrets error:", res.status, text);
    return NextResponse.json({ error: "Could not start a voice session with OpenAI." }, { status: 502 });
  }

  const data = await res.json();
  // GA returns { value }, older beta shape returns { client_secret: { value } }
  const value: string | undefined = data.value ?? data.client_secret?.value;
  if (!value) return NextResponse.json({ error: "Unexpected response from OpenAI." }, { status: 502 });
  return NextResponse.json({ value });
}
