Handoff Notes for RPG Game Switch

---

<handoff>

# LevelUp — Project Context and Handoff

## What LevelUp Is

LevelUp is a web-based RPG and self-improvement PWA hosted at `https://osioke.github.io/levelup/`. It is built entirely in Vanilla JS with no frameworks or libraries. Maintainability, readability, and minimalism are the governing principles — functions should be small and pure, 4-space indentation throughout, no bloat.

The app gamifies real-life habit building through a Solo Levelling / manhwa aesthetic. The player builds five attributes — Strength, Intelligence, Agility, Endurance, and Charisma — by completing daily quests grounded in real behavioural science. A sixth stat, Luck, is derived as the average of all five and cannot be raised directly. The core philosophical premise is that what people experience as luck is actually the compound result of preparation, adaptability, persistence, knowledge, and strong relationships. Build the attributes, and luck rises with them.

---

## The World and Tone

LevelUp is set in a near-future where the economy has collapsed and traditional success no longer exists. The player's Future Self has deployed **the System** — which is what this app *is* — back through time to help them survive and thrive. The app is the System. The System speaks directly to the player in all UI text. It is not warm but it is unambiguously on the player's side. It speaks like an entity that has already seen every timeline and knows what works — matter-of-fact, slightly ominous, precise.

This tone must be consistent across every piece of text in the app: tooltips, button labels, quest descriptions, overlays, toasts, warnings, settings copy, everything. The rewrite of all existing text to match this voice is a pending task.

Examples of the register shift:

- Not *"Complete Quest"* → *"EXECUTE"* or *"MARK DONE"*
- Not *"Daily Quests"* → *"TODAY'S DIRECTIVES"*
- Not *"Momentum reflects the compounding effect of consistent practice"* → *"Consecutive effort compounds. The System has observed this in every timeline. Show up again tomorrow."*
- Not *"A score of 10 is your baseline: functional and alive"* → *"10 is where survivors start. The question is what you do next."*

---

## File Structure

```
life-quest-app/
├── index.html
├── manifest.json
├── service-worker.js
├── css/style.css
├── js/app.js
├── js/quests.js
├── data/quests.json
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── levelupicon.png
└── README.md
```

---

## Technical Foundation

**Stack:** Vanilla JS, CSS custom properties, Web Audio API (no external audio files), PWA with service worker.

**Storage:** `localStorage` only. Two keys:
- `STORAGE_KEY = 'levelup_player'` — the full player object
- `GEAR_KEY = 'levelup_gear'` — gear setting (1, 2, or 3), stored separately so it survives profile resets

**Player object shape (current):**
```javascript
{
    name:            string,
    stats:           { strength, intelligence, agility, endurance, charisma },
    completedToday:  string[],   // quest IDs completed today
    lastQuestDate:   string,     // ISO date YYYY-MM-DD
    consecutiveDays: number,
    momentum:        number,     // 1.0 to 1.5
    lastActiveDate:  string
}
```

**XP and levelling:**
- Stat floor is 10. Each stat starts at 10 and has no ceiling.
- Earned XP = sum of (stat value − 10) across all five stats
- `xpForLevel(n) = floor(25 × (n−1)^1.9)`
- Level is derived from total earned XP, never stored directly

**Rank system:** F (L1) → E (L16) → D (L31) → C (L46) → B (L61) → A (L76) → S (L91) → S+ (L101) → SS (L121) → SS+ (L151) → SSS (L200)

**Tier unlock system:**
- Tier 1: Level 1+ — foundational mental models
- Tier 2: Level 10+ — deeper frameworks
- Tier 3: Level 25+ — mastery level

**Momentum system:**
- Builds with consecutive days: `1 + 0.5 × (1 − e^(−days/14))`, max 1.5×
- Decays on missed days: 1 day = ×0.95, 2 days = ×0.85, 3 days = ×0.75, 4+ days = exponential decay
- Acts as an XP multiplier on quest completion

**Gear system (recently implemented):**
- Gear 1: 1 quest per stat per day (5 total)
- Gear 2: 2 quests per stat per day (10 total) — two different quests from the tier-filtered pool using offset seeds
- Gear 3: 3 quests per stat per day (15 total) — varied tier assignment: slot 1 from highest unlocked tier, slot 2 from one tier below, slot 3 always from Tier 1. Slot 3 carries a reflection prompt — a textarea the player must fill with 10+ characters before the complete button unlocks. The writing is ephemeral; nothing is stored.
- Gear is accessible anytime via settings

**Service worker:** Network-first strategy for HTML, CSS, JS. Cache-first for images and JSON. Current cache name is `levelup-v5`. Must be bumped on every deploy.

---

## Quest Data

75 quests across 5 stats, structured as 6 Tier 1 / 5 Tier 2 / 4 Tier 3 per stat. Each quest has: `id`, `stat`, `tier`, `xp` (2–6), `title`, `desc`, `model` (named mental model), `why` (research backing).

