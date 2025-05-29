import * as React from "react"
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native"
import { TouchableOpacity } from "react-native"

// Función para combinar estilos con mejor tipado
const combineViewStyles = (base: StyleProp<ViewStyle>, additional?: StyleProp<ViewStyle>): StyleProp<ViewStyle> => {
  if (!additional) return base
  return [base, additional]
}

const combineTextStyles = (base: StyleProp<TextStyle>, additional?: StyleProp<TextStyle>): StyleProp<TextStyle> => {
  if (!additional) return base
  return [base, additional]
}

// Definimos estilos base
const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  cardHeader: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  cardTitleContainer: {
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardContent: {
    paddingHorizontal: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
})

// Interfaces para props
interface CardProps {
  style?: StyleProp<ViewStyle>
  className?: string // Para compatibilidad con código existente
  children?: React.ReactNode
  onPress?: () => void
  onClick?: () => void // Para compatibilidad con código existente
}

interface CardTextProps {
  style?: StyleProp<TextStyle>
  className?: string // Para compatibilidad con código existente
  children?: React.ReactNode
}

// Convierte className en un objeto de estilo simplificado
// Esta es una implementación básica que solo maneja algunos casos comunes
const classNameToStyle = (className?: string): StyleProp<ViewStyle> | StyleProp<TextStyle> => {
  if (!className) return {}
  
  const styles: any = {}
  
  // Espaciado
  if (className.includes('space-y-3')) {
    styles.gap = 12 // aproximadamente 3 unidades
  }
  if (className.includes('p-4')) {
    styles.padding = 16 // 4 unidades
  }
  if (className.includes('p-8')) {
    styles.padding = 32 // 8 unidades
  }
  
  // Texto
  if (className.includes('text-center')) {
    styles.textAlign = 'center'
  }
  if (className.includes('text-lg')) {
    styles.fontSize = 18 // tamaño de texto lg
  }
  if (className.includes('text-xs')) {
    styles.fontSize = 12 // tamaño de texto xs
  }
  
  // Flex
  if (className.includes('flex-row')) {
    styles.flexDirection = 'row'
  }
  if (className.includes('items-center')) {
    styles.alignItems = 'center'
  }
  if (className.includes('justify-between')) {
    styles.justifyContent = 'space-between'
  }
  
  return styles
}

function Card({ style, className, children, onPress, onClick, ...props }: CardProps & Omit<React.ComponentProps<typeof View>, 'style'>) {
  const CardComponent = (onPress || onClick) ? TouchableOpacity : View
  const handlePress = onPress || onClick
  
  return (
    <CardComponent
      style={combineViewStyles(
        styles.card, 
        [classNameToStyle(className), style]
      )}
      onPress={handlePress}
      {...props}
    >
      {children}
    </CardComponent>
  )
}

function CardHeader({ style, className, children, ...props }: CardProps & Omit<React.ComponentProps<typeof View>, 'style'>) {
  return (
    <View
      style={combineViewStyles(
        styles.cardHeader, 
        [classNameToStyle(className), style]
      )}
      {...props}
    >
      {children}
    </View>
  )
}

function CardTitle({ style, className, children, ...props }: CardTextProps & Omit<React.ComponentProps<typeof Text>, 'style'>) {
  return (
    <Text
      style={combineTextStyles(
        styles.cardTitle, 
        [classNameToStyle(className), style]
      )}
      {...props}
    >
      {children}
    </Text>
  )
}

function CardDescription({ style, className, children, ...props }: CardTextProps & Omit<React.ComponentProps<typeof Text>, 'style'>) {
  return (
    <Text
      style={combineTextStyles(
        styles.cardDescription, 
        [classNameToStyle(className), style]
      )}
      {...props}
    >
      {children}
    </Text>
  )
}

function CardAction({ style, className, children, ...props }: CardProps & Omit<React.ComponentProps<typeof View>, 'style'>) {
  return (
    <View
      style={[classNameToStyle(className), style]}
      {...props}
    >
      {children}
    </View>
  )
}

function CardContent({ style, className, children, ...props }: CardProps & Omit<React.ComponentProps<typeof View>, 'style'>) {
  return (
    <View
      style={combineViewStyles(
        styles.cardContent, 
        [classNameToStyle(className), style]
      )}
      {...props}
    >
      {children}
    </View>
  )
}

function CardFooter({ style, className, children, ...props }: CardProps & Omit<React.ComponentProps<typeof View>, 'style'>) {
  return (
    <View
      style={combineViewStyles(
        styles.cardFooter, 
        [classNameToStyle(className), style]
      )}
      {...props}
    >
      {children}
    </View>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}