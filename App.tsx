import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, StyleSheet } from 'react-native'
import { JournalProvider } from './src/context/JournalContext'
import { SimpleTabNavigator } from './src/navigation/SimpleTabNavigator'

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <JournalProvider>
        <SimpleTabNavigator />
      </JournalProvider>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})
