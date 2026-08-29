"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { Card } from "../../components/Card"

// Language options
const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
]

export default function LanguagesScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [selectedLanguage, setSelectedLanguage] = useState("es") // Default to Spanish

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    // Here you would implement the actual language change in a real app
    // For example, updating context, localStorage, or API call
    
    // Navigate back after selection
    navigation.goBack()
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Idiomas</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.text + "80" }]}>
          Selecciona el idioma en el que deseas utilizar la aplicación
        </Text>
        
        <Card style={styles.languagesCard}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                selectedLanguage === language.code && { backgroundColor: colors.primary + "15" },
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[styles.languageName, { color: colors.text }]}>{language.name}</Text>
              </View>
              {selectedLanguage === language.code && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>
        
        <Text style={[styles.noteText, { color: colors.text + "60" }]}>
          Nota: Cambiar el idioma reiniciará algunas partes de la aplicación
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  languagesCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
  },
  noteText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
})