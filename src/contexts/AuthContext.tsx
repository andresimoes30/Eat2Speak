"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { login as apiLogin, setAuthToken } from "../../services/api"

// Define types for the context
type UserRole = {
  id: number
  type: string
}

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  roleId: number  // 1: Student, 2: Native, 3: Restaurant
  userType: "student" | "native" | "restaurant"
  roles?: UserRole[]
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

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to map role ID to user type
const mapRoleIdToUserType = (roleId: number): "student" | "native" | "restaurant" => {
  switch (roleId) {
    case 1:
      return "student"
    case 2:
      return "native"
    case 3:
      return "restaurant"
    default:
      return "student" // Default fallback
  }
}

// Context provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if there's a stored user when the app loads
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        const storedToken = await AsyncStorage.getItem("token")
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setAuthToken(storedToken) // Set the token for API requests
        }
      } catch (error) {
        console.error("Error loading user from storage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Sign in function using real API
  const signIn = async (credentials: { email: string; password: string; userType?: string }) => {
    try {
      setIsLoading(true)

      // Call the real login API
      const response = await apiLogin(credentials.email, credentials.password)
      
      if (!response || !response.data || !response.data.user) {
        throw new Error("Invalid response from server")
      }

      const { token, user: userData } = response.data
      
      // Extract role ID from the API response
      const roleId = userData.accountType || (userData.roles && userData.roles.length > 0 ? userData.roles[0].id : 1)
      
      // Create user object with role information
      const authenticatedUser: User = {
        id: userData.id.toString(),
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email,
        roleId: roleId,
        userType: mapRoleIdToUserType(roleId),
        roles: userData.roles
      }

      // Save user and token to state and AsyncStorage
      setUser(authenticatedUser)
      await AsyncStorage.setItem("user", JSON.stringify(authenticatedUser))
      await AsyncStorage.setItem("token", token)
      
      // Set token for future API requests
      setAuthToken(token)

      return Promise.resolve()
    } catch (error) {
      console.error("Error signing in:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up function (can be updated to use real API later)
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

      // Here would be the real registration API call
      // For now, simulate a successful response
      const mockUser: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        roleId: userData.userType === "student" ? 1 : userData.userType === "native" ? 2 : 3,
        userType: userData.userType as "student" | "native" | "restaurant",
        nativeLanguage: userData.nativeLanguage,
      }

      // Save user to state and AsyncStorage
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

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true)

      // Call the logout API endpoint to invalidate the session on the server
      try {
        // Import the logout function from the API service
        const { logout } = require("../../services/api")
        await logout()
        console.log("Server session invalidated")
      } catch (error) {
        console.error("Error during logout API call:", error)
        // Continue with local cleanup even if the API call fails
      }

      // Remove user and token from state and AsyncStorage
      setUser(null)
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("token")
      
      // Clear token from API requests
      setAuthToken(null)

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

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
