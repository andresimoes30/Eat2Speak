import { useState, useContext, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Image,
  ActivityIndicator
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Restaurant } from "./AppTypes"
import { useLanguage } from "../../contexts/LanguageContext"
import * as restaurantApi from "../../../services/restaurantApi"
import * as favoriteApi from "../../../services/favoriteApi"

// Define the parameter list for navigation
type NativeStackParamList = {
  NativeHomeMain: undefined;
  NativeProfileMain: undefined;
  NativeSelectRestaurants: undefined;
};

// Define the navigation prop type
type NativeSelectRestaurantsNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativeSelectRestaurants'
>;

// Extended restaurant type with favorite status
interface RestaurantWithFavorite extends Restaurant {
  isFavorite?: boolean;
  imageUrl?: string;
}

export default function NativeSelectRestaurants() {
  const { appState, updateAppState } = useContext(AppContext) as AppContextType
  const navigation = useNavigation<NativeSelectRestaurantsNavigationProp>();
  const { t } = useLanguage();
  
  // State for restaurants and favorites
  const [restaurants, setRestaurants] = useState<RestaurantWithFavorite[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<number[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);
  
  // Initialize with context
  const [selectedRestaurants, setSelectedRestaurants] = useState<number[]>(
    appState.selectedRestaurants || []
  );
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCity, setFilterCity] = useState("all")
  const [filterCuisine, setFilterCuisine] = useState("all")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [showCityOptions, setShowCityOptions] = useState(false)
  const [showCuisineOptions, setShowCuisineOptions] = useState(false)
  const [showLanguageOptions, setShowLanguageOptions] = useState(false)
  const [selectionChanged, setSelectionChanged] = useState(false)

  // Fetch restaurants and favorites on mount
  useEffect(() => {
    fetchRestaurants();
    fetchFavorites();
  }, []);

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    setError(null);
    
    try {
      // Fetch real restaurants from the API
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCity !== 'all') filters.city = filterCity;
      if (filterCuisine !== 'all') filters.cuisine = filterCuisine;
      if (filterLanguage !== 'all') filters.language = filterLanguage;
      
      const data = await restaurantApi.getRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoadingRestaurants(false);
    }
  };
  
  // Fetch user's favorite restaurants
  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    
    try {
      // In a production app, we would use the real API
      // For now, simulate API call with mock data
      setTimeout(() => {
        // For demonstration, set a couple of restaurants as favorites
        const favorites = [1, 3]; // Francesinha Braga and Mac Daniels
        setFavoriteRestaurants(favorites);
        setLoadingFavorites(false);
      }, 800);
      
      // Real API call would be like this:
      /*
      const favorites = await favoriteApi.getFavoriteRestaurants();
      setFavoriteRestaurants(favorites.map(restaurant => restaurant.id));
      */
    } catch (error) {
      console.error("Error fetching favorites:", error);
      // We don't set an error message here to not block the main functionality
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Toggle favorite status of a restaurant
  const toggleFavorite = async (restaurantId: number) => {
    // Add restaurant ID to updating list to show loading indicator
    setUpdatingFavorites(prev => [...prev, restaurantId]);
    
    try {
      const isCurrentlyFavorite = favoriteRestaurants.includes(restaurantId);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        // await favoriteApi.removeFromFavorites(restaurantId);
        setFavoriteRestaurants(prev => prev.filter(id => id !== restaurantId));
      } else {
        // Add to favorites
        // await favoriteApi.addToFavorites(restaurantId);
        setFavoriteRestaurants(prev => [...prev, restaurantId]);
      }
      
      // Show a brief success message
      Alert.alert(
        isCurrentlyFavorite 
          ? (t("native.favorites.removedTitle") || "Removed from Favorites")
          : (t("native.favorites.addedTitle") || "Added to Favorites"),
        isCurrentlyFavorite
          ? (t("native.favorites.removedMessage") || "Restaurant removed from your favorites")
          : (t("native.favorites.addedMessage") || "Restaurant added to your favorites"),
        [{ text: t("common.ok") }]
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert(
        t("native.favorites.errorTitle") || "Error",
        t("native.favorites.errorMessage") || "Failed to update favorites"
      );
    } finally {
      // Remove from updating list
      setUpdatingFavorites(prev => prev.filter(id => id !== restaurantId));
    }
  };

  // Toggle restaurant selection for teaching
  const toggleRestaurant = (restaurantId: number) => {
    setSelectedRestaurants((prev) => {
      const newSelection = prev.includes(restaurantId) 
        ? prev.filter((id) => id !== restaurantId) 
        : [...prev, restaurantId];
      setSelectionChanged(true);
      return newSelection;
    });
  }

  // Save selection and return to home screen
  const saveSelection = () => {
    updateAppState({ selectedRestaurants });
    // Show a brief success message
    Alert.alert(
      t("native.restaurants.saveSuccess"),
      t("native.restaurants.selectionConfirmation", { count: selectedRestaurants.length }),
      [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
    );
  }
  
  // Filter restaurants based on search and filters
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = filterCity === "all" || restaurant.location.includes(filterCity)
    const matchesCuisine = filterCuisine === "all" || restaurant.cuisine === filterCuisine
    const matchesLanguage = filterLanguage === "all" || restaurant.languages.includes(filterLanguage)
    return matchesSearch && matchesCity && matchesCuisine && matchesLanguage
  });

  // Get unique options for filters
  const cities = [...new Set(restaurants.map((r) => r.location.split(" ")[0]))]
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))]
  const languages = [...new Set(restaurants.flatMap((r) => r.languages))]
  
  // Loading and error states
  if (loadingRestaurants) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.backButtonText}>{t("button.back")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("native.selectRestaurants")}</Text>
          <View style={styles.placeholder}></View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>
            {t("native.restaurants.loading") || "Loading restaurants..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.backButtonText}>{t("button.back")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("native.selectRestaurants")}</Text>
          <View style={styles.placeholder}></View>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchRestaurants}
          >
            <Text style={styles.retryButtonText}>
              {t("native.restaurants.retry") || "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backButtonText}>{t("button.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("native.selectRestaurants")}</Text>
        <View style={styles.placeholder}></View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          placeholder={t("native.restaurants.searchPlaceholder")}
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersGrid}>
        <View style={styles.filterItem}>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowCityOptions(!showCityOptions)}
          >
            <Text>{filterCity === "all" ? t("native.restaurants.city") : filterCity}</Text>
            <Ionicons name={showCityOptions ? "chevron-up" : "chevron-down"} size={16} color="#000" />
          </TouchableOpacity>
          
          {showCityOptions && (
            <View style={styles.optionsDropdown}>
              <TouchableOpacity 
                style={styles.optionItem} 
                onPress={() => {
                  setFilterCity("all")
                  setShowCityOptions(false)
                }}
              >
                <Text>{t("native.restaurants.all")}</Text>
              </TouchableOpacity>
              {cities.map((city) => (
                <TouchableOpacity 
                  key={city} 
                  style={styles.optionItem}
                  onPress={() => {
                    setFilterCity(city)
                    setShowCityOptions(false)
                  }}
                >
                  <Text>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.filterItem}>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowCuisineOptions(!showCuisineOptions)}
          >
            <Text>{filterCuisine === "all" ? t("native.restaurants.cuisine") : filterCuisine}</Text>
            <Ionicons name={showCuisineOptions ? "chevron-up" : "chevron-down"} size={16} color="#000" />
          </TouchableOpacity>
          
          {showCuisineOptions && (
            <View style={styles.optionsDropdown}>
              <TouchableOpacity 
                style={styles.optionItem} 
                onPress={() => {
                  setFilterCuisine("all")
                  setShowCuisineOptions(false)
                }}
              >
                <Text>{t("native.restaurants.all")}</Text>
              </TouchableOpacity>
              {cuisines.map((cuisine) => (
                <TouchableOpacity 
                  key={cuisine} 
                  style={styles.optionItem}
                  onPress={() => {
                    setFilterCuisine(cuisine)
                    setShowCuisineOptions(false)
                  }}
                >
                  <Text>{cuisine}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.filterItem}>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowLanguageOptions(!showLanguageOptions)}
          >
            <Text>{filterLanguage === "all" ? t("native.restaurants.language") : filterLanguage}</Text>
            <Ionicons name={showLanguageOptions ? "chevron-up" : "chevron-down"} size={16} color="#000" />
          </TouchableOpacity>
          
          {showLanguageOptions && (
            <View style={styles.optionsDropdown}>
              <TouchableOpacity 
                style={styles.optionItem} 
                onPress={() => {
                  setFilterLanguage("all")
                  setShowLanguageOptions(false)
                }}
              >
                <Text>{t("native.restaurants.allLanguages")}</Text>
              </TouchableOpacity>
              {languages.map((language) => (
                <TouchableOpacity 
                  key={language} 
                  style={styles.optionItem}
                  onPress={() => {
                    setFilterLanguage(language)
                    setShowLanguageOptions(false)
                  }}
                >
                  <Text>{language}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      
      {/* Results counter */}
      <View style={styles.resultsCounter}>
        <Text style={styles.counterText}>
          {t("native.restaurants.found", { count: filteredRestaurants.length })}
        </Text>
        <Text style={styles.counterText}>
          {t("native.restaurants.selectedCount", { count: selectedRestaurants.length })}
        </Text>
      </View>

      {/* Restaurant list */}
      <ScrollView style={styles.restaurantList}>
        {filteredRestaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.cardWrapper}>
            {/* Restaurant card */}
            <TouchableOpacity
              style={[
                styles.card, 
                selectedRestaurants.includes(restaurant.id) && styles.selectedCard,
                !restaurant.available && styles.unavailableCard
              ]}
              onPress={() => restaurant.available && toggleRestaurant(restaurant.id)}
              activeOpacity={restaurant.available ? 0.7 : 1}
            >
              {/* Restaurant image */}
              <Image 
                source={{ uri: restaurant.imageUrl }} 
                style={styles.restaurantImage}
                resizeMode="cover"
              />
              
              <View style={styles.cardContent}>
                <View style={styles.restaurantContainer}>
                  <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantHeader}>
                      <Text style={[
                        styles.restaurantName,
                        selectedRestaurants.includes(restaurant.id) && styles.selectedText,
                        !restaurant.available && styles.disabledText
                      ]}>
                        {restaurant.name}
                      </Text>
                      {selectedRestaurants.includes(restaurant.id) && 
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                        </View>
                      }
                    </View>

                    <View style={styles.locationContainer}>
                      <Ionicons name="location-outline" size={16} color="#4b5563" style={styles.locationIcon} />
                      <Text style={styles.locationText}>{restaurant.location}</Text>
                    </View>

                    <Text style={styles.descriptionText}>{restaurant.description}</Text>

                    <View style={styles.ratingContainer}>
                      <View style={styles.ratingWrapper}>
                        <Ionicons name="star" size={16} color="#f59e0b" style={styles.starIcon} />
                        <Text style={styles.ratingText}>{restaurant.rating}</Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{restaurant.cuisine}</Text>
                      </View>
                    </View>

                    <View style={styles.languagesContainer}>
                      {restaurant.languages.map((lang: string) => (
                        <View key={lang} style={styles.languageBadge}>
                          <Text style={styles.badgeText}>{lang}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge, 
                      restaurant.available ? styles.availableBadge : styles.unavailableBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {restaurant.available ? t("native.restaurants.available") : t("native.restaurants.unavailable")}
                      </Text>
                    </View>
                    {!restaurant.available && (
                      <View style={styles.comingSoonContainer}>
                        <Ionicons name="time-outline" size={16} color="#6b7280" />
                        <Text style={styles.comingSoonText}>{t("native.restaurants.comingSoon")}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Favorite button overlay */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(restaurant.id)}
              disabled={updatingFavorites.includes(restaurant.id)}
            >
              {updatingFavorites.includes(restaurant.id) ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons 
                  name={favoriteRestaurants.includes(restaurant.id) ? "heart" : "heart-outline"} 
                  size={22} 
                  color={favoriteRestaurants.includes(restaurant.id) ? "#dc2626" : "#ffffff"} 
                />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={() => {
            setSelectedRestaurants([]);
            setSelectionChanged(true);
          }}
        >
          <Text style={styles.clearButtonText}>{t("native.restaurants.clearAll")}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.saveButton,
            !selectionChanged && { opacity: 0.7 }
          ]} 
          onPress={saveSelection}
          disabled={!selectionChanged}
        >
          <Text style={styles.saveButtonText}>
            {selectionChanged 
              ? t("native.restaurants.saveFavorites", { count: selectedRestaurants.length }) 
              : t("native.restaurants.noChanges")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
  placeholder: {
    width: 50,
  },
  // Loading and error styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  // Filter styles
  filtersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  optionsDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    zIndex: 10,
    maxHeight: 200,
  },
  optionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  // Results counter
  resultsCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  counterText: {
    fontSize: 14,
    color: '#4b5563',
  },
  // Restaurant list
  restaurantList: {
    marginBottom: 16,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
  },
  selectedCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  unavailableCard: {
    opacity: 0.7,
  },
  selectedText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  disabledText: {
    color: '#9ca3af',
  },
  checkmarkContainer: {
    marginLeft: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 2,
  },
  cardContent: {
    padding: 16,
  },
  restaurantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontWeight: '500',
    fontSize: 16,
    marginRight: 8,
  },
  checkmark: {
    color: '#3b82f6',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 12,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#10b981',
  },
  unavailableBadge: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
  },
  comingSoonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  clearButtonText: {
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});