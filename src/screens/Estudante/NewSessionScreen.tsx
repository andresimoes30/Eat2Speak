"use client"

import { useState, useRef, useEffect, useMemo, Component, ReactNode } from "react"
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
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { useAuth } from "../../contexts/AuthContext"
import { Card } from "../../components/Card"
import api from "../../../services/api"

// API response interfaces
interface APIError {
  status: string
  message: string
  error?: string
}

interface APIResponse<T> {
  status: string
  message?: string
  data: T
}

// Database-aligned interfaces
interface Restaurant {
  restaurantId: string
  ownerUserId: string
  name: string
  cuisineType: string
  address: string
  commissionPercent: number
}

interface Menu {
  menuId: string
  restaurantId: string
  menuCode: string
  price: number
  description?: string 
  image?: string
}

interface User {
  userId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

interface Language {
  languageId: string
  languageName: string
}

interface Session {
  sessionId?: string
  learnerUserId: string
  nativeUserId: string
  restaurantId: string
  menuId?: string
  sessionDate: string
  startTime: string
  endTime: string
  tableSize: number
  languageUsed: string
  totalPrice: number
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rejected'
}

// UI interfaces
interface RestaurantUI {
  id: string
  nombre: string
  imagen: string
  direccion: string
  tipo: string
  calificacion: number
  idiomas: string[]
}

interface MenuUI {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  categoria: string
}

interface ProfessorUI {
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

// Session type options
enum SessionType {
  OneOnOne = 'one_on_one',
  Group = 'group',
  Conversation = 'conversation'
}

// API service functions
const fetchRestaurants = async (): Promise<RestaurantUI[]> => {
  try {
    const response = await api.get<APIResponse<Restaurant[]>>('/api/restaurants');
    
    // Map API response to UI format
    return response.data.data.map(restaurant => ({
      id: restaurant.restaurantId,
      nombre: restaurant.name,
      imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300", // Default image
      direccion: restaurant.address,
      tipo: restaurant.cuisineType,
      calificacion: 4.5, // Default rating
      idiomas: ["Inglés", "Español"], // Default languages
    }));
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

const fetchLanguages = async (): Promise<Language[]> => {
  try {
    const response = await api.get<APIResponse<{languages: Language[]}>>('/api/languages');
    return response.data.data.languages;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

const fetchRestaurantLanguages = async (restaurantId: string): Promise<string[]> => {
  try {
    const response = await api.get<APIResponse<{languages: string[]}>>(`/api/restaurants/${restaurantId}/languages`);
    return response.data.data.languages;
  } catch (error) {
    console.error('Error fetching restaurant languages:', error);
    // Fallback with basic languages
    return ["Inglés", "Español"];
  }
};

const fetchMenus = async (restaurantId: string): Promise<MenuUI[]> => {
  try {
    const response = await api.get<APIResponse<{menus: Menu[]}>>(`/api/restaurants/${restaurantId}/menu`);
    
    // Map API response to UI format
    return response.data.data.menus.map(menu => ({
      id: menu.menuId,
      nombre: menu.menuCode, // Use menu code as name if name not available
      descripcion: menu.description || "Menú especial del restaurante",
      precio: menu.price,
      imagen: menu.image || "https://images.unsplash.com/photo-1533777324565-a040eb52facd?q=80&w=300",
      categoria: "Completo",
    }));
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
};

const fetchNativeSpeakers = async (language: string): Promise<ProfessorUI[]> => {
  try {
    const response = await api.get<APIResponse<{nativeSpeakers: User[]}>>(`/api/languages/native?language=${encodeURIComponent(language)}`);
    
    // Map API response to UI format
    return response.data.data.nativeSpeakers.map(user => ({
      id: user.userId,
      nombre: `${user.firstName} ${user.lastName}`,
      imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300", // Default image
      experiencia: "5 años", // Default experience
      calificacion: 4.8, // Default rating
      disponibilidad: ["Lunes", "Miércoles", "Viernes"], // Default availability
      descripcion: "Profesor nativo con experiencia en enseñanza a todos los niveles." // Default description
    }));
  } catch (error) {
    console.error('Error fetching native speakers:', error);
    throw error;
  }
};

const createSession = async (sessionData: Omit<Session, 'sessionId' | 'status'>): Promise<Session> => {
  try {
    const response = await api.post<APIResponse<{session: Session}>>('/api/sessions', sessionData);
    return response.data.data.session;
  } catch (error: any) {
    console.error('Error creating session:', error);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Datos de sesión inválidos');
    } else if (error.response?.status === 401) {
      throw new Error('Debe iniciar sesión para reservar');
    } else if (error.response?.status === 403) {
      throw new Error('No tiene permisos para crear esta sesión');
    } else if (error.response?.status === 404) {
      throw new Error('El restaurante o profesor no existe');
    } else {
      throw new Error('Error al crear la sesión. Por favor intente nuevamente.');
    }
  }
};

const processSessionPayment = async (sessionId: string, paymentMethod: string): Promise<any> => {
  try {
    const response = await api.post<APIResponse<{payment: any}>>(`/api/payments/session/${sessionId}`, {
      paymentMethod
    });
    return response.data.data.payment;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Error al procesar el pago. Por favor intente nuevamente.');
  }
};

// Function to generate available dates
const generarFechasDisponibles = (): FechaDisponible[] => {
  const fechas: FechaDisponible[] = [];
  const hoy = new Date();

  for (let i = 1; i <= 14; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);

    fechas.push({
      id: i.toString(),
      fecha: fecha,
      disponible: Math.random() > 0.3, // 70% probability of availability
    });
  }

  return fechas;
}

// Navigation type
type NavigationProp = {
  navigate: (screen: string, params?: any) => void
  goBack: () => void
}

// Route parameters type
type RouteParams = {
  restaurantId?: string;
  restaurantName?: string;
}

// Form validation error interface
interface FormErrors {
  restaurant?: string;
  language?: string;
  menu?: string;
  date?: string;
  time?: string;
  duration?: string;
  sessionType?: string;
  professor?: string;
}

// Error Boundary Component
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#fff'
        }}>
          <Ionicons name="alert-circle" size={50} color="red" />
          <Text style={{
            marginTop: 20,
            fontSize: 18,
            color: '#333',
            textAlign: 'center'
          }}>
            Algo salió mal. Por favor intente nuevamente.
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: '#0066cc',
              borderRadius: 8
            }}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Component
export default function NewSessionScreen({ route }: { route: { params?: RouteParams } }) {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const { user } = useAuth()
  const scrollViewRef = useRef<ScrollView>(null)
  const params = route.params || {}

  // Restaurants state
  const [restaurants, setRestaurants] = useState<RestaurantUI[]>([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)
  
  // Languages state
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([])
  const [loadingLanguages, setLoadingLanguages] = useState(false)

  // Menus state
  const [menus, setMenus] = useState<MenuUI[]>([])
  const [loadingMenus, setLoadingMenus] = useState(false)

  // Professors state
  const [professors, setProfessors] = useState<ProfessorUI[]>([])
  const [loadingProfessors, setLoadingProfessors] = useState(false)
  
  // Selection states
  const [paso, setPaso] = useState(params.restaurantId ? 2 : 1) // Start at step 2 if restaurant provided
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState<RestaurantUI | null>(null)
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.OneOnOne)
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<string | null>(null)
  const [menuSeleccionado, setMenuSeleccionado] = useState<MenuUI | null>(null)
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<ProfessorUI | null>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<FechaDisponible | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<HorarioDisponible | null>(null)
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<number>(1) // Duración en horas (mínimo 1)
  
  // UI states
  const [cargando, setCargando] = useState(false)
  const [creandoSession, setCreandoSession] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [reservaExitosa, setReservaExitosa] = useState(false)
  const [comentarios, setComentarios] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card")
  const [sessionCreated, setSessionCreated] = useState<Session | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [error, setError] = useState<string | null>(null)

  // Time slots
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([
    { id: "1", hora: "10:00", disponible: true },
    { id: "2", hora: "11:00", disponible: false },
    { id: "3", hora: "12:00", disponible: true },
    { id: "4", hora: "13:00", disponible: true },
    { id: "5", hora: "16:00", disponible: true },
    { id: "6", hora: "17:00", disponible: false },
    { id: "7", hora: "18:00", disponible: true },
    { id: "8", hora: "19:00", disponible: true },
    { id: "9", hora: "20:00", disponible: true },
  ])

  // Available dates
  const [fechasDisponibles, setFechasDisponibles] = useState<FechaDisponible[]>(generarFechasDisponibles())

  // Constants
  const TASA_SERVICIO = 5 // Service fee in euros

  // Fetch restaurants on component mount
  useEffect(() => {
    const loadRestaurants = async () => {
      if (restaurants.length === 0) {
        setLoadingRestaurants(true);
        try {
          const fetchedRestaurants = await fetchRestaurants();
          // Ensure we have valid data before setting state
          if (Array.isArray(fetchedRestaurants) && fetchedRestaurants.length > 0) {
            setRestaurants(fetchedRestaurants);
          } else {
            // Set fallback data if API returns empty
            setRestaurants([
              {
                id: "1",
                nombre: "Restaurante Ejemplo",
                imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300",
                direccion: "Calle Principal 123",
                tipo: "Mediterráneo",
                calificacion: 4.5,
                idiomas: ["Inglés", "Español"],
              }
            ]);
          }
        } catch (error) {
          console.error('Error loading restaurants:', error);
          setError('No se pudieron cargar los restaurantes. Por favor intente nuevamente.');
          // Set fallback data if API fails
          setRestaurants([
            {
              id: "1",
              nombre: "Restaurante Ejemplo",
              imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300",
              direccion: "Calle Principal 123",
              tipo: "Mediterráneo",
              calificacion: 4.5,
              idiomas: ["Inglés", "Español"],
            }
          ]);
        } finally {
          setLoadingRestaurants(false);
        }
      }
    };

    // Wrap in try-catch to prevent initialization crashes
    try {
      loadRestaurants();
    } catch (e) {
      console.error('Failed to load restaurants:', e);
      setLoadingRestaurants(false);
    }
  }, []);

  // Fetch languages on component mount
  useEffect(() => {
    const loadLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const languages = await fetchLanguages();
        setAvailableLanguages(languages);
      } catch (error) {
        console.error('Error loading languages:', error);
        setError('No se pudieron cargar los idiomas. Por favor intente nuevamente.');
      } finally {
        setLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

  // Initialize selected restaurant from route params
  useEffect(() => {
    if (params.restaurantId && restaurants.length > 0) {
      const restaurantId = params.restaurantId;
      console.log("Searching for restaurant with ID:", restaurantId);
      
      const foundRestaurant = restaurants.find(
        (restaurante) => restaurante.id === restaurantId.toString() || 
                         restaurante.id === String(restaurantId) ||
                         Number(restaurante.id) === Number(restaurantId)
      );
      
      if (foundRestaurant) {
        console.log("Restaurant found:", foundRestaurant.nombre);
        setRestauranteSeleccionado(foundRestaurant);
        
        // Load menus for this restaurant
        loadMenusForRestaurant(foundRestaurant.id);
      } else {
        console.log("Error: Restaurant not found with ID:", params.restaurantId);
        
        // Use first restaurant as fallback if available
        if (restaurants.length > 0) {
          console.log("Using first restaurant as fallback:", restaurants[0].nombre);
          setRestauranteSeleccionado(restaurants[0]);
          
          // Load menus for this restaurant
          loadMenusForRestaurant(restaurants[0].id);
        }
      }
    }
  }, [params.restaurantId, restaurants]);

  // Load menus for selected restaurant
  const loadMenusForRestaurant = async (restaurantId: string) => {
    setLoadingMenus(true);
    try {
      const fetchedMenus = await fetchMenus(restaurantId);
      setMenus(fetchedMenus);
    } catch (error) {
      console.error('Error loading menus:', error);
      setError('No se pudieron cargar los menús del restaurante.');
    } finally {
      setLoadingMenus(false);
    }
  };

  // Filter available languages based on selected restaurant
  const idiomasDisponibles = useMemo(() => {
    if (!restauranteSeleccionado) return [];
    
    return availableLanguages
      .filter(lang => restauranteSeleccionado.idiomas.includes(lang.languageName))
      .map(lang => lang.languageName);
  }, [restauranteSeleccionado, availableLanguages]);

  // Load professors when language is selected
  useEffect(() => {
    const loadProfessors = async () => {
      if (idiomaSeleccionado) {
        setLoadingProfessors(true);
        try {
          const fetchedProfessors = await fetchNativeSpeakers(idiomaSeleccionado);
          setProfessors(fetchedProfessors);
        } catch (error) {
          console.error('Error loading professors:', error);
          setError('No se pudieron cargar los profesores para este idioma.');
        } finally {
          setLoadingProfessors(false);
        }
      }
    };

    if (idiomaSeleccionado) {
      loadProfessors();
    }
  }, [idiomaSeleccionado]);

  // Función para avanzar al siguiente paso
  const avanzarPaso = () => {
    // Clear any previous errors
    setError(null);
    setFormErrors({});
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
    // Clear any previous errors
    setError(null);
    setFormErrors({});
    setPaso(paso - 1)
    // Scroll to top when changing steps
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
    }
  }

  // Función para seleccionar restaurante
  const seleccionarRestaurante = (restaurante: RestaurantUI) => {
    setRestauranteSeleccionado(restaurante)
    setIdiomaSeleccionado(null) // Resetear idioma al cambiar de restaurante
    setProfesorSeleccionado(null) // Resetear profesor al cambiar de restaurante
    
    // Load menus for this restaurant
    loadMenusForRestaurant(restaurante.id);
    
    avanzarPaso();
  }

  // Function to select session type
  const seleccionarSessionType = (type: SessionType) => {
    setSessionType(type);
    avanzarPaso();
  }

  // Función para seleccionar idioma
  const seleccionarIdioma = (idioma: string) => {
    setIdiomaSeleccionado(idioma);
    setProfesorSeleccionado(null); // Reset professor when changing language
    
    // Validate if we have professors available for this language
    if (professors.length === 0) {
      setError(`No hay profesores disponibles para el idioma ${idioma}`);
      return;
    }
    
    avanzarPaso();
  }

  // Función para seleccionar menú
  const seleccionarMenu = (menu: MenuUI) => {
    setMenuSeleccionado(menu)
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

  // Function to select professor
  const seleccionarProfesor = (profesor: ProfessorUI) => {
    setProfesorSeleccionado(profesor);
    avanzarPaso();
  }

  // Validate current step before proceeding
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};
    
    switch (paso) {
      case 1: // Restaurant selection
        if (!restauranteSeleccionado) {
          newErrors.restaurant = 'Debe seleccionar un restaurante';
        }
        break;
      case 2: // Session type selection
        if (!sessionType) {
          newErrors.sessionType = 'Debe seleccionar un tipo de sesión';
        }
        break;
      case 3: // Language selection
        if (!idiomaSeleccionado) {
          newErrors.language = 'Debe seleccionar un idioma';
        }
        break;
      case 4: // Professor selection
        if (!profesorSeleccionado) {
          newErrors.professor = 'Debe seleccionar un profesor';
        }
        break;
      case 5: // Menu selection
        if (!menuSeleccionado) {
          newErrors.menu = 'Debe seleccionar un menú';
        }
        break;
      case 6: // Date selection
        if (!fechaSeleccionada) {
          newErrors.date = 'Debe seleccionar una fecha';
        }
        break;
      case 7: // Time selection
        if (!horaSeleccionada) {
          newErrors.time = 'Debe seleccionar una hora';
        }
        break;
      case 8: // Duration selection
        if (!duracionSeleccionada) {
          newErrors.duration = 'Debe seleccionar una duración';
        }
        break;
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Función para confirmar reserva
  const confirmarReserva = async () => {
    // Validate all required data
    if (!restauranteSeleccionado || !idiomaSeleccionado || !profesorSeleccionado || 
        !fechaSeleccionada || !horaSeleccionada || !duracionSeleccionada) {
      setError('Faltan datos necesarios para completar la reserva.');
      return;
    }
    
    // Check if user is logged in
    // Type guard to check if user has userId property
    if (!user) {
      setError('Debe iniciar sesión para realizar una reserva.');
      return;
    }

    // Get user ID safely
    let userId;
    try {
      userId = ((user as unknown) as User).userId;
      if (!userId) {
        setError('No se pudo identificar el usuario. Por favor inicie sesión nuevamente.');
        return;
      }
    } catch (err) {
      console.error('Error accessing user ID:', err);
      setError('Error de autenticación. Por favor inicie sesión nuevamente.');
      return;
    }
    
    setCargando(true);
    setCreandoSession(true);
    
    try {
      // Calculate end time safely
      let startTime = '';
      let endTime = '';
      
      try {
        startTime = horaSeleccionada.hora;
        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = hours + duracionSeleccionada;
        endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } catch (err) {
        console.error('Error calculating times:', err);
        setError('Error al calcular los horarios de la sesión.');
        setCargando(false);
        setCreandoSession(false);
        return;
      }
      
      // Format date for API safely
      let formattedDate = '';
      try {
        formattedDate = fechaSeleccionada.fecha.toISOString().split('T')[0];
      } catch (err) {
        console.error('Error formatting date:', err);
        setError('Error al formatear la fecha de la sesión.');
        setCargando(false);
        setCreandoSession(false);
        return;
      }
      
      // Create session data
      const sessionData: Omit<Session, 'sessionId' | 'status'> = {
        learnerUserId: userId,
        nativeUserId: profesorSeleccionado.id,
        restaurantId: restauranteSeleccionado.id,
        menuId: menuSeleccionado?.id,
        sessionDate: formattedDate,
        startTime,
        endTime,
        tableSize: sessionType === SessionType.Group ? 4 : 2,
        languageUsed: idiomaSeleccionado,
        totalPrice: (menuSeleccionado ? menuSeleccionado.precio : 0) + TASA_SERVICIO * duracionSeleccionada
      };
      
      // Create session
      const session = await createSession(sessionData);
      
      // Store the created session
      setSessionCreated(session);
      
      // Process payment if session was created successfully
      if (session && session.sessionId) {
        try {
          const payment = await processSessionPayment(session.sessionId, paymentMethod);
          console.log('Payment processed:', payment);
        } catch (error) {
          console.error('Payment processing error:', error);
          // We can still continue with the booking even if payment fails
          // The user can pay later
        }
      }
      
      setCargando(false);
      setReservaExitosa(true);
      setModalVisible(true);
    } catch (error: any) {
      setCargando(false);
      setError(error.message || 'Error al crear la sesión');
    } finally {
      setCreandoSession(false);
    }
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

        {/* Show loading indicator while fetching restaurants */}
        {loadingRestaurants && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Cargando restaurantes...</Text>
          </View>
        )}

        {/* Show error message if any */}
        {error && (
          <View style={[styles.errorContainer, { borderColor: colors.error }]}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* List of restaurants */}
        {!loadingRestaurants && restaurants.map((item) => (
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

  // Render session type selection
  const renderizarSeleccionSessionType = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectSessionType")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectSessionTypeDesc").replace("{restaurant}", restauranteSeleccionado?.nombre || "")}
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

        {/* Session types */}
        <View style={styles.sessionTypes}>
          <TouchableOpacity
            style={[
              styles.sessionTypeCard,
              {
                backgroundColor: colors.card,
                borderColor: sessionType === SessionType.OneOnOne ? colors.primary : colors.border,
              },
            ]}
            onPress={() => seleccionarSessionType(SessionType.OneOnOne)}
          >
            <Ionicons 
              name="person" 
              size={40} 
              color={sessionType === SessionType.OneOnOne ? colors.primary : colors.text} 
              style={styles.sessionTypeIcon}
            />
            <Text style={[styles.sessionTypeName, { color: colors.text }]}>One-on-One</Text>
            <Text style={[styles.sessionTypeDesc, { color: colors.text + "80" }]}>
              Sesión personalizada con un profesor nativo, enfocada en tus necesidades específicas.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sessionTypeCard,
              {
                backgroundColor: colors.card,
                borderColor: sessionType === SessionType.Group ? colors.primary : colors.border,
              },
            ]}
            onPress={() => seleccionarSessionType(SessionType.Group)}
          >
            <Ionicons 
              name="people" 
              size={40} 
              color={sessionType === SessionType.Group ? colors.primary : colors.text} 
              style={styles.sessionTypeIcon}
            />
            <Text style={[styles.sessionTypeName, { color: colors.text }]}>Grupo</Text>
            <Text style={[styles.sessionTypeDesc, { color: colors.text + "80" }]}>
              Sesión en grupo pequeño (2-4 personas), ideal para practicar en un ambiente social.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sessionTypeCard,
              {
                backgroundColor: colors.card,
                borderColor: sessionType === SessionType.Conversation ? colors.primary : colors.border,
              },
            ]}
            onPress={() => seleccionarSessionType(SessionType.Conversation)}
          >
            <Ionicons 
              name="chatbubbles" 
              size={40} 
              color={sessionType === SessionType.Conversation ? colors.primary : colors.text} 
              style={styles.sessionTypeIcon}
            />
            <Text style={[styles.sessionTypeName, { color: colors.text }]}>Conversación</Text>
            <Text style={[styles.sessionTypeDesc, { color: colors.text + "80" }]}>
              Práctica de conversación casual enfocada en fluidez y expresión natural.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeRestaurant")}</Text>
        </TouchableOpacity>
      </>
    );
  };

  // Render language selection
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

        {/* Show loading indicator while fetching languages */}
        {loadingLanguages && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Cargando idiomas...</Text>
          </View>
        )}

        {/* Show error message if any */}
        {error && (
          <View style={[styles.errorContainer, { borderColor: colors.error }]}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Language list */}
        <View style={styles.optionsList}>
          {formErrors.language && (
            <Text style={[styles.errorText, { color: colors.error, marginBottom: 10 }]}>{formErrors.language}</Text>
          )}
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
                  {t("session.teachersAvailable", { count: professors.length })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text + "40"} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeSessionType")}</Text>
        </TouchableOpacity>
      </>
    )
  }

  // Render professor selection
  const renderizarSeleccionProfesor = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectProfessor")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectProfessorDesc").replace("{language}", idiomaSeleccionado || "")}
        </Text>

        <View style={styles.selectedInfo}>
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>
              {restauranteSeleccionado?.nombre} • {idiomaSeleccionado}
            </Text>
            <Text style={[styles.selectedSubtitle, { color: colors.text + "80" }]}>
              {sessionType === SessionType.OneOnOne ? "Sesión individual" : 
               sessionType === SessionType.Group ? "Sesión en grupo" : "Sesión de conversación"}
            </Text>
          </View>
        </View>

        {/* Show loading indicator while fetching professors */}
        {loadingProfessors && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Cargando profesores...</Text>
          </View>
        )}

        {/* Show error message if any */}
        {error && (
          <View style={[styles.errorContainer, { borderColor: colors.error }]}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Professor list */}
        {professors.map((profesor) => (
          <TouchableOpacity
            key={profesor.id}
            style={[
              styles.professorCard,
              {
                backgroundColor: colors.card,
                borderColor: profesorSeleccionado?.id === profesor.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => seleccionarProfesor(profesor)}
          >
            <Image source={{ uri: profesor.imagen }} style={styles.professorImage} />
            <View style={styles.professorInfo}>
              <Text style={[styles.professorName, { color: colors.text }]}>{profesor.nombre}</Text>
              <View style={styles.professorMeta}>
                <Ionicons name="star" size={14} color={colors.gold ? colors.gold[500] : "#FFD700"} />
                <Text style={[styles.professorRating, { color: colors.text + "80" }]}>{profesor.calificacion}</Text>
                <Text style={[styles.professorExperience, { color: colors.text + "80" }]}>• {profesor.experiencia}</Text>
              </View>
              <Text style={[styles.professorDescription, { color: colors.text + "80" }]}>
                {profesor.descripcion}
              </Text>
              <View style={styles.availabilityContainer}>
                <Text style={[styles.availabilityLabel, { color: colors.text + "70" }]}>Disponibilidad:</Text>
                <View style={styles.availabilityDays}>
                  {profesor.disponibilidad.map((day, index) => (
                    <Text key={index} style={[styles.availabilityDay, { color: colors.text + "80" }]}>
                      {day}{index < profesor.disponibilidad.length - 1 ? ", " : ""}
                    </Text>
                  ))}
                </View>
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

  // Renderizar selección de menú
  const renderizarSeleccionMenu = () => {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{t("session.selectMenu")}</Text>
        <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
          {t("session.selectMenuDesc").replace("{professor}", profesorSeleccionado?.nombre || "")}
        </Text>

        <View style={styles.selectedInfo}>
          <View style={styles.selectedDetails}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>
              {restauranteSeleccionado?.nombre} • {idiomaSeleccionado} • {profesorSeleccionado?.nombre}
            </Text>
          </View>
        </View>

        {/* Show loading indicator while fetching menus */}
        {loadingMenus && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Cargando menús...</Text>
          </View>
        )}

        {/* Show error message if any */}
        {error && (
          <View style={[styles.errorContainer, { borderColor: colors.error }]}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Menu list */}
        {menus.map((item) => (
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
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeProfessor")}</Text>
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
              {idiomaSeleccionado} • {profesorSeleccionado?.nombre} • {restauranteSeleccionado?.nombre}
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
              {menuSeleccionado?.nombre} • {profesorSeleccionado?.nombre} • {restauranteSeleccionado?.nombre}
            </Text>
          </View>
        </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.sessionType")}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {sessionType === SessionType.OneOnOne ? "Sesión individual" : 
                 sessionType === SessionType.Group ? "Sesión en grupo" : "Sesión de conversación"}
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
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="card-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.text + "80" }]}>{t("session.paymentMethod")}</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodOption, 
                    { 
                      backgroundColor: paymentMethod === 'credit_card' ? colors.primary + '20' : 'transparent',
                      borderColor: paymentMethod === 'credit_card' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setPaymentMethod('credit_card')}
                >
                  <Ionicons 
                    name="card" 
                    size={16} 
                    color={paymentMethod === 'credit_card' ? colors.primary : colors.text + "60"} 
                  />
                  <Text style={[
                    styles.paymentMethodText, 
                    { color: paymentMethod === 'credit_card' ? colors.primary : colors.text + "60" }
                  ]}>
                    Tarjeta
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodOption, 
                    { 
                      backgroundColor: paymentMethod === 'paypal' ? colors.primary + '20' : 'transparent',
                      borderColor: paymentMethod === 'paypal' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setPaymentMethod('paypal')}
                >
                  <Ionicons 
                    name="logo-paypal" 
                    size={16} 
                    color={paymentMethod === 'paypal' ? colors.primary : colors.text + "60"} 
                  />
                  <Text style={[
                    styles.paymentMethodText, 
                    { color: paymentMethod === 'paypal' ? colors.primary : colors.text + "60" }
                  ]}>
                    PayPal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={retrocederPaso}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t("session.changeDate")}</Text>
        </TouchableOpacity>
      </>
    )
  }
        {/* Show error message if any */}
        {error && (
          <View style={[styles.errorContainer, { borderColor: colors.error, marginBottom: 16 }]}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}
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
            disabled={cargando || creandoSession}
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
        return renderizarSeleccionSessionType()
      case 3:
        return renderizarSeleccionIdioma()
      case 4:
        return renderizarSeleccionProfesor()
      case 5:
        return renderizarSeleccionMenu()
      case 6:
        return renderizarSeleccionFecha()
      case 7:
        return renderizarSeleccionHora()
      case 8:
        return renderizarSeleccionDuracion()
      case 9:
        return renderizarConfirmacion()
      default:
        return null
    }
  }
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="cash-outline" size={20} color={colors.primary} />
                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                      {(menuSeleccionado ? menuSeleccionado.precio : 0) + TASA_SERVICIO * duracionSeleccionada}€ • {paymentMethod === 'credit_card' ? 'Tarjeta' : 'PayPal'}
                    </Text>
                  </View>
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
              {menuSeleccionado?.nombre} • {profesorSeleccionado?.nombre} • {restauranteSeleccionado?.nombre}
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Error handling wrapper */}
      <ErrorBoundary>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                {
                  backgroundColor: step <= paso ? colors.primary : colors.border,
                  width: `${100 / 9 - 1}%`,
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
          <View style={styles.stepContainer}>
            {/* Wrap render in try-catch to prevent render crashes */}
            {(() => {
              try {
                return renderizarPaso();
              } catch (err) {
                console.error('Error rendering step:', err);
                return (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={24} color="red" />
                    <Text style={{color: 'red', marginLeft: 8}}>
                      Error al cargar esta sección. Por favor intente nuevamente.
                    </Text>
                  </View>
                );
              }
            })()}
          </View>
        </ScrollView>

        {/* Modal de confirmación */}
        {(() => {
          try {
            return renderizarModalConfirmacion();
          } catch (err) {
            console.error('Error rendering modal:', err);
            return null;
          }
        })()}

        {/* Loading Overlay */}
        {cargando && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ErrorBoundary>
    </View>
  )
}

const styles = StyleSheet.create({
  professorCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  professorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  professorInfo: {
    flex: 1,
  },
  professorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  professorMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  professorRating: {
    fontSize: 14,
    marginLeft: 4,
  },
  professorExperience: {
    fontSize: 14,
    marginLeft: 8,
  },
  professorDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  availabilityContainer: {
    marginTop: 4,
  },
  availabilityLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  availabilityDays: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  availabilityDay: {
    fontSize: 14,
  },
  sessionTypes: {
    marginBottom: 24,
  },
  sessionTypeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sessionTypeIcon: {
    alignSelf: "center",
    marginBottom: 12,
  },
  sessionTypeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  sessionTypeDesc: {
    fontSize: 14,
    textAlign: "center",
  },
  paymentMethods: {
    flexDirection: "row",
    marginTop: 8,
  },
  paymentMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 14,
    marginLeft: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
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
