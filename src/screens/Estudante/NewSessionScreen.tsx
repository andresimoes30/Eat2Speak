"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Definir interfaces para os tipos de dados
interface Restaurante {
  id: string
  nombre: string
  imagen: string
  direccion: string
  tipo: string
  calificacion: number
  idiomas: string[]
}

interface Menu {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  categoria: string
}

interface Profesor {
  id: string
  nombre: string
  imagen: string
  experiencia: string
  calificacion: number
  disponibilidad: string[]
  descripcion: string
}

interface FechaDisponible {
  id: string
  fecha: Date
  disponible: boolean
}

interface HorarioDisponible {
  id: string
  hora: string
  disponible: boolean
}

// Dados ficticios para restaurantes
const restaurantesData: Restaurante[] = [
  {
    id: "1",
    nombre: "La Pasta Italiana",
    imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300",
    direccion: "Calle Principal 123",
    tipo: "Italiana",
    calificacion: 4.7,
    idiomas: ["Italiano", "Español", "Inglés"],
  },
  {
    id: "2",
    nombre: "Sushi Koi",
    imagen: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=300",
    direccion: "Avenida Sakura 45",
    tipo: "Japonesa",
    calificacion: 4.9,
    idiomas: ["Japonés", "Inglés"],
  },
  {
    id: "3",
    nombre: "Le Petit Bistro",
    imagen: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=300",
    direccion: "Rue de Paris 78",
    tipo: "Francesa",
    calificacion: 4.5,
    idiomas: ["Francés", "Español", "Inglés"],
  },
  {
    id: "4",
    nombre: "El Taco Loco",
    imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=300",
    direccion: "Calle México 56",
    tipo: "Mexicana",
    calificacion: 4.6,
    idiomas: ["Español", "Inglés"],
  },
  {
    id: "5",
    nombre: "Beijing House",
    imagen: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300",
    direccion: "Avenida Oriental 89",
    tipo: "China",
    calificacion: 4.4,
    idiomas: ["Mandarín", "Inglés"],
  },
]

// Datos ficticios para profesores
const profesoresData: Record<string, Profesor[]> = {
  Italiano: [
    {
      id: "1",
      nombre: "Maria Rossi",
      imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
      experiencia: "5 años",
      calificacion: 4.8,
      disponibilidad: ["Lunes", "Miércoles", "Viernes"],
      descripcion: "Profesora nativa de italiano con experiencia en enseñanza a todos los niveles.",
    },
    {
      id: "2",
      nombre: "Antonio Bianchi",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
      experiencia: "8 años",
      calificacion: 4.9,
      disponibilidad: ["Martes", "Jueves", "Sábado"],
      descripcion: "Chef y profesor de italiano, especializado en vocabulario culinario.",
    },
  ],
  Japonés: [
    {
      id: "3",
      nombre: "Yuki Tanaka",
      imagen: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300",
      experiencia: "6 años",
      calificacion: 4.7,
      disponibilidad: ["Lunes", "Martes", "Jueves"],
      descripcion: "Profesora nativa de japonés con enfoque en conversación práctica.",
    },
    {
      id: "4",
      nombre: "Hiroshi Yamamoto",
      imagen: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300",
      experiencia: "10 años",
      calificacion: 4.9,
      disponibilidad: ["Miércoles", "Viernes", "Domingo"],
      descripcion: "Chef de sushi y profesor de japonés, experto en terminología culinaria.",
    },
  ],
  Francés: [
    {
      id: "5",
      nombre: "Sophie Dubois",
      imagen: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300",
      experiencia: "7 años",
      calificacion: 4.6,
      disponibilidad: ["Lunes", "Miércoles", "Viernes"],
      descripcion: "Profesora nativa de francés especializada en francés cotidiano y de negocios.",
    },
    {
      id: "6",
      nombre: "Pierre Moreau",
      imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300",
      experiencia: "9 años",
      calificacion: 4.8,
      disponibilidad: ["Martes", "Jueves", "Sábado"],
      descripcion: "Chef francés y profesor, experto en vocabulario gastronómico.",
    },
  ],
  Español: [
    {
      id: "7",
      nombre: "Carmen Rodríguez",
      imagen: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300",
      experiencia: "6 años",
      calificacion: 4.7,
      disponibilidad: ["Lunes", "Miércoles", "Viernes"],
      descripcion: "Profesora nativa de español con experiencia en todos los niveles.",
    },
    {
      id: "8",
      nombre: "Javier López",
      imagen: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=300",
      experiencia: "8 años",
      calificacion: 4.8,
      disponibilidad: ["Martes", "Jueves", "Domingo"],
      descripcion: "Chef español y profesor, especializado en terminología culinaria.",
    },
  ],
  Mandarín: [
    {
      id: "9",
      nombre: "Li Wei",
      imagen: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?q=80&w=300",
      experiencia: "7 años",
      calificacion: 4.6,
      disponibilidad: ["Lunes", "Miércoles", "Sábado"],
      descripcion: "Profesora nativa de mandarín con enfoque en conversación práctica.",
    },
    {
      id: "10",
      nombre: "Zhang Min",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
      experiencia: "9 años",
      calificacion: 4.8,
      disponibilidad: ["Martes", "Jueves", "Domingo"],
      descripcion: "Chef chino y profesor de mandarín, experto en terminología culinaria.",
    },
  ],
  Inglés: [
    {
      id: "11",
      nombre: "Emma Johnson",
      imagen: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
      experiencia: "8 años",
      calificacion: 4.7,
      disponibilidad: ["Lunes", "Miércoles", "Viernes"],
      descripcion: "Profesora nativa de inglés con experiencia en todos los niveles.",
    },
    {
      id: "12",
      nombre: "James Smith",
      imagen: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300",
      experiencia: "10 años",
      calificacion: 4.9,
      disponibilidad: ["Martes", "Jueves", "Sábado"],
      descripcion: "Chef británico y profesor de inglés, especializado en terminología culinaria.",
    },
  ],
}

