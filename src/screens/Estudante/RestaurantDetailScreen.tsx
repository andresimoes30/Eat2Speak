"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Platform,
  Dimensions
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { WebView } from "react-native-webview"
import * as Location from "expo-location"
// Import centralized connectivity utility
import { checkNetworkConnectivity } from "../../utils/connectivity"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import restaurantApi from "../../../services/restaurantApi"
import Geocoder from "react-native-geocoding"

// Interface for map messages from WebView
interface MapMessage {
  type: string;
  data?: any;
}

// Create HTML content for the Leaflet map
const createMapHTML = (
  latitude: number, 
  longitude: number, 
  name: string, 
  address: string, 
  zoom: number = 15
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body {
          padding: 0;
          margin: 0;
        }
        html, body, #map {
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        .custom-marker-icon {
          background-color: #3B82F6;
          width: 32px;
          height: 32px;
          display: block;
          left: -16px;
          top: -16px;
          position: relative;
          border-radius: 16px;
          border: 2px solid white;
          text-align: center;
          color: white;
          line-height: 32px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .custom-marker-icon::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          margin-left: -8px;
          border-width: 8px 8px 0;
          border-style: solid;
          border-color: #3B82F6 transparent;
          display: block;
          width: 0;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 220px !important;
        }
        .popup-container {
          padding: 12px;
        }
        .popup-title {
          font-weight: bold;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .popup-address {
          font-size: 12px;
          color: #666;
        }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
        crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
        crossorigin=""></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([${latitude}, ${longitude}], ${zoom});
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
        
        // Custom marker icon
        const restaurantIcon = L.divIcon({
          className: 'custom-marker-icon',
          html: '<span>R</span>',
          iconSize: [32, 32]
        });
        
        // Add marker
        const marker = L.marker([${latitude}, ${longitude}], {
          icon: restaurantIcon,
          draggable: false
        }).addTo(map);
        
        // Add popup
        marker.bindPopup(
          '<div class="popup-container">' +
          '<div class="popup-title">${name.replace(/'/g, "\\'")}</div>' +
          '<div class="popup-address">${address.replace(/'/g, "\\'")}</div>' +
          '</div>',
          { 
            className: 'custom-popup',
            closeButton: false
          }
        );
        
        // Open popup by default
        marker.openPopup();
        
        // Handle map interactions
        map.on('moveend', function() {
          const center = map.getCenter();
          const zoom = map.getZoom();
          
          // Send data to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapMoved',
            data: {
              latitude: center.lat,
              longitude: center.lng,
              zoom: zoom
            }
          }));
        });
        
        // Handle marker click
        marker.on('click', function() {
          // Send data to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClicked',
            data: {
              name: '${name.replace(/'/g, "\\'")}'
            }
          }));
        });
        
        // Handle message from React Native
        window.addEventListener('message', function(event) {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'updateMarker') {
              // Update marker position
              marker.setLatLng([message.data.latitude, message.data.longitude]);
              map.setView([message.data.latitude, message.data.longitude], message.data.zoom || ${zoom});
            } 
            else if (message.type === 'zoomIn') {
              map.setZoom(map.getZoom() + 1);
            } 
            else if (message.type === 'zoomOut') {
              map.setZoom(map.getZoom() - 1);
            }
          } catch (e) {
            console.error('Error processing message:', e);
          }
        });
        
        // Let React Native know the map is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapReady'
        }));
      </script>
    </body>
    </html>
  `;
};

// Simple network connectivity helper (fallback for NetInfo)
// Removed local implementation as we now import from centralized utility

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

// Interface for map-related errors
interface MapError {
  code?: string;
  message: string;
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

// Default region for the map (Lisbon, Portugal)
const DEFAULT_REGION = {
  latitude: 38.7223,
  longitude: -9.1393,
  zoom: 15
};

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

// Function to geocode an address to coordinates
const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  if (!address || address === "Endereço não disponível") {
    return null;
  }
  
  try {
    // Check for network connectivity using our fallback function
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new Error('No network connection');
    }
    
    const response = await Geocoder.from(address);
    
    if (!response.results || response.results.length === 0) {
      return null;
    }
    
    const { lat, lng } = response.results[0].geometry.location;
    
    return {
      latitude: lat,
      longitude: lng
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
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
  
  // Map-specific states
  const webViewRef = useRef<WebView>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
    zoom: DEFAULT_REGION.zoom
  })
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [isNetworkConnected, setIsNetworkConnected] = useState<boolean | null>(true)
  
  // Get the restaurant ID from route params
  const restaurantId = route.params?.id || 1

  // Handle WebView messages from the Leaflet map
  const handleWebViewMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const message: MapMessage = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'mapReady':
          setMapReady(true);
          setMapError(null);
          break;
          
        case 'mapMoved':
          if (message.data) {
            setMapCenter({
              latitude: message.data.latitude,
              longitude: message.data.longitude,
              zoom: message.data.zoom
            });
          }
          break;
          
        case 'markerClicked':
          // Handle marker click if needed
          break;
          
        case 'mapError':
          setMapError(message.data?.message || 'An error occurred with the map');
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, []);
  
  // Zoom map in
  const zoomIn = useCallback(() => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'zoomIn'
      }));
    }
  }, [mapReady]);
  
  // Zoom map out
  const zoomOut = useCallback(() => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'zoomOut'
      }));
    }
  }, [mapReady]);
  
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
      
      // Update map center based on restaurant coordinates
      if (transformedData.coordinates) {
        setMapCenter({
          latitude: transformedData.coordinates.latitude,
          longitude: transformedData.coordinates.longitude,
          zoom: 15
        });
        
        // Update marker on map if map is ready
        if (webViewRef.current && mapReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'updateMarker',
            data: {
              latitude: transformedData.coordinates.latitude,
              longitude: transformedData.coordinates.longitude,
              zoom: 15
            }
          }));
        }
      }
      
      setError(null);
      setMapError(null);
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
  
  // Check network connectivity with a periodic check (replaces NetInfo.addEventListener)
  useEffect(() => {
    // Periodically check network connectivity
    const checkConnectivity = async () => {
      try {
        const isConnected = await checkNetworkConnectivity();
        setIsNetworkConnected(isConnected);
        
        // Update map error based on connectivity
        if (!isConnected) {
          setMapError(t('map.noNetworkConnection') || 'No network connection. Map functionality may be limited.');
        } else if (mapError === 'No network connection. Map functionality may be limited.') {
          setMapError(null);
        }
      } catch (error) {
        console.error('Error checking connectivity:', error);
        // Don't update error state on check failure
      }
    };
    
    // Initial check
    checkConnectivity();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(checkConnectivity, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [mapError, t]);
  
  // Request location permissions
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermissionGranted(status === 'granted');
        } else {
          // iOS
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermissionGranted(status === 'granted');
        }
      } catch (err) {
        console.error('Error requesting location permission:', err);
        setLocationPermissionGranted(false);
      }
    };
    
    requestLocationPermission();
  }, []);
  
  // Try to geocode the restaurant address if coordinates are missing
  useEffect(() => {
    const tryGeocodeAddress = async () => {
      // Skip if we already have valid coordinates or no address
      if (
        (restaurant.coordinates.latitude !== 0 && restaurant.coordinates.longitude !== 0) ||
        !restaurant.location ||
        restaurant.location === "Endereço não disponível"
      ) {
        return;
      }
      
      try {
        const coordinates = await geocodeAddress(restaurant.location);
        
        if (coordinates) {
          // Update restaurant with geocoded coordinates
          setRestaurant(prev => ({
            ...prev,
            coordinates
          }));
          
          // Update map center for WebView
          setMapCenter({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            zoom: 15
          });
          
          // Update marker on map if map is ready
          if (webViewRef.current && mapReady) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'updateMarker',
              data: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                zoom: 15
              }
            }));
          }
        }
      } catch (err) {
        console.error('Error geocoding address:', err);
        // Don't set error state here as it's not critical, just fall back to default coordinates
      }
    };
    
    if (isNetworkConnected) {
      tryGeocodeAddress();
    }
  }, [restaurant.location, isNetworkConnected, mapReady]);

  // Fetch restaurant details when component mounts or ID changes
  useEffect(() => {
    fetchRestaurantDetails(restaurantId);
  }, [restaurantId, fetchRestaurantDetails]);
  
  // Update map marker when restaurant coordinates change
  useEffect(() => {
    if (webViewRef.current && mapReady && restaurant.coordinates) {
      const message = {
        type: 'updateMarker',
        data: {
          latitude: restaurant.coordinates.latitude,
          longitude: restaurant.coordinates.longitude,
          zoom: 15
        }
      };
      
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, [restaurant.coordinates, mapReady]);
  
  // Open directions in native maps app
  const openDirections = useCallback(() => {
    const { latitude, longitude } = restaurant.coordinates;
    const label = encodeURIComponent(restaurant.name);
    
    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q='
    });
    
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps app:', err);
        Alert.alert(
          "Error",
          "Unable to open maps application. Please make sure you have a maps app installed.",
          [{ text: "OK" }]
        );
      });
    }
  }, [restaurant.coordinates, restaurant.name]);

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
                {/* Show map error if there is one */}
                {mapError && (
                  <View style={[styles.mapErrorContainer, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
                    <Text style={[styles.mapErrorText, { color: colors.error }]}>
                      {mapError}
                    </Text>
                  </View>
                )}
                
                {/* Loading indicator while map initializes */}
                {!mapReady && (
                  <View style={styles.mapLoadingContainer}>
                    <ActivityIndicator size="large" color={colors.blue[600]} />
                    <Text style={[styles.mapLoadingText, { color: colors.text }]}>
                      {t("restaurant.loadingMap") || "Carregando mapa..."}
                    </Text>
                  </View>
                )}
                
                {/* WebView-based map */}
                <WebView
                  ref={webViewRef}
                  style={styles.map}
                  originWhitelist={['*']}
                  source={{ 
                    html: createMapHTML(
                      restaurant.coordinates.latitude,
                      restaurant.coordinates.longitude,
                      restaurant.name,
                      restaurant.location,
                      15
                    )
                  }}
                  onMessage={handleWebViewMessage}
                  onError={() => setMapError(t('map.loadError') || 'Error loading map')}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.mapLoadingContainer}>
                      <ActivityIndicator size="large" color={colors.blue[600]} />
                      <Text style={[styles.mapLoadingText, { color: colors.text }]}>
                        {t("restaurant.loadingMap") || "Carregando mapa..."}
                      </Text>
                    </View>
                  )}
                  onHttpError={() => setMapError(t('map.connectionError') || 'Failed to load map resources')}
                />
                
                {/* Map controls */}
                <View style={styles.mapControls}>
                  <TouchableOpacity 
                    style={[styles.mapControlButton, { backgroundColor: colors.card }]}
                    onPress={zoomIn}
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.mapControlButton, { backgroundColor: colors.card }]}
                    onPress={zoomOut}
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                {/* Map overlay with restaurant information */}
                <View style={styles.mapOverlay}>
                  <View 
                    style={[
                      styles.mapAddressContainer, 
                      { 
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderWidth: 1,
                        borderColor: colors.blue[300] 
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="navigate" size={18} color={colors.blue[600]} />
                      <Text style={{ fontSize: 12, color: colors.blue[600], fontWeight: '600', marginLeft: 4 }}>
                        ENDEREÇO
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
                      onPress={openDirections}
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Map loading styles
  mapLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 5,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  // Map error styles
  mapErrorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  mapErrorText: {
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
  },
  // Map controls
  mapControls: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  mapControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
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