const { withDangerousMod } = require('expo/config-plugins')
const path = require('path')
const fs = require('fs')
const https = require('https')

const MODEL_FILENAME = 'ggml-small.en.bin'
const MODEL_URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${MODEL_FILENAME}`

function downloadFile(srcUrl, destPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(srcUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft <= 0) {
            res.resume()
            return reject(new Error('Too many redirects'))
          }
          res.resume()
          return resolve(downloadFile(res.headers.location, destPath, redirectsLeft - 1))
        }
        if (res.statusCode !== 200) {
          res.resume()
          return reject(new Error(`Download failed: HTTP ${res.statusCode}`))
        }
        const file = fs.createWriteStream(destPath)
        res.pipe(file)
        file.on('finish', () => file.close((err) => (err ? reject(err) : resolve())))
        file.on('error', (err) => {
          fs.unlink(destPath, () => reject(err))
        })
      })
      .on('error', reject)
  })
}

async function ensureModel(projectRoot) {
  const dest = path.join(projectRoot, 'assets', MODEL_FILENAME)
  if (fs.existsSync(dest)) return dest

  console.log(`[withWhisperModel] Model not found locally; downloading from ${MODEL_URL} (~466 MB)...`)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  await downloadFile(MODEL_URL, dest)
  console.log(`[withWhisperModel] Downloaded model to ${dest}`)
  return dest
}

function withWhisperModel(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const src = await ensureModel(cfg.modRequest.projectRoot)
      const destDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets')
      const dest = path.join(destDir, MODEL_FILENAME)

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
      const src = await ensureModel(cfg.modRequest.projectRoot)
      const destDir = cfg.modRequest.platformProjectRoot
      const dest = path.join(destDir, MODEL_FILENAME)

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
