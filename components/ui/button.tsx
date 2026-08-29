import * as React from "react"
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native"

// Definiciones de estilos para variantes y tamaños
const variantStyles = {
  default: {
    container: {
      backgroundColor: "#2563eb", // blue-600
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 1,
    } as ViewStyle,
    text: {
      color: "white",
    } as TextStyle,
  },
  destructive: {
    container: {
      backgroundColor: "#dc2626", // red-600
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 1,
    } as ViewStyle,
    text: {
      color: "white",
    } as TextStyle,
  },
  outline: {
    container: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#e5e7eb", // gray-200
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 1,
    } as ViewStyle,
    text: {
      color: "#111827", // gray-900
    } as TextStyle,
  },
  secondary: {
    container: {
      backgroundColor: "#e5e7eb", // gray-200
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 1,
    } as ViewStyle,
    text: {
      color: "#111827", // gray-900
    } as TextStyle,
  },
  ghost: {
    container: {
      backgroundColor: "transparent",
    } as ViewStyle,
    text: {
      color: "#111827", // gray-900
    } as TextStyle,
  },
  link: {
    container: {
      backgroundColor: "transparent",
    } as ViewStyle,
    text: {
      color: "#2563eb", // blue-600
      textDecorationLine: "underline",
    } as TextStyle,
  },
}

const sizeStyles = {
  default: {
    container: {
      height: 36, // h-9
      paddingHorizontal: 16, // px-4
      paddingVertical: 8, // py-2
    } as ViewStyle,
    text: {
      fontSize: 14, // text-sm
    } as TextStyle,
  },
  sm: {
    container: {
      height: 32, // h-8
      paddingHorizontal: 12, // px-3
      paddingVertical: 6,
      borderRadius: 6, // rounded-md
    } as ViewStyle,
    text: {
      fontSize: 12, // text-xs
    } as TextStyle,
  },
  lg: {
    container: {
      height: 40, // h-10
      paddingHorizontal: 24, // px-6
      paddingVertical: 10,
      borderRadius: 6, // rounded-md
    } as ViewStyle,
    text: {
      fontSize: 16,
    } as TextStyle,
  },
  icon: {
    container: {
      height: 36, // h-9
      width: 36, // w-9
      padding: 8,
    } as ViewStyle,
    text: {
      fontSize: 14, // text-sm
    } as TextStyle,
  },
}

// Definición del componente Button con sus props
interface ButtonProps {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  className?: string // Mantener por compatibilidad
  asChild?: boolean // Mantener por compatibilidad
  onClick?: (event?: any) => void
  onPress?: (event?: any) => void // Agregar soporte para onPress (estilo React Native)
  children?: React.ReactNode
  disabled?: boolean
}

// Versión simplificada sin forwardRef
export function Button({ 
  style, 
  textStyle,
  variant = "default", 
  size = "default", 
  onClick,
  onPress,
  children,
  disabled = false,
  ...props 
}: ButtonProps) {
  const variantStyle = variantStyles[variant] || variantStyles.default
  const sizeStyle = sizeStyles[size] || sizeStyles.default
  
  // Usar onPress si está definido, o onClick como fallback
  const handlePress = onPress || onClick
  
  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        variantStyle.container,
        sizeStyle.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[
          styles.baseText,
          variantStyle.text,
          sizeStyle.text,
          textStyle,
        ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8, // rounded-md
    gap: 8,
  },
  baseText: {
    fontWeight: "500", // font-medium
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
})