const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tell Metro to recognize .mjs files!
config.resolver.sourceExts.push('mjs');

module.exports = config;