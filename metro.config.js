const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Đảm bảo các module ESM được xử lý đúng trên Web
config.resolver.sourceExts.push('mjs');

module.exports = config;
