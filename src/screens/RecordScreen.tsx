import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { format } from 'date-fns'
import { useJournal } from '../context/JournalContext'

export function RecordScreen() {
  const {
    isRecording,
    isTranscribing,
    transcript,
    recordingDuration,
    startRecording,
    stopRecording,
    clearTranscript,
    saveEntry,
    mostRecentEmptyDate,
  } = useJournal()

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isTranscribing) {
      startRecording()
    }
  }

  const handleSave = async () => {
    await saveEntry(transcript)
    clearTranscript()
  }

  const handleSaveToDate = async () => {
    if (mostRecentEmptyDate) {
      await saveEntry(transcript, mostRecentEmptyDate)
      clearTranscript()
    }
  }

  const handleRecordAgain = () => {
    clearTranscript()
    startRecording()
  }

  const handleDiscard = () => {
    clearTranscript()
  }

  const isButtonDisabled = isTranscribing

  const formatTestButtonDate = () => {
    if (!mostRecentEmptyDate) return ''
    return format(mostRecentEmptyDate, 'MMM d')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.recordSection}>
        <Pressable
          style={[
            styles.recordButton,
            isButtonDisabled && styles.recordButtonDisabled,
          ]}
          onPress={handleRecordPress}
          disabled={isButtonDisabled}
        >
          {isTranscribing ? (
            <ActivityIndicator color="white" size="large" />
          ) : isRecording ? (
            <FontAwesome name="stop" size={32} color="white" />
          ) : (
            <FontAwesome name="microphone" size={40} color="white" />
          )}
        </Pressable>

        {transcript ? (
          <>
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Your Entry:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>

            <View style={styles.buttonRow}>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={handleRecordAgain}>
                <Text style={styles.secondaryButtonText}>Record Again</Text>
              </Pressable>
            </View>

            <View style={styles.buttonRow}>
              {mostRecentEmptyDate ? (
                <Pressable style={styles.testButton} onPress={handleSaveToDate}>
                  <Text style={styles.testButtonText}>Save to {formatTestButtonDate()}</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.discardButton} onPress={handleDiscard}>
                <Text style={styles.discardButtonText}>Discard</Text>
              </Pressable>
            </View>
          </>
        ) : isRecording ? (
          <View style={styles.emptyState}>
            <Text style={styles.timerText}>
              {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:{String(recordingDuration % 60).padStart(2, '0')}
            </Text>
            <Text style={styles.emptyStateText}>Recording in progress...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordSection: {
    width: '100%',
    alignItems: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  transcriptContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 150,
    width: '100%',
    marginBottom: 20,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    color: '#E74C3C',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
})
