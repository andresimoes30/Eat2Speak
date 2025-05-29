"use client"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import LoadingScreen from "../screens/LoadingScreen"
import NativeNavigator from "./NativeNavigator"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { user, isLoading } = useAuth()
  // State to track if user is using the direct native login
  const [isNativeDirectAccess, setIsNativeDirectAccess] = useState(false)

  if (isLoading) {
    return <LoadingScreen />
  }

  // Listen for navigation events to set isNativeDirectAccess flag
  const screenListeners = {
    state: (e: { data?: { state?: { routes?: any[] } } }) => {
      // Check if navigating to NativeHome directly
      const routes = e.data?.state?.routes || [];
      const currentRoute = routes[routes.length - 1];
      if (currentRoute?.name === "NativeHome") {
        setIsNativeDirectAccess(true);
      } else if (currentRoute?.name === "Auth") {
        setIsNativeDirectAccess(false);
      }
    }
  }

  // If accessing native section directly, render NativeNavigator with bottom tabs
  if (isNativeDirectAccess) {
    return <NativeNavigator />
  }

  // Otherwise render normal navigator structure
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      screenListeners={screenListeners}
    >
      {user ? (
        // Normal authenticated user
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // Unauthenticated user
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
}