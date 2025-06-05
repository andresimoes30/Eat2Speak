"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Alert,
  Linking,
  Platform
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
// Remove MapView import to avoid native module error
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import restaurantApi from "../../../services/restaurantApi"

// Definindo interfaces para tipagem
interface MenuItem {
  id: number
  name: string
  price: string
  description: string
}

interface Review {
  id: number
  user: string
  rating: number
  date: string
  comment: string
}

interface RestaurantDetail {
  id: number
  name: string
  image: string
  cuisine: string
  price: string
  rating: number
  location: string
  phone: string
  website: string
  hours: string
  description: string
  languages: string[]
  menu: MenuItem[]
  reviews: Review[]
  // Added coordinates for map display
  coordinates: {
    latitude: number
    longitude: number
  }
}

// Interface for API error
interface ApiError {
  message: string
  code?: string
}

// Definindo tipos para as rotas de navegação
type RootStackParamList = {
  RestaurantDetail: { id?: number; name?: string }
}

// Default restaurant data (used while loading or as fallback)
// Default fallback data for when the API call fails or for initial loading UI
const fallbackRestaurantDetails: RestaurantDetail = {
  id: 1,
  name: "La Pasta Italiana",
  image: "https://via.placeholder.com/600x400",
  cuisine: "Italiana",
  price: "$$",
  rating: 4.7,
  location: "Rua Augusta, 1200, São Paulo",
  phone: "(11) 3456-7890",
  website: "www.lapastaitaliana.com.br",
  hours: "Segunda a Sábado: 12h às 23h, Domingo: 12h às 17h",
  description:
    "Restaurante italiano autêntico com ambiente acolhedor e pratos tradicionais da culinária italiana. Nossos chefs são nativos da Itália e oferecem uma experiência gastronômica única.",
  languages: ["Italiano", "Inglês"],
  // Default coordinates for São Paulo
  coordinates: {
    latitude: -23.5505,
    longitude: -46.6333
  },
  menu: [
    {
      id: 1,
      name: "Spaghetti alla Carbonara",
      price: "45,00 €",
      description: "Spaghetti com molho de ovos, queijo pecorino, pimenta preta e pancetta.",
    },
    {
      id: 2,
      name: "Risotto ai Funghi",
      price: "52,00 €",
      description: "Risoto cremoso com mix de cogumelos frescos e parmesão.",
    },
    {
      id: 3,
      name: "Tiramisu",
      price: "28,00 €",
      description: "Sobremesa tradicional italiana com café, mascarpone e cacau.",
    },
  ],
  reviews: [
    {
      id: 1,
      user: "João P.",
      rating: 5,
      date: "10/04/2025",
      comment: "Excelente experiência! A comida estava deliciosa e a aula de italiano foi muito produtiva.",
    },
    {
      id: 2,
      user: "Ana M.",
      rating: 4,
      date: "28/03/2025",
      comment: "Ótimo lugar para aprender italiano enquanto desfruta de uma boa comida. Recomendo!",
    },
  ],
}

// Definindo tipos para as rotas de navegação
type NavigationProp = {
  navigate: (screen: string, params: { restaurantId: number; restaurantName: string }) => void
}

// Helper function to get random menu items
const getRandomMenuItems = (count: number = 3): MenuItem[] => {
  const menuItems = [
    {
      id: 1,
      name: "Spaghetti alla Carbonara",
      price: "45,00 €",
      description: "Spaghetti com molho de ovos, queijo pecorino, pimenta preta e pancetta.",
    },
    {
      id: 2,
      name: "Risotto ai Funghi",
      price: "52,00 €",
      description: "Risoto cremoso com mix de cogumelos frescos e parmesão.",
    },
    {
      id: 3,
      name: "Tiramisu",
      price: "28,00 €",
      description: "Sobremesa tradicional italiana com café, mascarpone e cacau.",
    },
    {
      id: 4,
      name: "Pizza Margherita",
      price: "38,00 €",
      description: "Pizza tradicional com molho de tomate, mussarela e manjericão fresco.",
    },
    {
      id: 5,
      name: "Lasagna Bolognese",
      price: "48,00 €",
      description: "Camadas de massa fresca, molho bolonhesa, bechamel e queijo parmesão.",
    }
  ];
  
  // Return random items from the menu
  return [...menuItems].sort(() => 0.5 - Math.random()).slice(0, count);
};

