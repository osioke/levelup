# LevelUp — Neural Link and Co-op Sync Handoff Prompt for Next Chat

Paste this entire prompt at the start of the new chat, then attach the files listed at the bottom.

---

## Who you are and how we work

You are my development and design partner on a PWA called **LevelUp**. You know this codebase well. When I ask for changes you always:

- Make targeted edits using SEARCH FOR / REPLACE WITH style precision — never rewrite files unnecessarily
- Cross-check every change across all core files (app.js, index.html, ... there are other files as detailed below) before delivering
- Explain what you built and why each decision was made
- Deliver complete files every time — never truncated, never partial
- Use British English
- Match the **System voice**: cold, precise, monospace terminal aesthetic. No warmth, no motivational coach energy. The System observes. It does not cheer.

---

## What LevelUp is

A solo PWA gamification app that turns habit-building into an RPG-style progression system. The player completes real-world daily tasks ("directives") mapped to five stats: **Strength, Intelligence, Agility, Endurance, Charisma**. Completing directives earns XP (which raises stats and level), Gold (spendable in the Supply Cache), and builds Momentum (a streak multiplier, max 1.5×).

**Core philosophy:** The app mirrors the player's real self. Stats are consequences, not scores. The System does not gamify effort — it makes effort visible.

**Tech stack:** Vanilla JS, CSS custom properties, Web Audio API, localStorage, Service Worker. No frameworks. No build tools. Single-file per layer (app.js / index.html / style_additions.css appended to css/style.css).

**Deployed at:** `osioke.github.io/levelup/` looking to move this into its own org-level repo so the url is more brand aware

---

## Completed stages

### Pre-Stage 1
- Date bug fix, dead onboarding code removal, tooltip refactor, service worker cache bump

### Stage 1 — Core RPG system
- Stats, XP formula (25 × (n-1)^1.9), level, rank (F→SSS), titles, momentum (exponential build, decay), HP system, corrupted state, daily reset, quest completion with critical hits, level-up and rank-up overlays with share cards, gear system (1–3 directives per stat), onboarding with typewriter terminal sequence, Awaken boot overlay

### Stage 2 — Gold + Supply Cache
- Gold earned per directive (1 gold per base XP), Supply Cache shop screen with five items: Focus Draught (INT+END ×2), Vitality Tonic (+20 HP), Sprint Scroll (gear +1), Rest Sigil (momentum protection 24h), Clarity Shards (+5 XP × 3 directives). Active buffs display panel.

### Stage 3 — Atmospheric immersion
- Relaunch boot sequence (System log on every app open, skippable)
- System log strip (bottom-left, sequential entries, auto-fades)
- Ambient audio: two-layer oscillator drone (90Hz + 91.5Hz) with breathing LFO, filtered noise floor (bandpass 900Hz), intermittent crackle — on status/quests screens: noise + crackle only (drone tones removed as too intrusive); full drone + noise + crackle on map screen

### Stage 4 — World Map
- 3×3 CSS grid map, five stat zones arranged as a cross with void corners: Signal Grid (INT, top), Iron Peaks (STR, left), Convergence hub (centre), Social Forest (CHA, right), Dead Sea (END, bottom-centre), Ashfield (AGI, bottom-right)
- Fog of War driven by stat value: tier 0 (floor 10) = uncharted, tier 1 (11–29) = signal faint, tier 2 (30–59) = partially mapped, tier 3 (60+) = fully scanned
- ASCII terrain textures per zone (▲╱╲ peaks, ┼ grid, ✦ forest, ≈ sea, · dust)
- Radar sweep: CSS conic-gradient, 160% oversized to extend past edges, 8s rotation, corrupted = red + fast + jitter
- Zone lore panel: slides up on tap, four tiers of System-voice lore per zone, hub lore varies by number of unlocked zones (0–5 states)
- Zone directive filter: tap "VIEW [STAT] DIRECTIVES" in lore panel → quest screen filtered to that stat, filter bar shows at top with CLEAR button
- Territory transmissions: one-time System log entries (gold border, 7s linger) on tier 2 and tier 3 milestone crossings, stored in player.mapMilestones
- Map audio: separate soundscape (220Hz drone, faster breath, sonar ping every 6–10s), swaps with status ambient on screen transition

### Completed in current session (pre-handoff)
- **Post-onboarding First Transmission overlay**: fires once after Awaken sequence for new players only. Sequential System briefing lines fade in one by one. Final line: `[ STANDING BY. YOUR FIRST DIRECTIVES HAVE BEEN ISSUED. ]`. VIEW FIRST DIRECTIVES button fades in after — this is the only exit. Player taps it, goes to quests, back returns to status. No skip button — the button IS the skip. `hasSeenBriefing` flag on player object, defaults to `true` for existing players.
- **Gold tooltip**: tapping ◈ GOLD label on status screen opens a tooltip explaining how gold is earned and spent. Same pattern as all other stat tooltips.
- **INVITE → button** on gold row: generates a referral link (`?ref=REFID`) using a deterministic 6-char ID from player name + date. Uses Web Share API with clipboard fallback. `NOTE: This isn't fully built out yet.`
- **Referral system (client-side stub)**: `checkIncomingReferral()` reads `?ref=` param on load and stores it locally. `recordReferralIfPresent()` fires on new player creation, stores `player.referredBy`, logs `[ RECRUIT SIGNAL ACKNOWLEDGED ]`. Full cross-device payout deferred to Stage 5 backend. `REFERRAL_GOLD = 50` (TBD per design doc).

**Current service worker version:** levelup-v16

---

## Player object structure

