"use client"
import { useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  Alert,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"

// Interface for notification type
interface Notification {
  id: number
  title: string
  message: string
  date: string
  time: string
  read: boolean
  type: 'booking' | 'cancellation' | 'update' | 'system' | 'payment'
  relatedEvent?: {
    id: number
    date: string
    time: string
    language: string
  }
}

// Mock data for notifications
const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Nueva reserva confirmada",
    message: "Se ha confirmado una nueva reserva para una clase de Italiano con 6 participantes.",
    date: "01 Junio, 2025",
    time: "09:15",
    read: false,
    type: 'booking',
    relatedEvent: {
      id: 1,
      date: "15 Junio, 2025",
      time: "19:00",
      language: "Italiano"
    }
  },
  {
    id: 2,
    title: "Cancelación de evento",
    message: "El evento de Alemán programado para el 28 de junio ha sido cancelado por el profesor.",
    date: "31 Mayo, 2025",
    time: "18:30",
    read: false,
    type: 'cancellation',
    relatedEvent: {
      id: 5,
      date: "28 Junio, 2025",
      time: "13:30",
      language: "Alemán"
    }
  },
  {
    id: 3,
    title: "Actualización de sistema",
    message: "Se han realizado mejoras en la plataforma para optimizar la experiencia de usuario.",
    date: "30 Mayo, 2025",
    time: "14:20",
    read: true,
    type: 'system'
  },
  {
    id: 4,
    title: "Pago recibido",
    message: "Has recibido un pago de 180€ por el evento de Italiano del 15 de junio.",
    date: "28 Mayo, 2025",
    time: "10:45",
    read: true,
    type: 'payment',
    relatedEvent: {
      id: 1,
      date: "15 Junio, 2025",
      time: "19:00",
      language: "Italiano"
    }
  },
  {
    id: 5,
    title: "Nuevo participante añadido",
    message: "Un nuevo estudiante se ha unido al evento de Japonés del 18 de junio.",
    date: "27 Mayo, 2025",
    time: "16:30",
    read: true,
    type: 'booking',
    relatedEvent: {
      id: 2,
      date: "18 Junio, 2025",
      time: "12:30",
      language: "Japonés"
    }
  },
  {
    id: 6,
    title: "Recordatorio de evento próximo",
    message: "El evento de Francés está programado para dentro de 5 días. Asegúrate de tener todo preparado.",
    date: "25 Mayo, 2025",
    time: "09:00",
    read: true,
    type: 'system',
    relatedEvent: {
      id: 3,
      date: "20 Junio, 2025",
      time: "20:00",
      language: "Francés"
    }
  },
  {
    id: 7,
    title: "Actualización de menú solicitada",
    message: "Eat2Speak te recomienda actualizar tu menú para los próximos eventos. El verano se acerca y es una buena oportunidad para ofrecer platos de temporada.",
    date: "24 Mayo, 2025",
    time: "11:20",
    read: true,
    type: 'system'
  }
]

