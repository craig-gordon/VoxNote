import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useJournal } from '../context/JournalContext'
import type { InsightItem } from '../utils/generateInsights'
import type { FeedbackType } from '../db/insightsRepository'

function InsightCard({ insight }: { insight: InsightItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons
          name={insight.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={getColorForType(insight.type)}
        />
        <Text style={styles.cardTitle}>{insight.title}</Text>
      </View>
      <Text style={styles.cardDescription}>{insight.description}</Text>
    </View>
  )
}

function getColorForType(type: InsightItem['type']): string {
  switch (type) {
    case 'pattern':
      return '#5C6BC0'
    case 'connection':
      return '#FF9800'
    case 'question':
      return '#26A69A'
    case 'suggestion':
      return '#4CAF50'
    default:
      return '#666'
  }
}

interface FeedbackButtonProps {
  type: FeedbackType
  icon: keyof typeof Ionicons.glyphMap
  selectedIcon: keyof typeof Ionicons.glyphMap
  color: string
  isSelected: boolean
  onPress: () => void
}

function FeedbackButton({ type, icon, selectedIcon, color, isSelected, onPress }: FeedbackButtonProps) {
  return (
    <Pressable
      style={[styles.feedbackButton, isSelected && { backgroundColor: color + '20' }]}
      onPress={onPress}
    >
      <Ionicons
        name={isSelected ? selectedIcon : icon}
        size={28}
        color={isSelected ? color : '#999'}
      />
    </Pressable>
  )
}

export function InsightsScreen() {
  const {
    insight,
    insightsLoading,
    insightsGenerating,
    insightsError,
    generateNewInsight,
    submitInsightFeedback,
  } = useJournal()

  if (insightsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    )
  }

  if (insightsError && !insight) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{insightsError}</Text>
        <Pressable style={styles.retryButton} onPress={generateNewInsight}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    )
  }

  if (!insight) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bulb-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Insights Yet</Text>
        <Text style={styles.emptySubtitle}>
          Generate AI-powered insights from your journal entries.
        </Text>
        <Pressable style={styles.generateButton} onPress={generateNewInsight}>
          <Ionicons name="sparkles-outline" size={20} color="#fff" />
          <Text style={styles.generateButtonText}>Generate Insights</Text>
        </Pressable>
      </View>
    )
  }

  if (insight.result.analyzedEntryCount === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="journal-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Recent Entries</Text>
        <Text style={styles.emptySubtitle}>
          Record a journal entry to start generating insights.
        </Text>
      </View>
    )
  }

  const insights = insight.result.insights

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Insights</Text>
        <View style={styles.headerRight}>
          {insightsGenerating && (
            <Text style={styles.updatingText}>Generating...</Text>
          )}
          <Pressable onPress={generateNewInsight} style={styles.refreshButton} disabled={insightsGenerating}>
            <Ionicons name="refresh-outline" size={22} color={insightsGenerating ? '#ccc' : '#007AFF'} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.subheader}>
        Based on {insight.result.analyzedEntryCount} {insight.result.analyzedEntryCount === 1 ? 'entry' : 'entries'} from the past month
      </Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {insights.map((item, index) => (
          <InsightCard key={index} insight={item} />
        ))}

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>Was this helpful?</Text>
          <View style={styles.feedbackButtons}>
            <FeedbackButton
              type="positive"
              icon="happy-outline"
              selectedIcon="happy"
              color="#4CAF50"
              isSelected={insight.feedback === 'positive'}
              onPress={() => submitInsightFeedback('positive')}
            />
            <FeedbackButton
              type="neutral"
              icon="remove-circle-outline"
              selectedIcon="remove-circle"
              color="#FF9800"
              isSelected={insight.feedback === 'neutral'}
              onPress={() => submitInsightFeedback('neutral')}
            />
            <FeedbackButton
              type="negative"
              icon="sad-outline"
              selectedIcon="sad"
              color="#F44336"
              isSelected={insight.feedback === 'negative'}
              onPress={() => submitInsightFeedback('negative')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  refreshButton: {
    padding: 8,
  },
  subheader: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  generateButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
})
