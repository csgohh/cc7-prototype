# JAGA (Prototype)

A self-care companion for home-dwelling seniors (60+) in Singapore, their family caregivers, and Active Ageing Centre (AAC) staff.

> **University prototype.** All data is mock. There is no real database and no real Singpass or government integration. Every screen is labelled "Prototype · Demo data".

- **Senior app** (mobile, 390px): medication log, **Talk to Kaki** voice companion, check-ups, smart reminders, schemes, volunteering, privacy controls, one-tap help.
- **Caregiver app** (mobile): sees only what the senior shares, alerts with "I've called them" / "Can't reach them", support info, alert settings.
- **AAC dashboard** (desktop): cases sorted by urgency, case detail and timeline, actions, high-need seniors list, stats.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS, Zustand (saved to `localStorage`), OpenAI Realtime API over WebRTC.

## Run locally

```bash
npm install
cp .env.example .env.local     # then edit .env.local (Windows: copy .env.example .env.local)
npm run dev
```

Open http://localhost:3000, then choose a role.

| Variable | What it does |
| --- | --- |
| `OPENAI_API_KEY` | Used **only on the server** (`/api/session`) to mint a short-lived key for the voice chatbot. Without it Kaki runs in **typed demo mode** (scripted replies; keyword safety check and escalation still work). |
| `NURSE_HOTLINE` | Number shown on the Hotline screen. Placeholder by default. |
| `OPENAI_REALTIME_MODEL` | Optional. Defaults to `gpt-realtime`. |

Microphone access needs `https://` or `localhost`. Vercel gives you https.

## Deploy to Vercel

1. Push this folder to a GitHub repository (`.env.local` is git-ignored).
2. On https://vercel.com, click **Add New → Project** and import the repo. Framework is detected as Next.js. No build settings need changing.
3. Under **Environment Variables** add `OPENAI_API_KEY` (and `NURSE_HOTLINE` if you want). Apply to Production and Preview.
4. Click **Deploy**. Or from the terminal: `npx vercel` then `npx vercel --prod`.
5. If you add or change environment variables later, **redeploy** (`NURSE_HOTLINE` is read at build time).

## Demo script (live presentation)

1. Landing page → **Senior** → "Log in with Singpass" → Approve (fake screens, labelled Demo).
2. Tap **Demo tools** (bottom-right, on every screen) to open the **Simulate time** panel. It also shows which escalation level is active.
3. **Level 1 (caregiver):** *Miss today's dose* → *Skip 1 day* → *Miss today's dose*. Medicine is now missed 2 days in a row, so the Caregiver app shows a "Level 1" alert (open it in another window; windows stay in sync).
4. **Level 2 (AAC):** *Skip 1 day* again (24 h with no response), **or** tap **Can't reach them** in the caregiver Alerts tab. The AAC dashboard shows **Follow-up needed**. Use Called / Home visit / Assign volunteer / Resolved and watch the caregiver and senior get updates.
5. **Chatbot emergency:** *Trigger chatbot emergency*, or in Talk to Kaki type "I have chest pain" (or say it in English, Mandarin 胸口痛, Malay "sakit dada" or Tamil "நெஞ்சு வலி"). The senior sees a 995 card, the caregiver gets an alert and AAC gets an Emergency case.
6. Other flags: type "I feel dizzy" (urgent → nurse hotline + AAC case) or "I feel lonely" (wellbeing → AAC call within 24 h).
7. Senior → More → **Privacy & sharing**: toggle what Mei Ling can see and check the caregiver Overview.
8. *Reset demo data* in the panel starts over.

## Escalation logic

All rules live in [`lib/escalation.ts`](lib/escalation.ts), written as small pure functions with comments.

| Trigger | Result |
| --- | --- |
| Medicine missed on **2 consecutive days** | **Level 1:** caregiver alert (Caregiver app → Alerts) |
| Level 1 still open after **24 more hours**, or caregiver taps **Can't reach them** | **Level 2:** AAC case "Follow-up needed" |
| Senior takes a dose again | Streak breaks, open Level 1 alert closes |
| Chatbot `flag_risk` = **emergency** | 995 card for the senior + caregiver alert + AAC emergency case |
| Chatbot `flag_risk` = **urgent** | Nurse hotline card + AAC urgent case |
| Chatbot `flag_risk` = **wellbeing** | Gentle support card + AAC case "call within 24 h" |

A browser-side keyword check ([`lib/riskKeywords.ts`](lib/riskKeywords.ts)) runs on everything the senior says or types, so emergencies are caught even if the model forgets to call the tool.

Privacy: the caregiver sees only what the senior shares. If medication sharing is off, medication alerts are shown with generic wording ("may need a check-in"). Emergencies are always sent. Kaki conversations are never shown to the caregiver. Medicine photos are never uploaded (only a "photo taken" flag is kept), and photo sharing is off by default.

## Kaki (voice chatbot)

- **System prompt:** edit [`lib/kakiPrompt.ts`](lib/kakiPrompt.ts) and paste your text into `YOUR_KAKI_PROMPT` (marked `PLACEHOLDER`). Until then a short fallback prompt is used. Tool-calling rules, language and mode instructions are added automatically. The prompt is only imported on the server.
- **Connection:** the browser calls `/api/session`, which uses `OPENAI_API_KEY` to create an ephemeral key; the browser then connects to OpenAI over WebRTC. Captions come from the data channel.
- **Tools** (defined in [`lib/kakiConfig.ts`](lib/kakiConfig.ts), run in [`lib/kakiRuntime.ts`](lib/kakiRuntime.ts)): `flag_risk`, `set_reminder`, `find_activity`, `check_scheme`.
- **Languages:** Auto, English/Singlish, Mandarin, Cantonese, Hokkien (beta), Malay, Tamil. Changing language or mode mid-call sends a `session.update`.
- The Realtime API is evolving. If OpenAI changes endpoints or event names, the only places to update are `app/api/session/route.ts` and `components/KakiChat.tsx`.

## Folder structure

```
app/
  page.tsx                 Role switcher (landing)
  senior/                  Senior app (login, approve, home, medication, kaki, schemes, more,
                           checkups, reminders, hotline, volunteer, privacy)
  caregiver/               Overview, alerts, support, settings
  aac/                     Dashboard, cases/[id], high-need
  api/session/             Ephemeral OpenAI key
  api/instructions/        Instructions for mid-call language/mode change
components/                Frames (layouts), DemoTools (simulate time), KakiChat, shared UI
lib/
  mockData.ts              All mock data + demo seed
  store.ts                 Zustand store (persisted to localStorage)
  escalation.ts            Escalation rules  <- read this first
  riskKeywords.ts          Multilingual emergency keyword check
  kakiPrompt.ts / kakiConfig.ts / kakiRuntime.ts
  selectors.ts, time.ts, types.ts
```

## Accessibility notes (senior app)

20px+ body text, 56px+ buttons with icon and text, status shown with text and icon (not colour alone), no swipe-only gestures, a "Call for help" button on every screen, big hour/minute pickers instead of native time wheels. Screens aim for 4 or fewer main actions; the longest lists (check-up slots) are capped at 4 items.

## Known prototype limits

- Time is simulated: the date only moves with the Demo tools.
- No server state. Each browser keeps its own data (open two windows on the same browser to see roles sync).
- Scheme eligibility is invented for demo purposes and is not official.
- "KampungLink" is the name used in the scam-warning copy, as specified in the brief.
