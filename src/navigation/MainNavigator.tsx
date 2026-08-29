"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useLanguage } from "../contexts/LanguageContext"

// Screens
import DashboardScreen from "../screens/Estudante/DashboardScreen"
import RestaurantsScreen from "../screens/Estudante/RestaurantsScreen"
import RestaurantDetailScreen from "../screens/Estudante/RestaurantDetailScreen"
import ProfileScreen from "../screens/Estudante/ProfileScreen"
import PersonalInfoScreen from "../screens/Estudante/PersonalInfoScreen"
import SecurityScreen from "../screens/Estudante/SecurityScreen"
import NuevaSesionScreen from "../screens/Estudante/NewSessionScreen"
import NotificationsScreen from "../screens/Estudante/NotificationsScreen"
import LanguagesScreen from "../screens/Estudante/LanguagesScreen"
import HelpSupportScreen from "../screens/Estudante/HelpSupportScreen"
import TermsConditionsScreen from "../screens/Estudante/TermsConditionsScreen"
import BookSessionTutorialScreen from "../screens/tutorials/BookSessionTutorialScreen"
import PaymentSystemTutorialScreen from "../screens/tutorials/PaymentSystemTutorialScreen"
import EditProfileScreen from "../screens/Estudante/EditProfileScreen"
import PaymentsScreen from "../screens/Estudante/PaymentsScreen"
import PaymentMethodsScreen from "../screens/Estudante/PaymentMethodsScreen"

const Tab = createBottomTabNavigator()
const DashboardStack = createNativeStackNavigator()
const RestaurantsStack = createNativeStackNavigator()
const PaymentsStack = createNativeStackNavigator()
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
      }}
    >
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: t("tab.home") }} />
      <DashboardStack.Screen name="NuevaSesion" component={NuevaSesionScreen} options={{ title: "Nueva Sesión" }} />
    </DashboardStack.Navigator>
  )
}

function RestaurantsStackNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

  return (
    <RestaurantsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <RestaurantsStack.Screen
        name="RestaurantsMain"
        component={RestaurantsScreen}
        options={{ title: t("tab.restaurants") }}
      />
      <RestaurantsStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ route }) => ({
          // @ts-ignore - Ignore type checking for this line
          title: route.params?.name || "Detalles del Restaurante",
        })}
      />
    </RestaurantsStack.Navigator>
  )
}


function PaymentsStackNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

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
      }}
    >
      <PaymentsStack.Screen
        name="PaymentsMain"
        component={PaymentsScreen}
        options={{ title: t("tab.payments") }}
      />
      <PaymentsStack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ title: t("paymentMethods.title") }}
      />
    </PaymentsStack.Navigator>
  )
}

function ProfileStackNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

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
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: t("tab.profile") }} />
      <ProfileStack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{ title: t("profile.personalInfo") }}
      />
      <ProfileStack.Screen name="Security" component={SecurityScreen} options={{ title: t("profile.security") }} />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t("profile.notifications") }}
      />
      <ProfileStack.Screen
        name="Languages"
        component={LanguagesScreen}
        options={{ title: t("profile.language") }}
      />
      <ProfileStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: t("profile.help") }}
      />
      <ProfileStack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ title: t("profile.terms") }}
      />
      <ProfileStack.Screen
        name="BookSessionTutorial"
        component={BookSessionTutorialScreen}
        options={{ title: t("tutorial.bookSession.introTitle") }}
      />
      <ProfileStack.Screen
        name="PaymentSystemTutorial"
        component={PaymentSystemTutorialScreen}
        options={{ title: t("tutorial.payment.introTitle") }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: t("profile.edit") }}
      />
    </ProfileStack.Navigator>
  )
}

export default function MainNavigator() {
  const { colors } = useTheme()
  const { t } = useLanguage()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

      if (route.name === "Dashboard") {
        iconName = focused ? "home" : "home-outline"
      } else if (route.name === "Restaurants") {
        iconName = focused ? "restaurant" : "restaurant-outline"
      } else if (route.name === "Payments") {
        iconName = focused ? "wallet" : "wallet-outline"
      } else if (route.name === "Profile") {
        iconName = focused ? "person" : "person-outline"
      }

          return <Ionicons name={iconName as any} size={size} color={color} />
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
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} options={{ title: t("tab.home") }} />
      <Tab.Screen name="Restaurants" component={RestaurantsStackNavigator} options={{ title: t("tab.restaurants") }} />
      <Tab.Screen name="Payments" component={PaymentsStackNavigator} options={{ title: t("tab.payments") }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: t("tab.profile") }} />
    </Tab.Navigator>
  )
}
