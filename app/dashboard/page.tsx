"use client"
import { Calendar, ChevronRight, Clock, Plus, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardChart } from "@/components/dashboard-chart"

export default function DashboardPage() {
  // Mock data
  const upcomingSessions = [
    {
      id: 1,
      date: "15 Maio, 2025",
      time: "19:00",
      restaurant: "La Pasta Italiana",
      teacher: "Maria Silva",
      language: "Italiano",
    },
    {
      id: 2,
      date: "18 Maio, 2025",
      time: "12:30",
      restaurant: "Sushi Koi",
      teacher: "Hiroshi Tanaka",
      language: "Japonês",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bem-vindo, João!</h2>
          <p className="text-muted-foreground">Aqui está um resumo da sua jornada de aprendizado.</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-wine-600 hover:bg-wine-700">
          <Plus className="mr-2 h-4 w-4" /> Nova Sessão
        </Button>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex items-center">
            <div className="bg-purple-200 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-purple-900">Nova Sessão</CardTitle>
              <CardDescription className="text-purple-700">Agende uma aula</CardDescription>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 text-purple-500" />
          </CardContent>
        </Card>

        <Card className="bg-gold-50 border-gold-100">
          <CardContent className="p-4 flex items-center">
            <div className="bg-gold-200 p-3 rounded-full mr-4">
              <Utensils className="h-6 w-6 text-gold-700" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-gold-900">Restaurantes</CardTitle>
              <CardDescription className="text-gold-700">Explore locais</CardDescription>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 text-gold-500" />
          </CardContent>
        </Card>

        <Card className="bg-wine-50 border-wine-100">
          <CardContent className="p-4 flex items-center">
            <div className="bg-wine-200 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-wine-700" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-wine-900">Exercícios</CardTitle>
              <CardDescription className="text-wine-700">Pratique agora</CardDescription>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 text-wine-500" />
          </CardContent>
        </Card>
      </div>

      {/* Progress section */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Progresso</CardTitle>
          <CardDescription>Acompanhe seu desenvolvimento nos idiomas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Italiano</span>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Japonês</span>
                <span className="text-sm text-muted-foreground">30%</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Francês</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões Agendadas</CardTitle>
          <CardDescription>Suas próximas aulas em restaurantes</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {session.language} com {session.teacher}
                    </h4>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="mr-1 h-4 w-4" />
                      {session.date} às {session.time}
                    </div>
                    <p className="text-sm mt-1">{session.restaurant}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Você não tem sessões agendadas.</p>
              <Button className="mt-4 bg-wine-600 hover:bg-wine-700">Agendar Sessão</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
          <CardDescription>Visualize seu progresso ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sessions">
            <TabsList className="mb-4">
              <TabsTrigger value="sessions">Sessões</TabsTrigger>
              <TabsTrigger value="exercises">Exercícios</TabsTrigger>
              <TabsTrigger value="vocabulary">Vocabulário</TabsTrigger>
            </TabsList>
            <TabsContent value="sessions">
              <div className="h-[300px]">
                <DashboardChart />
              </div>
            </TabsContent>
            <TabsContent value="exercises">
              <div className="h-[300px]">
                <DashboardChart />
              </div>
            </TabsContent>
            <TabsContent value="vocabulary">
              <div className="h-[300px]">
                <DashboardChart />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
