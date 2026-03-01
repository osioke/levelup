const CACHE_NAME = 'levelup-v3';
const ASSETS = [
    '/levelup/',
    '/levelup/index.html',
    '/levelup/css/style.css',
    '/levelup/js/app.js',
    '/levelup/js/quests.js',
    '/levelup/data/quests.json',
    '/levelup/manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
            .then(res => res || fetch(e.request))
    );
});

self.addEventListener('message', e => {
    if (!e.data || e.data.type !== 'CHECK_NOTIFICATION') return;
    const { lastActiveDate, playerName } = e.data;
    if (!lastActiveDate) return;

    const diffDays = Math.floor(
        (new Date() - new Date(lastActiveDate)) / 86400000
    );

    if (diffDays >= 3) {
        self.registration.showNotification('LevelUp', {
            body:      `${playerName || 'Hunter'}, your momentum is fading. Return and keep levelling up.`,
            icon:      '/levelup/icons/icon-192.png',
            tag:       'levelup-reminder',
            renotify:  false,
            data:      { url: '/levelup/' }
        });
    }
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url.includes('/levelup/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) return clients.openWindow('/levelup/');
            })
    );
});