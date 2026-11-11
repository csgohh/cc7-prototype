"use client";
// Talk to Kaki: OpenAI Realtime voice over WebRTC, with large live captions and a text fallback.
//
// Flow:  tap -> POST /api/session (server makes an ephemeral key) -> browser opens a WebRTC
// connection straight to OpenAI -> audio in/out + a data channel ("oai-events") for captions
// and tool calls. If anything fails (no key, no mic), the screen falls back to "typed demo mode".
import { useEffect, useRef, useState } from "react";
import { Info, Mic, Send, Square } from "lucide-react";
import { LANGUAGES, MODES, type KakiLanguage, type KakiMode } from "@/lib/kakiConfig";
import { localReply, runKakiTool } from "@/lib/kakiRuntime";
import { checkEmergencyKeywords } from "@/lib/riskKeywords";
import { useJaga } from "@/lib/store";
import { ScamWarning } from "./ui";

type Status = "idle" | "connecting" | "listening" | "thinking" | "speaking";
interface Msg { id: number; role: "user" | "kaki"; text: string }

const STATUS_TEXT: Record<Status, string> = {
  idle: "Tap to talk",
  connecting: "Connecting…",
  listening: "Listening… tap to stop",
  thinking: "Kaki is thinking…",
  speaking: "Kaki is speaking…",
};

