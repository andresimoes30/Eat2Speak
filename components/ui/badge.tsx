import * as React from "react"
import { Text, StyleSheet, StyleProp, TextStyle, View } from "react-native"

// Definición de estilos como objetos React Native
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  default: {
    borderColor: 'transparent',
    backgroundColor: '#2563eb', // blue-600
    color: 'white',
  },
  secondary: {
    borderColor: 'transparent',
    backgroundColor: '#e5e7eb', // gray-200
    color: '#111827', // gray-900
  },
  destructive: {
    borderColor: 'transparent',
    backgroundColor: '#dc2626', // red-600
    color: 'white',
  },
  outline: {
    borderColor: '#e5e7eb', // gray-200
    backgroundColor: 'transparent',
    color: '#111827', // gray-900
  },
})

// Función para combinar estilos con mejor tipado
const combineStyles = (base: StyleProp<TextStyle>, variant: StyleProp<TextStyle>, additional?: StyleProp<TextStyle>): StyleProp<TextStyle> => {
  if (!additional) return [base, variant]
  return [base, variant, additional]
}

// Definición del componente Badge con sus props para React Native
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  style?: StyleProp<TextStyle>
  className?: string // Para compatibilidad con código existente
  children?: React.ReactNode
  onClick?: () => void // Para compatibilidad con código existente
  onPress?: () => void
}

// Versión de Badge para React Native
const Badge = React.forwardRef<Text, BadgeProps>(
  ({ variant = "default", style, className, children, onClick, onPress, ...props }, ref) => {
    // Elegir el estilo de variante
    let variantStyle: StyleProp<TextStyle>
    switch (variant) {
      case 'secondary':
        variantStyle = styles.secondary
        break
      case 'destructive':
        variantStyle = styles.destructive
        break
      case 'outline':
        variantStyle = styles.outline
        break
      default:
        variantStyle = styles.default
    }
    
    // Convertir className básico a estilos (simplificado)
    const classNameStyle: StyleProp<TextStyle> = {}
    
    return (
      <Text
        ref={ref}
        style={combineStyles(styles.base, variantStyle, [classNameStyle, style])}
        onPress={onPress || onClick}
        {...props}
      >
        {children}
      </Text>
    )
  }
)

Badge.displayName = "Badge"

export { Badge }