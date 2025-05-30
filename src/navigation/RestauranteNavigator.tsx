"use client"
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useLanguage } from "../contexts/LanguageContext"

// Screens - These will be created next
import RestauranteDashboardScreen from "../screens/restaurante/RestauranteDashboardScreen"
import RestauranteMenuScreen from "../screens/restaurante/RestauranteMenuScreen"
import RestauranteAvailabilityScreen from "../screens/restaurante/RestauranteAvailabilityScreen"
import RestauranteEventsScreen from "../screens/restaurante/RestauranteEventsScreen"
import RestauranteNotificationsScreen from "../screens/restaurante/RestauranteNotificationsScreen"
import RestauranteSettingsScreen from "../screens/restaurante/RestauranteSettingsScreen"
import RestaurantePersonalInfoScreen from "../screens/restaurante/RestaurantePersonalInfoScreen"
import RestauranteSecurityScreen from "../screens/restaurante/RestauranteSecurityScreen"
import RestauranteHelpSupportScreen from "../screens/restaurante/RestauranteHelpSupportScreen"
import RestauranteTermsConditionsScreen from "../screens/restaurante/RestauranteTermsConditionsScreen"

const Tab = createBottomTabNavigator()
const DashboardStack = createNativeStackNavigator()
const MenuStack = createNativeStackNavigator()
const AvailabilityStack = createNativeStackNavigator()
const EventsStack = createNativeStackNavigator()
const ProfileStack = createNativeStackNavigator()

function DashboardStackNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

  return (
    <DashboardStack.Navigator
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
      <DashboardStack.Screen 
        name="RestauranteDashboardMain" 
        component={RestauranteDashboardScreen} 
        options={{ title: "Dashboard" }} 
      />
      <DashboardStack.Screen 
        name="RestauranteNotifications" 
        component={RestauranteNotificationsScreen} 
        options={{ title: "Notificaciones" }} 
      />
    </DashboardStack.Navigator>
  )
}

function MenuStackNavigator() {
  const { colors } = useTheme()

  return (
    <MenuStack.Navigator
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
      <MenuStack.Screen 
        name="RestauranteMenuMain" 
        component={RestauranteMenuScreen} 
        options={{ title: "Menú" }} 
      />
    </MenuStack.Navigator>
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
      <AvailabilityStack.Screen 
        name="RestauranteAvailabilityMain" 
        component={RestauranteAvailabilityScreen} 
        options={{ title: "Disponibilidad" }} 
      />
    </AvailabilityStack.Navigator>
  )
}

function EventsStackNavigator() {
  const { colors } = useTheme()

  return (
    <EventsStack.Navigator
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
      <EventsStack.Screen 
        name="RestauranteEventsMain" 
        component={RestauranteEventsScreen} 
        options={{ title: "Eventos" }} 
      />
    </EventsStack.Navigator>
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
      <ProfileStack.Screen 
        name="RestauranteSettingsMain" 
        component={RestauranteSettingsScreen} 
        options={{ title: "Configuración" }} 
      />
      <ProfileStack.Screen 
        name="RestaurantePersonalInfo" 
        component={RestaurantePersonalInfoScreen} 
        options={{ title: "Información Personal" }} 
      />
      <ProfileStack.Screen 
        name="RestauranteSecurity" 
        component={RestauranteSecurityScreen} 
        options={{ title: "Seguridad" }} 
      />
      <ProfileStack.Screen 
        name="RestauranteHelpSupport" 
        component={RestauranteHelpSupportScreen} 
        options={{ title: "Ayuda y Soporte" }} 
      />
      <ProfileStack.Screen 
        name="RestauranteTermsConditions" 
        component={RestauranteTermsConditionsScreen} 
        options={{ title: "Términos y Condiciones" }} 
      />
    </ProfileStack.Navigator>
  )
}

export default function RestauranteNavigator() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Menú") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Disponibilidad") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Eventos") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Ajustes") {
            iconName = focused ? "settings" : "settings-outline";
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
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Menú" component={MenuStackNavigator} />
      <Tab.Screen name="Disponibilidad" component={AvailabilityStackNavigator} />
      <Tab.Screen name="Eventos" component={EventsStackNavigator} />
      <Tab.Screen name="Ajustes" component={ProfileStackNavigator} />
    </Tab.Navigator>
  )
}