export default function KakiChat() {
  const flagRisk = useJaga((s) => s.flagRisk);
  const [mode, setMode] = useState<KakiMode>("ask");
  const [language, setLanguage] = useState<KakiLanguage>("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [kakiCaption, setKakiCaption] = useState("");
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [text, setText] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const botBuf = useRef("");
  const idRef = useRef(0);
  const followUp = useRef(false); // a tool ran, so the model must speak again after response.done

  const addMsg = (role: Msg["role"], t: string) => setMsgs((m) => [...m.slice(-5), { id: idRef.current++, role, text: t }]);

  const sendEvent = (ev: object) => {
    if (dcRef.current?.readyState === "open") dcRef.current.send(JSON.stringify(ev));
  };

  /** Everything the senior says (voice transcript or typed) goes through the backup keyword check. */
  const onUserText = (t: string) => {
    setHeard(t);
    addMsg("user", t);
    const hit = checkEmergencyKeywords(t);
    if (hit) flagRisk("emergency", hit.reason, "keyword");
  };

  const showKaki = (t: string) => {
    setKakiCaption(t);
    addMsg("kaki", t);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEvent = (ev: any) => {
    switch (ev.type) {
      case "input_audio_buffer.speech_started":
        setStatus("listening");
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (ev.transcript?.trim()) onUserText(ev.transcript.trim());
        setStatus("thinking");
        break;
      case "response.created":
        botBuf.current = "";
        setKakiCaption("");
        setStatus("thinking");
        break;
      case "response.output_audio_transcript.delta":
      case "response.audio_transcript.delta": // older beta event name
        botBuf.current += ev.delta ?? "";
        setKakiCaption(botBuf.current);
        setStatus("speaking");
        break;
      case "response.output_audio_transcript.done":
      case "response.audio_transcript.done":
        if (ev.transcript) addMsg("kaki", ev.transcript);
        break;
      case "response.output_item.done":
        if (ev.item?.type === "function_call") {
          let args: Record<string, string> = {};
          try { args = JSON.parse(ev.item.arguments || "{}"); } catch { /* ignore bad JSON */ }
          const result = runKakiTool(ev.item.name, args);
          sendEvent({ type: "conversation.item.create", item: { type: "function_call_output", call_id: ev.item.call_id, output: JSON.stringify(result) } });
          followUp.current = true;
        }
        break;
      case "response.done":
        if (followUp.current) {
          followUp.current = false;
          sendEvent({ type: "response.create" });
        } else {
          setStatus("listening");
        }
        break;
      case "error":
        setError(ev.error?.message ?? "Something went wrong with the voice connection.");
        break;
    }
  };

  const cleanup = () => {
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    dcRef.current = null;
    pcRef.current = null;
    streamRef.current = null;
  };

  const stop = () => {
    cleanup();
    setStatus("idle");
  };

  const start = async () => {
    setError(null);
    setStatus("connecting");
    try {
      const r = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, language }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Voice is not available right now.");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error("Kaki cannot hear you because the microphone is blocked. Please allow the microphone, or type below.");
      }

      const peer = new RTCPeerConnection();
      peer.ontrack = (e) => { if (audioRef.current) audioRef.current.srcObject = e.streams[0]; };
      stream.getTracks().forEach((t) => peer.addTrack(t, stream));
      const dc = peer.createDataChannel("oai-events");
      dc.onmessage = (e) => { try { handleEvent(JSON.parse(e.data)); } catch { /* ignore */ } };
      dc.onopen = () => setStatus("listening");
      peer.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(peer.connectionState)) stop();
      };
      pcRef.current = peer;
      dcRef.current = dc;
      streamRef.current = stream;

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: { Authorization: `Bearer ${j.value}`, "Content-Type": "application/sdp" },
      });
      if (!sdpRes.ok) throw new Error("Could not connect to the voice service.");
      await peer.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
    } catch (e) {
      cleanup();
      setStatus("idle");
      setDemo(true);
      setError(e instanceof Error ? e.message : "Voice is not available.");
    }
  };

  // If the senior changes language or mode during a call, update Kaki's instructions.
  useEffect(() => {
    if (dcRef.current?.readyState !== "open") return;
    fetch(`/api/instructions?mode=${mode}&language=${language}`)
      .then((r) => r.json())
      .then((j) => sendEvent({ type: "session.update", session: { type: "realtime", instructions: j.instructions } }))
      .catch(() => {});
  }, [mode, language]);

  useEffect(() => cleanup, []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    onUserText(t);
    if (dcRef.current?.readyState === "open") {
      sendEvent({ type: "conversation.item.create", item: { type: "message", role: "user", content: [{ type: "input_text", text: t }] } });
      sendEvent({ type: "response.create" });
    } else {
      setDemo(true);
      showKaki(localReply(t));
    }
  };

  const live = status !== "idle" && status !== "connecting";

  return (
    <div className="space-y-4">
      <h1 className="h1">Talk to Kaki</h1>

      <div className="flex gap-2 rounded-2xl bg-gold/25 p-3 text-lg" role="note">
        <Info className="mt-0.5 shrink-0" aria-hidden />
        <p><strong>Kaki does not diagnose.</strong> Always check with your doctor or pharmacist.</p>
      </div>

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Kaki mode">
        {MODES.map((m) => (
          <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}
            className={`btn !px-2 ${mode === m.id ? "btn-primary" : "btn-secondary"}`}>{m.label}</button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-lg font-medium">Language</span>
        <select className="input" value={language} onChange={(e) => setLanguage(e.target.value as KakiLanguage)}>
          {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </label>

      <button onClick={live ? stop : start} disabled={status === "connecting"}
        aria-label={STATUS_TEXT[status]}
        className={`btn !min-h-[150px] flex-col !gap-2 !rounded-3xl !text-3xl ${live ? "btn-danger" : "btn-primary"} ${status === "listening" ? "animate-pulse" : ""}`}>
        {live ? <Square size={48} aria-hidden /> : <Mic size={56} aria-hidden />}
        {STATUS_TEXT[status]}
      </button>

      <section aria-live="polite" aria-label="Live captions" className="min-h-[140px] space-y-3 rounded-2xl border-2 border-panel bg-card p-4">
        {!heard && !kakiCaption && <p className="text-xl text-navy/70">Captions will appear here.</p>}
        {heard && <p className="text-xl text-navy/80"><span className="font-semibold">You:</span> {heard}</p>}
        {kakiCaption && <p className="text-3xl font-medium leading-snug text-teal"><span className="sr-only">Kaki: </span>{kakiCaption}</p>}
      </section>

      {error && <p role="alert" className="rounded-2xl border-2 border-alert bg-white p-3 text-lg text-alert">{error}</p>}
      {demo && !live && (
        <p className="rounded-2xl bg-panel p-3 text-lg">
          <strong>Typed demo mode.</strong> Kaki&apos;s replies are scripted here. Voice needs an OpenAI key on the server.
        </p>
      )}

      <form onSubmit={send} className="space-y-2">
        <label htmlFor="kaki-text" className="block text-lg font-medium">Or type to Kaki</label>
        <div className="flex gap-2">
          <input id="kaki-text" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here…" />
          <button type="submit" className="btn btn-primary !w-auto !px-5" aria-label="Send message"><Send aria-hidden /></button>
        </div>
      </form>

      {msgs.length > 1 && (
        <section aria-label="Earlier messages" className="space-y-2">
          <h2 className="h2">Earlier</h2>
          {msgs.slice(0, -1).map((m) => (
            <p key={m.id} className={`rounded-xl p-3 text-xl ${m.role === "user" ? "bg-panel" : "bg-card"}`}>
              <span className="font-semibold">{m.role === "user" ? "You" : "Kaki"}:</span> {m.text}
            </p>
          ))}
        </section>
      )}

      <ScamWarning />
      <audio ref={audioRef} autoPlay className="hidden" />
    </div>
  );
}
