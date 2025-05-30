import { createNativeStackNavigator } from "@react-navigation/native-stack"
import WelcomeScreen from "../screens/auth/WelcomeScreen"
import StudentLoginScreen from "../screens/auth/StudentLoginScreen"
import NativeLoginScreen from "../screens/auth/NativeLoginScreen"
import RestaurantLoginScreen from "../screens/auth/RestaurantLoginScreen"
import RegisterScreen from "../screens/auth/RegisterScreen"
import ConfirmRegistrationScreen from "../screens/auth/ConfirmRegistration"
import NativeNavigator from "./NativeNavigator"
import RestauranteNavigator from "./RestauranteNavigator"

// Definir los tipos para las rutas
export type AuthStackParamList = {
  Welcome: undefined
  StudentLogin: undefined
  NativeLogin: undefined
  RestaurantLogin: undefined
  StudentRegister: { userType?: "student" }
  NativeRegister: { userType?: "native" }
  RestaurantRegister: { userType?: "restaurant" }
  Register: { userType?: "student" | "native" | "restaurant" }
  ConfirmRegistration: { 
    userData: {
      firstName?: string
      lastName?: string
      email: string
      phone: string
      password: string
      userType: "student" | "native" | "restaurant"
      nativeLanguage?: string
      restaurantName?: string
      cuisineType?: string
      address?: string
    }
  }
  NativeHome: undefined
  RestauranteHome: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
      <Stack.Screen name="NativeLogin" component={NativeLoginScreen} />
      <Stack.Screen name="RestaurantLogin" component={RestaurantLoginScreen} />
      <Stack.Screen name="StudentRegister" component={RegisterScreen} initialParams={{ userType: "student" }} />
      <Stack.Screen name="NativeRegister" component={RegisterScreen} initialParams={{ userType: "native" }} />
      <Stack.Screen name="RestaurantRegister" component={RegisterScreen} initialParams={{ userType: "restaurant" }} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConfirmRegistration" component={ConfirmRegistrationScreen} />
      <Stack.Screen name="NativeHome" component={NativeNavigator} />
      <Stack.Screen name="RestauranteHome" component={RestauranteNavigator} />
    </Stack.Navigator>
  )
}
