/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('offline-cache').then((cache) => cache.add(OFFLINE_URL))
  );
});

self.addEventListener('activate', () => {
  self.clientsClaim();
});

const navigationHandler = async (params: { request: Request }) => {
  try {
    return await fetch(params.request);
  } catch {
    const cache = await caches.open('offline-cache');
    return await cache.match(OFFLINE_URL);
  }
};

registerRoute(new NavigationRoute(navigationHandler));

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) =>
    (request.destination === 'style' || request.destination === 'script') &&
    url.origin !== self.location.origin,
  new StaleWhileRevalidate({
    cacheName: 'external-resources-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  /\/api\//,
  new NetworkFirst({ cacheName: 'api-cache' })
);
