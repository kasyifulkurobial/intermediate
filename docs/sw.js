// Service Worker untuk Push Notification dan PWA

const CACHE_NAME = "dicoding-stories-v1"
const APP_SHELL_CACHE = "app-shell-v1"
const DATA_CACHE_NAME = "data-cache-v1"


const APP_SHELL_FILES = [
  "/intermediate/",
  "/intermediate/index.html",
  "/intermediate/offline.html",
  "/intermediate/scripts/index.js",
  "/intermediate/styles/styles.css",
  "/intermediate/icons/icon-192x192.png",
  "/intermediate/icons/icon-512x512.png",
  "/intermediate/images/logo.png",
  "/intermediate/manifest.json",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
]

// Install Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  // Cache app shell assets
  const cacheAppShell = async () => {
    const appShellCache = await caches.open(APP_SHELL_CACHE)
    console.log("Service Worker: Caching App Shell")
    return appShellCache.addAll(APP_SHELL_FILES)
  }

  event.waitUntil(cacheAppShell())
})

// Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  // Remove old caches
  const removeOldCaches = async () => {
    const cacheNames = await caches.keys()
    return Promise.all(
      cacheNames
        .filter((cacheName) => {
          return cacheName !== APP_SHELL_CACHE && cacheName !== DATA_CACHE_NAME
        })
        .map((cacheName) => {
          console.log("Service Worker: Removing old cache", cacheName)
          return caches.delete(cacheName)
        }),
    )
  }

  event.waitUntil(removeOldCaches())

  // Ensure service worker takes control immediately
  return self.clients.claim()
})

// Fetch Strategy: Cache-First for static assets, Network-First for API requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // For API requests (data), use Network-First strategy
  if (url.origin === "https://story-api.dicoding.dev") {
    event.respondWith(networkFirstStrategy(event.request))
  }
  // For static assets, use Cache-First strategy
  else {
    event.respondWith(cacheFirstStrategy(event.request))
  }
})

// Cache-First Strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    console.log("Service Worker: Returning from cache", request.url)
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    // Check if we received a valid response
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
      console.log("Service Worker: Network response not valid for caching", request.url)
      return networkResponse
    }

    // Clone the response
    const responseToCache = networkResponse.clone()

    // Cache the fetched response
    const cache = await caches.open(APP_SHELL_CACHE)
    cache.put(request, responseToCache)

    console.log("Service Worker: Caching new resource", request.url)
    return networkResponse
  } catch (error) {
    console.log("Service Worker: Fetch failed, returning offline page", error)

    // If the request is for a page (navigate), return the offline page
    if (request.mode === "navigate") {
      const offlineCache = await caches.open(APP_SHELL_CACHE)
      return offlineCache.match("/offline.html")
    }

    // For other resources, return a simple error response
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Network-First Strategy for API requests
async function networkFirstStrategy(request) {
  try {
    console.log("Service Worker: Fetching resource from network", request.url)
    const networkResponse = await fetch(request)

    // Cache the response if it's valid
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      console.log("Service Worker: Resource fetched and cached", request.url)
    }

    return networkResponse
  } catch (error) {
    console.log("Service Worker: Network request failed, getting from cache", error)

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // If not in cache and network failed, return a custom response for API
    return new Response(JSON.stringify({ error: true, message: "Network error" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Handle Push Notification
self.addEventListener("push", (event) => {
  let notificationData = {}

  try {
    notificationData = event.data.json()
  } catch (e) {
    notificationData = {
      title: "Dicoding Stories",
      options: {
        body: "Ada pembaruan baru dari Dicoding Stories",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
      },
    }
  }

  const title = notificationData.title || "Dicoding Stories"
  const options = notificationData.options || {
    body: "Ada pembaruan baru dari Dicoding Stories",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow("/"))
})
