"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { ProgressBar } from "../../components/ProgressBar"

// Interface for event type
interface Event {
  id: number
  date: string
  time: string
  language: string
  participants: number
  status: string
  revenue: string
  teacherName?: string
  studentsList?: string[]
}

// Interface for notification type
interface Notification {
  id: number
  title: string
  message: string
  date: string
  read: boolean
  type: 'booking' | 'cancellation' | 'update' | 'system'
}

// Mock data for upcoming events
const upcomingEvents: Event[] = [
  {
    id: 1,
    date: "15 Junio, 2025",
    time: "19:00",
    language: "Italiano",
    participants: 6,
    status: "Confirmado",
    revenue: "180€",
    teacherName: "María Silva",
    studentsList: ["Juan Pérez", "Ana López", "Carlos Rodríguez", "Laura García", "Pablo Martínez"]
  },
  {
    id: 2,
    date: "18 Junio, 2025",
    time: "12:30",
    language: "Japonés",
    participants: 4,
    status: "Confirmado",
    revenue: "120€",
    teacherName: "Hiroshi Tanaka",
    studentsList: ["Elena Fernández", "Miguel González", "Sofía Díaz", "David Sánchez"]
  },
  {
    id: 3,
    date: "20 Junio, 2025",
    time: "20:00",
    language: "Francés",
    participants: 8,
    status: "Confirmado",
    revenue: "240€",
    teacherName: "Sophie Dupont",
    studentsList: ["Roberto Torres", "Carmen López", "Javier Ruiz", "Isabel Morales", "Fernando Ortiz", "Lucía Vega", "Antonio Molina", "Rosa Campos"]
  }
]

// Mock data for notifications
const recentNotifications: Notification[] = [
  {
    id: 1,
    title: "Nueva reserva",
    message: "Se ha confirmado una nueva reserva para el 15 de junio a las 19:00",
    date: "01 Junio, 2025",
    read: false,
    type: 'booking'
  },
  {
    id: 2,
    title: "Cancelación",
    message: "La reserva del 10 de junio a las 18:30 ha sido cancelada",
    date: "31 Mayo, 2025",
    read: true,
    type: 'cancellation'
  },
  {
    id: 3,
    title: "Actualización de sistema",
    message: "Se han realizado mejoras en la plataforma",
    date: "30 Mayo, 2025",
    read: true,
    type: 'system'
  }
]

