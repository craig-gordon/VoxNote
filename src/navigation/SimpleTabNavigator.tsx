import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { RecordScreen } from '../screens/RecordScreen'
import { CalendarScreen } from '../screens/CalendarScreen'
import { InsightsScreen } from '../screens/InsightsScreen'
import { useJournal } from '../context/JournalContext'

type TabName = 'Record' | 'Journal' | 'Insights'

interface TabConfig {
  name: TabName
  icon: keyof typeof Ionicons.glyphMap
  iconFocused: keyof typeof Ionicons.glyphMap
  component: React.ComponentType
  disabled?: boolean
}

const tabs: TabConfig[] = [
  { name: 'Record', icon: 'mic-outline', iconFocused: 'mic', component: RecordScreen },
  { name: 'Journal', icon: 'book-outline', iconFocused: 'book', component: CalendarScreen },
  { name: 'Insights', icon: 'bulb-outline', iconFocused: 'bulb', component: InsightsScreen },
]

export function SimpleTabNavigator() {
  const [activeTab, setActiveTab] = useState<TabName>('Record')
  const { isRecording, isTranscribing } = useJournal()

  const isRecordingInProgress = isRecording || isTranscribing

  const ActiveScreen = tabs.find(t => t.name === activeTab)?.component || RecordScreen

  const handleTabPress = (tab: TabConfig) => {
    if (tab.disabled) return
    if (isRecordingInProgress && tab.name !== 'Record') return
    setActiveTab(tab.name)
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        <ActiveScreen />
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name
          const isDisabled = tab.disabled || (isRecordingInProgress && tab.name !== 'Record')

          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab)}
              disabled={isDisabled}
            >
              <Ionicons
                name={isActive ? tab.iconFocused : tab.icon}
                size={24}
                color={isDisabled ? '#ccc' : (isActive ? '#007AFF' : '#8E8E93')}
              />
              <Text style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
                isDisabled && styles.tabLabelDisabled,
              ]}>
                {tab.name}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#8E8E93',
  },
  tabLabelActive: {
    color: '#007AFF',
  },
  tabLabelDisabled: {
    color: '#ccc',
  },
})