// Datos ficticios para menús de restaurantes
const menusData: Record<string, Menu[]> = {
  Italiana: [
    {
      id: "1",
      nombre: "Menú Toscana",
      descripcion: "Incluye antipasto mixto, pasta al pesto y tiramisú",
      precio: 25,
      imagen: "https://images.unsplash.com/photo-1533777324565-a040eb52facd?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "2",
      nombre: "Menú Roma",
      descripcion: "Incluye bruschetta, lasaña tradicional y panna cotta",
      precio: 30,
      imagen: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "3",
      nombre: "Menú Pizza",
      descripcion: "Pizza margherita artesanal y ensalada caprese",
      precio: 18,
      imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300",
      categoria: "Ligero",
    },
  ],
  Japonesa: [
    {
      id: "4",
      nombre: "Menú Tokio",
      descripcion: "Surtido de nigiri, maki variado y postre de té verde",
      precio: 35,
      imagen: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "5",
      nombre: "Menú Bento",
      descripcion: "Bento tradicional con tempura, arroz y encurtidos",
      precio: 22,
      imagen: "https://images.unsplash.com/photo-1535140728325-a4d3707eee61?q=80&w=300",
      categoria: "Individual",
    },
    {
      id: "6",
      nombre: "Menú Ramen",
      descripcion: "Ramen tonkotsu con gyoza y edamame",
      precio: 20,
      imagen: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=300",
      categoria: "Ligero",
    },
  ],
  Francesa: [
    {
      id: "7",
      nombre: "Menú Paris",
      descripcion: "Sopa de cebolla, coq au vin y crème brûlée",
      precio: 40,
      imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "8",
      nombre: "Menú Provence",
      descripcion: "Quiche lorraine, ratatouille y mousse de chocolate",
      precio: 32,
      imagen: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "9",
      nombre: "Menú Bistro",
      descripcion: "Croque monsieur con ensalada y éclair de café",
      precio: 24,
      imagen: "https://images.unsplash.com/photo-1608855238293-a8853e7f7c98?q=80&w=300",
      categoria: "Ligero",
    },
  ],
  Mexicana: [
    {
      id: "10",
      nombre: "Menú Jalisco",
      descripcion: "Guacamole, tacos variados y flan de cajeta",
      precio: 28,
      imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "11",
      nombre: "Menú Oaxaca",
      descripcion: "Quesadillas, mole con pollo y arroz con leche",
      precio: 26,
      imagen: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "12",
      nombre: "Menú Street Food",
      descripcion: "Surtido de tacos callejeros y agua fresca",
      precio: 20,
      imagen: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=300",
      categoria: "Ligero",
    },
  ],
  China: [
    {
      id: "13",
      nombre: "Menú Imperial",
      descripcion: "Rollitos primavera, pato pekinés y lichis en almíbar",
      precio: 38,
      imagen: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "14",
      nombre: "Menú Szechuan",
      descripcion: "Tofu picante, pollo kung pao y helado de té",
      precio: 30,
      imagen: "https://images.unsplash.com/photo-1541696490-8744a5dc0228?q=80&w=300",
      categoria: "Completo",
    },
    {
      id: "15",
      nombre: "Menú Dim Sum",
      descripcion: "Selección variada de dim sum y té chino",
      precio: 25,
      imagen: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=300",
      categoria: "Ligero",
    },
  ],
}

