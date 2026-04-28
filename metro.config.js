const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Bundle .bin files (Whisper model)
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'bin']

module.exports = config