Quest XP values: average 3.68 per quest. Daily XP on Gear 1 is approximately 18.4 (5 quests × average XP). Gear 2 is 36.8, Gear 3 is 55.2. With full momentum (1.5×) these become 27.6, 55.2, and 82.8 respectively.

Time-to-milestone on Gear 1 (base, no momentum): Tier 2 unlock ~3 months, E-Rank ~8 months, D-Rank ~2.4 years, Level 100 ~23 years. Gear 3 with full momentum compresses Level 100 to ~5 years.

The quest descriptions were recently rewritten so that multi-day Tier 3 quests (there are 10 of them) now allow the player to mark complete on day 1 for beginning the practice, rather than locking the button until day 3 or 7. Zone 2 Cardio was clarified with a practical talk test. Progressive Overload and Deliberate Practice Session were given fallback instructions for players without an established baseline.

---

## What Is Already Working

Everything listed below is implemented, tested, and deployed:

- Status screen: stats, rank badge, title, level, XP progress bar, momentum bar, luck stat, all with tooltips
- Quest screen: daily quest cards with model/why sections, complete button, floating XP on completion, momentum-adjusted XP display
- Gear system with gear selector in settings
- Gear 3 reflection prompt
- Settings screen: name edit, gear selector with three gear buttons and per-gear warning copy, danger zone with confirmation flow
- Daily quest seeding by date — same quests every time the player opens the app on a given day, rotating daily
- Level-up overlay (interactive, user-dismissed, with share card generation)
- Rank-up overlay (same, with gold colour scheme)
- Canvas share card: 1080×1080 branded image, native share sheet on mobile, download fallback on desktop
- Awaken boot sequence overlay on first profile creation
- Onboarding: five-question flow (this is being replaced — see Stage 1 below)
- Sound system: Web Audio API, no external files, quest complete chime, level-up fanfare, rank-up fanfare, sound toggle
- Momentum build and decay
- PWA: manifest, service worker, installable
- Profile reset with confirmation

---

## The Design Roadmap

The project is evolving from a functional habit tracker into a true game engine. The governing principles for this evolution are:

**Minimalist code.** No new dependencies. Vanilla JS and CSS throughout. Each stage extends what exists without restructuring it.

**The Bridge.** Every game mechanic maps to a real-world habit or ritual. If a player "consumes" an item in the shop, the item description tells them what real-world act it corresponds to, and the consumption text acknowledges the act indirectly — prompting without instructing. The System trusts the player to play honestly. No confirmation prompts, no checkboxes.

**Physicality.** The player's behaviour is the controller. The game responds to what the player does in the real world, not just what they tap on the screen.

---

## Stage 1 — HP, Entropy, and Onboarding Rewrite

*This stage is designed but not yet implemented.*

**Onboarding rewrite.** The current five-question self-assessment flow is being replaced entirely. The new flow:

The screen opens on `#0f0f1a` (the `--bg` colour, not black). An ambient low drone begins via Web Audio API — a quiet oscillator at ~55Hz, gain ~0.04, sine wave, no external audio. Lore lines appear one at a time in the existing terminal/monospace style, each fading in after the previous with ~600ms between lines. The `> SIGNAL` lines use `--accent` (cyan). The lore paragraph lines use `--text`. The aesthetic is a transmission arriving from the future — urgent, matter-of-fact, slightly ominous.

Lore text:
```
> SIGNAL DETECTED
> LOCATING SURVIVOR...
> CONNECTION ESTABLISHED

The economy broke first.
Then the systems. Then the people.
Most are still waiting for someone to fix it.
You stopped waiting.

I am the System your future self deployed.
I found you because you are still moving.
That matters more than you know.
```

After the lore, two final lines appear:
```
Identify yourself.
This name is your key.
```

Then the name input appears. The framing is not "tell me your name" — the System already knows the player. It is asking the player to *declare* themselves, which is an act of agency and investment. The input placeholder reads `ENTER DESIGNATION...`. The button reads `INITIALISE`. On submission the existing boot sequence fires as before.

The `ONBOARD_QUESTIONS` array, `showQuestion`, `proceedToQuestions`, `questionAnswers`, and the question section HTML are all removed. `createPlayer` no longer uses `questionAnswers` — all stats initialise at `STAT_FLOOR` (10).

**HP and maxHp.** Added to the player object: `hp`, `maxHp`, `corrupted`. maxHp scales with level: `maxHp = 100 + (level × 5)`. At Level 1 this is 105; at Level 10, 150; at Level 25, 225. This means HP grows as the player grows — Entropy damage stays fixed in absolute terms, so it becomes proportionally less punishing at higher levels, which is a natural reward for long-term investment. The corrupted threshold stays fixed at 25 HP absolute.

**Entropy.** In `checkDailyReset`, after the existing momentum calculation, HP damage is applied for missed days using the same shape as momentum decay: 1 day missed = −10 HP, 2 days = −20 HP, 3+ days = −35 HP. If the player completed all 5 quests the previous day, +20 HP regeneration (capped at maxHp). If HP drops to 0, `corrupted` is set to true. If HP rises above 25, `corrupted` clears.

