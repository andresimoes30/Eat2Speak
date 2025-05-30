"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"

// Definiendo tipos para las rutas de navegación
type RootStackParamList = {
  StudentLogin: undefined
  NativeLogin: undefined
  RestaurantLogin: undefined
  Register: { userType: string }
}

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void
}

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()

  // Animation values
  const logoOpacity = new Animated.Value(0)
  const logoScale = new Animated.Value(0.8)
  const textOpacity = new Animated.Value(0)
  const textTranslateY = new Animated.Value(20)
  const buttonsOpacity = new Animated.Value(0)
  const buttonsTranslateY = new Animated.Value(20)

  useEffect(() => {
    // Animate logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    Animated.timing(logoScale, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Animate text
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start()

    Animated.timing(textTranslateY, {
      toValue: 0,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start()

    // Animate buttons
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 800,
      delay: 600,
      useNativeDriver: true,
    }).start()

    Animated.timing(buttonsTranslateY, {
      toValue: 0,
      duration: 800,
      delay: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <LinearGradient
      colors={[colors.blue[700], colors.blue[600], colors.gold[500]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Ionicons name="wine" size={60} color="white" />
          <Text style={styles.logoText}>Eat2Speak</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.tagline}>{t("welcome.tagline")}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslateY }],
            },
          ]}
        >
          <View style={styles.registerButtonsRow}>
            <TouchableOpacity
              style={[styles.registerButton, { borderColor: "white" }]}
              onPress={() => navigation.navigate("StudentLogin")}
            >
              <Ionicons name="person-outline" size={20} color="white" />
              <Text style={styles.registerButtonText}>{t("welcome.student")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, { borderColor: "white" }]}
              onPress={() => navigation.navigate("NativeLogin")}
            >
              <Ionicons name="school-outline" size={20} color="white" />
              <Text style={styles.registerButtonText}>{t("welcome.native")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, { borderColor: "white" }]}
              onPress={() => navigation.navigate("RestaurantLogin")}
            >
              <Ionicons name="restaurant-outline" size={20} color="white" />
              <Text style={styles.registerButtonText}>{t("welcome.restaurant")}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Direct login as native button for development */}
          <TouchableOpacity
            style={[styles.directLoginButton, { borderColor: "white", marginTop: 20 }]}
            onPress={() => navigation.navigate("NativeHome" as never)}
          >
            <Ionicons name="construct-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.directLoginText}>Login como Nativo</Text>
          </TouchableOpacity>
          
          {/* Direct login as restaurant button for development */}
          <TouchableOpacity
            style={[styles.directLoginButton, { borderColor: "white", marginTop: 10 }]}
            onPress={() => navigation.navigate("RestauranteHome" as never)}
          >
            <Ionicons name="restaurant-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.directLoginText}>Login como Restaurante</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 60, // Añadir más padding en la parte superior
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  taglineContainer: {
    marginBottom: 50,
  },
  tagline: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  buttonsContainer: {
    width: "100%",
  },
  registerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  registerButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 12,
    color: "white",
    marginTop: 5,
  },
  directLoginButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexDirection: "row",
  },
  directLoginText: {
    fontSize: 14,
    color: "white",
  },
})
