'use strict';

require('./index-eb65fe33.js');

// REPL props

const svelteUrl = `https://unpkg.com/svelte@3`;
const rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;
const mapbox_setup = `window.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;`;

exports.mapbox_setup = mapbox_setup;
exports.rollupUrl = rollupUrl;
exports.svelteUrl = svelteUrl;