**HP bar on status screen.** Sits below the momentum row. Red-to-amber gradient fill (low HP feels dangerous). When `corrupted` is true: a CSS class on the status header applies a red border, replaces the player title text with `[ SYSTEM COMPROMISED ]`, and adds a slow red pulse to the border. One class toggle, no structural changes.

**Corrupted debuff.** In `completeQuest`, if `player.corrupted` is true, `earnedAmt` is halved. When HP rises above 25 and corrupted clears, a toast shows `[ SYSTEM RESTORED ]` in accent colour.

**Sound additions.** Ambient drone on the quest screen (fades in over 2 seconds, fades out over 1 second on leaving). Enhanced rank-up sound — longer, lower register, simulated reverb tail, seismic compared to the level-up sound. Critical hit variant: 1-in-8 chance on quest completion triggers a distinct sharp transient sound and a `[ CRITICAL ]` floating label in gold above the floating XP label. You can relook at these sounds that they are pleasing and calming while being systemy, and adjust accordingly. The systemy or system-like sounds would sound retro I believe.

**Full text rewrite.** All user-facing text across `index.html`, `app.js`, and `quests.js` rewritten in the System's voice as described in the tone section. This includes tooltips, button labels, toasts, overlay text, quest screen headers, settings copy, and gear warning text.

---

## Stage 2 — Gold, the Item Shop, and the Bridge

*This stage is designed but not yet implemented.*

**Gold** is added to the player state. It is earned on quest completion — Gold earned equals the XP value of the quest. A full day of Gear 1 quests earns ~18 Gold. The economy is calibrated so a player can buy one basic consumable after one day of full quest completion.

**The shop** is a new screen accessible from the status screen. It sells five consumables, deliberately small in number. Items are named for their function, not their substance, so no player is alienated by specificity. Emojis signal the real-world object without naming it.

The five items (names, descriptions, effects, and prices are indicative and open for discussion):

1. **Focus Draught** ☕ — *"The warm drink that sharpens the mind before deep work. Field operatives in every timeline have used a version of this."* Effect: Intelligence and Endurance XP doubled for the rest of the day. ~15–20 Gold.

2. **Vitality Tonic** 💧 — *"Something that restores the body. Water. A meal. Anything nourishing."* Effect: Restores 20 HP. ~15–20 Gold.

3. **Sprint Scroll** ⚡ — *"A focused burst. 25 minutes. Nothing else."* Effect: Temporarily raises Gear by one step for the rest of the day. ~30–40 Gold.

4. **Rest Sigil** 🌑 — *"Ten minutes away from all screens. The System will wait."* Effect: Momentum decay protection for 24 hours — missing a day will not reduce momentum while the Sigil is active. ~30–40 Gold.

5. **Clarity Shard** 📝 — *"Three things. What you are grateful for, or what you intend. Written."* Effect: +5 XP bonus applied to the next three quests completed. ~15–20 Gold.

**The Bridge principle in the shop.** Item descriptions name the real-world object or act in the third person — they describe what the item *is*, not what the player should do. When the player taps "consume", the consumption text acknowledges the act in present tense as if the System is registering something that has just happened in the real world. This is the indirect prompt. No confirmation dialog, no checkbox. The System trusts the player. Sound plays on consumption — a distinct rising tone, different from quest completion, suggesting a buff being applied.

---

## Stage 3 — Juice and Sound Polish

*This stage is designed but not yet implemented.*

The ambient drone, enhanced rank-up sound, and critical hit sound described in Stage 1 are the foundation. Stage 3 expands on the "game feel" — making the System feel alive and reactive. Specific items to address: more ceremony on significant events, visual feedback that distinguishes different levels of achievement, and ensuring all animations are GPU-composited (opacity and transform only, never properties that trigger layout reflow). Everything must work correctly on a 375px viewport.

---

## Stage 4 — The World Grid

*This stage is the lowest priority and will be approached last.*

A spatial map view using CSS Grid (or HTML Canvas if CSS Grid proves insufficient) that treats the five stat clusters as zones in a world — Work Tundra, Social Forest, and so on. Fog of War is driven by tier unlock: zones are obscured until the player has reached the appropriate tier. The map is a read-only visualisation of existing player state, not a separate game layer with its own logic. It cannot break game logic because it depends entirely on data that already exists. This will be tackled as a completely separate workstream after Stages 1–3 are implemented and stable.

---

## Deployment Notes

- Hosted on GitHub Pages at `https://osioke.github.io/levelup/`
- Service worker cache name must be bumped on every deploy to force cache invalidation
- Current cache name: `levelup-v5`
- All paths in the service worker precache list use the `/levelup/` prefix
- Give short git commit message summaries of all code in said reply
- Code shared should have 4 spaces indentation
- When you need to review a file before proceeding, ask for it and not asume you have it or search old files

</handoff>