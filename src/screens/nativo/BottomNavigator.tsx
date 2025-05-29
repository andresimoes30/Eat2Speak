"use client"

import { useContext } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Badge } from "@/components/ui/badge"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Notification } from "./AppTypes"

// Definir los nombres de iconos específicos que usamos
type IconName = 'home-outline' | 'calendar-outline' | 'location-outline' | 
  'time-outline' | 'cash-outline' | 'notifications-outline' | 'person-outline';

interface NavigationItem {
  id: string;
  label: string;
  iconName: IconName;  // Nombre específico del icono de Ionicons
  screen: string;
  badge: number | null;
}

export default function BottomNavigator() {
  const { appState, setCurrentScreen, currentScreen } = useContext(AppContext) as AppContextType

  const navigationItems: NavigationItem[] = [
    {
      id: "home",
      label: "Inicio",
      iconName: "home-outline",
      screen: "home",
      badge: null,
    },
    {
      id: "restaurants",
      label: "Restaurantes",
      iconName: "location-outline",
      screen: "restaurants",
      badge: appState.selectedRestaurants.length > 0 ? appState.selectedRestaurants.length : null,
    },
    {
      id: "history",
      label: "Historial",
      iconName: "time-outline",
      screen: "history",
      badge: null,
    },
    {
      id: "payments",
      label: "Pagos",
      iconName: "cash-outline",
      screen: "payments",
      badge: null,
    },
    {
      id: "notifications",
      label: "Notificaciones",
      iconName: "notifications-outline",
      screen: "notifications",
      badge: appState.notifications.filter((n: Notification) => !n.read).length || null,
    },
    {
      id: "profile",
      label: "Perfil",
      iconName: "person-outline",
      screen: "profile",
      badge: null,
    },
  ]

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen)
  }

  return (
    <View style={styles.container}>
      <View style={styles.navGrid}>
        {navigationItems.map((item) => {
          const isActive = currentScreen === item.screen

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navButton,
                isActive ? styles.activeNavButton : styles.inactiveNavButton
              ]}
              onPress={() => handleNavigation(item.screen)}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={item.iconName} 
                  size={20} 
                  color={isActive ? '#2563eb' : '#4b5563'} 
                />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    style={styles.badge}
                  >
                    <Text style={styles.badgeText}>
                      {item.badge > 9 ? "9+" : item.badge.toString()}
                    </Text>
                  </Badge>
                )}
              </View>
              <Text style={[
                styles.labelText,
                isActive ? styles.activeText : styles.inactiveText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
    width: '100%',
    maxWidth: 450,
  },
  navButton: {
    width: '32%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    padding: 8,
    borderRadius: 8,
  },
  activeNavButton: {
    backgroundColor: '#dbeafe',
  },
  inactiveNavButton: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    position: 'relative',
  },
  iconText: {
    fontSize: 20,
  },
  labelText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  inactiveText: {
    color: '#4b5563',
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
    backgroundColor: '#ef4444',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
  },
});