import { registerRootComponent } from 'expo'
import Constants from 'expo-constants'
import { initializeNeonClient } from './src/db/neonClient'
import App from './App'

const neonUrl = Constants.expoConfig?.extra?.neonDatabaseUrl
if (neonUrl) {
  initializeNeonClient(neonUrl)
}

registerRootComponent(App)