```js
{
  name: String,
  stats: { strength, intelligence, agility, endurance, charisma },  // floor 10, no ceiling
  completedToday: [],           // quest IDs completed today
  lastQuestDate: 'YYYY-MM-DD',
  consecutiveDays: Number,
  momentum: 1.0–1.5,
  _prevMomentum: Number,        // used in relaunch boot delta display
  lastActiveDate: 'YYYY-MM-DD',
  hp: Number,                   // current HP
  maxHp: Number,                // 100 + level×5
  corrupted: Boolean,           // true when HP hits 0
  gold: Number,
  buffs: {
    focusDraught: ISO string | null,
    sprintScroll: ISO string | null,
    restSigil: ISO string | null,
    clarityShards: Number
  },
  mapMilestones: {},            // e.g. { intelligence_2: true, strength_3: true }
  hasSeenBriefing: Boolean,     // first transmission overlay
  refId: String,                // 6-char referral ID
  referredBy: String | null     // ref ID of recruiter, if applicable
}
```

---

## File structure

```
levelup/
  index.html
  manifest.json
  service-worker.js
  css/
    style.css          ← base styles (do not touch unless necessary)
  js/
    app.js             ← all game logic
    quests.js          ← getDailyQuests(), renderQuests()
  data/
    quests.json        ← quest pool
```

`style_additions.css` is appended to `css/style.css` on deploy. It is delivered separately to avoid re-delivering the full base stylesheet.

---

## What to build next — two parallel expansion tracks

Share the two context documents (attached below) with the new chat. They contain the full design intent. Here is a summary brief:

---

### Track A: The Neural Link Expansion (Stage 5a)

**Source doc:** `Strategic Context - The Neural Link Expansion.md`

Three-layer content system:

**Layer I — Daily Directives (already built).** No changes needed.

**Layer II — System Incursions (Meteors).** Time-sensitive bounty quests the player creates from their real-world plans for the day. Input: free text ("Big presentation at 2pm"). Output: a game entity with a name, stat, XP reward, and time window. This requires the AI Processor layer.

**Layer III — World Bosses (Stars).** Long-term goals with persistent HP bars, damaged by completing relevant Dailies and Incursions. A World Boss might be "Launch the app" — it takes weeks to defeat and its HP only moves through real-world execution.

**The AI Processor Upgrade:** BYO-Key model. Player provides their own Gemini, Anthropic or OpenAI API key, stored in localStorage only. Gemini will be the default since it has a generous free api key, with a direct deep link to the settings page or API key page and a guide so users can easily get the free key and come back. We'd ask the their AI API key in a nice system way and guide with steps them to the link to make it easy to get and so they get the value faster. The AI translates plan text into Incursion entities and World Boss structures, then purges the input (Ephemeral Protocol). The UI is "Elastic" — expands based on active layers: Solo (just dailies) → Combat (adds Incursion breach) → War Room (adds World Boss HP bar).

**What to bring to the new chat:**
- The Neural Link context doc
- The current `app.js`, `index.html`, `style.css`
- The `quests.js` file (ask Osioke to share it — it contains `getDailyQuests` and `renderQuests`) ("I'll share all the files" - Osioke)

---

### Track B: The Co-op Sync-Link Protocol (Stage 5b)

**Source doc:** `Strategic Context - The Co-op Sync-Link Protocol.md`

Four systems:

**1. Save-State Transmissions (cloud persistence).** Player progress serialised to JSON and stored in Firebase/Supabase under an 8-char "Save Frequency" code (e.g. `S-992-X1`). Recovery = enter frequency code → overwrite localStorage. No email, no password. Data is local by default; syncing is a deliberate tactical choice.

**2. Co-op Sync-Link.** Two players share a 5-char Sync-ID (e.g. `TR-88`). Both apps poll a shared JSON "Session Blob" every 30–60s. If both complete tasks in the same window → **[RESONANCE]** fires, doubling XP and Luck gains. Anonymous; no accounts.

**3. World Boss Raids / Temporal Rifts.** Co-op encounters mapped to real-world events. Raids = large projects (weeks). Rifts = time-bound events (1–4 hours). Can be toggled Public to appear on the World Map Bulletin.

**4. Referral / Network Expansion.** The client-side stub is already built (current session). Stage 5b completes it: when a Recruit Awakens via a referral link, the Recruiter receives `REFERRAL_GOLD` (50, TBD) via the bulletin board sync. Requires Firebase/Supabase to resolve cross-device.

**Telegram Comms:** Each Raid generates a Mission Topic (thread) in a central Telegram Supergroup. The `[ ESTABLISH COMMS ]` button deep-links to that Topic ID.

**Audio note:** When tethered to an ally, the ambient audio gains a secondary "heartbeat" rhythm layer.

**What to bring to the new chat:**
- The Sync-Link context doc
- The current `app.js`, `index.html`, `style_additions.css`
- A Firebase/Supabase project URL and anon key (Osioke will need to create a free Firebase/Supabase project or its replica wrt to the databse tool used; Osioke will need your guidance in setting this up)
- The Telegram Bot token and Supergroup ID (if Telegram comms are in scope for that session)

---

## How to start the new chat

Paste this entire document. Then say which track you want to work on first. The assistant will read the relevant context doc and ask any clarifying questions before writing a line of code.

---

## Files to attach to the new chat

| File | Why |
|---|---|
| `app.js` | Full game logic — essential |
| `index.html` | Full HTML — essential |
| `style_additions.css` | All custom CSS — essential |
| `Strategic Context - The Neural Link Expansion.md` | For Track A |
| `Strategic Context - The Co-op Sync-Link Protocol.md` | | For Track B |
| `quests.js` | Needed if touching quest rendering (ask Osioke) |
| `quests.json` | Needed if redesigning the quest pool (ask Osioke) |