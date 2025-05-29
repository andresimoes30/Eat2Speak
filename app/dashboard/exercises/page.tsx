"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, Clock, Headphones, MessageSquare, Pen } from "lucide-react"

// Mock data for exercises
const exercises = {
  beginner: [
    {
      id: 1,
      title: "Saudações Básicas",
      description: "Aprenda a se apresentar e cumprimentar pessoas",
      type: "vocabulary",
      progress: 100,
      completed: true,
      language: "Italiano",
      duration: "10 min",
      icon: MessageSquare,
    },
    {
      id: 2,
      title: "Artigos Definidos e Indefinidos",
      description: "Aprenda a usar artigos corretamente",
      type: "grammar",
      progress: 75,
      completed: false,
      language: "Italiano",
      duration: "15 min",
      icon: BookOpen,
    },
    {
      id: 3,
      title: "Números de 1 a 20",
      description: "Aprenda a contar em italiano",
      type: "vocabulary",
      progress: 50,
      completed: false,
      language: "Italiano",
      duration: "8 min",
      icon: MessageSquare,
    },
    {
      id: 4,
      title: "Compreensão Auditiva: Diálogos Simples",
      description: "Ouça e compreenda conversas básicas",
      type: "listening",
      progress: 0,
      completed: false,
      language: "Italiano",
      duration: "12 min",
      icon: Headphones,
    },
  ],
  intermediate: [
    {
      id: 5,
      title: "Tempos Verbais no Passado",
      description: "Aprenda a conjugar verbos no passato prossimo",
      type: "grammar",
      progress: 60,
      completed: false,
      language: "Italiano",
      duration: "20 min",
      icon: BookOpen,
    },
    {
      id: 6,
      title: "Vocabulário de Restaurante",
      description: "Aprenda palavras e frases úteis para pedir comida",
      type: "vocabulary",
      progress: 30,
      completed: false,
      language: "Italiano",
      duration: "15 min",
      icon: MessageSquare,
    },
    {
      id: 7,
      title: "Escrita: Minha Rotina Diária",
      description: "Escreva um texto sobre suas atividades cotidianas",
      type: "writing",
      progress: 0,
      completed: false,
      language: "Italiano",
      duration: "25 min",
      icon: Pen,
    },
  ],
  advanced: [
    {
      id: 8,
      title: "Subjuntivo Presente",
      description: "Domine o uso do modo subjuntivo",
      type: "grammar",
      progress: 20,
      completed: false,
      language: "Italiano",
      duration: "30 min",
      icon: BookOpen,
    },
    {
      id: 9,
      title: "Debate: Tópicos Culturais",
      description: "Pratique conversação avançada sobre cultura italiana",
      type: "conversation",
      progress: 0,
      completed: false,
      language: "Italiano",
      duration: "45 min",
      icon: MessageSquare,
    },
  ],
}

// Exercise type badges
const typeBadges = {
  vocabulary: { label: "Vocabulário", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  grammar: { label: "Gramática", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
  conversation: { label: "Conversação", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  writing: { label: "Escrita", color: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
  listening: { label: "Audição", color: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
}

export default function ExercisesPage() {
  const [level, setLevel] = useState("beginner")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  // Filter exercises by type if a filter is selected
  const filteredExercises = typeFilter
    ? exercises[level as keyof typeof exercises].filter((ex) => ex.type === typeFilter)
    : exercises[level as keyof typeof exercises]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Exercícios</h2>
        <p className="text-muted-foreground">Pratique e aprimore suas habilidades linguísticas</p>
      </div>

      <Tabs defaultValue="beginner" onValueChange={setLevel} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beginner">Principiante</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediário</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={`cursor-pointer ${!typeFilter ? "bg-gray-100" : ""}`}
          onClick={() => setTypeFilter(null)}
        >
          Todos
        </Badge>
        {Object.entries(typeBadges).map(([type, { label, color }]) => (
          <Badge
            key={type}
            variant="outline"
            className={`cursor-pointer ${typeFilter === type ? color : ""}`}
            onClick={() => setTypeFilter(type)}
          >
            {label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          const ExerciseIcon = exercise.icon
          const typeBadge = typeBadges[exercise.type as keyof typeof typeBadges]

          return (
            <Card key={exercise.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={typeBadge.color}>
                    {typeBadge.label}
                  </Badge>
                  {exercise.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardTitle className="text-lg mt-2">{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>

              <CardContent className="pb-2 flex-grow">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{exercise.duration}</span>
                  </div>
                  <span>{exercise.language}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{exercise.progress}%</span>
                  </div>
                  <Progress value={exercise.progress} className="h-2" />
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button className="w-full bg-wine-600 hover:bg-wine-700">
                  {exercise.progress > 0 ? "Continuar" : "Iniciar"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        {filteredExercises.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum exercício encontrado com o filtro selecionado.</p>
            <Button variant="outline" className="mt-4" onClick={() => setTypeFilter(null)}>
              Mostrar todos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