// Helper function to get random reviews
const getRandomReviews = (count: number = 2): Review[] => {
  const reviews = [
    {
      id: 1,
      user: "João P.",
      rating: 5,
      date: "10/04/2025",
      comment: "Excelente experiência! A comida estava deliciosa e a aula de italiano foi muito produtiva.",
    },
    {
      id: 2,
      user: "Ana M.",
      rating: 4,
      date: "28/03/2025",
      comment: "Ótimo lugar para aprender italiano enquanto desfruta de uma boa comida. Recomendo!",
    },
    {
      id: 3,
      user: "Carlos S.",
      rating: 5,
      date: "15/05/2025",
      comment: "Ambiente agradável e ótimo para praticar o idioma. A comida é autêntica e deliciosa.",
    },
    {
      id: 4,
      user: "Mariana L.",
      rating: 3,
      date: "02/03/2025",
      comment: "Comida boa, mas o serviço poderia ser mais rápido. Boa experiência com o idioma.",
    }
  ];
  
  // Return random reviews
  return [...reviews].sort(() => 0.5 - Math.random()).slice(0, count);
};

// Function to transform API data to match our component's data structure
const transformRestaurantData = (apiData: any): RestaurantDetail => {
  if (!apiData) return fallbackRestaurantDetails;
  
  // Default coordinates for Lisbon if none provided
  // These would normally come from the API
  const defaultCoordinates = {
    latitude: 38.7223,
    longitude: -9.1393
  };
  
  // Use API coordinates if available, or generate random coordinates nearby default
  const coordinates = apiData.coordinates || {
    // If no coordinates are available, use defaults with slight random variation
    // to simulate different locations in the city
    latitude: defaultCoordinates.latitude + (Math.random() - 0.5) * 0.02,
    longitude: defaultCoordinates.longitude + (Math.random() - 0.5) * 0.02
  };
  
  return {
    id: apiData.id || apiData.restaurantId || 1,
    name: apiData.name || "Restaurante",
    image: restaurantApi.getRestaurantImage(apiData.restaurantId || 1),
    cuisine: apiData.cuisine || apiData.cuisineType || "Variada",
    price: apiData.price || (Math.floor(Math.random() * 3) + 1).toString().split('').map(() => '$').join(''),
    rating: apiData.rating || (3.5 + Math.random() * 1.5).toFixed(1),
    location: apiData.location || apiData.address || "Endereço não disponível",
    phone: apiData.phone || "(00) 0000-0000",
    website: apiData.website || "www.restaurante.com",
    hours: apiData.hours || "Segunda a Sábado: 12h às 23h",
    description: apiData.description || `Restaurante ${apiData.cuisineType || 'tradicional'} com ambiente acolhedor.`,
    languages: apiData.languages || ["Português", "Inglês"],
    coordinates: coordinates,
    menu: apiData.menu || getRandomMenuItems(3 + Math.floor(Math.random() * 3)),
    reviews: apiData.reviews || getRandomReviews(2 + Math.floor(Math.random() * 3))
  };
};

