"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import Toast from "react-native-toast-message"

type RouteParams = {
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

type NavigationProp = {
  navigate: (screen: string, params?: any) => void
  goBack: () => void
}

export default function ConfirmRegistrationScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute()
  const { userData } = route.params as RouteParams
  const { colors } = useTheme()
  const { signUp } = useAuth()

  // Estado para los roles adicionales
  const [additionalRoles, setAdditionalRoles] = useState({
    student: userData.userType === "student",
    native: userData.userType === "native",
    restaurant: userData.userType === "restaurant",
  })

  const [isLoading, setIsLoading] = useState(false)

  // Función para manejar el cambio de roles
  const handleRoleToggle = (role: "student" | "native" | "restaurant") => {
    // No permitir desactivar el rol principal con el que se registró
    if (role === userData.userType) return;
    
    setAdditionalRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }))
  }

  // Modifica la función handleCompleteRegistration para manejar correctamente los campos opcionales
  const handleCompleteRegistration = async () => {
    // Verificar que al menos un rol esté seleccionado
    if (!additionalRoles.student && !additionalRoles.native && !additionalRoles.restaurant) {
      Alert.alert("Error", "Debes seleccionar al menos un rol")
      return
    }

    setIsLoading(true)

    try {
      // Crear un array con los roles seleccionados
      const roles: string[] = []
      if (additionalRoles.student) roles.push("student")
      if (additionalRoles.native) roles.push("native")
      if (additionalRoles.restaurant) roles.push("restaurant")

      // Actualizar los datos del usuario con los roles seleccionados
      const updatedUserData = {
        ...userData,
        roles: roles,
        // El userType principal será el primero seleccionado
        userType: roles[0] as "student" | "native" | "restaurant",
      }

      // Como solo necesitamos el front-end, simulamos el registro exitoso
      // sin llamar realmente a signUp
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "¡Registro completado con éxito!",
        })

        // Navegar a la pantalla de login correspondiente al rol principal
        const loginScreens: Record<string, string> = {
          student: "StudentLogin",
          native: "NativeLogin",
          restaurant: "RestaurantLogin",
        }

        navigation.navigate(loginScreens[roles[0]])
      }, 1000)
    } catch (error) {
      console.error("Registration error:", error)
      Alert.alert("Error en el Registro", "No fue posible completar el registro. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para renderizar la información del usuario según su tipo
  const renderUserInfo = () => {
    return (
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Personal</Text>

        {/* Información común para todos los usuarios */}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Email:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{userData.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Teléfono:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{userData.phone}</Text>
        </View>

        {/* Información específica para estudiantes y nativos */}
        {(userData.userType === "student" || userData.userType === "native") && (
          <>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Nombre:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.firstName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Apellido:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.lastName}</Text>
            </View>
          </>
        )}

        {/* Información específica para nativos */}
        {userData.userType === "native" && userData.nativeLanguage && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Idioma Nativo:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userData.nativeLanguage}</Text>
          </View>
        )}

        {/* Información específica para restaurantes */}
        {userData.userType === "restaurant" && (
          <>
            {userData.restaurantName && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Nombre del Restaurante:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.restaurantName}</Text>
              </View>
            )}

            {userData.cuisineType && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Tipo de Cocina:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.cuisineType}</Text>
              </View>
            )}

            {userData.address && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Dirección:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.address}</Text>
              </View>
            )}
          </>
        )}
      </View>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Confirmar Registro</Text>
        </View>

        {/* Mostrar la información del usuario */}
        {renderUserInfo()}

        {/* Sección para seleccionar roles adicionales */}
        <View style={styles.rolesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Roles Adicionales</Text>
          <Text style={[styles.sectionDescription, { color: colors.text + "CC" }]}>
            Puedes seleccionar múltiples roles para tu cuenta. Esto te permitirá acceder a diferentes funcionalidades de
            la aplicación.
          </Text>

          <View style={styles.roleToggleContainer}>
          <View style={styles.roleToggle}>
            <View style={styles.roleInfo}>
              <Ionicons name="school-outline" size={24} color={colors.primary} />
              <Text style={[styles.roleText, { color: colors.text }]}>Estudiante</Text>
              {userData.userType === "student" && (
                <Text style={[styles.lockedText, { color: colors.primary }]}>(Rol principal)</Text>
              )}
            </View>
            <Switch
              value={additionalRoles.student}
              onValueChange={() => handleRoleToggle("student")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={additionalRoles.student ? colors.accent : "#f4f3f4"}
              disabled={userData.userType === "student"}
            />
          </View>

          <View style={styles.roleToggle}>
            <View style={styles.roleInfo}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={[styles.roleText, { color: colors.text }]}>Nativo</Text>
              {userData.userType === "native" && (
                <Text style={[styles.lockedText, { color: colors.primary }]}>(Rol principal)</Text>
              )}
            </View>
            <Switch
              value={additionalRoles.native}
              onValueChange={() => handleRoleToggle("native")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={additionalRoles.native ? colors.accent : "#f4f3f4"}
              disabled={userData.userType === "native"}
            />
          </View>

          <View style={styles.roleToggle}>
            <View style={styles.roleInfo}>
              <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
              <Text style={[styles.roleText, { color: colors.text }]}>Restaurante</Text>
              {userData.userType === "restaurant" && (
                <Text style={[styles.lockedText, { color: colors.primary }]}>(Rol principal)</Text>
              )}
            </View>
            <Switch
              value={additionalRoles.restaurant}
              onValueChange={() => handleRoleToggle("restaurant")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={additionalRoles.restaurant ? colors.accent : "#f4f3f4"}
              disabled={userData.userType === "restaurant"}
            />
          </View>
          </View>
        </View>

        {/* Botón para completar el registro */}
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.primary }]}
          onPress={handleCompleteRegistration}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.completeButtonText}>Completar Registro</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  infoSection: {
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: "500",
    width: 150,
  },
  infoValue: {
    flex: 1,
  },
  rolesSection: {
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  roleToggleContainer: {
    gap: 16,
  },
  roleToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  roleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roleText: {
    fontSize: 16,
  },
  lockedText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  completeButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
