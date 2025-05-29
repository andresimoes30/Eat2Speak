import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "./src/contexts/AuthContext"
import RootNavigator from "./src/navigation/RootNavigator"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import { LanguageProvider } from "./src/contexts/LanguageContext"
import Toast from "react-native-toast-message"

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootNavigator />
              <Toast />
            </NavigationContainer>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
