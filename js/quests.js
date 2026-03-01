// Picks 3 random quests per day, one per stat rotation
// Seeded by date so quests are consistent for the full day

function getDailyQuests(allQuests) {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const stats = ['strength', 'intelligence', 'agility', 'endurance', 'charisma'];

    const dailyQuests = [];

    stats.forEach((stat, i) => {
        const pool = allQuests.filter(q => q.stat === stat);
        // Simple date-based index so quests rotate daily
        const seed = dateToNumber(today) + i;
        const picked = pool[seed % pool.length];
        dailyQuests.push(picked);
    });

    return dailyQuests;
}

function dateToNumber(dateStr) {
    // Converts "YYYY-MM-DD" to a simple integer for seeding
    return parseInt(dateStr.replace(/-/g, ''), 10);
}

function renderQuests(quests, completedIds) {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';

    const dateEl = document.getElementById('quest-date');
    dateEl.textContent = new Date().toDateString().toUpperCase();

    quests.forEach(quest => {
        const isComplete = completedIds.includes(quest.id);

        const card = document.createElement('div');
        card.className = 'quest-card' + (isComplete ? ' completed' : '');
        card.innerHTML = `
      <div class="quest-card-left">
        <div class="quest-stat">[ ${quest.stat.toUpperCase()} ]</div>
        <div class="quest-title">${quest.title}</div>
        <div class="quest-desc">${quest.desc}</div>
        <button 
          class="complete-btn" 
          data-id="${quest.id}" 
          data-stat="${quest.stat}" 
          data-xp="${quest.xp}"
          ${isComplete ? 'disabled' : ''}
        >
          ${isComplete ? '✓ COMPLETED' : 'COMPLETE QUEST'}
        </button>
      </div>
      <div class="quest-xp">+${quest.xp} XP</div>
    `;
        list.appendChild(card);
    });

    // Attach complete button listeners
    document.querySelectorAll('.complete-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            const { id, stat, xp } = btn.dataset;
            completeQuest(id, stat, parseInt(xp));
        });
    });
}