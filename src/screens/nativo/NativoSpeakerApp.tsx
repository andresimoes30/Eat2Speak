"use client"

import { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import NativeHomeScreen from "./NativeHomeScreen"
import NativeNotificationsScreen from "./NativeNotificationsScreen"
import NativeProfileScreen from "./NativeProfileScreen"
import NativeSessionHistoryScreen from "./NativeSessionHistoryScreen"
import NativePaymentsScreen from "./NativePaymentsScreen"
import RestaurantSelectionScreen from "./RestaurantSelectionScreen"
import BottomNavigator from "./BottomNavigator"
import FloatingActionButton from "./FloatingActionButton"
import QuickActionsMenu from "./QuickActionsMenu"
import { AppContext, AppState, mockData } from "./AppTypes"

export default function NativeSpeakerApp() {
  const [currentScreen, setCurrentScreen] = useState<string>("home")
  const [appState, setAppState] = useState<AppState>({
    user: mockData.user,
    isAvailable: mockData.user.isAvailable,
    notifications: mockData.notifications,
    selectedRestaurants: [1, 2],
    availableDays: ["monday", "tuesday", "wednesday", "friday"],
    languages: [
      { language: "Español", level: "Nativo" },
      { language: "Inglés", level: "Avanzado" },
    ],
  })

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }))
  }

  // Temporary component for unavailable screens
  const ComingSoonScreen = ({ feature }: { feature: string }) => (
    <View style={styles.comingSoonContainer}>
      <Text style={styles.comingSoonTitle}>{feature}</Text>
      <Text style={styles.comingSoonText}>Esta funcionalidad estará disponible próximamente</Text>
    </View>
  )

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <NativeHomeScreen />
      case "availability":
        return <ComingSoonScreen feature="Disponibilidad" />
      case "restaurants":
        return <RestaurantSelectionScreen />
      case "history":
        return <NativeSessionHistoryScreen />
      case "payments":
        return <NativePaymentsScreen />
      case "notifications":
        return <NativeNotificationsScreen />
      case "profile":
        return <NativeProfileScreen />
      default:
        return <NativeHomeScreen />
    }
  }

  return (
    <AppContext.Provider value={{ appState, updateAppState, setCurrentScreen, currentScreen }}>
      <View style={{ 
        maxWidth: 500, 
        marginLeft: 'auto', 
        marginRight: 'auto', 
        backgroundColor: '#f9fafb', 
        minHeight: '100%', 
        paddingBottom: 80 
      }}>
        {renderScreen()}
        <QuickActionsMenu />
        <FloatingActionButton />
        <BottomNavigator />
      </View>
    </AppContext.Provider>
  )
}

const styles = StyleSheet.create({
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2563eb',
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
  }
})
