"use client"
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useLanguage } from "../contexts/LanguageContext"

// Screens
import NativeHomeScreen from "../screens/nativo/NativeHomeScreen"
import NativeSessionHistoryScreen from "../screens/nativo/NativeSessionHistoryScreen"
import NativeProfileScreen from "../screens/nativo/NativeProfileScreen"
import RestaurantSelectionScreen from "../screens/nativo/RestaurantSelectionScreen"
import NativeSelectRestaurants from "../screens/nativo/NativeSelectRestaurants"
import NativePaymentsScreen from "../screens/nativo/NativePaymentsScreen"
// Telas de perfil do professor nativo
import NativePersonalInfoScreen from "../screens/nativo/NativePersonalInfoScreen"
import NativeSecurityScreen from "../screens/nativo/NativeSecurityScreen"
import NativeNotificationsScreen from "../screens/nativo/NativeNotificationsScreen"
import NativeHelpSupportScreen from "../screens/nativo/NativeHelpSupportScreen"
import NativeTermsConditionsScreen from "../screens/nativo/NativeTermsConditionsScreen"

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const AvailabilityStack = createNativeStackNavigator()
const HistoryStack = createNativeStackNavigator()
const PaymentsStack = createNativeStackNavigator()
const ProfileStack = createNativeStackNavigator()

function HomeStackNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="NativeHomeMain" component={NativeHomeScreen} options={{ title: "Inicio" }} />
      <HomeStack.Screen name="NativeSelectRestaurants" component={NativeSelectRestaurants} options={{ title: "Seleccionar Restaurantes" }} />
    </HomeStack.Navigator>
  )
}

function AvailabilityStackNavigator() {
  const { colors } = useTheme()

  return (
    <AvailabilityStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <AvailabilityStack.Screen name="RestaurantSelection" component={RestaurantSelectionScreen} options={{ title: "Seleccionar Restaurantes" }} />
    </AvailabilityStack.Navigator>
  )
}

function HistoryStackNavigator() {
  const { colors } = useTheme()

  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <HistoryStack.Screen name="NativeHistoryMain" component={NativeSessionHistoryScreen} options={{ title: "Historial" }} />
    </HistoryStack.Navigator>
  )
}

function PaymentsStackNavigator() {
  const { colors } = useTheme()

  return (
    <PaymentsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <PaymentsStack.Screen name="NativePaymentsMain" component={NativePaymentsScreen} options={{ title: "Pagos" }} />
    </PaymentsStack.Navigator>
  )
}

function ProfileStackNavigator() {
  const { colors } = useTheme()

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="NativeProfileMain" component={NativeProfileScreen} options={{ title: "Perfil" }} />
      <ProfileStack.Screen name="NativePersonalInfo" component={NativePersonalInfoScreen} options={{ title: "Información Personal" }} />
      <ProfileStack.Screen name="NativeSecurity" component={NativeSecurityScreen} options={{ title: "Seguridad" }} />
      <ProfileStack.Screen name="NativeNotifications" component={NativeNotificationsScreen} options={{ title: "Notificaciones" }} />
      <ProfileStack.Screen name="NativeHelpSupport" component={NativeHelpSupportScreen} options={{ title: "Ayuda y Soporte" }} />
      <ProfileStack.Screen name="NativeTermsConditions" component={NativeTermsConditionsScreen} options={{ title: "Términos y Condiciones" }} />
    </ProfileStack.Navigator>
  )
}

export default function NativeNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Inicio") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Historial") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Pagos") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStackNavigator} />
      <Tab.Screen name="Historial" component={HistoryStackNavigator} />
      <Tab.Screen name="Pagos" component={PaymentsStackNavigator} options={{ title: t('payments.tabLabel') || 'Pagos' }} />
      <Tab.Screen name="Perfil" component={ProfileStackNavigator} />
    </Tab.Navigator>
  )
}