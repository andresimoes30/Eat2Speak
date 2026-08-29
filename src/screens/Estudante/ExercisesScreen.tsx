"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { ProgressBar } from "../../components/ProgressBar"

// Definiendo tipos para las rutas de navegación
type RootStackParamList = {
  ExerciseDetail: { id: number; title: string }
}

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params: RootStackParamList[keyof RootStackParamList]) => void
}

// Mock data for exercises
const exercises = {
  beginner: [
    {
      id: 1,
      title: "Saludos Básicos",
      description: "Aprenda a presentarse y saludar a personas",
      type: "vocabulary",
      progress: 100,
      completed: true,
      language: "Italiano",
      duration: "10 min",
      icon: "chatbubble-outline",
    },
    {
      id: 2,
      title: "Artículos Definidos e Indefinidos",
      description: "Aprenda a usar artículos correctamente",
      type: "grammar",
      progress: 75,
      completed: false,
      language: "Italiano",
      duration: "15 min",
      icon: "book-outline",
    },
    {
      id: 3,
      title: "Números del 1 al 20",
      description: "Aprenda a contar en italiano",
      type: "vocabulary",
      progress: 50,
      completed: false,
      language: "Italiano",
      duration: "8 min",
      icon: "chatbubble-outline",
    },
    {
      id: 4,
      title: "Comprensión Auditiva: Diálogos Simples",
      description: "Escuche y comprenda conversaciones básicas",
      type: "listening",
      progress: 0,
      completed: false,
      language: "Italiano",
      duration: "12 min",
      icon: "headset-outline",
    },
  ],
  intermediate: [
    {
      id: 5,
      title: "Tiempos Verbales en el Pasado",
      description: "Aprenda a conjugar verbos en el passato prossimo",
      type: "grammar",
      progress: 60,
      completed: false,
      language: "Italiano",
      duration: "20 min",
      icon: "book-outline",
    },
    {
      id: 6,
      title: "Vocabulario de Restaurante",
      description: "Aprenda palabras y frases útiles para pedir comida",
      type: "vocabulary",
      progress: 30,
      completed: false,
      language: "Italiano",
      duration: "15 min",
      icon: "chatbubble-outline",
    },
    {
      id: 7,
      title: "Escritura: Mi Rutina Diaria",
      description: "Escriba un texto sobre sus actividades cotidianas",
      type: "writing",
      progress: 0,
      completed: false,
      language: "Italiano",
      duration: "25 min",
      icon: "create-outline",
    },
  ],
  advanced: [
    {
      id: 8,
      title: "Subjuntivo Presente",
      description: "Domine el uso del modo subjuntivo",
      type: "grammar",
      progress: 20,
      completed: false,
      language: "Italiano",
      duration: "30 min",
      icon: "book-outline",
    },
    {
      id: 9,
      title: "Debate: Temas Culturales",
      description: "Practique conversación avanzada sobre cultura italiana",
      type: "conversation",
      progress: 0,
      completed: false,
      language: "Italiano",
      duration: "45 min",
      icon: "chatbubble-outline",
    },
  ],
}

