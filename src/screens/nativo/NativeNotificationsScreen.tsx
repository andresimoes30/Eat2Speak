import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"

// Define the parameter list for the Native Navigator stack
type NativeStackParamList = {
  NativeProfileMain: undefined;
  NativeNotifications: undefined;
};

// Define the navigation prop type
type NativeNotificationsNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativeNotifications'
>;

// Notification type
interface Notification {
  id: number;
  type: 'booking' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NativeNotificationsScreen() {
  const navigation = useNavigation<NativeNotificationsNavigationProp>();
  
  // Estados para preferências de notificações
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  
  // Estados para filtro e notificações
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'message' | 'system'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'booking',
      title: 'Nueva reserva',
      message: 'Juan Pérez ha reservado una sesión para mañana a las 17:00 en La Paella Real',
      time: 'Hace 30 minutos',
      read: false
    },
    {
      id: 2,
      type: 'message',
      title: 'Nuevo mensaje',
      message: 'Sofía Martínez: Hola, ¿podríamos cambiar nuestra sesión para el viernes?',
      time: 'Hace 2 horas',
      read: true
    },
    {
      id: 3,
      type: 'system',
      title: 'Actualización de la app',
      message: 'Hemos lanzado una nueva versión de la app con mejoras en el rendimiento',
      time: 'Hace 1 día',
      read: false
    },
    {
      id: 4,
      type: 'booking',
      title: 'Sesión confirmada',
      message: 'Miguel Rodríguez ha confirmado su asistencia a la sesión del lunes',
      time: 'Hace 2 días',
      read: true
    },
    {
      id: 5,
      type: 'message',
      title: 'Nuevo mensaje',
      message: 'Carlos Gutiérrez: ¡Gracias por la clase de hoy! Fue muy útil.',
      time: 'Hace 3 días',
      read: true
    },
    {
      id: 6,
      type: 'system',
      title: 'Verificación completada',
      message: 'Tu perfil ha sido verificado. Ahora puedes recibir más solicitudes de estudiantes.',
      time: 'Hace 1 semana',
      read: true
    },
  ]);
  
  // Theme colors - simplified version since we don't have ThemeContext
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
      200: '#bfdbfe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      600: '#7c3aed',
      700: '#6d28d9'
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      600: '#ca8a04',
      700: '#a16207'
    },
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      600: '#d97706',
    },
    rose: {
      50: '#fff1f2',
      100: '#ffe4e6',
      600: '#e11d48',
    },
    emerald: {
      50: '#ecfdf5',
      100: '#d1fae5',
      600: '#059669',
    }
  };

  // Função para marcar notificação como lida/não lida
  const toggleReadStatus = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: !notification.read } 
        : notification
    ));
  };

  // Função para excluir notificação
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Função para marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Função para limpar todas as notificações
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Filtra as notificações com base no filtro selecionado
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Calcula o número de notificações não lidas para cada tipo
  const unreadCount = {
    all: notifications.filter(n => !n.read).length,
    booking: notifications.filter(n => n.type === 'booking' && !n.read).length,
    message: notifications.filter(n => n.type === 'message' && !n.read).length,
    system: notifications.filter(n => n.type === 'system' && !n.read).length,
  };

  // Função para obter o ícone e cor de acordo com o tipo de notificação
  const getNotificationTypeInfo = (type: 'booking' | 'message' | 'system') => {
    switch (type) {
      case 'booking':
        return { 
          icon: 'calendar-outline', 
          color: colors.blue[600],
          bgColor: colors.blue[50]
        };
      case 'message':
        return { 
          icon: 'chatbubble-outline', 
          color: colors.emerald[600],
          bgColor: colors.emerald[50]
        };
      case 'system':
        return { 
          icon: 'information-circle-outline', 
          color: colors.amber[600],
          bgColor: colors.amber[50]
        };
      default:
        return { 
          icon: 'notifications-outline', 
          color: colors.primary,
          bgColor: colors.blue[50]
        };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: colors.blue[100] }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && { color: colors.blue[700] }
          ]}>Todas</Text>
          {unreadCount.all > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadCount.all}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && { backgroundColor: colors.rose[100] }
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            filter === 'unread' && { color: colors.rose[600] }
          ]}>No leídas</Text>
          {unreadCount.all > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>{unreadCount.all}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'booking' && { backgroundColor: colors.blue[100] }
          ]}
          onPress={() => setFilter('booking')}
        >
          <Text style={[
            styles.filterText,
            filter === 'booking' && { color: colors.blue[700] }
          ]}>Reservas</Text>
          {unreadCount.booking > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.blue[600] }]}>
              <Text style={styles.badgeText}>{unreadCount.booking}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'message' && { backgroundColor: colors.emerald[100] }
          ]}
          onPress={() => setFilter('message')}
        >
          <Text style={[
            styles.filterText,
            filter === 'message' && { color: colors.emerald[600] }
          ]}>Mensajes</Text>
          {unreadCount.message > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.emerald[600] }]}>
              <Text style={styles.badgeText}>{unreadCount.message}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'system' && { backgroundColor: colors.amber[100] }
          ]}
          onPress={() => setFilter('system')}
        >
          <Text style={[
            styles.filterText,
            filter === 'system' && { color: colors.amber[600] }
          ]}>Sistema</Text>
          {unreadCount.system > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: colors.amber[600] }]}>
              <Text style={styles.badgeText}>{unreadCount.system}</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Marcar todas como leídas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={clearAllNotifications}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Borrar todas</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          style={styles.notificationsList}
          renderItem={({ item }) => {
            const typeInfo = getNotificationTypeInfo(item.type);
            return (
              <View style={[
                styles.notificationCard, 
                { backgroundColor: colors.card },
                !item.read && { borderLeftWidth: 3, borderLeftColor: typeInfo.color }
              ]}>
                <View style={[
                  styles.notificationIconContainer, 
                  { backgroundColor: typeInfo.bgColor }
                ]}>
                  <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[
                      styles.notificationTitle, 
                      { color: colors.text },
                      !item.read && { fontWeight: '700' }
                    ]}>{item.title}</Text>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{item.time}</Text>
                  </View>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                    {item.message}
                  </Text>
                  <View style={styles.notificationActions}>
                    <TouchableOpacity 
                      style={styles.notificationAction}
                      onPress={() => toggleReadStatus(item.id)}
                    >
                      <Ionicons 
                        name={item.read ? "mail-outline" : "mail-open-outline"} 
                        size={16} 
                        color={colors.primary} 
                      />
                      <Text style={[styles.notificationActionText, { color: colors.primary }]}>
                        {item.read ? "Marcar como no leída" : "Marcar como leída"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.notificationAction}
                      onPress={() => deleteNotification(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                      <Text style={[styles.notificationActionText, { color: colors.error }]}>
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay notificaciones</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes notificaciones {filter !== 'all' ? `de tipo ${filter}` : ''} en este momento
          </Text>
        </View>
      )}

      {/* Notification Settings */}
      <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.settingsTitle, { color: colors.text }]}>Preferencias de notificaciones</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: colors.text }]}>Notificaciones por email</Text>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: colors.text }]}>Notificaciones push</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={styles.settingsSubtitle}>
          <Text style={[styles.settingsSubtitleText, { color: colors.textSecondary }]}>Tipos de notificaciones</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: colors.text }]}>Reservas</Text>
          <Switch
            value={bookingNotifications}
            onValueChange={setBookingNotifications}
            trackColor={{ false: colors.border, true: colors.blue[600] }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: colors.text }]}>Mensajes</Text>
          <Switch
            value={messageNotifications}
            onValueChange={setMessageNotifications}
            trackColor={{ false: colors.border, true: colors.emerald[600] }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: colors.text }]}>Sistema</Text>
          <Switch
            value={systemNotifications}
            onValueChange={setSystemNotifications}
            trackColor={{ false: colors.border, true: colors.amber[600] }}
            thumbColor={colors.card}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgeCount: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationActionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  settingsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingsSubtitle: {
    marginTop: 12,
    marginBottom: 8,
  },
  settingsSubtitleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 16,
  },
});