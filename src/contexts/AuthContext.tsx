"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Definir tipos para el contexto
type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  userType: "student" | "native" | "restaurant"
  nativeLanguage?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (credentials: { email: string; password: string; userType?: string }) => Promise<void>
  signUp: (userData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    userType: string
    nativeLanguage?: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si hay un usuario almacenado al cargar la aplicación
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error loading user from storage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Función para iniciar sesión
  const signIn = async (credentials: { email: string; password: string; userType?: string }) => {
    try {
      setIsLoading(true)

      // Aquí iría la lógica real de autenticación con tu API
      // Por ahora, simulamos una respuesta exitosa
      const mockUser: User = {
        id: "user-123",
        firstName: "Usuario",
        lastName: "Ejemplo",
        email: credentials.email,
        userType: (credentials.userType as "student" | "native" | "restaurant") || "student",
      }

      // Guardar el usuario en el estado y en AsyncStorage
      setUser(mockUser)
      await AsyncStorage.setItem("user", JSON.stringify(mockUser))

      return Promise.resolve()
    } catch (error) {
      console.error("Error signing in:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para registrarse
  const signUp = async (userData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    userType: string
    nativeLanguage?: string
  }) => {
    try {
      setIsLoading(true)

      // Aquí iría la lógica real de registro con tu API
      // Por ahora, simulamos una respuesta exitosa
      const mockUser: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType as "student" | "native" | "restaurant",
        nativeLanguage: userData.nativeLanguage,
      }

      // Guardar el usuario en el estado y en AsyncStorage
      setUser(mockUser)
      await AsyncStorage.setItem("user", JSON.stringify(mockUser))

      return Promise.resolve()
    } catch (error) {
      console.error("Error signing up:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setIsLoading(true)

      // Eliminar el usuario del estado y de AsyncStorage
      setUser(null)
      await AsyncStorage.removeItem("user")

      return Promise.resolve()
    } catch (error) {
      console.error("Error signing out:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
