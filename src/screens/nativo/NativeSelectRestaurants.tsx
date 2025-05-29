import { useState, useContext, useEffect } from "react"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Restaurant, mockData } from "./AppTypes"
import { useLanguage } from "../../contexts/LanguageContext"

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

export default function NativeSelectRestaurants() {
  const { appState, updateAppState } = useContext(AppContext) as AppContextType
  const navigation = useNavigation<NativeSelectRestaurantsNavigationProp>();
  const { t } = useLanguage();
  
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

  // Log when the screen renders
  useEffect(() => {
    console.log("NativeSelectRestaurants rendered");
  }, []);

  // Toggle restaurant selection with visual feedback
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
  const filteredRestaurants = mockData.restaurants.filter((restaurant: Restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = filterCity === "all" || restaurant.location.includes(filterCity)
    const matchesCuisine = filterCuisine === "all" || restaurant.cuisine === filterCuisine
    const matchesLanguage = filterLanguage === "all" || restaurant.languages.includes(filterLanguage)
    return matchesSearch && matchesCity && matchesCuisine && matchesLanguage
  })

  const cities = [...new Set(mockData.restaurants.map((r: Restaurant) => r.location.split(" ")[0]))]
  const cuisines = [...new Set(mockData.restaurants.map((r: Restaurant) => r.cuisine))]
  const languages = [...new Set(mockData.restaurants.flatMap((r: Restaurant) => r.languages))]
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backButtonText}>{t("button.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("native.selectRestaurants")}</Text>
        <View style={styles.placeholder}></View>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          placeholder={t("native.restaurants.searchPlaceholder")}
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Filtros */}
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
      {/* Contador de resultados */}
      <View style={styles.resultsCounter}>
        <Text style={styles.counterText}>{t("native.restaurants.found", { count: filteredRestaurants.length })}</Text>
        <Text style={styles.counterText}>{t("native.restaurants.selectedCount", { count: selectedRestaurants.length })}</Text>
      </View>

      {/* Lista de Restaurantes */}
      <ScrollView style={styles.restaurantList}>
        {filteredRestaurants.map((restaurant: Restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={[
              styles.card, 
              selectedRestaurants.includes(restaurant.id) && styles.selectedCard,
              !restaurant.available && styles.unavailableCard
            ]}
            onPress={() => restaurant.available && toggleRestaurant(restaurant.id)}
            activeOpacity={restaurant.available ? 0.7 : 1}
          >
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
        ))}
      </ScrollView>

      {/* Botones de acción */}
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
    </View>
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
  resultsCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  counterText: {
    fontSize: 14,
    color: '#4b5563',
  },
  restaurantList: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  unavailableCard: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
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