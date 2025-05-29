"use client"

import { useContext } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType } from "./AppTypes"

// Definir los nombres de iconos específicos que usamos
type IconName = 'add-outline' | 'add-circle-outline';

interface FABConfig {
  iconName: IconName;  // Nombre específico del icono de Ionicons
  label: string;
  action: () => void;
}

export default function FloatingActionButton() {
  const { appState, setCurrentScreen } = useContext(AppContext) as AppContextType

  // Mostrar diferentes FABs según la pantalla actual
  const getFABConfig = () => {
    // Por simplicidad, mostraremos el FAB principal
    return {
      iconName: "add-outline",
      label: "Acción rápida",
      action: () => {
        // Acción principal según el contexto
        if (appState.isAvailable) {
          setCurrentScreen("restaurants")
        } else {
          setCurrentScreen("availability")
        }
      },
    }
  }

  const fabConfig = getFABConfig()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={fabConfig.action}
      >
        <Ionicons name={fabConfig.iconName as any} size={28} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    zIndex: 50,
  },
  button: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
});