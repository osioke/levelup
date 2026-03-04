# Strategic Context: The Co-op "Sync-Link" Protocol

**Status:** Post-Stage 5 Development (Social & Persistence Layer)
**Core Concept:** A "Zero-Auth" asynchronous co-op and recovery mode where survivors synchronize terminals to maximize Luck and protect their progress.

## 1. The Vision: "Shared Frequency"

Co-op is framed as **Tactical Synchronization**. It moves the game from a solitary survival experience to a **Resistance Cell** model. Players do not "log in"; they "tune in" to shared or private frequencies to coordinate real-world growth.

* **The Goal:** To provide a **Social Luck Multiplier**. Collaboration is the fastest way to level up.
* **The Vibe:** Encrypted, high-stakes coordination across a digital wasteland.

---

## 2. Encounter Types & Real-World Mapping

| System Entity | Real-World Equivalent | Duration |
| --- | --- | --- |
| **World Boss Raid** | Large-scale projects (App Launch, Marathon, Certification). | Weeks / Months |
| **Temporal Rift** | Time-bound, high-stress events (Meetings, Sprints, Exams). | 1 – 4 Hours |

---

## 3. Technical Architecture: "The Lean Sync"

To maintain our "No-Account" philosophy, the system uses an anonymous handshake protocol.

* **Database:** A single-table `sync_instances` (Firebase/Supabase).
* **The Handshake:** A 5-character alphanumeric **Sync-ID** (e.g., `TR-88`).
* **Sync Logic:** Asynchronous polling. Apps fetch the shared JSON "Session Blob" every 30–60 seconds, creating an atmospheric "Satellite Delay."

---

## 4. Auth-less Persistence (Save-State Transmissions)

The Sync-ID protocol also serves as the game’s "Account" system without requiring emails or passwords.

* **Mechanism:** A player’s progress is serialized into a JSON blob and uploaded to the database under a unique 8-character **"Save Frequency"** (e.g., `S-992-X1`).
* **Recovery:** To "Sign In" on a new device, the operator enters their Frequency Code. The System "reconstitutes" the terminal state by overwriting local storage with the cloud-stored blob.
* **Philosophy:** Data is ephemeral and local by default; "Syncing" to the cloud is a deliberate tactical choice by the operator.

---

## 5. The "SOS Frequency" (Public Bulletin Board)

A future discovery layer where the terminal acts as a global radio receiver for players seeking aid.

* **Public Broadcast:** Hosts can toggle an encounter to "Public," listing it on a global **World Map Bulletin**.
* **Luck Farming:** High-level players can browse the feed to join Rifts, helping others while earning massive Luck bonuses.

---

## 6. Tactical Comms: Telegram Topics

To facilitate human coordination without bloating the PWA, the app "patches" players into external channels via the Telegram API.

* **The Resistance Hub:** A central Telegram Supergroup serves as the primary comms server.
* **Disposable Threads:** The system generates a **Mission Topic** (thread) for every Raid.
* **Deep-Linking:** The `[ ESTABLISH COMMS ]` button links directly to that specific Topic ID, allowing users to jump from the Terminal into the tactical chat.

---

## 7. Design & UX Feedback

* **The Sync Pulse:** Ambient audio gains a secondary "heartbeat" rhythm when tethered to an ally.
* **System Logs:** The terminal prints anonymous ally activity (e.g., `[SYNC] OPERATOR_02: CRITICAL HIT DEALT`).
* **Resonance State:** If both players complete tasks within the same window, the system triggers **[RESONANCE]**, doubling all XP and Luck gains.

---

## 8. Network Expansion Bonus (Referral System)

To accelerate the growth of the Resistance, the System incentivizes operators to bring new nodes online.

* **The Mechanism:** Players can "Broadcast" their progress via a unique URL containing their **Sync-ID** (e.g., `?ref=DX-990`).
* **The Handshake:** When a new user (Recruit) initializes their terminal via a referral link, a "Handshake" is recorded in the global database.
* **The Reward:** The Recruiter is awarded a **Gold Bonus** once the Recruit completes their "Awaken" boot sequence.
* **Economy Note:** The specific Gold figure remains **TBD** to be balanced during active development.
* **Sync State Integration:** This utilizes the asynchronous "Bulletin Board" logic; rewards are claimed the next time the Recruiter syncs with the system.

---

### Summary of Strategic Intent

This protocol fulfills the player's core job: **"How can I level up quick?"** By introducing the **Sync-Link**, we turn social accountability and data persistence into a gameplay mechanic, rewarding real-world partnership and tactical backups with the highest growth multipliers in the System.