const { withDangerousMod } = require('expo/config-plugins')
const path = require('path')
const fs = require('fs')

const MODEL_FILENAME = 'ggml-small.en.bin'

/**
 * Embeds the Whisper model into the native Android assets and iOS bundle so it ships with the APK/IPA
 * and can be loaded via whisper.rn's `isBundleAsset: true` option.
 */
function withWhisperModel(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, 'assets', MODEL_FILENAME)
      const destDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets')
      const dest = path.join(destDir, MODEL_FILENAME)

      if (!fs.existsSync(src)) {
        throw new Error(`[withWhisperModel] Model not found at ${src}. Place ggml-small.en.bin in the assets/ folder.`)
      }

      fs.mkdirSync(destDir, { recursive: true })
      const srcStat = fs.statSync(src)
      const needsCopy = !fs.existsSync(dest) || fs.statSync(dest).size !== srcStat.size
      if (needsCopy) {
        fs.copyFileSync(src, dest)
        console.log(`[withWhisperModel] Copied ${MODEL_FILENAME} to android assets`)
      }
      return cfg
    },
  ])

  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, 'assets', MODEL_FILENAME)
      const destDir = cfg.modRequest.platformProjectRoot
      const dest = path.join(destDir, MODEL_FILENAME)

      if (!fs.existsSync(src)) {
        throw new Error(`[withWhisperModel] Model not found at ${src}.`)
      }

      const srcStat = fs.statSync(src)
      const needsCopy = !fs.existsSync(dest) || fs.statSync(dest).size !== srcStat.size
      if (needsCopy) {
        fs.copyFileSync(src, dest)
        console.log(`[withWhisperModel] Copied ${MODEL_FILENAME} to ios bundle`)
      }
      return cfg
    },
  ])

  return config
}

module.exports = withWhisperModel
