/**
 * Service Worker for caching and offline functionality
 */

const CACHE_NAME = 'avant-garde-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/css/app.css',
  '/js/app.js',
  '/favicon.ico',
  '/logo.svg',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Route patterns and their cache strategies
const ROUTE_CACHE_CONFIG = [
  {
    pattern: /\.(js|css|woff2?|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60, // 1 year
  },
  {
    pattern: /\.(png|jpg|jpeg|gif|webp|svg)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: IMAGE_CACHE,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  {
    pattern: /^https:\/\/api\./,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE,
    maxAge: 5 * 60, // 5 minutes
  },
  {
    pattern: /\/admin/,
    strategy: CACHE_STRATEGIES.NETWORK_ONLY,
  },
];

/**
 * Install event - cache static assets
 */
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

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle requests with appropriate cache strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Find matching cache configuration
  const config = findCacheConfig(request.url);
  
  if (!config) {
    return; // No cache strategy defined
  }
  
  event.respondWith(
    handleRequest(request, config)
  );
});

/**
 * Find cache configuration for a URL
 */
function findCacheConfig(url) {
  return ROUTE_CACHE_CONFIG.find(config => config.pattern.test(url));
}

/**
 * Handle request based on cache strategy
 */
async function handleRequest(request, config) {
  const { strategy, cacheName, maxAge } = config;
  
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName, maxAge);
      
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName, maxAge);
      
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName, maxAge);
      
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
      
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cacheName);
      
      default:
        return await fetch(request);
    }
  } catch (error) {
    console.error('Request handling failed:', error);
    return await handleOffline(request);
  }
}

/**
 * Cache First strategy
 */
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale cache if network fails
    }
    throw error;
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, ignore
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return await networkPromise;
}

/**
 * Cache Only strategy
 */
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (!cachedResponse) {
    throw new Error('No cached response available');
  }
  
  return cachedResponse;
}

/**
 * Check if cached response is expired
 */
function isExpired(response, maxAge) {
  if (!maxAge) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  const ageInSeconds = (now.getTime() - responseDate.getTime()) / 1000;
  
  return ageInSeconds > maxAge;
}

/**
 * Handle offline scenarios
 */
async function handleOffline(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return cached homepage or offline page
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a basic offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Avant-Garde</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            .offline { max-width: 400px; margin: 0 auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="offline">
            <div class="icon">📡</div>
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
  
  // For other requests, throw error
  throw new Error('Offline and no cached response available');
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync()
    );
  }
});

/**
 * Handle background sync tasks
 */
async function handleBackgroundSync() {
  try {
    // Process any queued offline actions
    console.log('Processing background sync tasks...');
    
    // This would typically involve:
    // 1. Getting queued actions from IndexedDB
    // 2. Attempting to sync them with the server
    // 3. Removing successful syncs from the queue
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  const action = event.action;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(data.url || '/');
        }
      })
  );
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches()
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch((error) => event.ports[0].postMessage({ success: false, error: error.message }));
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('All caches cleared');
}