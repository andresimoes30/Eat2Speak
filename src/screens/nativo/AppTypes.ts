import { createContext } from "react"

// Interfaces for better TypeScript support
export interface User {
  id: number
  name: string
  avatar: string
  languages: string[]
  rating: number
  isAvailable: boolean
}

export interface Stats {
  students: number
  hoursTeached: number
  averageRating: number
}

export interface Session {
  id: number
  student: string
  date: string
  time?: string
  restaurant: string
  language: string
  rating?: number
  hasFeedback?: boolean
}

export interface Notification {
  id: number
  type: "booking" | "message" | "system"
  title: string
  message: string
  time: string
  read: boolean
}

export interface Restaurant {
  id: number
  name: string
  location: string
  cuisine: string
  rating: number
  languages: string[]
  available: boolean
  description: string
  // Add new properties used in the favorite restaurants section
  isFavorite?: boolean
  address?: string
  priceLevel?: string
}

export interface Language {
  language: string
  level: string
}

export interface AppState {
  user: User
  isAvailable: boolean
  notifications: Notification[]
  selectedRestaurants: number[]
  availableDays: string[]
  languages: Language[]
}

// Datos mock
export const mockData: {
  user: User
  stats: Stats
  upcomingSessions: Session[]
  recentSessions: Session[]
  notifications: Notification[]
  restaurants: Restaurant[]
  favoriteRestaurants: Restaurant[]
} = {
  user: {
    id: 1,
    name: "María González",
    avatar: "/placeholder.svg?height=40&width=40",
    languages: ["Español", "Inglés"],
    rating: 4.8,
    isAvailable: true,
  },
  stats: {
    students: 47,
    hoursTeached: 156,
    averageRating: 4.8,
  },
  upcomingSessions: [
    {
      id: 1,
      student: "John Smith",
      date: "2024-01-15",
      time: "14:00",
      restaurant: "La Paella Real",
      language: "Español",
    },
    {
      id: 2,
      student: "Emma Wilson",
      date: "2024-01-16",
      time: "18:30",
      restaurant: "Café Central",
      language: "Español",
    },
  ],
  recentSessions: [
    {
      id: 1,
      student: "Mike Johnson",
      date: "2024-01-10",
      restaurant: "Tapas Bar",
      language: "Español",
      rating: 5,
      hasFeedback: true,
    },
    {
      id: 2,
      student: "Sarah Davis",
      date: "2024-01-08",
      restaurant: "El Rincón",
      language: "Inglés",
      rating: 4,
      hasFeedback: false,
    },
    {
      id: 3,
      student: "Pierre Dubois",
      date: "2024-01-05",
      restaurant: "Café Central",
      language: "Francés",
      rating: 5,
      hasFeedback: true,
    },
  ],
  notifications: [
    {
      id: 1,
      type: "booking",
      title: "Nueva reserva",
      message: "John Smith ha reservado una sesión para mañana",
      time: "Hace 2 horas",
      read: false,
    },
    {
      id: 2,
      type: "message",
      title: "Nuevo mensaje",
      message: "Emma Wilson te ha enviado un mensaje",
      time: "Hace 4 horas",
      read: false,
    },
    {
      id: 3,
      type: "system",
      title: "Actualización de perfil",
      message: "Tu perfil ha sido verificado exitosamente",
      time: "Ayer",
      read: true,
    },
    {
      id: 4,
      type: "booking",
      title: "Sesión completada",
      message: "Has completado una sesión con Mike Johnson",
      time: "Hace 2 días",
      read: true,
    },
  ],
  restaurants: [
    {
      id: 1,
      name: "La Paella Real",
      location: "Madrid Centro",
      cuisine: "Española",
      rating: 4.5,
      languages: ["Español", "Inglés"],
      available: true,
      description: "Auténtica paella valenciana en el corazón de Madrid",
    },
    {
      id: 2,
      name: "Café Central",
      location: "Salamanca",
      cuisine: "Café",
      rating: 4.3,
      languages: ["Español", "Francés"],
      available: true,
      description: "Ambiente acogedor perfecto para conversaciones",
    },
    {
      id: 3,
      name: "Tapas Bar",
      location: "Malasaña",
      cuisine: "Tapas",
      rating: 4.7,
      languages: ["Español"],
      available: false,
      description: "Las mejores tapas tradicionales de Madrid",
    },
    {
      id: 4,
      name: "El Rincón Italiano",
      location: "Chueca",
      cuisine: "Italiana",
      rating: 4.4,
      languages: ["Español", "Italiano", "Inglés"],
      available: true,
      description: "Pasta fresca y ambiente familiar",
    },
  ],
  // Add favorite restaurants array with sample data
  favoriteRestaurants: [
    {
      id: 1,
      name: "La Paella Real",
      location: "Madrid Centro",
      cuisine: "Española",
      rating: 4.5,
      languages: ["Español", "Inglés"],
      available: true,
      description: "Auténtica paella valenciana en el corazón de Madrid",
      isFavorite: true,
      address: "Calle Mayor 23, Madrid",
      priceLevel: "€€"
    },
    {
      id: 2,
      name: "Café Central",
      location: "Salamanca",
      cuisine: "Café",
      rating: 4.3,
      languages: ["Español", "Francés"],
      available: true,
      description: "Ambiente acogedor perfecto para conversaciones",
      isFavorite: true,
      address: "Calle Serrano 45, Madrid",
      priceLevel: "€"
    },
    {
      id: 4,
      name: "El Rincón Italiano",
      location: "Chueca",
      cuisine: "Italiana",
      rating: 4.4,
      languages: ["Español", "Italiano", "Inglés"],
      available: true,
      description: "Pasta fresca y ambiente familiar",
      isFavorite: false,
      address: "Calle Fuencarral 58, Madrid",
      priceLevel: "€€"
    },
  ],
}

// Context para el estado global de la app
export interface AppContextType {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  setCurrentScreen: (screen: string) => void
  currentScreen: string
}

// Valor predeterminado para el contexto para evitar errores de null
const defaultAppState: AppState = {
  user: mockData.user,
  isAvailable: false,
  notifications: [],
  selectedRestaurants: [],
  availableDays: [],
  languages: []
};

// Creamos un valor predeterminado para el contexto
export const AppContext = createContext<AppContextType>({
  appState: defaultAppState,
  updateAppState: () => {}, // Función vacía
  setCurrentScreen: () => {}, // Función vacía
  currentScreen: "home"
})