// Horarios disponibles ficticios
const horariosDisponibles: HorarioDisponible[] = [
  { id: "1", hora: "10:00", disponible: true },
  { id: "2", hora: "11:00", disponible: false },
  { id: "3", hora: "12:00", disponible: true },
  { id: "4", hora: "13:00", disponible: true },
  { id: "5", hora: "16:00", disponible: true },
  { id: "6", hora: "17:00", disponible: false },
  { id: "7", hora: "18:00", disponible: true },
  { id: "8", hora: "19:00", disponible: true },
  { id: "9", hora: "20:00", disponible: true },
]

// Fechas disponibles ficticias (próximos 7 días)
const generarFechasDisponibles = (): FechaDisponible[] => {
  const fechas: FechaDisponible[] = []
  const hoy = new Date()

  for (let i = 1; i <= 14; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)

    fechas.push({
      id: i.toString(),
      fecha: fecha,
      disponible: Math.random() > 0.3, // 70% de probabilidad de estar disponible
    })
  }

  return fechas
}

const fechasDisponibles = generarFechasDisponibles()

// Tipo para la navegación
type NavigationProp = {
  navigate: (screen: string, params?: any) => void
  goBack: () => void
}

// Tipo para los parámetros de ruta
type RouteParams = {
  restaurantId?: string;
  restaurantName?: string;
}