export default function RestauranteDashboardScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // State for managing events, notifications and modal
  const [events, setEvents] = useState<Event[]>(upcomingEvents)
  const [notifications, setNotifications] = useState<Notification[]>(recentNotifications)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Calculate total expected revenue
  const totalRevenue = events.reduce((sum, event) => {
    return sum + parseInt(event.revenue.replace('€', ''))
  }, 0)

  // Calculate total participants
  const totalParticipants = events.reduce((sum, event) => {
    return sum + event.participants
  }, 0)

  // Handle showing event details
  const handleShowDetails = (event: Event) => {
    setSelectedEvent(event)
    setDetailsModalVisible(true)
  }

  // Event details modal
  const renderEventDetailsModal = () => {
    if (!selectedEvent) return null

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
                {t("dashboard.eventDetails")}
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
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.dateTime")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedEvent.date} a las {selectedEvent.time}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="language-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("session.language")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedEvent.language}
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
                    {selectedEvent.teacherName}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.participants")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedEvent.participants} {t("dashboard.people")}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="cash-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("dashboard.estimatedRevenue")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedEvent.revenue}
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
                    {selectedEvent.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.participantsTitle, { color: colors.text, marginTop: 20 }]}>
                {t("dashboard.studentsList")}
              </Text>
              <View style={styles.participantsList}>
                {selectedEvent.studentsList?.map((student, index) => (
                  <View key={index} style={[styles.participantItem, { borderColor: colors.border }]}>
                    <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.participantName, { color: colors.text }]}>
                      {student}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={{ color: "white" }}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, Platform.OS === 'ios' ? { paddingTop: 8 } : null]}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            {t("dashboard.welcome").replace("{name}", user?.firstName || "Restaurante")}
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.text + "80" }]}>
            {t("dashboard.summary")}
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <View style={[styles.statCard, { backgroundColor: colors.primary + "15" }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{events.length}</Text>
              <Text style={[styles.statLabel, { color: colors.primary + "99" }]}>{t("dashboard.scheduledSessions")}</Text>
            </View>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + "30" }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.purple[50] }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.purple[700] }]}>{totalParticipants}</Text>
              <Text style={[styles.statLabel, { color: colors.purple[500] }]}>{t("dashboard.participants")}</Text>
            </View>
            <View style={[styles.statIconContainer, { backgroundColor: colors.purple[200] }]}>
              <Ionicons name="people" size={24} color={colors.purple[700]} />
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.gold[50] }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.gold[700] }]}>{totalRevenue}€</Text>
              <Text style={[styles.statLabel, { color: colors.gold[500] }]}>{t("dashboard.price")}</Text>
            </View>
            <View style={[styles.statIconContainer, { backgroundColor: colors.gold[200] }]}>
              <Ionicons name="cash" size={24} color={colors.gold[700]} />
            </View>
          </View>
        </View>

      {/* Upcoming Events */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("dashboard.scheduledSessions")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Eventos' as never)}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>{t("restaurants.viewAll", { count: "" })}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.cardSubtitle, { color: colors.text + "80" }]}>
          {t("dashboard.upcomingClasses")}
        </Text>

        {events.length > 0 ? (
          <View style={styles.eventsContainer}>
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventItem, { borderColor: colors.border }]}
                onPress={() => handleShowDetails(event)}
              >
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>
                    {t("session.language")}: {event.language}
                  </Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.text + "80"} style={styles.eventIcon} />
                    <Text style={[styles.eventMetaText, { color: colors.text + "80" }]}>
                      {event.date} {t("dashboard.at")} {event.time}
                    </Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailItem}>
                      <Ionicons name="people-outline" size={14} color={colors.text + "80"} />
                      <Text style={[styles.eventDetailText, { color: colors.text + "80" }]}>
                        {event.participants} {t("dashboard.participants")}
                      </Text>
                    </View>
                    <View style={styles.eventDetailItem}>
                      <Ionicons name="cash-outline" size={14} color={colors.text + "80"} />
                      <Text style={[styles.eventDetailText, { color: colors.text + "80" }]}>
                        {event.revenue}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text + "50"} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>{t("dashboard.noSessions")}</Text>
          </View>
        )}
      </Card>

      {/* Recent Notifications */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("dashboard.recentNotifications")}</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Dashboard' as never)}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>{t("restaurants.viewAll", { count: "" })}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.cardSubtitle, { color: colors.text + "80" }]}>
          {t("dashboard.importantMessages")}
        </Text>

        {notifications.length > 0 ? (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <View 
                key={notification.id} 
                style={[
                  styles.notificationItem, 
                  { 
                    borderColor: colors.border,
                    backgroundColor: notification.read ? colors.background : colors.primary + "10" 
                  }
                ]}
              >
                <View style={[
                  styles.notificationIcon, 
                  { 
                    backgroundColor: 
                      notification.type === 'booking' ? colors.success + "20" :
                      notification.type === 'cancellation' ? colors.error + "20" :
                      colors.primary + "20"
                  }
                ]}>
                  <Ionicons 
                    name={
                      notification.type === 'booking' ? 'checkmark-circle' :
                      notification.type === 'cancellation' ? 'close-circle' :
                      notification.type === 'update' ? 'refresh-circle' :
                      'information-circle'
                    } 
                    size={24} 
                    color={
                      notification.type === 'booking' ? colors.success :
                      notification.type === 'cancellation' ? colors.error :
                      colors.primary
                    } 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {notification.title}
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.text + "80" }]}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationDate, { color: colors.text + "60" }]}>
                    {notification.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>{t("dashboard.noNotifications")}</Text>
          </View>
        )}
      </Card>
      
      {/* Event Details Modal */}
      {renderEventDetailsModal()}
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
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
  },
  statsOverview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  card: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  eventsContainer: {
    marginTop: 8,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventIcon: {
    marginRight: 4,
  },
  eventMetaText: {
    fontSize: 14,
  },
  eventDetails: {
    flexDirection: "row",
    marginTop: 4,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  eventDetailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  notificationsContainer: {
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    position: 'relative',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
    position: 'absolute',
    right: -16,
    top: 3,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
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
  participantsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  participantsList: {
    maxHeight: 200,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  participantName: {
    fontSize: 14,
    marginLeft: 8,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});