export default function RestaurantDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RestaurantDetail">>()
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("info")
  
  // State for the restaurant data, loading state, and errors
  const [restaurant, setRestaurant] = useState<RestaurantDetail>(fallbackRestaurantDetails)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the restaurant ID from route params
  const restaurantId = route.params?.id || 1

  // Function to fetch restaurant details
  const fetchRestaurantDetails = useCallback(async (id: number, isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else if (!refreshing) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Fetch restaurant details from API
      const response = await restaurantApi.getRestaurantDetails(id);
      
      // Transform API data to match our component's structure
      const transformedData = transformRestaurantData(response);
      
      // Update state with fetched data
      setRestaurant(transformedData);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to load restaurant details";
      setError(errorMessage);
      
      // Show error alert
      Alert.alert(
        "Error",
        `Failed to load restaurant details: ${errorMessage}`,
        [
          { text: "OK" },
          { 
            text: "Retry", 
            onPress: () => fetchRestaurantDetails(id, isRefreshing)
          }
        ]
      );
      
      console.error("Error fetching restaurant details:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch restaurant details when component mounts or ID changes
  useEffect(() => {
    fetchRestaurantDetails(restaurantId);
  }, [restaurantId, fetchRestaurantDetails]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    fetchRestaurantDetails(restaurantId, true);
  }, [restaurantId, fetchRestaurantDetails]);

  // If we're in the loading state, show a loading indicator
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.blue[600]} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t("restaurant.loading") || "Carregando informações do restaurante..."}
        </Text>
      </View>
    );
  }

  // If there's an error and no data, show an error state
  if (error && !restaurant) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.error }]}>
          {t("restaurant.errorTitle") || "Erro ao carregar"}
        </Text>
        <Text style={[styles.errorMessage, { color: colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.blue[600] }]}
          onPress={() => fetchRestaurantDetails(restaurantId)}
        >
          <Text style={styles.retryButtonText}>
            {t("restaurant.retry") || "Tentar novamente"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.blue[600]]}
          tintColor={colors.blue[600]}
        />
      }
    >
      {/* Banner to show errors if we have data but there was an error refreshing */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error + "15" }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={[styles.errorBannerText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            onPress={() => fetchRestaurantDetails(restaurantId, true)}
            style={styles.errorBannerButton}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
      
      <Image 
        source={{ uri: restaurant.image }} 
        style={styles.coverImage}
        defaultSource={{ uri: "https://via.placeholder.com/600x400" }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{restaurant.rating}</Text>
          </View>
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.text + "80"} />
            <Text style={[styles.metaText, { color: colors.text + "80" }]}>{restaurant.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="restaurant-outline" size={16} color={colors.text + "80"} />
            <Text style={[styles.metaText, { color: colors.text + "80" }]}>{restaurant.cuisine}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={16} color={colors.text + "80"} />
            <Text style={[styles.metaText, { color: colors.text + "80" }]}>{restaurant.price}</Text>
          </View>
        </View>

        <View style={styles.languagesContainer}>
          {restaurant.languages.map((language: string) => (
            <View
              key={language}
              style={[
                styles.languageTag,
                {
                  backgroundColor: colors.blue[50],
                  borderColor: colors.blue[200],
                },
              ]}
            >
              <Text style={[styles.languageText, { color: colors.blue[700] }]}>{language}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.tabsContainer, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "info" && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab("info")}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === "info" ? colors.primary : colors.text + "80" }]}>
              {t("restaurant.tabs.info")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "menu" && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab("menu")}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === "menu" ? colors.primary : colors.text + "80" }]}>
              {t("restaurant.tabs.menu")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "reviews" && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              style={[styles.tabButtonText, { color: activeTab === "reviews" ? colors.primary : colors.text + "80" }]}
            >
              {t("restaurant.tabs.reviews")}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "info" && (
          <View style={styles.tabContent}>
            <Card style={styles.infoCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("restaurant.sections.about")}</Text>
              <Text style={[styles.description, { color: colors.text + "90" }]}>{restaurant.description}</Text>

              {/* Contact information removed as requested */}
            </Card>

            <Card style={styles.infoCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("restaurant.sections.location")}</Text>
              <View style={styles.mapContainer}>
                {/* Static map visualization to avoid native module errors */}
                <View style={styles.mapBackground}>
                  {/* Map grid pattern */}
                  <View style={styles.mapGrid}>
                    {[...Array(5)].map((_, i) => (
                      <View 
                        key={`h-${i}`} 
                        style={[
                          styles.mapGridLine, 
                          styles.mapGridHorizontal, 
                          { 
                            top: `${20 * (i + 1)}%`, 
                            borderColor: 'rgba(255,255,255,0.2)' 
                          }
                        ]} 
                      />
                    ))}
                    {[...Array(5)].map((_, i) => (
                      <View 
                        key={`v-${i}`} 
                        style={[
                          styles.mapGridLine, 
                          styles.mapGridVertical, 
                          { 
                            left: `${20 * (i + 1)}%`, 
                            borderColor: 'rgba(255,255,255,0.2)' 
                          }
                        ]} 
                      />
                    ))}
                  </View>

                  {/* Simulated roads */}
                  <View style={[styles.mapRoad, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={[styles.mapRoadSecondary, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  
                  {/* Location marker */}
                  <View style={styles.mapMarkerContainer}>
                    <View style={[styles.mapMarker, { backgroundColor: colors.blue[600] }]}>
                      <Ionicons name="location" size={20} color="white" />
                    </View>
                    <View style={[styles.mapMarkerShadow, { backgroundColor: colors.blue[600] + '50' }]} />
                  </View>
                </View>
                
                {/* Address info container */}
                <View style={styles.mapOverlay}>
                  <View style={[styles.mapAddressContainer, { 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderWidth: 1,
                    borderColor: colors.blue[300]
                  }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="navigate" size={18} color={colors.blue[600]} />
                      <Text style={{ fontSize: 12, color: colors.blue[600], fontWeight: '600', marginLeft: 4 }}>
                        ENDEREÇO REAL
                      </Text>
                    </View>
                    <Text style={[styles.mapAddressTitle, { color: colors.text, fontSize: 16, fontWeight: 'bold' }]}>
                      {restaurant.name}
                    </Text>
                    <Text style={[styles.mapAddressText, { color: colors.text, fontSize: 14, fontWeight: '500' }]}>
                      {restaurant.location}
                    </Text>
                    
                    {/* Directions button */}
                    <TouchableOpacity 
                      style={[styles.directionsButton, { backgroundColor: colors.blue[600] }]}
                      onPress={() => {
                        const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
                        const latLng = `${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`;
                        const label = encodeURIComponent(restaurant.name);
                        const url = Platform.select({
                          ios: `${scheme}${label}@${latLng}`,
                          android: `${scheme}${latLng}(${label})`
                        });
                        
                        if (url) Linking.openURL(url);
                      }}
                    >
                      <Ionicons name="navigate-circle-outline" size={16} color="white" />
                      <Text style={styles.directionsButtonText}>
                        {t("restaurant.getDirections") || "Como Chegar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {activeTab === "menu" && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("restaurant.sections.menu")}</Text>
            {restaurant.menu.map((item: MenuItem) => (
              <Card key={item.id} style={styles.menuItemCard}>
                <View style={styles.menuItemHeader}>
                  <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.menuItemPrice, { color: colors.primary }]}>{item.price}</Text>
                </View>
                <Text style={[styles.menuItemDescription, { color: colors.text + "80" }]}>{item.description}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === "reviews" && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("restaurant.sections.reviews")}</Text>
            {restaurant.reviews.map((review: Review) => (
              <Card key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewUser, { color: colors.text }]}>{review.user}</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.reviewRatingText, { color: colors.text + "80" }]}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.text + "60" }]}>{review.date}</Text>
                <Text style={[styles.reviewComment, { color: colors.text + "90" }]}>{review.comment}</Text>
              </Card>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.blue[600] }]}
          onPress={() => navigation.navigate("NuevaSesion", { restaurantId: restaurant.id, restaurantName: restaurant.name })}
        >
          <Text style={styles.bookButtonText}>{t("restaurants.book")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Error banner styles
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorBannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  errorBannerButton: {
    padding: 8,
  },
  coverImage: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "bold",
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 14,
  },
  languagesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  languageTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabContent: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoCard: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  contactInfo: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
  },
  // Map styles
  mapContainer: {
    height: 220,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
    backgroundColor: '#37474F', // Map background color
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#37474F',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGridLine: {
    position: 'absolute',
    borderWidth: 1,
    zIndex: 1,
  },
  mapGridHorizontal: {
    left: 0,
    right: 0,
  },
  mapGridVertical: {
    top: 0,
    bottom: 0,
  },
  mapRoad: {
    position: 'absolute',
    height: 16,
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -8,
    zIndex: 2,
  },
  mapRoadSecondary: {
    position: 'absolute',
    width: 16,
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -8,
    zIndex: 2,
  },
  mapMarkerContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -16,
    marginTop: -32,
    alignItems: 'center',
    zIndex: 3,
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  mapMarkerShadow: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  mapAddressContainer: {
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  mapAddressTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  mapAddressText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 4,
  },
  directionsButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
  },
  menuItemCard: {
    marginBottom: 12,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewRatingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  bookButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})