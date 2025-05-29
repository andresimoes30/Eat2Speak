"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import Toast from "react-native-toast-message"

// Definir el tipo para la navegación
type NavigationProp = {
  navigate: (screen: string, params?: any) => void
}

export default function NativeLoginScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { signIn } = useAuth()
  const { t } = useLanguage()

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const validate = () => {
    let isValid = true
    const newErrors = {
      email: "",
      password: "",
    }

    if (!email.trim()) {
      newErrors.email = t("error.emailRequired")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("error.emailInvalid")
      isValid = false
    }

    if (!password) {
      newErrors.password = t("error.passwordRequired")
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async () => {
    if (!validate()) return

    setIsLoading(true)

    try {
      await signIn({
        email,
        password,
        userType: "native",
      })

      Toast.show({
        type: "success",
        text1: t("auth.loginSuccess"),
      })
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert(t("error.loginFailed"), t("error.wrongCredentials"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t("auth.native.title")}</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>{t("auth.native.subtitle")}</Text>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t("auth.email")}</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: errors.email ? colors.error : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="su@email.com"
                placeholderTextColor={colors.text + "80"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text> : null}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t("auth.password")}</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: errors.password ? colors.error : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t("auth.enterYourPassword")}
                placeholderTextColor={colors.text + "80"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>{t("auth.forgotPassword")}</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>{t("auth.login")}</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.text }]}>{t("auth.noAccount")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("NativeRegister")}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>{t("auth.createAccount")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60, // Añadir más padding en la parte superior
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20, // Añadir margen superior
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
})
