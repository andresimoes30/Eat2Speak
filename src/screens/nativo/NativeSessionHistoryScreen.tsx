import { useState, useContext } from "react"
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Session, mockData } from "./AppTypes"
import { useLanguage } from "../../contexts/LanguageContext"

// Card component to maintain consistent styling
const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )
}

export default function NativeSessionHistoryScreen() {
  const { setCurrentScreen } = useContext(AppContext) as AppContextType
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all")
  const [selectedSession, setSelectedSession] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")

  // Theme colors (simplified version to match NativeHomeScreen)
  const colors = {
    background: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    error: '#dc2626',
    success: '#10b981',
    card: '#ffffff',
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      500: '#8b5cf6',
      700: '#6d28d9',
      900: '#4c1d95'
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      900: '#78350f'
    }
  }

  const filteredSessions = mockData.recentSessions.filter((session: Session) => {
    if (filter === "with-feedback") return session.hasFeedback
    if (filter === "without-feedback") return !session.hasFeedback
    if (filter === "high-rated") return session.rating ? session.rating >= 4 : false
    return true
  })
  
  const submitFeedback = (sessionId: number) => {
    // Here the feedback would be sent to the server
    console.log(`Feedback para sesión ${sessionId}:`, feedback)
    setSelectedSession(null)
    setFeedback("")
  }

  const getSessionStats = () => {
    const total = mockData.recentSessions.length
    const withFeedback = mockData.recentSessions.filter((s: Session) => s.hasFeedback).length
    const avgRating = mockData.recentSessions.reduce((acc: number, s: Session) => acc + (s.rating || 0), 0) / total
    return { total, withFeedback, avgRating: avgRating.toFixed(1) }
  }

  const stats = getSessionStats()
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>{t("native.sessionHistory")}</Text>
        <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
          {t("native.sessionHistory.description")}
        </Text>
      </View>

      {/* Estadísticas del Historial */}
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.sessionHistory.summary")}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t("native.sessionHistory.stats")}
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statsItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="time-outline" size={24} color={colors.blue[600]} />
            </View>
            <Text style={[styles.statsValue, { color: colors.blue[600] }]}>{stats.total}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{t("native.sessionHistory.totalSessions")}</Text>
          </View>
          
          <View style={styles.statsItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + "15" }]}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.success} />
            </View>
            <Text style={[styles.statsValue, { color: colors.success }]}>{stats.withFeedback}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{t("native.sessionHistory.withFeedback")}</Text>
          </View>
          
          <View style={styles.statsItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.gold[50] }]}>
              <Ionicons name="star-outline" size={24} color={(colors.gold as any)[600]} />
            </View>
            <Text style={[styles.statsValue, { color: (colors.gold as any)[600] }]}>{stats.avgRating}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{t("native.sessionHistory.averageRating")}</Text>
          </View>
        </View>
      </Card>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.filterTitle, { color: colors.text }]}>{t("native.sessionHistory.filterSessions")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { borderColor: colors.border },
                filter === "all" && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} 
              onPress={() => setFilter("all")}
            >
              <Text style={[
                styles.filterText, 
                { color: filter === "all" ? "white" : colors.text }
              ]}>
                {t("native.sessionHistory.all")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { borderColor: colors.border },
                filter === "with-feedback" && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} 
              onPress={() => setFilter("with-feedback")}
            >
              <Text style={[
                styles.filterText, 
                { color: filter === "with-feedback" ? "white" : colors.text }
              ]}>
                {t("native.sessionHistory.withFeedbackFilter")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { borderColor: colors.border },
                filter === "without-feedback" && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} 
              onPress={() => setFilter("without-feedback")}
            >
              <Text style={[
                styles.filterText, 
                { color: filter === "without-feedback" ? "white" : colors.text }
              ]}>
                {t("native.sessionHistory.withoutFeedback")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { borderColor: colors.border },
                filter === "high-rated" && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} 
              onPress={() => setFilter("high-rated")}
            >
              <Text style={[
                styles.filterText, 
                { color: filter === "high-rated" ? "white" : colors.text }
              ]}>
                {t("native.sessionHistory.highestRated")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Lista de Sesiones */}
      <View style={styles.sessionsList}>
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session: Session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <View style={styles.studentRow}>
                    <View style={[styles.sessionIconContainer, { backgroundColor: colors.blue[50] }]}>
                      <Ionicons name="person-outline" size={16} color={colors.blue[600]} />
                    </View>
                    <Text style={[styles.studentName, { color: colors.text }]}>{session.student}</Text>
                  </View>

                  <View style={styles.sessionDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="restaurant-outline" size={14} color={colors.textSecondary} style={styles.sessionIcon} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{session.restaurant}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={styles.sessionIcon} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{session.date}</Text>
                    </View>
                  </View>

                  <View style={[styles.languageBadge, { backgroundColor: colors.purple[50] }]}>
                    <Text style={[styles.languageBadgeText, { color: colors.purple[700] }]}>{session.language}</Text>
                  </View>
                </View>

                <View style={styles.sessionRating}>
                  <View style={[styles.ratingBadge, { backgroundColor: colors.gold[50] }]}>
                    <Ionicons name="star" size={14} color={(colors.gold as any)[600]} />
                    <Text style={[styles.ratingText, { color: colors.gold[700] }]}>{session.rating}</Text>
                  </View>

                  {session.hasFeedback ? (
                    <View style={[styles.feedbackBadge, { backgroundColor: colors.success + "15" }]}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} style={{ marginRight: 4 }} />
                      <Text style={[styles.feedbackBadgeText, { color: colors.success }]}>{t("native.sessionHistory.feedbackSent")}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, { borderColor: colors.border }]} 
                      onPress={() => setSelectedSession(session.id)}
                    >
                      <Ionicons name="chatbubble-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>{t("native.sessionHistory.giveFeedback")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Formulario de Feedback */}
              {selectedSession === session.id && (
                <View style={[styles.feedbackForm, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.feedbackTitle, { color: colors.text }]}>{t("native.sessionHistory.feedbackFor", { student: session.student })}</Text>
                  <TextInput
                    style={[styles.feedbackInput, { borderColor: colors.border, color: colors.text }]}
                    placeholder={t("native.sessionHistory.feedbackPlaceholder")}
                    placeholderTextColor={colors.textSecondary}
                    value={feedback}
                    onChangeText={setFeedback}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.feedbackActions}>
                    <TouchableOpacity 
                      style={[
                        styles.submitButton, 
                        { backgroundColor: colors.primary },
                        !feedback.trim() && styles.disabledButton
                      ]} 
                      onPress={() => submitFeedback(session.id)}
                      disabled={!feedback.trim()}
                    >
                      <Text style={styles.submitButtonText}>{t("button.submit")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.cancelButton, { borderColor: colors.border }]} 
                      onPress={() => setSelectedSession(null)}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t("button.cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyCardContent}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="calendar-outline" size={32} color={colors.blue[600]} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("native.sessionHistory.noSessions")}</Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                {t("native.sessionHistory.noSessionsFound")}
              </Text>
            </View>
          </Card>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionsList: {
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  studentName: {
    fontWeight: '600',
    fontSize: 16,
  },
  sessionDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
  },
  languageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionRating: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  feedbackBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  feedbackForm: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyCardContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
  },
});