export default function RestauranteNotificationsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  
  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch(filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read)
      case 'read':
        return notifications.filter(notification => notification.read)
      default:
        return notifications
    }
  }
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    )
    
    setNotifications(updatedNotifications)
    
    // If the notification is currently selected, update it there too
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification({ ...selectedNotification, read: true })
    }
  }
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    Alert.alert(
      "Marcar todo como leído",
      "¿Deseas marcar todas las notificaciones como leídas?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Confirmar",
          onPress: () => {
            const updatedNotifications = notifications.map(notification => (
              { ...notification, read: true }
            ))
            
            setNotifications(updatedNotifications)
            
            Alert.alert("Éxito", "Todas las notificaciones han sido marcadas como leídas")
          }
        }
      ]
    )
  }
  
  // Delete notification
  const deleteNotification = (id: number) => {
    Alert.alert(
      "Eliminar notificación",
      "¿Deseas eliminar esta notificación? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const updatedNotifications = notifications.filter(
              notification => notification.id !== id
            )
            
            setNotifications(updatedNotifications)
            
            if (detailsModalVisible) {
              setDetailsModalVisible(false)
            }
            
            Alert.alert("Éxito", "La notificación ha sido eliminada")
          }
        }
      ]
    )
  }
  
  // Show notification details
  const showNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setDetailsModalVisible(true)
    
    // Mark as read when opened
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }
  
  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'booking':
        return 'checkmark-circle'
      case 'cancellation':
        return 'close-circle'
      case 'update':
        return 'refresh-circle'
      case 'payment':
        return 'cash'
      default:
        return 'information-circle'
    }
  }
  
  // Get color for notification type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'booking':
        return colors.success
      case 'cancellation':
        return colors.error
      case 'update':
        return colors.primary
      case 'payment':
        return colors.gold[700]
      default:
        return colors.primary
    }
  }
  
  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconName = getNotificationIcon(item.type)
    const iconColor = getNotificationColor(item.type)
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { 
            backgroundColor: item.read ? colors.background : colors.primary + "10",
            borderColor: colors.border
          }
        ]}
        onPress={() => showNotificationDetails(item)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: iconColor + "20" }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
          </View>
          
          <Text 
            style={[styles.notificationMessage, { color: colors.text + "80" }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          
          <View style={styles.notificationMeta}>
            <Text style={[styles.notificationDate, { color: colors.text + "60" }]}>
              {item.date} - {item.time}
            </Text>
            
            {item.relatedEvent && (
              <View style={[styles.eventBadge, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.eventBadgeText, { color: colors.primary }]}>
                  {item.relatedEvent.language}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
  
  // Render notification details modal
  const renderNotificationDetailsModal = () => {
    if (!selectedNotification) return null
    
    const iconName = getNotificationIcon(selectedNotification.type)
    const iconColor = getNotificationColor(selectedNotification.type)
    
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
                Detalles de la notificación
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.notificationDetailContent}>
              <View style={[
                styles.notificationDetailIcon, 
                { backgroundColor: iconColor + "20" }
              ]}>
                <Ionicons name={iconName as any} size={32} color={iconColor} />
              </View>
              
              <Text style={[styles.notificationDetailTitle, { color: colors.text }]}>
                {selectedNotification.title}
              </Text>
              
              <Text style={[styles.notificationDetailDate, { color: colors.text + "60" }]}>
                {selectedNotification.date} - {selectedNotification.time}
              </Text>
              
              <Text style={[styles.notificationDetailMessage, { color: colors.text }]}>
                {selectedNotification.message}
              </Text>
              
              {selectedNotification.relatedEvent && (
                <View style={[
                  styles.relatedEventCard, 
                  { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }
                ]}>
                  <View style={styles.relatedEventHeader}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={[styles.relatedEventTitle, { color: colors.primary }]}>
                      Evento Relacionado
                    </Text>
                  </View>
                  
                  <View style={styles.relatedEventDetails}>
                    <Text style={[styles.relatedEventLanguage, { color: colors.text }]}>
                      {selectedNotification.relatedEvent.language}
                    </Text>
                    <Text style={[styles.relatedEventDateTime, { color: colors.text + "80" }]}>
                      {selectedNotification.relatedEvent.date} a las {selectedNotification.relatedEvent.time}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.viewEventButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setDetailsModalVisible(false)
                      // Navigate to the event details in the Eventos tab
                      navigation.navigate('Eventos' as never);
                    }}
                  >
                    <Text style={styles.viewEventButtonText}>Ver Evento</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: colors.error }]}
                onPress={() => {
                  setDetailsModalVisible(false)
                  deleteNotification(selectedNotification.id)
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                  Eliminar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>
                  Cerrar
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
        <Text style={[styles.title, { color: colors.text }]}>Notificaciones</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllReadButton, { borderColor: colors.primary }]}
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={18} color={colors.primary} />
            <Text style={[styles.markAllReadText, { color: colors.primary }]}>
              Marcar todo como leído
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { 
              borderBottomColor: filter === 'all' 
                ? colors.primary 
                : 'transparent' 
            }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { 
                color: filter === 'all' 
                  ? colors.primary 
                  : colors.text + "60",
                fontWeight: filter === 'all' ? "600" : "400"
              }
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            { 
              borderBottomColor: filter === 'unread' 
                ? colors.primary 
                : 'transparent' 
            }
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { 
                color: filter === 'unread' 
                  ? colors.primary 
                  : colors.text + "60",
                fontWeight: filter === 'unread' ? "600" : "400"
              }
            ]}
          >
            No leídas
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            { 
              borderBottomColor: filter === 'read' 
                ? colors.primary 
                : 'transparent' 
            }
          ]}
          onPress={() => setFilter('read')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { 
                color: filter === 'read' 
                  ? colors.primary 
                  : colors.text + "60",
                fontWeight: filter === 'read' ? "600" : "400"
              }
            ]}
          >
            Leídas
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.text + "40"} />
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>
              No hay notificaciones
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.text + "60" }]}>
              {filter === 'unread' 
                ? "No tienes notificaciones sin leer" 
                : filter === 'read' 
                  ? "No tienes notificaciones leídas" 
                  : "Las notificaciones aparecerán aquí"}
            </Text>
          </View>
        }
      />
      
      {/* Notification Details Modal */}
      {renderNotificationDetailsModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  markAllReadText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterTab: {
    paddingVertical: 10,
    marginRight: 20,
    borderBottomWidth: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  filterTabText: {
    fontSize: 15,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    position: 'relative',
    right: -4,
  },
  notificationMessage: {
    fontSize: 13,
    marginBottom: 6,
  },
  notificationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationDate: {
    fontSize: 12,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: "500",
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
  notificationDetailContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  notificationDetailIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  notificationDetailTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  notificationDetailDate: {
    fontSize: 13,
    marginBottom: 16,
  },
  notificationDetailMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  relatedEventCard: {
    width: "100%",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  relatedEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  relatedEventTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  relatedEventDetails: {
    marginBottom: 14,
  },
  relatedEventLanguage: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  relatedEventDateTime: {
    fontSize: 13,
  },
  viewEventButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  viewEventButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  deleteButtonText: {
    fontWeight: "600",
    marginLeft: 8,
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