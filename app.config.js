import 'dotenv/config'

export default {
  expo: {
    name: 'Vox Note',
    slug: 'voxnote',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.voxnote',
      infoPlist: {
        NSMicrophoneUsageDescription:
          'This app uses the microphone to record your voice for transcription.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.voxnote',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.RECORD_AUDIO'],
    },
    plugins: [
      'expo-audio',
      '@siteed/audio-studio',
      ['expo-asset', { assets: ['./assets/ggml-small.en.bin'] }],
    ],
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      neonDatabaseUrl: process.env.NEON_DATABASE_CONNECTION_STRING,
    },
    jsEngine: 'hermes',
  },
}