// Componente principal
export default function NewSessionScreen({ route }: { route: { params?: RouteParams } }) {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const scrollViewRef = useRef<ScrollView>(null)
  const params = route.params || {}

  // Estados para el proceso de selección
  const [paso, setPaso] = useState(params.restaurantId ? 2 : 1) // Comenzar en paso 2 si se proporciona un restaurante
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState<Restaurante | null>(null)
  
  // Inicializar restaurante seleccionado desde los parámetros de ruta
  useEffect(() => {
    if (params.restaurantId) {
      // Guarda restaurantId en una variable local para evitar advertencias de TypeScript
      const restaurantId = params.restaurantId;
      console.log("Buscando restaurante con ID:", restaurantId, "tipo:", typeof restaurantId)
      console.log("Restaurantes disponibles:", restaurantesData.map(r => `${r.id} (${typeof r.id}): ${r.nombre}`))
      
      // Intentar diferentes formas de encontrar el restaurante
      const foundRestaurant = restaurantesData.find(
        (restaurante) => restaurante.id === restaurantId.toString() || 
                         restaurante.id === String(restaurantId) ||
                         Number(restaurante.id) === Number(restaurantId)
      )
      
      if (foundRestaurant) {
        console.log("¡Restaurante encontrado!:", foundRestaurant.nombre)
        console.log("Idiomas disponibles:", foundRestaurant.idiomas)
        setRestauranteSeleccionado(foundRestaurant)
      } else {
        console.log("Error: No se encontró el restaurante con ID:", params.restaurantId)
        console.log("IDs disponibles:", restaurantesData.map(r => r.id))
        
        // Si hay restaurantes, seleccionar el primero como fallback
        if (restaurantesData.length > 0) {
          console.log("Usando primer restaurante como fallback:", restaurantesData[0].nombre)
          setRestauranteSeleccionado(restaurantesData[0])
        }
      }
    }
  }, [params.restaurantId])
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<string | null>(null)
  const [menuSeleccionado, setMenuSeleccionado] = useState<Menu | null>(null)
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<Profesor | null>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<FechaDisponible | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<HorarioDisponible | null>(null)
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<number>(1) // Duración en horas (mínimo 1)
  const [cargando, setCargando] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [reservaExitosa, setReservaExitosa] = useState(false)
  const [comentarios, setComentarios] = useState("")

  // Constantes
  const TASA_SERVICIO = 5 // Tasa de servicio en euros

  // Filtrar idiomas disponibles según el restaurante seleccionado
  const idiomasDisponibles = restauranteSeleccionado ? restauranteSeleccionado.idiomas : []

  // Filtrar menús disponibles según el tipo de restaurante
  const menusDisponibles = restauranteSeleccionado ? menusData[restauranteSeleccionado.tipo] || [] : []
  
  // Filtrar profesores disponibles según el idioma seleccionado
  const profesoresDisponibles = idiomaSeleccionado ? profesoresData[idiomaSeleccionado] || [] : []

  // Función para avanzar al siguiente paso
  const avanzarPaso = () => {
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      setPaso(paso + 1)
      // Scroll to top when changing steps
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true })
      }
    }, 500)
  }

  // Función para retroceder al paso anterior
  const retrocederPaso = () => {
    setPaso(paso - 1)
    // Scroll to top when changing steps
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
    }
  }

  // Función para seleccionar restaurante
  const seleccionarRestaurante = (restaurante: Restaurante) => {
    setRestauranteSeleccionado(restaurante)
    setIdiomaSeleccionado(null) // Resetear idioma al cambiar de restaurante
    setProfesorSeleccionado(null) // Resetear profesor al cambiar de restaurante
    avanzarPaso()
  }

  // Función para seleccionar idioma
  const seleccionarIdioma = (idioma: string) => {
    setIdiomaSeleccionado(idioma)
    setProfesorSeleccionado(null) // Resetear profesor al cambiar de idioma
    avanzarPaso()
  }

  // Función para seleccionar menú
  const seleccionarMenu = (menu: Menu) => {
    setMenuSeleccionado(menu)
    // Seleccionar profesor aleatorio para este idioma
    if (idiomaSeleccionado && profesoresDisponibles.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * profesoresDisponibles.length)
      setProfesorSeleccionado(profesoresDisponibles[indiceAleatorio])
    }
    avanzarPaso()
  }
  
  // Función para seleccionar duración
  const seleccionarDuracion = (duracion: number) => {
    setDuracionSeleccionada(duracion)
    avanzarPaso()
  }

  // Función para seleccionar fecha
  const seleccionarFecha = (fecha: FechaDisponible) => {
    setFechaSeleccionada(fecha)
    avanzarPaso()
  }

  // Función para seleccionar hora
  const seleccionarHora = (hora: HorarioDisponible) => {
    setHoraSeleccionada(hora)
    avanzarPaso()
  }

  // Función para confirmar reserva
  const confirmarReserva = () => {
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      setReservaExitosa(true)
      setModalVisible(true)
    }, 1500)
  }

  // Función para formatear fecha
  const formatearFecha = (fecha: Date | undefined): string => {
    if (!fecha) return ""

    const opciones: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }
    return fecha.toLocaleDateString("es-ES", opciones)
  }

  // Renderizar selección de restaurante
  const renderizarSeleccionRestaurante = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectRestaurant")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectRestaurantDesc")}
        </Text>

        {restaurantesData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.restaurantCard,
              {
                backgroundColor: colors.card,
                borderColor: restauranteSeleccionado?.id === item.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => seleccionarRestaurante(item)}
          >
            <Image source={{ uri: item.imagen }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <Text style={[styles.restaurantName, { color: colors.text }]}>{item.nombre}</Text>
              <Text style={[styles.restaurantType, { color: colors.text + "80" }]}>{item.tipo}</Text>
              <View style={styles.restaurantMeta}>
                <Ionicons name="location-outline" size={14} color={colors.text + "80"} />
                <Text style={[styles.restaurantAddress, { color: colors.text + "80" }]}>{item.direccion}</Text>
              </View>
              <View style={styles.restaurantMeta}>
                <Ionicons name="star" size={14} color={colors.gold ? colors.gold[500] : "#FFD700"} />
                <Text style={[styles.restaurantRating, { color: colors.text + "80" }]}>{item.calificacion}</Text>
              </View>
              <View style={styles.languageTags}>
                {item.idiomas.map((idioma, index) => (
                  <View key={index} style={[styles.languageTag, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.languageTagText, { color: colors.primary }]}>{idioma}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text + "40"} style={styles.restaurantArrow} />
          </TouchableOpacity>
        ))}
      </>
    )
  }

  // Renderizar selección de idioma
  const renderizarSeleccionIdioma = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectLanguage")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectLanguageDesc").replace("{restaurant}", restauranteSeleccionado?.nombre || "")}
        </Text>

        <View style={styles.selectedInfo}>
          <Image source={{ uri: restauranteSeleccionado?.imagen }} style={styles.selectedImage} />
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>{restauranteSeleccionado?.nombre}</Text>
            <Text style={[styles.selectedSubtitle, { color: colors.text + "80" }]}>
              {restauranteSeleccionado?.tipo} • {restauranteSeleccionado?.direccion}
            </Text>
          </View>
        </View>

        <View style={styles.optionsList}>
          {idiomasDisponibles.map((idioma, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: idiomaSeleccionado === idioma ? colors.primary : colors.border,
                },
              ]}
              onPress={() => seleccionarIdioma(idioma)}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{idioma}</Text>
                <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
                  {profesoresData[idioma]?.length || 0} profesores disponibles
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text + "40"} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeRestaurant")}</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Renderizar selección de menú
  const renderizarSeleccionMenu = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectMenu")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectMenuDesc").replace("{language}", idiomaSeleccionado || "")}
        </Text>

        <View style={styles.selectedInfo}>
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>
              {restauranteSeleccionado?.nombre} • {idiomaSeleccionado}
            </Text>
          </View>
        </View>

        {menusDisponibles.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.card,
                borderColor: menuSeleccionado?.id === item.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => seleccionarMenu(item)}
          >
            <Image source={{ uri: item.imagen }} style={styles.menuImage} />
            <View style={styles.menuInfo}>
              <Text style={[styles.menuName, { color: colors.text }]}>{item.nombre}</Text>
              <Text style={[styles.menuCategory, { color: colors.text + "70" }]}>
                {t("session.category")}: {item.categoria}
              </Text>
              <Text style={[styles.menuDescription, { color: colors.text + "80" }]}>{item.descripcion}</Text>
              <View style={styles.menuPrice}>
                <Text style={[styles.priceLabel, { color: colors.text + "80" }]}>{t("session.price")}:</Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>{item.precio}€</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeLanguage")}</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Renderizar selección de duración
  const renderizarSeleccionDuracion = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectDuration")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectDurationDesc")}
        </Text>

        <View style={styles.selectedInfo}>
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>
              {fechaSeleccionada?.fecha ? formatearFecha(fechaSeleccionada.fecha) : ""} • {horaSeleccionada?.hora}
            </Text>
            <Text style={[styles.selectedSubtitle, { color: colors.text + "80" }]}>
              {menuSeleccionado?.nombre} • {restauranteSeleccionado?.nombre}
            </Text>
          </View>
        </View>

        <View style={styles.durationContainer}>
          {[1, 2, 3].map((duracion) => (
            <TouchableOpacity
              key={duracion}
              style={[
                styles.durationCard,
                {
                  backgroundColor: colors.card,
                  borderColor: duracionSeleccionada === duracion ? colors.primary : colors.border,
                },
              ]}
              onPress={() => seleccionarDuracion(duracion)}
            >
              <Text style={[styles.durationText, { color: colors.text }]}>{duracion} {t(duracion === 1 ? "session.hour" : "session.hours")}</Text>
              <Text style={[styles.durationPrice, { color: colors.primary }]}>
                {(menuSeleccionado ? menuSeleccionado.precio : 0) + TASA_SERVICIO * duracion}€
              </Text>
              <Text style={[styles.durationSubtext, { color: colors.text + "70" }]}>
                {t("session.menuLabel")}: {menuSeleccionado ? menuSeleccionado.precio : 0}€ + {t("session.serviceLabel")}: {TASA_SERVICIO * duracion}€
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeTime")}</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Renderizar selección de fecha
  const renderizarSeleccionFecha = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectDate")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectDateDesc")}
        </Text>

        <View style={styles.selectedInfo}>
          <Image source={{ uri: menuSeleccionado?.imagen }} style={styles.selectedImage} />
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>{menuSeleccionado?.nombre}</Text>
            <Text style={[styles.selectedSubtitle, { color: colors.text + "80" }]}>
              {idiomaSeleccionado} • {restauranteSeleccionado?.nombre}
            </Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScrollView}>
          <View style={styles.dateList}>
            {fechasDisponibles.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dateCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: fechaSeleccionada?.id === item.id ? colors.primary : colors.border,
                    opacity: item.disponible ? 1 : 0.5,
                  },
                ]}
                onPress={() => item.disponible && seleccionarFecha(item)}
                disabled={!item.disponible}
              >
                <Text style={[styles.dateDay, { color: colors.text }]}>
                  {item.fecha.toLocaleDateString("es-ES", { weekday: "short" })}
                </Text>
                <Text style={[styles.dateNumber, { color: colors.primary }]}>{item.fecha.getDate()}</Text>
                <Text style={[styles.dateMonth, { color: colors.text + "80" }]}>
                  {item.fecha.toLocaleDateString("es-ES", { month: "short" })}
                </Text>
                {!item.disponible && (
                  <Text style={[styles.dateUnavailable, { color: colors.error }]}>{t("session.unavailable")}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeMenu")}</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Renderizar selección de hora
  const renderizarSeleccionHora = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectTime")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectTimeDesc").replace("{date}", fechaSeleccionada?.fecha ? formatearFecha(fechaSeleccionada.fecha) : "")}
        </Text>

        <View style={styles.selectedInfo}>
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>
              {fechaSeleccionada?.fecha ? formatearFecha(fechaSeleccionada.fecha) : ""}
            </Text>
            <Text style={[styles.selectedSubtitle, { color: colors.text + "80" }]}>
              {menuSeleccionado?.nombre} • {restauranteSeleccionado?.nombre}
            </Text>
          </View>
        </View>

        <View style={styles.timeGrid}>
          {horariosDisponibles.map((horario) => (
            <TouchableOpacity
              key={horario.id}
              style={[
                styles.timeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: horaSeleccionada?.id === horario.id ? colors.primary : colors.border,
                  opacity: horario.disponible ? 1 : 0.5,
                },
              ]}
              onPress={() => horario.disponible && seleccionarHora(horario)}
              disabled={!horario.disponible}
            >
              <Text
                style={[styles.timeText, { color: horaSeleccionada?.id === horario.id ? colors.primary : colors.text }]}
              >
                {horario.hora}
              </Text>
              {!horario.disponible && (
                <Text style={[styles.timeUnavailable, { color: colors.error }]}>{t("session.unavailable")}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeDate")}</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Renderizar confirmación
  const renderizarConfirmacion = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.confirmReservation")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.confirmReservationDesc")}
        </Text>

        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{t("session.sessionDetails")}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.restaurant")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{restauranteSeleccionado?.nombre}</Text>
              <Text style={[styles.summarySubvalue, { color: colors.text + "60" }]}>
                {restauranteSeleccionado?.direccion}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.language")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{idiomaSeleccionado}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="fast-food-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.menu")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{menuSeleccionado?.nombre}</Text>
              <Text style={[styles.summarySubvalue, { color: colors.text + "60" }]}>
                {menuSeleccionado?.descripcion}
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.teacher")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{profesorSeleccionado?.nombre}</Text>
              <Text style={[styles.summarySubvalue, { color: colors.text + "60" }]}>
                {profesorSeleccionado?.experiencia} {t("session.experience")}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.dateAndTime")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {fechaSeleccionada?.fecha ? formatearFecha(fechaSeleccionada.fecha) : ""} • {horaSeleccionada?.hora}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.duration")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {duracionSeleccionada} {t(duracionSeleccionada === 1 ? "session.hour" : "session.hours")}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.price")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {(menuSeleccionado ? menuSeleccionado.precio : 0) + TASA_SERVICIO * duracionSeleccionada}€
              </Text>
              <Text style={[styles.summarySubvalue, { color: colors.text + "60" }]}>
                {t("session.menuLabel")}: {menuSeleccionado ? menuSeleccionado.precio : 0}€ + {t("session.serviceLabel")}: {TASA_SERVICIO * duracionSeleccionada}€
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.commentsLabel, { color: colors.text }]}>{t("session.additionalComments")}</Text>
          <TextInput
            style={[
              styles.commentsInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t("session.commentsPlaceholder")}
            placeholderTextColor={colors.text + "60"}
            multiline
            numberOfLines={3}
            value={comentarios}
            onChangeText={setComentarios}
          />
        </Card>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeDuration")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={confirmarReserva}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={styles.confirmButtonText}>{t("session.confirmButton")}</Text>
                <Ionicons name="checkmark" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </>
    )
  }

  // Renderizar paso actual
  const renderizarPaso = () => {
    switch (paso) {
      case 1:
        return renderizarSeleccionRestaurante()
      case 2:
        return renderizarSeleccionIdioma()
      case 3:
        return renderizarSeleccionMenu()
      case 4:
        return renderizarSeleccionFecha()
      case 5:
        return renderizarSeleccionHora()
      case 6:
        return renderizarSeleccionDuracion()
      case 7:
        return renderizarConfirmacion()
      default:
        return null
    }
  }

  // Renderizar modal de confirmación
  const renderizarModalConfirmacion = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {reservaExitosa ? (
              <>
                <View style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}>
                  <Ionicons name="checkmark-circle" size={60} color={colors.success} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t("session.reservationConfirmed")}</Text>
                <Text style={[styles.modalDescription, { color: colors.text + "80" }]}>
                  {t("session.reservationConfirmedDesc")}
                </Text>
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                      {fechaSeleccionada?.fecha ? formatearFecha(fechaSeleccionada.fecha) : ""} •{" "}
                      {horaSeleccionada?.hora}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} />
                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                      {duracionSeleccionada} {t(duracionSeleccionada === 1 ? "session.hour" : "session.hours")} con {profesorSeleccionado?.nombre}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="fast-food-outline" size={20} color={colors.primary} />
                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                      {menuSeleccionado?.nombre} • {restauranteSeleccionado?.nombre}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setModalVisible(false)
                    navigation.navigate("Dashboard")
                  }}
                >
                  <Text style={styles.modalButtonText}>{t("session.backToDashboard")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t("session.processingReservation")}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              {
                backgroundColor: step <= paso ? colors.primary : colors.border,
                width: `${100 / 7 - 2}%`,
              },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.stepContainer}>{renderizarPaso()}</View>
      </ScrollView>

      {/* Modal de confirmación */}
      {renderizarModalConfirmacion()}

      {/* Loading Overlay */}
      {cargando && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  menuCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    overflow: "hidden",
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  menuCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  menuPrice: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationContainer: {
    marginVertical: 16,
  },
  durationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  durationText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  durationPrice: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  durationSubtext: {
    fontSize: 12,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressStep: {
    height: 4,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  restaurantList: {
    paddingBottom: 16,
  },
  restaurantCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  restaurantType: {
    fontSize: 14,
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    marginLeft: 4,
  },
  restaurantRating: {
    fontSize: 14,
    marginLeft: 4,
  },
  restaurantArrow: {
    alignSelf: "center",
    marginRight: 12,
  },
  languageTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  languageTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  languageTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  selectedImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  selectedDetails: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedSubtitle: {
    fontSize: 14,
  },
  optionsList: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "center",
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  teacherList: {
    paddingBottom: 16,
  },
  teacherCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  teacherImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  teacherMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  teacherRating: {
    fontSize: 14,
    marginLeft: 4,
  },
  teacherDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  teacherPrice: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateScrollView: {
    marginVertical: 16,
  },
  dateList: {
    flexDirection: "row",
    paddingRight: 16,
  },
  dateCard: {
    width: 80,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  dateDay: {
    fontSize: 14,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 14,
  },
  dateUnavailable: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timeCard: {
    width: "30%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeUnavailable: {
    fontSize: 10,
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  summarySubvalue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  commentsLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  commentsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 80,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  modalDetails: {
    width: "100%",
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
