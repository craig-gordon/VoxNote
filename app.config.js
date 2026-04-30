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
      'react-native-quick-crypto',
      './plugins/withWhisperModel',
    ],
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      neonDatabaseUrl: process.env.NEON_DATABASE_CONNECTION_STRING,
      r2AccountId: process.env.R2_ACCOUNT_ID,
      r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
      r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      r2Bucket: process.env.R2_BUCKET,
      eas: {
        projectId: '16772473-9ebf-4a95-95c2-eba1d9b28e22'
      }
    },
    jsEngine: 'hermes',
  },
}
