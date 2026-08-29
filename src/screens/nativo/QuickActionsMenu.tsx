"use client"

import { useState, useContext } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Notification } from "./AppTypes"

// Definir los nombres de iconos específicos que usamos
type IconName = 'time-outline' | 'calendar-outline' | 'location-outline' | 
  'chatbubble-outline' | 'cash-outline' | 'notifications-outline' | 
  'chevron-up' | 'close';

export default function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { appState, setCurrentScreen, updateAppState } = useContext(AppContext) as AppContextType

  interface QuickAction {
    id: string;
    title: string;
    description: string;
    iconName: IconName;  // Nombre específico del icono de Ionicons
    color: string;
    action: () => void;
    badge?: number | null;
  }

  const quickActions: QuickAction[] = [
    {
      id: "toggle-availability",
      title: appState.isAvailable ? "Desactivar disponibilidad" : "Activar disponibilidad",
      description: "Cambiar estado rápidamente",
      iconName: appState.isAvailable ? "time-outline" : "calendar-outline",
      color: appState.isAvailable ? "#ef4444" : "#10b981",
      action: () => {
        updateAppState({ isAvailable: !appState.isAvailable })
        setIsOpen(false)
      },
    },
    {
      id: "view-sessions",
      title: "Próximas sesiones",
      description: "Ver sesiones programadas",
      iconName: "calendar-outline",
      color: "#3b82f6",
      action: () => {
        setCurrentScreen("home")
        setIsOpen(false)
      },
    },
    {
      id: "find-restaurants",
      title: "Buscar restaurantes",
      description: "Explorar nuevos lugares",
      iconName: "location-outline",
      color: "#2563eb",
      action: () => {
        setCurrentScreen("restaurants")
        setIsOpen(false)
      },
    },
    {
      id: "messages",
      title: "Mensajes",
      description: "Chat con estudiantes",
      iconName: "chatbubble-outline",
      color: "#3b82f6",
      action: () => {
        setCurrentScreen("messages")
        setIsOpen(false)
      },
    },
    {
      id: "earnings",
      title: "Ganancias",
      description: "Ver ingresos y estadísticas",
      iconName: "cash-outline",
      color: "#10b981",
      action: () => {
        setCurrentScreen("earnings")
        setIsOpen(false)
      },
    },
    {
      id: "notifications",
      title: "Notificaciones",
      description: `${appState.notifications.filter((n: Notification) => !n.read).length} sin leer`,
      iconName: "notifications-outline",
      color: "#3b82f6",
      badge: appState.notifications.filter((n: Notification) => !n.read).length || null,
      action: () => {
        setCurrentScreen("notifications")
        setIsOpen(false)
      },
    },
  ]

  if (!isOpen) {
    return (
      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          style={styles.actionButton}
        >
          <Ionicons name="chevron-up" size={16} color="#2563eb" style={{ marginRight: 4 }} />
          <Text style={{ color: '#2563eb' }}>Acciones</Text>
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.overlay}>
      {/* Overlay */}
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={() => setIsOpen(false)}
        activeOpacity={1}
      />

      {/* Menu */}
      <Card style={styles.menuCard}>
        <CardContent style={styles.cardContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Acciones Rápidas</Text>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <Ionicons name="close" size={20} color="#1e3a8a" />
            </Button>
          </View>

          <ScrollView style={styles.actionsList}>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                style={styles.actionItem}
                onClick={action.action}
              >
                <View style={styles.actionContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={action.iconName} size={20} color={action.color} />
                    {action.badge && (
                      <Badge style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {action.badge > 9 ? "9+" : action.badge.toString()}
                        </Text>
                      </Badge>
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                </View>
              </Button>
            ))}
          </ScrollView>
        </CardContent>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    zIndex: 40,
  },
  actionButton: {
    borderRadius: 30,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: '#bfdbfe',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  menuCard: {
    width: '100%',
    maxWidth: 450,
    marginHorizontal: 16,
    marginBottom: 96,
    maxHeight: 384,
    borderColor: '#bfdbfe',
  },
  cardContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1e3a8a',
  },
  actionsList: {
    maxHeight: 300,
  },
  actionItem: {
    width: '100%',
    justifyContent: 'flex-start',
    height: 'auto',
    padding: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    height: 16,
    width: 16,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  actionTitle: {
    fontWeight: '500',
    fontSize: 14,
    color: '#1e3a8a',
  },
  actionDescription: {
    fontSize: 12,
    color: '#2563eb',
  },
});