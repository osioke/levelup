// ─── CONSTANTS ───────────────────────────────────────────────
const STORAGE_KEY = 'levelup_player';
const MAX_STAT = 100;
const STAT_NAMES = ['strength', 'intelligence', 'agility', 'endurance', 'charisma'];

const TITLES = [
    { minLevel: 1, label: 'ORDINARY PERSON' },
    { minLevel: 2, label: 'AWAKENED' },
    { minLevel: 4, label: 'APPRENTICE' },
    { minLevel: 6, label: 'CHALLENGER' },
    { minLevel: 8, label: 'PROVEN' },
    { minLevel: 9, label: 'ELITE' }
];

const ONBOARD_QUESTIONS = [
    {
        stat: 'strength',
        text: 'How many times did you move your body with purpose this past week?',
        options: ['Not at all', 'Once or twice', 'Three or four times', 'Almost every day']
    },
    {
        stat: 'intelligence',
        text: 'How often do you deliberately learn or study something outside of work or school?',
        options: ['Rarely or never', 'Occasionally', 'A few times a week', 'Daily']
    },
    {
        stat: 'agility',
        text: 'When your plans change unexpectedly, how do you typically respond?',
        options: ['It really unsettles me', 'I struggle but manage', 'I adapt fairly well', 'I adapt quickly and move on']
    },
    {
        stat: 'endurance',
        text: 'How consistently do you follow through on things even when motivation fades?',
        options: ['I often give up', 'I finish sometimes', 'I usually push through', 'I almost always finish what I start']
    },
    {
        stat: 'charisma',
        text: 'How comfortable are you initiating conversations or building new connections?',
        options: ['Very uncomfortable', 'Somewhat uncomfortable', 'Fairly comfortable', 'Very comfortable']
    }
];

// ─── STATE ───────────────────────────────────────────────────
let player = null;
let dailyQuests = [];
let allQuests = [];
let currentQuestion = 0;
let questionAnswers = {};

// ─── INIT ────────────────────────────────────────────────────
async function init() {
    allQuests = await loadQuests();
    player = loadPlayer();

    setupTooltips();

    if (!player) {
        showScreen('screen-onboarding');
        runTypewriter();
        return;
    }

    checkDailyReset();
    dailyQuests = getDailyQuests(allQuests);
    updateStatusScreen();
    showScreen('screen-status');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/levelup/service-worker.js');
    }
}

// ─── TYPEWRITER ───────────────────────────────────────────────
function runTypewriter() {
    const heading = 'INITIALISING PLAYER DATA';
    const subtext = 'Enter your name to begin your journey.';
    const headEl = document.getElementById('onboard-heading');
    const subEl = document.getElementById('onboard-sub');

    typeText(headEl, heading, 55, () => {
        setTimeout(() => {
            typeText(subEl, subtext, 35, () => {
                setTimeout(() => {
                    document.getElementById('name-section').classList.remove('hidden');
                    document.getElementById('name-input').focus();
                    setupNameSection();
                }, 300);
            });
        }, 200);
    });
}

function typeText(el, text, speed, onDone) {
    let i = 0;
    el.textContent = '';
    const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            if (onDone) onDone();
        }
    }, speed);
}

// ─── NAME SECTION ─────────────────────────────────────────────
function setupNameSection() {
    const input = document.getElementById('name-input');

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') proceedToQuestions();
    });

    // Show a continue button after typing starts
    input.addEventListener('input', () => {
        if (input.value.trim().length > 0) {
            showContinueBtn('CONTINUE', proceedToQuestions);
        } else {
            hideContinueBtn();
        }
    });
}

function showContinueBtn(label, fn) {
    const btn = document.getElementById('start-btn');
    btn.textContent = label;
    btn.classList.remove('hidden');
    btn.onclick = fn;
}

function hideContinueBtn() {
    document.getElementById('start-btn').classList.add('hidden');
}

// ─── QUESTIONS ────────────────────────────────────────────────
function proceedToQuestions() {
    const name = document.getElementById('name-input').value.trim();
    if (!name) {
        document.getElementById('name-input').focus();
        return;
    }

    document.getElementById('name-section').classList.add('hidden');
    hideContinueBtn();

    // Update subtext
    document.getElementById('onboard-sub').textContent = 'Answer honestly. This helps calibrate your starting profile.';

    currentQuestion = 0;
    questionAnswers = {};
    document.getElementById('question-section').classList.remove('hidden');
    showQuestion(currentQuestion);
}

