"use client"
import { useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Alert,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Interface for participant type
interface Participant {
  id: number
  name: string
  type: 'student' | 'teacher'
  avatar?: string
  email?: string
  phone?: string
}

// Interface for event type
interface Event {
  id: number
  date: string
  time: string
  language: string
  totalParticipants: number
  status: 'confirmed' | 'pending' | 'cancelled'
  revenue: string
  participants: Participant[]
}

// Mock data for events
const upcomingEvents: Event[] = [
  {
    id: 1,
    date: "15 Junio, 2025",
    time: "19:00",
    language: "Italiano",
    totalParticipants: 6,
    status: "confirmed",
    revenue: "180€",
    participants: [
      { id: 1, name: "María Silva", type: "teacher", email: "maria@example.com" },
      { id: 2, name: "Juan Pérez", type: "student", email: "juan@example.com" },
      { id: 3, name: "Ana López", type: "student", email: "ana@example.com" },
      { id: 4, name: "Carlos Rodríguez", type: "student", email: "carlos@example.com" },
      { id: 5, name: "Laura García", type: "student", email: "laura@example.com" },
      { id: 6, name: "Pablo Martínez", type: "student", email: "pablo@example.com" }
    ]
  },
  {
    id: 2,
    date: "18 Junio, 2025",
    time: "12:30",
    language: "Japonés",
    totalParticipants: 4,
    status: "confirmed",
    revenue: "120€",
    participants: [
      { id: 7, name: "Hiroshi Tanaka", type: "teacher", email: "hiroshi@example.com" },
      { id: 8, name: "Elena Fernández", type: "student", email: "elena@example.com" },
      { id: 9, name: "Miguel González", type: "student", email: "miguel@example.com" },
      { id: 10, name: "Sofía Díaz", type: "student", email: "sofia@example.com" },
      { id: 11, name: "David Sánchez", type: "student", email: "david@example.com" }
    ]
  },
  {
    id: 3,
    date: "20 Junio, 2025",
    time: "20:00",
    language: "Francés",
    totalParticipants: 8,
    status: "confirmed",
    revenue: "240€",
    participants: [
      { id: 12, name: "Sophie Dupont", type: "teacher", email: "sophie@example.com" },
      { id: 13, name: "Roberto Torres", type: "student", email: "roberto@example.com" },
      { id: 14, name: "Carmen López", type: "student", email: "carmen@example.com" },
      { id: 15, name: "Javier Ruiz", type: "student", email: "javier@example.com" },
      { id: 16, name: "Isabel Morales", type: "student", email: "isabel@example.com" },
      { id: 17, name: "Fernando Ortiz", type: "student", email: "fernando@example.com" },
      { id: 18, name: "Lucía Vega", type: "student", email: "lucia@example.com" },
      { id: 19, name: "Antonio Molina", type: "student", email: "antonio@example.com" },
      { id: 20, name: "Rosa Campos", type: "student", email: "rosa@example.com" }
    ]
  },
  {
    id: 4,
    date: "25 Junio, 2025",
    time: "18:00",
    language: "Inglés",
    totalParticipants: 5,
    status: "pending",
    revenue: "150€",
    participants: [
      { id: 21, name: "John Smith", type: "teacher", email: "john@example.com" },
      { id: 22, name: "Marta Jiménez", type: "student", email: "marta@example.com" },
      { id: 23, name: "Pedro Sánchez", type: "student", email: "pedro@example.com" },
      { id: 24, name: "Raquel Gómez", type: "student", email: "raquel@example.com" },
      { id: 25, name: "Alberto Vázquez", type: "student", email: "alberto@example.com" }
    ]
  },
  {
    id: 5,
    date: "28 Junio, 2025",
    time: "13:30",
    language: "Alemán",
    totalParticipants: 3,
    status: "cancelled",
    revenue: "90€",
    participants: [
      { id: 26, name: "Hans Mueller", type: "teacher", email: "hans@example.com" },
      { id: 27, name: "Cristina Rojas", type: "student", email: "cristina@example.com" },
      { id: 28, name: "Daniel Ponce", type: "student", email: "daniel@example.com" }
    ]
  }
]

// Mock data for past events
const pastEvents: Event[] = [
  {
    id: 6,
    date: "5 Junio, 2025",
    time: "20:00",
    language: "Portugués",
    totalParticipants: 4,
    status: "confirmed",
    revenue: "120€",
    participants: [
      { id: 29, name: "João Silva", type: "teacher", email: "joao@example.com" },
      { id: 30, name: "Alicia Ramírez", type: "student", email: "alicia@example.com" },
      { id: 31, name: "Sergio Castro", type: "student", email: "sergio@example.com" },
      { id: 32, name: "Marina López", type: "student", email: "marina@example.com" }
    ]
  },
  {
    id: 7,
    date: "2 Junio, 2025",
    time: "19:30",
    language: "Chino",
    totalParticipants: 6,
    status: "confirmed",
    revenue: "180€",
    participants: [
      { id: 33, name: "Li Wei", type: "teacher", email: "liwei@example.com" },
      { id: 34, name: "Tomás Herrera", type: "student", email: "tomas@example.com" },
      { id: 35, name: "Eva Gutiérrez", type: "student", email: "eva@example.com" },
      { id: 36, name: "Rubén Flores", type: "student", email: "ruben@example.com" },
      { id: 37, name: "Beatriz Navarro", type: "student", email: "beatriz@example.com" },
      { id: 38, name: "Diego Torres", type: "student", email: "diego@example.com" }
    ]
  }
]

export default function RestauranteEventsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // State for events and filters
  const [upcomingEventsList, setUpcomingEventsList] = useState<Event[]>(upcomingEvents)
  const [pastEventsList, setPastEventsList] = useState<Event[]>(pastEvents)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all')
  
  // Get filtered events based on status
  const getFilteredEvents = () => {
    const events = activeTab === 'upcoming' ? upcomingEventsList : pastEventsList
    
    if (statusFilter === 'all') {
      return events
    }
    
    return events.filter(event => event.status === statusFilter)
  }
  
  // Open event details modal
  const handleShowDetails = (event: Event) => {
    setSelectedEvent(event)
    setDetailsModalVisible(true)
  }
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed':
        return colors.success
      case 'pending':
        return colors.gold[500]
      case 'cancelled':
        return colors.error
      default:
        return colors.text
    }
  }
  
  // Get status text
  const getStatusText = (status: string) => {
    switch(status) {
      case 'confirmed':
        return t("restaurant.confirmed")
      case 'pending':
        return t("restaurant.pending")
      case 'cancelled':
        return t("restaurant.cancelled")
      default:
        return status
    }
  }
  
  // Handle cancellation
  const handleCancelEvent = (eventId: number) => {
    Alert.alert(
      t("restaurant.cancelEvent"),
      t("restaurant.confirmCancelEvent"),
      [
        {
          text: t("common.no"),
          style: "cancel"
        },
        {
          text: t("restaurant.yesCancel"),
          style: "destructive",
          onPress: () => {
            // Update the event status
            const updatedEvents = upcomingEventsList.map(event => 
              event.id === eventId 
                ? { ...event, status: 'cancelled' as 'cancelled' } 
                : event
            )
            
            setUpcomingEventsList(updatedEvents)
            
            // If the event is currently selected in the modal, update it there too
            if (selectedEvent && selectedEvent.id === eventId) {
              setSelectedEvent({ ...selectedEvent, status: 'cancelled' as 'cancelled' })
            }
            
            Alert.alert(t("restaurant.eventCancelled"), t("restaurant.eventCancelledSuccess"))
          }
        }
      ]
    )
  }
  
  // Render event item
  const renderEventItem = ({ item }: { item: Event }) => {
    const statusColor = getStatusColor(item.status)
    const statusText = getStatusText(item.status)
    
    return (
      <Card style={styles.eventCard}>
        <TouchableOpacity
          style={styles.eventCardContent}
          onPress={() => handleShowDetails(item)}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventInfo}>
              <Text style={[styles.eventLanguage, { color: colors.primary }]}>
                {item.language}
              </Text>
              <Text style={[styles.eventDateTime, { color: colors.text }]}>
                {item.date} {t("common.atTime")} {item.time}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.text + "80"} />
              <Text style={[styles.detailText, { color: colors.text + "80" }]}>
                {item.totalParticipants} {t("restaurant.participants")}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={16} color={colors.text + "80"} />
              <Text style={[styles.detailText, { color: colors.text + "80" }]}>
                {item.revenue}
              </Text>
            </View>
          </View>
          
          <View style={styles.participantsPreview}>
            <View style={styles.participantsIcons}>
              {item.participants.slice(0, 5).map((participant, index) => (
                <View
                  key={participant.id}
                  style={[
                    styles.avatarCircle,
                    { 
                      backgroundColor: participant.type === 'teacher' 
                        ? colors.primary + "30" 
                        : colors.gold[100],
                      borderColor: colors.background,
                      marginLeft: index > 0 ? -10 : 0
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.avatarText, 
                      { 
                        color: participant.type === 'teacher' 
                          ? colors.primary 
                          : colors.gold[700] 
                      }
                    ]}
                  >
                    {participant.name.charAt(0)}
                  </Text>
                </View>
              ))}
              
              {item.participants.length > 5 && (
                <View style={[styles.moreAvatar, { backgroundColor: colors.text + "20", borderColor: colors.background }]}>
                  <Text style={[styles.moreAvatarText, { color: colors.text }]}>
                    +{item.participants.length - 5}
                  </Text>
                </View>
              )}
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={colors.text + "50"} />
          </View>
        </TouchableOpacity>
      </Card>
    )
  }
  
  // Render event details modal
  const renderEventDetailsModal = () => {
    if (!selectedEvent) return null
    
    const statusColor = getStatusColor(selectedEvent.status)
    const statusText = getStatusText(selectedEvent.status)
    
    // Separate teachers and students
    const teachers = selectedEvent.participants.filter(p => p.type === 'teacher')
    const students = selectedEvent.participants.filter(p => p.type === 'student')
    
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
                {t("restaurant.eventDetails")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.eventSummary}>
                <View style={styles.eventSummaryHeader}>
                  <Text style={[styles.eventSummaryLanguage, { color: colors.primary }]}>
                    {t("restaurant.sessionOf")} {selectedEvent.language}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusText}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.eventInfoDetails}>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + "20" }]}>
                      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>
                        {t("restaurant.dateAndTime")}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {selectedEvent.date} {t("common.atTime")} {selectedEvent.time}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + "20" }]}>
                      <Ionicons name="people-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>
                        {t("restaurant.participants")}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {selectedEvent.totalParticipants} {t("common.people")}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + "20" }]}>
                      <Ionicons name="cash-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>
                        {t("restaurant.estimatedRevenue")}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {selectedEvent.revenue}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.participantsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("restaurant.teacher")}
                </Text>
                {teachers.map((teacher) => (
                  <View key={teacher.id} style={[styles.participantItem, { borderColor: colors.border }]}>
                    <View style={[styles.participantAvatar, { backgroundColor: colors.primary + "30" }]}>
                      <Text style={[styles.participantAvatarText, { color: colors.primary }]}>
                        {teacher.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={[styles.participantName, { color: colors.text }]}>
                        {teacher.name}
                      </Text>
                      {teacher.email && (
                        <Text style={[styles.participantEmail, { color: colors.text + "80" }]}>
                          {teacher.email}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="school" size={20} color={colors.primary} />
                  </View>
                ))}
                
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                  {t("restaurant.students")} ({students.length})
                </Text>
                {students.map((student) => (
                  <View key={student.id} style={[styles.participantItem, { borderColor: colors.border }]}>
                    <View style={[styles.participantAvatar, { backgroundColor: colors.gold[100] }]}>
                      <Text style={[styles.participantAvatarText, { color: colors.gold[700] }]}>
                        {student.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={[styles.participantName, { color: colors.text }]}>
                        {student.name}
                      </Text>
                      {student.email && (
                        <Text style={[styles.participantEmail, { color: colors.text + "80" }]}>
                          {student.email}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              {selectedEvent.status !== 'cancelled' && activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.error }]}
                  onPress={() => {
                    setDetailsModalVisible(false)
                    handleCancelEvent(selectedEvent.id)
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                    {t("restaurant.cancelEvent")}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>
                  {t("common.close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === 'ios' ? { paddingTop: 8 } : null]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("restaurant.events")}</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { 
              borderBottomColor: activeTab === 'upcoming' 
                ? colors.primary 
                : colors.background,
              borderBottomWidth: 2
            }
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text 
            style={[
              styles.tabText, 
              { 
                color: activeTab === 'upcoming' 
                  ? colors.primary 
                  : colors.text + "80",
                fontWeight: activeTab === 'upcoming' ? "600" : "400"
              }
            ]}
          >
            {t("restaurant.upcoming")}
          </Text>
          {upcomingEventsList.length > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.tabBadgeText}>{upcomingEventsList.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            { 
              borderBottomColor: activeTab === 'past' 
                ? colors.primary 
                : colors.background,
              borderBottomWidth: 2
            }
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text 
            style={[
              styles.tabText, 
              { 
                color: activeTab === 'past' 
                  ? colors.primary 
                  : colors.text + "80",
                fontWeight: activeTab === 'past' ? "600" : "400"
              }
            ]}
          >
            {t("restaurant.past")}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: statusFilter === 'all' 
                  ? colors.primary 
                  : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setStatusFilter('all')}
          >
              <Text 
                style={[
                  styles.filterChipText, 
                  { color: statusFilter === 'all' ? "white" : colors.text }
                ]}
              >
                {t("common.all")}
              </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: statusFilter === 'confirmed' 
                  ? colors.success 
                  : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setStatusFilter('confirmed')}
          >
              <Text 
                style={[
                  styles.filterChipText, 
                  { color: statusFilter === 'confirmed' ? "white" : colors.text }
                ]}
              >
              {t("restaurant.confirmed")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: statusFilter === 'pending' 
                  ? colors.gold[500] 
                  : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setStatusFilter('pending')}
          >
            <Text 
              style={[
                styles.filterChipText, 
                { color: statusFilter === 'pending' ? "white" : colors.text }
              ]}
            >
              {t("restaurant.pending")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: statusFilter === 'cancelled' 
                  ? colors.error 
                  : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setStatusFilter('cancelled')}
          >
            <Text 
              style={[
                styles.filterChipText, 
                { color: statusFilter === 'cancelled' ? "white" : colors.text }
              ]}
            >
              {t("restaurant.cancelled")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <FlatList
        data={getFilteredEvents()}
        renderItem={renderEventItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.text + "40"} />
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>
              {activeTab === 'upcoming' ? t("restaurant.noUpcomingEvents") : t("restaurant.noPastEvents")}
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.text + "60" }]}>
              {statusFilter !== 'all' 
                ? t("restaurant.tryAnotherFilter") 
                : activeTab === 'upcoming' 
                  ? t("restaurant.scheduledEventsWillAppearHere") 
                  : t("restaurant.eventHistoryWillAppearHere")}
            </Text>
          </View>
        }
      />
      
      {/* Event Details Modal */}
      {renderEventDetailsModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    paddingVertical: 10,
    marginRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  filtersContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontWeight: "500",
    fontSize: 13,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 14,
  },
  eventCardContent: {
    padding: 0,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventLanguage: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventDateTime: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  eventDetails: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 4,
  },
  participantsPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  participantsIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  moreAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
    borderWidth: 2,
  },
  moreAvatarText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
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
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
  },
  eventSummary: {
    marginBottom: 16,
  },
  eventSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  eventSummaryLanguage: {
    fontSize: 17,
    fontWeight: "bold",
  },
  eventInfoDetails: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  participantsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 13,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  closeModalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  closeModalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});