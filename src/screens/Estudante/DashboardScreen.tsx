"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { ProgressBar } from "../../components/ProgressBar"
import { useState } from "react"

// Interface for session type
interface Session {
  id: number
  date: string
  time: string
  restaurant: string
  teacher: string
  language: string
  address?: string
  duration?: string
  price?: string
  status?: string
}

// Mock data for upcoming sessions
const upcomingSessions: Session[] = [
  {
    id: 1,
    date: "15 Mayo, 2025",
    time: "19:00",
    restaurant: "La Pasta Italiana",
    teacher: "María Silva",
    language: "Italiano",
    address: "Calle Principal 123, Madrid",
    duration: "1 hora",
    price: "30€",
    status: "Confirmado"
  },
  {
    id: 2,
    date: "18 Mayo, 2025",
    time: "12:30",
    restaurant: "Sushi Koi",
    teacher: "Hiroshi Tanaka",
    language: "Japonés",
    address: "Avenida Sakura 45, Barcelona",
    duration: "2 horas",
    price: "45€",
    status: "Confirmado"
  },
]

export default function DashboardScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // State for managing sessions, modal and selected session
  const [sessions, setSessions] = useState<Session[]>(upcomingSessions)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Handle showing session details
  const handleShowDetails = (session: Session) => {
    setSelectedSession(session)
    setDetailsModalVisible(true)
  }

  // Handle session cancellation
  const handleCancelSession = (sessionId: number) => {
    Alert.alert(
      t("dashboard.cancelSessionTitle"),
      t("dashboard.cancelSessionMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel"
        },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: () => {
            // Update sessions state by filtering out the cancelled session
            setSessions(sessions.filter(session => session.id !== sessionId))
            
            // Show confirmation
            Alert.alert(
              t("dashboard.cancelSuccess"),
              t("dashboard.cancelSuccessMessage"),
              [{ text: t("common.ok") }]
            )
          }
        }
      ]
    )
  }

  // Session details modal
  const renderSessionDetailsModal = () => {
    if (!selectedSession) return null

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("dashboard.sessionDetails")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="language-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.language")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.language}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.teacher")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.teacher}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.restaurant")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.restaurant}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.address")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.address}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.dateTime")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.date} {t("dashboard.at")} {selectedSession.time}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.duration")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="cash-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.price")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.price}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.status")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.success }]}>
                    {selectedSession.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.error + "30" }]}
                onPress={() => {
                  setDetailsModalVisible(false)
                  handleCancelSession(selectedSession.id)
                }}
              >
                <Text style={{ color: colors.error }}>{t("dashboard.cancel")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={{ color: "white" }}>{t("common.close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          {t("dashboard.welcome").replace("{name}", user?.firstName || "Usuario")}
        </Text>
        <Text style={[styles.welcomeSubtext, { color: colors.text + "80" }]}>
          {t("dashboard.summary")}
        </Text>
      </View>

      {/* Quick Access Cards */}
      <View style={styles.quickAccessSection}>
        <TouchableOpacity
          style={[styles.quickAccessCard, { backgroundColor: colors.purple[50] }]}
          onPress={() => navigation.navigate("NuevaSesion" as never)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: colors.purple[100] }]}>
            <Ionicons name="calendar-outline" size={24} color={colors.purple[700]} />
          </View>
          <View style={styles.quickAccessContent}>
            <Text style={[styles.quickAccessTitle, { color: colors.purple[900] }]}>{t("dashboard.newSession")}</Text>
            <Text style={[styles.quickAccessSubtitle, { color: colors.purple[700] }]}>{t("dashboard.scheduleClass")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.purple[500]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAccessCard, { backgroundColor: colors.gold[50] }]}
          onPress={() => navigation.navigate("Restaurants" as never)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: colors.gold[100] }]}>
            <Ionicons name="restaurant-outline" size={24} color={colors.gold[700]} />
          </View>
          <View style={styles.quickAccessContent}>
            <Text style={[styles.quickAccessTitle, { color: colors.gold[900] }]}>{t("dashboard.restaurants")}</Text>
            <Text style={[styles.quickAccessSubtitle, { color: colors.gold[700] }]}>{t("dashboard.exploreVenues")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gold[500]} />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t("dashboard.progress")}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.text + "80" }]}>{t("dashboard.followProgress")}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Italiano</Text>
              <Text style={[styles.progressValue, { color: colors.text + "80" }]}>65%</Text>
            </View>
            <ProgressBar progress={65} color={colors.primary} />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Japonés</Text>
              <Text style={[styles.progressValue, { color: colors.text + "80" }]}>30%</Text>
            </View>
            <ProgressBar progress={30} color={colors.primary} />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Francés</Text>
              <Text style={[styles.progressValue, { color: colors.text + "80" }]}>45%</Text>
            </View>
            <ProgressBar progress={45} color={colors.primary} />
          </View>
        </View>
      </Card>

      {/* Upcoming Sessions */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t("dashboard.scheduledSessions")}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.text + "80" }]}>{t("dashboard.upcomingClasses")}</Text>

        {sessions.length > 0 ? (
          <View style={styles.sessionsContainer}>
            {sessions.map((session) => (
              <View key={session.id} style={[styles.sessionItem, { borderColor: colors.border }]}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTitle, { color: colors.text }]}>
                    {t("dashboard.sessionWith")
                      .replace("{language}", session.language)
                      .replace("{teacher}", session.teacher)}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.text + "80"} style={styles.sessionIcon} />
                    <Text style={[styles.sessionMetaText, { color: colors.text + "80" }]}>
                      {t("dashboard.sessionTime")
                        .replace("{date}", session.date)
                        .replace("{time}", session.time)}
                    </Text>
                  </View>
                  <Text style={[styles.sessionLocation, { color: colors.text + "80" }]}>{session.restaurant}</Text>
                </View>
                <View style={styles.sessionActions}>
                  <TouchableOpacity 
                    style={[styles.sessionButton, { borderColor: colors.border }]}
                    onPress={() => handleShowDetails(session)}
                  >
                    <Text style={[styles.sessionButtonText, { color: colors.text }]}>{t("dashboard.details")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sessionButton,
                      {
                        borderColor: colors.error + "30",
                        marginTop: 8,
                      },
                    ]}
                    onPress={() => handleCancelSession(session.id)}
                  >
                    <Text style={{ color: colors.error }}>{t("dashboard.cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>{t("dashboard.noSessions")}</Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("NuevaSesion" as never)}
            >
              <Text style={styles.emptyStateButtonText}>{t("dashboard.scheduleSession")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
      
      {/* Session Details Modal */}
      {renderSessionDetailsModal()}
      {/* Statistics */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t("dashboard.statistics")}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.text + "80" }]}>
          {t("dashboard.visualizeProgress")}
        </Text>
        <View style={styles.chartContainer}>
          <Text style={[styles.chartPlaceholder, { color: colors.text + "60" }]}>
            {t("dashboard.chartPlaceholder")}
          </Text>
        </View>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 14,
  },
  card: {
    marginBottom: 24,
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
  progressContainer: {
    marginTop: 8,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
  },
  sessionsContainer: {
    marginTop: 8,
  },
  sessionItem: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sessionIcon: {
    marginRight: 4,
  },
  sessionMetaText: {
    fontSize: 14,
  },
  sessionLocation: {
    fontSize: 14,
  },
  sessionActions: {
    justifyContent: "center",
  },
  sessionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  sessionButtonText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  chartContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 8,
    marginTop: 8,
  },
  chartPlaceholder: {
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
})