// Exercise type badges with translation keys
const typeBadges = {
  vocabulary: { label: "exercises.type.vocabulary", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  grammar: { label: "exercises.type.grammar", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
  conversation: { label: "exercises.type.conversation", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  writing: { label: "exercises.type.writing", color: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
  listening: { label: "exercises.type.listening", color: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
}

export default function ExercisesScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const [level, setLevel] = useState("beginner")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  // Filter exercises by type if a filter is selected
  const filteredExercises = typeFilter
    ? exercises[level as keyof typeof exercises].filter((ex) => ex.type === typeFilter)
    : exercises[level as keyof typeof exercises]

  const getTypeColors = (type: string) => {
    switch (type) {
      case "vocabulary":
        return { bg: colors.blue[50], text: colors.blue[700], border: colors.blue[200] }
      case "grammar":
        return { bg: colors.purple[50], text: colors.purple[700], border: colors.purple[200] }
      case "conversation":
        return { bg: "#E6F4EA", text: "#137333", border: "#A8DAB5" } // Green
      case "writing":
        return { bg: "#FEF7E0", text: "#B06000", border: "#FEECB5" } // Amber
      case "listening":
        return { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD0" } // Pink
      default:
        return { bg: colors.blue[50], text: colors.blue[700], border: colors.blue[200] }
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("exercises.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.text + "80" }]}>
          {t("exercises.subtitle")}
        </Text>
      </View>

      <View style={styles.levelTabs}>
        <TouchableOpacity
          style={[
            styles.levelTab,
            {
              backgroundColor: level === "beginner" ? colors.primary : colors.card,
              borderColor: level === "beginner" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setLevel("beginner")}
        >
          <Text
            style={[
              styles.levelTabText,
              {
                color: level === "beginner" ? "white" : colors.text,
              },
            ]}
          >
            {t("exercises.level.beginner")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.levelTab,
            {
              backgroundColor: level === "intermediate" ? colors.primary : colors.card,
              borderColor: level === "intermediate" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setLevel("intermediate")}
        >
          <Text
            style={[
              styles.levelTabText,
              {
                color: level === "intermediate" ? "white" : colors.text,
              },
            ]}
          >
            {t("exercises.level.intermediate")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.levelTab,
            {
              backgroundColor: level === "advanced" ? colors.primary : colors.card,
              borderColor: level === "advanced" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setLevel("advanced")}
        >
          <Text
            style={[
              styles.levelTabText,
              {
                color: level === "advanced" ? "white" : colors.text,
              },
            ]}
          >
            {t("exercises.level.advanced")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeFilters}>
        <TouchableOpacity
          style={[
            styles.typeFilter,
            {
              backgroundColor: !typeFilter ? colors.blue[100] : "transparent",
              borderColor: !typeFilter ? colors.blue[300] : "transparent",
            },
          ]}
          onPress={() => setTypeFilter(null)}
        >
          <Text style={[styles.typeFilterText, { color: !typeFilter ? colors.blue[700] : colors.text + "80" }]}>
            {t("exercises.type.all")}
          </Text>
        </TouchableOpacity>
        {Object.entries(typeBadges).map(([type, info]) => {
          const isSelected = typeFilter === type
          const typeColor = getTypeColors(type)
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeFilter,
                {
                  backgroundColor: isSelected ? typeColor.bg : "transparent",
                  borderColor: isSelected ? typeColor.border : "transparent",
                },
              ]}
              onPress={() => setTypeFilter(isSelected ? null : type)}
            >
              <Text
                style={[
                  styles.typeFilterText,
                  {
                    color: isSelected ? typeColor.text : colors.text + "80",
                  },
                ]}
              >
                {t(info.label)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.exercisesList}>
        {filteredExercises.map((exercise) => {
          const typeColor = getTypeColors(exercise.type)
          return (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => navigation.navigate("ExerciseDetail", { id: exercise.id, title: exercise.title })}
            >
              <Card>
                <View style={styles.exerciseHeader}>
                  <View
                    style={[
                      styles.exerciseTypeTag,
                      {
                        backgroundColor: typeColor.bg,
                      },
                    ]}
                  >
                    <Text style={[styles.exerciseTypeText, { color: typeColor.text }]}>
                      {t(typeBadges[exercise.type as keyof typeof typeBadges].label)}
                    </Text>
                  </View>
                  {exercise.completed && <Ionicons name="checkmark-circle" size={22} color={colors.blue[500]} />}
                </View>

                <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.title}</Text>
                <Text style={[styles.exerciseDescription, { color: colors.text + "80" }]}>{exercise.description}</Text>

                <View style={styles.exerciseMeta}>
                  <View style={styles.exerciseMetaItem}>
                    <Ionicons name="time-outline" size={16} color={colors.text + "80"} />
                    <Text style={[styles.exerciseMetaText, { color: colors.text + "80" }]}>{exercise.duration}</Text>
                  </View>
                  <Text style={[styles.exerciseMetaText, { color: colors.text + "80" }]}>{exercise.language}</Text>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: colors.text }]}>{t("exercises.progress")}</Text>
                    <Text style={[styles.progressValue, { color: colors.text + "80" }]}>{exercise.progress}%</Text>
                  </View>
                  <ProgressBar progress={exercise.progress} color={colors.primary} />
                </View>

                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate("ExerciseDetail", { id: exercise.id, title: exercise.title })}
                >
                  <Text style={styles.startButtonText}>{exercise.progress > 0 ? t("exercises.continue") : t("exercises.start")}</Text>
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          )
        })}

        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={60} color={colors.text + "40"} />
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>
              {t("exercises.noResults")}
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => setTypeFilter(null)}
            >
              <Text style={styles.emptyStateButtonText}>{t("exercises.showAll")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  levelTabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  levelTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  levelTabText: {
    fontWeight: "500",
  },
  typeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  typeFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  typeFilterText: {
    fontSize: 14,
  },
  exercisesList: {
    marginBottom: 20,
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  exerciseTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  exerciseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  exerciseMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseMetaText: {
    fontSize: 14,
    marginLeft: 6,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
  },
  startButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})