function showQuestion(index) {
    const q = ONBOARD_QUESTIONS[index];
    document.getElementById('q-stat').textContent = '[ ' + q.stat.toUpperCase() + ' ASSESSMENT ]';
    document.getElementById('q-text').textContent = q.text;
    document.getElementById('q-progress').textContent =
        'QUESTION ' + (index + 1) + ' OF ' + ONBOARD_QUESTIONS.length;

    const optionsEl = document.getElementById('q-options');
    optionsEl.innerHTML = '';
    hideContinueBtn();

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            // Mark selected
            optionsEl.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            questionAnswers[q.stat] = i;

            // Show next or awaken
            const isLast = index === ONBOARD_QUESTIONS.length - 1;
            showContinueBtn(isLast ? 'AWAKEN' : 'NEXT', () => {
                if (isLast) {
                    createPlayer();
                } else {
                    currentQuestion++;
                    showQuestion(currentQuestion);
                }
            });
        });
        optionsEl.appendChild(btn);
    });
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
    const name = document.getElementById('name-input').value.trim().toUpperCase();

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

// ─── LOAD QUESTS ─────────────────────────────────────────────
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

// ─── QUEST COMPLETION ────────────────────────────────────────
function completeQuest(id, stat, xp) {
    if (player.completedToday.includes(id)) return;
    player.stats[stat] = Math.min(player.stats[stat] + xp, MAX_STAT);
    player.completedToday.push(id);
    savePlayer();
    renderQuests(dailyQuests, player.completedToday);
    updateStatusScreen();
    flashStat(stat);
}

// ─── STATUS SCREEN ───────────────────────────────────────────
function updateStatusScreen() {
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-level').textContent = calculateLevel();

    const title = calculateTitle();
    document.getElementById('player-title').innerHTML =
        '[ ' + title + ' ] <span class="info-icon" data-tip="title">?</span>';

    STAT_NAMES.forEach(stat => {
        const val = player.stats[stat];
        document.getElementById('val-' + stat).textContent = val;
        document.getElementById('bar-' + stat).style.width = val + '%';
    });

    const luck = calculateLuck();
    document.getElementById('val-luck').textContent = luck;
    document.getElementById('bar-luck').style.width = luck + '%';

    // Re-attach tooltip listeners after innerHTML update
    setupTooltips();
}

// ─── CALCULATIONS ────────────────────────────────────────────
function calculateLuck() {
    const total = STAT_NAMES.reduce((sum, s) => sum + player.stats[s], 0);
    return Math.floor(total / STAT_NAMES.length);
}

function calculateLevel() {
    const avg = calculateLuck();
    if (avg < 20) return 1;
    if (avg < 30) return 2;
    if (avg < 40) return 3;
    if (avg < 50) return 4;
    if (avg < 60) return 5;
    if (avg < 70) return 6;
    if (avg < 80) return 7;
    if (avg < 90) return 8;
    return 9;
}

function calculateTitle() {
    const level = calculateLevel();
    let title = TITLES[0].label;
    for (const t of TITLES) {
        if (level >= t.minLevel) title = t.label;
    }
    return title;
}

// ─── TOOLTIPS ────────────────────────────────────────────────
function setupTooltips() {
    document.querySelectorAll('.info-icon').forEach(icon => {
        // Clone to remove old listeners
        const fresh = icon.cloneNode(true);
        icon.parentNode.replaceChild(fresh, icon);

        fresh.addEventListener('click', e => {
            e.stopPropagation();
            const tip = fresh.dataset.tip;
            const box = document.getElementById('tip-' + tip);
            if (!box) return;

            const isOpen = box.classList.contains('visible');

            // Close all tooltips
            document.querySelectorAll('.tooltip-box').forEach(b => b.classList.remove('visible'));
            document.querySelectorAll('.info-icon').forEach(i => i.classList.remove('active'));

            if (!isOpen) {
                box.classList.add('visible');
                fresh.classList.add('active');
            }
        });
    });

    // Close tooltips when tapping elsewhere
    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip-box').forEach(b => b.classList.remove('visible'));
        document.querySelectorAll('.info-icon').forEach(i => i.classList.remove('active'));
    });
}

// ─── UI HELPERS ──────────────────────────────────────────────
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
    row.style.background = '#1a3a2a';
    setTimeout(() => { row.style.background = ''; }, 600);
}

// ─── START ───────────────────────────────────────────────────
init();