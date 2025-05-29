"use client"

import type React from "react"

import { View, StyleSheet, type ViewProps } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface CardProps extends ViewProps {
  children: React.ReactNode
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
})
