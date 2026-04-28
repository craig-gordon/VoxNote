import { useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native'
import { Calendar } from 'react-native-calendars'
import type { DateData } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { formatEntryKeyReadable, formatEntryLabel } from '../utils/formatEntryKey'
import { formatDateForDisplay } from '../utils/entryDateUtils'
import { useJournal } from '../context/JournalContext'
import { useAudioPlayback } from '../hooks/useAudioPlayback'

export function CalendarScreen() {
  const {
    entryKeys,
    selectedDate,
    setSelectedDate,
    markedDates,
    entriesForSelectedDate,
    selectedEntry,
    setSelectedEntry,
    handleSelectEntry,
    deleteAllEntries,
    deleteEntry,
    loadEntry,
  } = useJournal()

  const { hasAudio, isPlaying, play, stop } = useAudioPlayback(selectedEntry?.key ?? null)

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedEntry(null)
    setSelectedDate(day.dateString)
  }, [setSelectedDate, setSelectedEntry])

  const handleCloseEntry = () => {
    setSelectedEntry(null)
  }

  const handleDeleteEntry = () => {
    if (!selectedEntry) return
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(selectedEntry.key)
            setSelectedEntry(null)
          },
        },
      ],
    )
  }

  const handleClearAllEntries = async () => {
    await deleteAllEntries()
    setSelectedEntry(null)
    setSelectedDate(null)
  }

  useEffect(() => {
    const autoLoadSingleEntry = async () => {
      if (entriesForSelectedDate.length === 1 && !selectedEntry) {
        const key = entriesForSelectedDate[0]
        const content = await loadEntry(key)
        if (content) {
          setSelectedEntry({ key, content })
        }
      }
    }
    autoLoadSingleEntry()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesForSelectedDate, loadEntry, setSelectedEntry])

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.entriesHeader}>
        <Text style={styles.entriesSectionTitle}>Journal Calendar</Text>
        {entryKeys.length > 0 ? (
          <Pressable onPress={handleClearAllEntries}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </Pressable>
        ) : null}
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'white',
          textSectionTitleColor: '#666',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: '#333',
          textDisabledColor: '#d9e1e8',
          dotColor: '#007AFF',
          selectedDotColor: '#ffffff',
          arrowColor: '#007AFF',
          monthTextColor: '#333',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendar}
      />

      {selectedDate && entriesForSelectedDate.length > 1 ? (
        <View style={styles.entriesListContainer}>
          <Text style={styles.dateLabel}>
            {formatDateForDisplay(selectedDate)} ({entriesForSelectedDate.length} entries)
          </Text>
          <View style={styles.entriesList}>
            {entriesForSelectedDate.map((key) => (
              <Pressable
                key={key}
                style={[
                  styles.entryItem,
                  selectedEntry?.key === key && styles.entryItemSelected,
                ]}
                onPress={() => handleSelectEntry(key)}
              >
                <Text style={styles.entryItemText}>{formatEntryKeyReadable(key)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {selectedDate && entriesForSelectedDate.length === 0 ? (
        <View style={styles.noEntriesContainer}>
          <Text style={styles.noEntriesText}>
            No entries for {formatDateForDisplay(selectedDate)}
          </Text>
        </View>
      ) : null}
      </View>

      {selectedEntry ? (
        <View style={styles.selectedEntryContainer}>
          <View style={styles.selectedEntryHeader}>
            <Text style={styles.selectedEntryLabel}>{formatEntryLabel(selectedEntry.key, entriesForSelectedDate.length > 1)}</Text>
            <View style={styles.headerActions}>
              {hasAudio ? (
                <Pressable onPress={isPlaying ? stop : play} style={styles.playButton}>
                  <Ionicons
                    name={isPlaying ? 'stop-circle-outline' : 'play-circle-outline'}
                    size={28}
                    color="#333"
                  />
                </Pressable>
              ) : (
                <Ionicons name="mic-off-outline" size={24} color="#999" />
              )}
              <Pressable onPress={handleDeleteEntry}>
                <Ionicons name="trash-outline" size={20} color="#333" />
              </Pressable>
              <Pressable onPress={handleCloseEntry}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>
          </View>
          <ScrollView
            style={styles.selectedEntryScroll}
            contentContainerStyle={styles.selectedEntryContent}
          >
            <Text style={styles.selectedEntryText}>{selectedEntry.content}</Text>
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSection: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 0,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entriesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  calendar: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  entriesListContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  entriesList: {
    gap: 8,
  },
  entryItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  entryItemText: {
    fontSize: 16,
    color: '#007AFF',
  },
  entryItemSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  noEntriesContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  noEntriesText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedEntryContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingRight: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedEntryScroll: {
    flex: 1,
  },
  selectedEntryContent: {
    paddingHorizontal: 15,
  },
  selectedEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    padding: 2,
  },
  selectedEntryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedEntryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
})
