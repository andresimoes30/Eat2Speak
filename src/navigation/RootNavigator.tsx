"use client"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import LoadingScreen from "../screens/LoadingScreen"
import NativeNavigator from "./NativeNavigator"
import RestauranteNavigator from "./RestauranteNavigator"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { user, isLoading } = useAuth()
  // State to track if user is using the direct native login
  const [isNativeDirectAccess, setIsNativeDirectAccess] = useState(false)
  // State to track if user is using the direct restaurant login
  const [isRestauranteDirectAccess, setIsRestauranteDirectAccess] = useState(false)

  // Reset direct access flags when user changes
  useEffect(() => {
    if (!user) {
      setIsNativeDirectAccess(false)
      setIsRestauranteDirectAccess(false)
    }
  }, [user])

  if (isLoading) {
    return <LoadingScreen />
  }

  // Listen for navigation events to set direct access flags
  const screenListeners = {
    state: (e: { data?: { state?: { routes?: any[] } } }) => {
      // Check if navigating to special routes directly
      const routes = e.data?.state?.routes || [];
      const currentRoute = routes[routes.length - 1];
      
      if (currentRoute?.name === "NativeHome") {
        setIsNativeDirectAccess(true);
        setIsRestauranteDirectAccess(false);
      } else if (currentRoute?.name === "RestauranteHome") {
        setIsNativeDirectAccess(false);
        setIsRestauranteDirectAccess(true);
      } else if (currentRoute?.name === "Auth") {
        setIsNativeDirectAccess(false);
        setIsRestauranteDirectAccess(false);
      }
    }
  }

  // If accessing native section directly, render NativeNavigator with bottom tabs
  if (isNativeDirectAccess) {
    return <NativeNavigator />
  }
  
  // If accessing restaurant section directly, render RestauranteNavigator with bottom tabs
  if (isRestauranteDirectAccess) {
    return <RestauranteNavigator />
  }

  // Render navigator structure based on authentication and user role
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      screenListeners={screenListeners}
    >
      {user ? (
        // Role-based navigation for authenticated users
        user.roleId === 2 ? (
          // Native user (roleId 2) - Navigate to Native screens
          <Stack.Screen name="NativeMain" component={NativeNavigator} />
        ) : user.roleId === 3 ? (
          // Restaurant user (roleId 3) - Navigate to Restaurant screens
          <Stack.Screen name="RestauranteMain" component={RestauranteNavigator} />
        ) : (
          // Student user (roleId 1) or default - Navigate to Student screens
          <Stack.Screen name="Main" component={MainNavigator} />
        )
      ) : (
        // Unauthenticated user
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
}