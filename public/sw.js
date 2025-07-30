const CACHE_NAME = 'bible-aura-v1.0.0';
const STATIC_CACHE = 'bible-aura-static-v1';
const DYNAMIC_CACHE = 'bible-aura-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/chat',
  '/auth',
  '/bible',
  '/chat',
  '/journal',
  '/manifest.json',
  '/assets/hero-spiritual.jpg',
  '/✦Bible Aura.svg',
  '/✦Bible Aura secondary.svg'
];

// API endpoints to cache with strategy
const API_ENDPOINTS = [
  '/api/daily-verse',
  '/api/user-stats',
  'https://api.bible.com/api',
  'https://openrouter.ai/api/v1'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Different strategies for different types of requests
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    // Static assets - Cache First Strategy
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (url.pathname.startsWith('/api/') || API_ENDPOINTS.some(endpoint => url.href.includes(endpoint))) {
    // API requests - Network First Strategy
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else if (url.pathname.includes('.') && (url.pathname.includes('.js') || url.pathname.includes('.css') || url.pathname.includes('.png') || url.pathname.includes('.jpg') || url.pathname.includes('.svg'))) {
    // Assets - Cache First Strategy
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // Navigation requests - Network First with offline fallback
    event.respondWith(navigationStrategy(request));
  }
});

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Update cache in background
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {
          // Silently fail background update
        });
      
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Try to return cached version as fallback
    const cache = await caches.open(cacheName);
    const fallbackResponse = await cache.match(request);
    
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    // Return offline page or error response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

// Network First Strategy - for API requests
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline indicator header
      const headers = new Headers(cachedResponse.headers);
      headers.append('X-Served-From', 'cache');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers,
      });
    }
    
    // Return meaningful offline response for API requests
    if (request.url.includes('/api/daily-verse')) {
      return new Response(JSON.stringify({
        text: "Trust in the Lord with all your heart and lean not on your own understanding.",
        reference: "Proverbs 3:5",
        context: "Even when offline, remember that God's wisdom guides us through every situation.",
        theme: "Trust and Faith",
        offline: true
      }), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Served-From': 'fallback',
        }),
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Offline - This feature requires an internet connection',
      offline: true
    }), {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
  }
}

// Navigation Strategy - for page requests
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Navigation offline, serving cached page');
    
    const cache = await caches.open(STATIC_CACHE);
    
    // Try to serve cached page
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline fallback
    const offlinePage = await cache.match('/');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Last resort offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bible Aura - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              background: rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { font-size: 1.1rem; line-height: 1.6; }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: bold;
              cursor: pointer;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✦ Bible Aura</h1>
            <h2>You're Offline</h2>
            <p>You're currently offline, but don't worry!</p>
            <p>Some features are still available from your cached content.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/html',
      }),
    });
  }
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    console.log('Performing background sync...');
    
    // You could sync journal entries, prayer requests, etc.
    // that were created while offline
    
    // Example: sync pending journal entries
    const pendingData = await getStoredPendingData();
    if (pendingData.length > 0) {
      for (const item of pendingData) {
        try {
          await syncDataItem(item);
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const title = data.title || 'Bible Aura';
  const options = {
    body: data.body || 'You have a new spiritual insight waiting!',
    icon: '/✦Bible Aura.svg',
    badge: '/✦Bible Aura secondary.svg',
    tag: data.tag || 'bible-aura-notification',
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/✦Bible Aura.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/chat')
    );
  }
});

// Helper functions for background sync
async function getStoredPendingData() {
  // This would connect to IndexedDB to get pending sync data
  return [];
}

async function syncDataItem(item) {
  // This would sync individual data items to the server
  console.log('Syncing item:', item);
} 