"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"

// Define our theme colors
export const colors = {
  light: {
    background: "#FFFFFF",
    card: "#F9F9F9",
    text: "#333333",
    border: "#E5E5E5",
    primary: "#1E40AF", // blue (antes era wine)
    secondary: "#D4AF37", // gold
    accent: "#6A0DAD", // purple
    muted: "#F5F5F5",
    error: "#E53935",
    success: "#43A047",
    blue: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
    },
    gold: {
      50: "#FEF9E7",
      100: "#FCF3CF",
      200: "#F9E79F",
      300: "#F7DB6F",
      400: "#F4CF3F",
      500: "#F1C40F",
      600: "#CDA70D",
      700: "#A98A0B",
      800: "#856C08",
      900: "#624F06",
    },
    purple: {
      50: "#F3E5F5",
      100: "#E1BEE7",
      200: "#CE93D8",
      300: "#BA68C8",
      400: "#AB47BC",
      500: "#9C27B0",
      600: "#8E24AA",
      700: "#7B1FA2",
      800: "#6A1B9A",
      900: "#4A148C",
    },
  },
  dark: {
    background: "#121212",
    card: "#1E1E1E",
    text: "#E1E1E1",
    border: "#333333",
    primary: "#3B82F6", // blue (antes era wine - mais claro para dark mode)
    secondary: "#F2D16B", // gold (lighter for dark mode)
    accent: "#8A2BE2", // purple (lighter for dark mode)
    muted: "#2A2A2A",
    error: "#EF5350",
    success: "#66BB6A",
    blue: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
    },
    gold: {
      50: "#FEF9E7",
      100: "#FCF3CF",
      200: "#F9E79F",
      300: "#F7DB6F",
      400: "#F4CF3F",
      500: "#F1C40F",
      600: "#CDA70D",
      700: "#A98A0B",
      800: "#856C08",
      900: "#624F06",
    },
    purple: {
      50: "#F3E5F5",
      100: "#E1BEE7",
      200: "#CE93D8",
      300: "#BA68C8",
      400: "#AB47BC",
      500: "#9C27B0",
      600: "#8E24AA",
      700: "#7B1FA2",
      800: "#6A1B9A",
      900: "#4A148C",
    },
  },
}

type ThemeContextType = {
  theme: "light" | "dark"
  toggleTheme: () => void
  colors: typeof colors.light
  isMounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  colors: colors.light,
  isMounted: false,
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Force light mode as default regardless of device setting
  const deviceTheme = useColorScheme() as "light" | "dark"
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Garantir que temos um tema válido
  const currentTheme = theme || "light"
  const currentColors = colors[currentTheme]

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, colors: currentColors, isMounted }}>
      {children}
    </ThemeContext.Provider>
  )
}
