// ─── CONSTANTS ───────────────────────────────────────────────
const STORAGE_KEY = 'levelup_player';
const QUEST_KEY = 'levelup_quests';
const MAX_STAT = 100;
const STAT_NAMES = ['strength', 'intelligence', 'agility', 'endurance', 'charisma'];

// ─── STATE ───────────────────────────────────────────────────
let player = null;
let dailyQuests = [];
let allQuests = [];

// ─── INIT ────────────────────────────────────────────────────
async function init() {
    allQuests = await loadQuests();
    player = loadPlayer();

    if (!player) {
        showScreen('screen-onboarding');
        document.getElementById('start-btn').addEventListener('click', createPlayer);
        return;
    }

    checkDailyReset();
    dailyQuests = getDailyQuests(allQuests);
    updateStatusScreen();
    showScreen('screen-status');

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/levelup/service-worker.js');
    }
}

// ─── LOAD QUESTS FROM JSON ───────────────────────────────────
async function loadQuests() {
    try {
        const res = await fetch('/levelup/data/quests.json');
        const data = await res.json();
        return data.quests;
    } catch (e) {
        console.error('Could not load quests:', e);
        return [];
    }
}

// ─── PLAYER MANAGEMENT ───────────────────────────────────────
function loadPlayer() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

function savePlayer() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

function createPlayer() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim().toUpperCase();
    if (!name) {
        nameInput.focus();
        return;
    }

    player = {
        name,
        stats: {
            strength: 10,
            intelligence: 10,
            agility: 10,
            endurance: 10,
            charisma: 10
        },
        completedToday: [],
        lastQuestDate: today()
    };

    savePlayer();
    checkDailyReset();
    dailyQuests = getDailyQuests(allQuests);
    updateStatusScreen();
    showScreen('screen-status');
}

// ─── DAILY RESET ─────────────────────────────────────────────
function checkDailyReset() {
    if (player.lastQuestDate !== today()) {
        player.completedToday = [];
        player.lastQuestDate = today();
        savePlayer();
    }
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// ─── QUEST COMPLETION ────────────────────────────────────────
function completeQuest(id, stat, xp) {
    if (player.completedToday.includes(id)) return;

    // Add XP to stat (capped at MAX_STAT)
    player.stats[stat] = Math.min(player.stats[stat] + xp, MAX_STAT);
    player.completedToday.push(id);
    savePlayer();

    // Re-render quests and update status
    renderQuests(dailyQuests, player.completedToday);
    updateStatusScreen();

    // Show a quick flash on the stat row
    flashStat(stat);
}

// ─── STATUS SCREEN UPDATE ────────────────────────────────────
function updateStatusScreen() {
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-level').textContent = calculateLevel();

    STAT_NAMES.forEach(stat => {
        const val = player.stats[stat];
        document.getElementById('val-' + stat).textContent = val;
        document.getElementById('bar-' + stat).style.width = val + '%';
    });

    // Luck is derived from the average of all stats
    const luck = calculateLuck();
    document.getElementById('val-luck').textContent = luck;
    document.getElementById('bar-luck').style.width = luck + '%';
}

// ─── CALCULATIONS ─────────────────────────────────────────────
function calculateLuck() {
    const total = STAT_NAMES.reduce((sum, s) => sum + player.stats[s], 0);
    return Math.floor(total / STAT_NAMES.length);
}

function calculateLevel() {
    const luck = calculateLuck(); // average of all stats
    if (luck < 20) return 1;
    if (luck < 30) return 2;
    if (luck < 40) return 3;
    if (luck < 50) return 4;
    if (luck < 60) return 5;
    if (luck < 70) return 6;
    if (luck < 80) return 7;
    if (luck < 90) return 8;
    return 9;
}

// ─── UI HELPERS ───────────────────────────────────────────────
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === 'screen-quests') {
        renderQuests(dailyQuests, player.completedToday);
    }
}

function flashStat(stat) {
    const row = document.querySelector(`[data-stat="${stat}"]`);
    if (!row) return;
    row.style.transition = 'background 0.1s';
    row.style.background = '#1a3a2a';
    setTimeout(() => { row.style.background = ''; }, 600);
}

// ─── START ───────────────────────────────────────────────────
init();