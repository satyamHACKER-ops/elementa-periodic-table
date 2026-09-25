"use strict";

const CACHE_NAME = "elementa-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./data/elements.js",
    "./js/theme.js",
    "./js/search.js",
    "./js/filters.js",
    "./js/details.js",
    "./js/app.js"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_FILES);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (cacheNames) {
                return Promise.all(
                    cacheNames
                        .filter(function (name) {
                            return name !== CACHE_NAME;
                        })
                        .map(function (name) {
                            return caches.delete(name);
                        })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (cachedResponse) {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);
            })
    );
});
