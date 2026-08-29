"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { Card } from "../../components/Card"
import { ProgressBar } from "../../components/ProgressBar"

// Definindo interfaces para tipagem
interface Word {
  italian: string
  portuguese: string
}

interface DialogueLine {
  speaker: string
  text: string
  translation: string
}

interface Dialogue {
  title: string
  lines: DialogueLine[]
}

interface Exercise {
  type: string
  question: string
  options?: string[]
  correctAnswer: string
}

interface Section {
  id: number
  title: string
  completed: boolean
  content?: string
  words?: Word[]
  dialogues?: Dialogue[]
  exercises?: Exercise[]
}

interface ExerciseDetail {
  id: number
  title: string
  description: string
  type: string
  language: string
  level: string
  duration: string
  progress: number
  sections: Section[]
}

// Definindo tipos para as rotas de navegação
type RootStackParamList = {
  ExerciseDetail: { id?: number; title?: string }
}

export default function ExerciseDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ExerciseDetail">>()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [activeSection, setActiveSection] = useState(1)
  const [expandedDialogue, setExpandedDialogue] = useState<number | null>(null)

  // In a real app, you would fetch the exercise details based on the ID from the route params
  const exerciseId = route.params?.id || 1
  const exercise = exerciseDetails // This would be fetched from an API

  const currentSection = exercise.sections.find((section) => section.id === activeSection)

  const handleNextSection = () => {
    if (activeSection < exercise.sections.length) {
      setActiveSection(activeSection + 1)
    }
  }

  const handlePreviousSection = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1)
    }
  }

  const renderSectionContent = () => {
    if (!currentSection) return null

    switch (currentSection.title) {
      case "Introdução":
        return (
          <View style={styles.introductionContainer}>
            <Text style={[styles.introductionText, { color: colors.text }]}>{currentSection.content}</Text>
            <Image
              source={{ uri: "https://via.placeholder.com/400x200?text=Italian+Greetings" }}
              style={styles.introductionImage}
            />
          </View>
        )

      case "Vocabulário":
        return (
          <View style={styles.vocabularyContainer}>
            {currentSection.words?.map((word, index) => (
              <Card key={index} style={styles.wordCard}>
                <Text style={[styles.italianWord, { color: colors.primary }]}>{word.italian}</Text>
                <Text style={[styles.portugueseWord, { color: colors.text }]}>{word.portuguese}</Text>
              </Card>
            ))}
          </View>
        )

      case "Diálogos":
        return (
          <View style={styles.dialoguesContainer}>
            {currentSection.dialogues?.map((dialogue, index) => (
              <Card key={index} style={styles.dialogueCard}>
                <TouchableOpacity
                  style={styles.dialogueHeader}
                  onPress={() => setExpandedDialogue(expandedDialogue === index ? null : index)}
                >
                  <Text style={[styles.dialogueTitle, { color: colors.text }]}>{dialogue.title}</Text>
                  <Ionicons
                    name={expandedDialogue === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>

                {expandedDialogue === index && (
                  <View style={styles.dialogueContent}>
                    {dialogue.lines.map((line, lineIndex) => (
                      <View key={lineIndex} style={styles.dialogueLine}>
                        <Text style={[styles.speakerName, { color: colors.primary }]}>{line.speaker}:</Text>
                        <Text style={[styles.lineText, { color: colors.text }]}>{line.text}</Text>
                        <Text style={[styles.lineTranslation, { color: colors.text + "80" }]}>{line.translation}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>
        )

      case "Exercícios":
        return (
          <View style={styles.exercisesContainer}>
            {currentSection.exercises?.map((exercise, index) => (
              <Card key={index} style={styles.exerciseCard}>
                <Text style={[styles.exerciseQuestion, { color: colors.text }]}>{exercise.question}</Text>

                {exercise.type === "multiple-choice" && exercise.options && (
                  <View style={styles.optionsContainer}>
                    {exercise.options.map((option, optionIndex) => (
                      <TouchableOpacity
                        key={optionIndex}
                        style={[
                          styles.optionButton,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          },
                        ]}
                      >
                        <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {exercise.type === "translation" && (
                  <View style={styles.translationContainer}>
                    <View
                      style={[
                        styles.translationInput,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        },
                      ]}
                    >
                      <Text style={[styles.translationPlaceholder, { color: colors.text + "60" }]}>
                        Digite sua resposta...
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity style={[styles.checkAnswerButton, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.checkAnswerText, { color: colors.primary }]}>Verificar Resposta</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.title}</Text>
            <View style={styles.exerciseMeta}>
              <View style={[styles.typeTag, { backgroundColor: colors.blue[50] }]}>
                <Text style={[styles.typeText, { color: colors.blue[700] }]}>{exercise.type}</Text>
              </View>
              <Text style={[styles.languageText, { color: colors.text + "80" }]}>{exercise.language}</Text>
              <Text style={[styles.levelText, { color: colors.text + "80" }]}>{exercise.level}</Text>
            </View>
          </View>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color={colors.text + "80"} />
            <Text style={[styles.durationText, { color: colors.text + "80" }]}>{exercise.duration}</Text>
          </View>
        </View>

        <Text style={[styles.exerciseDescription, { color: colors.text + "90" }]}>{exercise.description}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Progresso</Text>
            <Text style={[styles.progressValue, { color: colors.text + "80" }]}>
              {Math.round((activeSection / exercise.sections.length) * 100)}%
            </Text>
          </View>
          <ProgressBar progress={(activeSection / exercise.sections.length) * 100} color={colors.primary} />
        </View>

        <View style={styles.sectionsContainer}>
          <View style={styles.sectionTabs}>
            {exercise.sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionTab,
                  activeSection === section.id && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text
                  style={[
                    styles.sectionTabText,
                    { color: activeSection === section.id ? colors.primary : colors.text + "80" },
                  ]}
                >
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.sectionContent}>{renderSectionContent()}</Card>
        </View>
      </ScrollView>

      <View style={[styles.navigationBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.navigationButton, { borderColor: colors.border }, activeSection === 1 && { opacity: 0.5 }]}
          onPress={handlePreviousSection}
          disabled={activeSection === 1}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navigationButtonText, { color: colors.text }]}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navigationButton,
            { backgroundColor: colors.primary },
            activeSection === exercise.sections.length && { opacity: 0.5 },
          ]}
          onPress={handleNextSection}
          disabled={activeSection === exercise.sections.length}
        >
          <Text style={styles.navigationButtonTextPrimary}>Próximo</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Mock data for exercise details
const exerciseDetails: ExerciseDetail = {
  id: 1,
  title: "Saudações Básicas",
  description: "Aprenda a se apresentar e cumprimentar pessoas em italiano.",
  type: "vocabulary",
  language: "Italiano",
  level: "Iniciante",
  duration: "15 min",
  progress: 0,
  sections: [
    {
      id: 1,
      title: "Introdução",
      completed: false,
      content: "Nesta lição, você aprenderá as saudações básicas em italiano que são usadas no dia a dia.",
    },
    {
      id: 2,
      title: "Vocabulário",
      completed: false,
      words: [
        { italian: "Ciao", portuguese: "Olá / Tchau (informal)" },
        { italian: "Buongiorno", portuguese: "Bom dia" },
        { italian: "Buonasera", portuguese: "Boa tarde / Boa noite" },
        { italian: "Arrivederci", portuguese: "Até logo (formal)" },
        { italian: "Come stai?", portuguese: "Como você está? (informal)" },
        { italian: "Come sta?", portuguese: "Como você está? (formal)" },
        { italian: "Sto bene, grazie", portuguese: "Estou bem, obrigado(a)" },
        { italian: "E tu?", portuguese: "E você? (informal)" },
        { italian: "Piacere", portuguese: "Prazer" },
        { italian: "Mi chiamo...", portuguese: "Meu nome é..." },
      ],
    },
    {
      id: 3,
      title: "Diálogos",
      completed: false,
      dialogues: [
        {
          title: "Diálogo 1: Encontro informal",
          lines: [
            { speaker: "Marco", text: "Ciao, come stai?", translation: "Olá, como você está?" },
            {
              speaker: "Giulia",
              text: "Ciao! Sto bene, grazie. E tu?",
              translation: "Olá! Estou bem, obrigada. E você?",
            },
            { speaker: "Marco", text: "Anche io sto bene, grazie!", translation: "Eu também estou bem, obrigado!" },
          ],
        },
        {
          title: "Diálogo 2: Encontro formal",
          lines: [
            { speaker: "Signor Rossi", text: "Buongiorno, signora Bianchi.", translation: "Bom dia, senhora Bianchi." },
            {
              speaker: "Signora Bianchi",
              text: "Buongiorno, signor Rossi. Come sta?",
              translation: "Bom dia, senhor Rossi. Como está?",
            },
            {
              speaker: "Signor Rossi",
              text: "Sto bene, grazie. E Lei?",
              translation: "Estou bem, obrigado. E a senhora?",
            },
            { speaker: "Signora Bianchi", text: "Molto bene, grazie.", translation: "Muito bem, obrigada." },
          ],
        },
      ],
    },
    {
      id: 4,
      title: "Exercícios",
      completed: false,
      exercises: [
        {
          type: "multiple-choice",
          question: "Como se diz 'Bom dia' em italiano?",
          options: ["Buonasera", "Buongiorno", "Arrivederci", "Ciao"],
          correctAnswer: "Buongiorno",
        },
        {
          type: "multiple-choice",
          question: "Qual é a resposta para 'Come stai?'",
          options: ["Mi chiamo Marco", "Arrivederci", "Sto bene, grazie", "Buongiorno"],
          correctAnswer: "Sto bene, grazie",
        },
        {
          type: "translation",
          question: "Traduza: 'Meu nome é Maria'",
          correctAnswer: "Mi chiamo Maria",
        },
      ],
    },
  ],
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  languageText: {
    fontSize: 14,
    marginRight: 12,
  },
  levelText: {
    fontSize: 14,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
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
  sectionsContainer: {
    marginBottom: 20,
  },
  sectionTabs: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  sectionTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionContent: {
    padding: 16,
  },
  introductionContainer: {
    alignItems: "center",
  },
  introductionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  introductionImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 16,
  },
  vocabularyContainer: {
    marginBottom: 16,
  },
  wordCard: {
    marginBottom: 12,
    padding: 12,
  },
  italianWord: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  portugueseWord: {
    fontSize: 14,
  },
  dialoguesContainer: {
    marginBottom: 16,
  },
  dialogueCard: {
    marginBottom: 12,
  },
  dialogueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  dialogueTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  dialogueContent: {
    padding: 12,
    paddingTop: 0,
  },
  dialogueLine: {
    marginBottom: 12,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  lineText: {
    fontSize: 16,
    marginBottom: 4,
  },
  lineTranslation: {
    fontSize: 14,
    fontStyle: "italic",
  },
  exercisesContainer: {
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 16,
    padding: 16,
  },
  exerciseQuestion: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
  },
  translationContainer: {
    marginBottom: 16,
  },
  translationInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 100,
    justifyContent: "center",
  },
  translationPlaceholder: {
    fontSize: 14,
  },
  checkAnswerButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkAnswerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  navigationBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
  },
  navigationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  navigationButtonTextPrimary: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginRight: 8,
  },
})
