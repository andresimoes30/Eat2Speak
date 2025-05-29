"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { LinearGradient } from "expo-linear-gradient"

// Definindo interfaces para tipagem
interface Restaurant {
  id: number
  name: string
  image: string
  cuisine: string
  price: string
  rating: number
  location: string
  languages: string[]
  featured: boolean
}

// Definindo tipos para as rotas de navegação
type RootStackParamList = {
  RestaurantDetail: { id: number; name: string }
  NuevaSesion: { restaurantId: number; restaurantName: string }
}

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params: RootStackParamList[keyof RootStackParamList]) => void
}

// Mock data for restaurants
const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "La Pasta Italiana",
    image: "https://via.placeholder.com/300x200",
    cuisine: "Italiana",
    price: "$$",
    rating: 4.7,
    location: "Calle Augusta, 1200",
    languages: ["Italiano", "Inglés"],
    featured: true,
  },
  {
    id: 2,
    name: "Sushi Koi",
    image: "https://via.placeholder.com/300x200",
    cuisine: "Japonesa",
    price: "$$$",
    rating: 4.9,
    location: "Alameda Santos, 800",
    languages: ["Japonés", "Inglés"],
    featured: false,
  },
  {
    id: 3,
    name: "Le Bistrot",
    image: "https://via.placeholder.com/300x200",
    cuisine: "Francesa",
    price: "$$$",
    rating: 4.6,
    location: "Calle Oscar Freire, 500",
    languages: ["Francés", "Inglés"],
    featured: true,
  },
  {
    id: 4,
    name: "Tapas & Vino",
    image: "https://via.placeholder.com/300x200",
    cuisine: "Española",
    price: "$$",
    rating: 4.5,
    location: "Calle de los Pinos, 300",
    languages: ["Español", "Inglés"],
    featured: false,
  },
  {
    id: 5,
    name: "Biergarten",
    image: "https://via.placeholder.com/300x200",
    cuisine: "Alemana",
    price: "$$",
    rating: 4.4,
    location: "Av. Paulista, 1000",
    languages: ["Alemán", "Inglés"],
    featured: false,
  },
  {
    id: 6,
    name: "Trattoria Napoli",
    image: "https://via.placeholder.com/300x200",
    cuisine: "Italiana",
    price: "$$",
    rating: 4.3,
    location: "Calle Amauri, 400",
    languages: ["Italiano", "Inglés"],
    featured: false,
  },
]

export default function RestaurantsScreen() {
  const { colors, isMounted } = useTheme()
  const { t } = useLanguage()
  const [view, setView] = useState<"list" | "map">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [cuisineFilter, setCuisineFilter] = useState("")
  const [languageFilter, setLanguageFilter] = useState("")
  const navigation = useNavigation<NavigationProp>()

  // Verificação de segurança para garantir que colors está definido
  if (!isMounted) {
    // Retornar um componente de fallback ou loading
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("restaurants.loading")}</Text>
      </View>
    )
  }

  // Filter restaurants based on search and filters
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPrice = priceFilter ? restaurant.price === priceFilter : true
    const matchesCuisine = cuisineFilter ? restaurant.cuisine === cuisineFilter : true
    const matchesLanguage = languageFilter ? restaurant.languages.includes(languageFilter) : true

    return matchesSearch && matchesPrice && matchesCuisine && matchesLanguage
  })

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCardWrapper}
      onPress={() => navigation.navigate("RestaurantDetail", { id: item.id, name: item.name })}
    >
      <Card style={[styles.restaurantCard, { backgroundColor: colors.card }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.restaurantImage} />
          {item.featured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.gold[500] }]}>
              <Text style={styles.featuredText}>{t("restaurants.featured")}</Text>
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.restaurantContent}>
          <View style={styles.restaurantHeader}>
            <Text style={[styles.restaurantName, { color: colors.text }]}>{item.name}</Text>
            <View style={[styles.priceTag, { backgroundColor: colors.blue[50] }]}>
              <Text style={[styles.priceText, { color: colors.blue[700] }]}>{item.price}</Text>
            </View>
          </View>

          <View style={styles.restaurantDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="restaurant-outline" size={16} color={colors.blue[500]} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: colors.text + "90" }]}>{item.cuisine}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color={colors.blue[500]} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: colors.text + "90" }]}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.languagesContainer}>
            {item.languages.map((language: string) => (
              <View
                key={language}
                style={[
                  styles.languageTag,
                  {
                    backgroundColor: colors.purple[50],
                    borderColor: colors.purple[200],
                  },
                ]}
              >
                <Text style={[styles.languageText, { color: colors.purple[700] }]}>{language}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.detailsButton, { borderColor: colors.gold[300], backgroundColor: colors.gold[50] }]}
              onPress={() => navigation.navigate("RestaurantDetail", { id: item.id, name: item.name })}
            >
              <Text style={[styles.detailsButtonText, { color: colors.gold[700] }]}>{t("restaurants.viewDetails")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.blue[600] }]}
              onPress={() => navigation.navigate("NuevaSesion", { restaurantId: item.id, restaurantName: item.name })}
            >
              <Text style={styles.bookButtonText}>{t("restaurants.book")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.blue[400]} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("restaurants.search")}
            placeholderTextColor={colors.text + "60"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: showFilters ? colors.blue[100] : colors.card,
              borderColor: showFilters ? colors.blue[300] : colors.border,
            },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? colors.blue[700] : colors.text} />
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              {
                backgroundColor: view === "list" ? colors.blue[600] : colors.card,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                borderRightWidth: 0,
                borderColor: view === "list" ? colors.blue[600] : colors.border,
              },
            ]}
            onPress={() => setView("list")}
          >
            <Ionicons name="list-outline" size={20} color={view === "list" ? "white" : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              {
                backgroundColor: view === "map" ? colors.blue[600] : colors.card,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                borderLeftWidth: 0,
                borderColor: view === "map" ? colors.blue[600] : colors.border,
              },
            ]}
            onPress={() => setView("map")}
          >
            <Ionicons name="map-outline" size={20} color={view === "map" ? "white" : colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <Card style={[styles.filtersCard, { backgroundColor: colors.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{t("restaurants.price")}</Text>
              <View style={styles.priceButtons}>
                {["$", "$$", "$$$", "$$$$"].map((price: string) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceButton,
                      {
                        backgroundColor: priceFilter === price ? colors.gold[100] : colors.background,
                        borderColor: priceFilter === price ? colors.gold[400] : colors.border,
                      },
                    ]}
                    onPress={() => setPriceFilter(priceFilter === price ? "" : price)}
                  >
                    <Text
                      style={[
                        styles.priceButtonText,
                        { color: priceFilter === price ? colors.gold[700] : colors.text },
                      ]}
                    >
                      {price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.filterItem, { marginLeft: 16 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{t("restaurants.cuisine")}</Text>
              <View style={styles.cuisineButtons}>
                {["Italiana", "Japonesa", "Francesa", "Española", "Alemana"].map((cuisine: string) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.cuisineButton,
                      {
                        backgroundColor: cuisineFilter === cuisine ? colors.blue[100] : colors.background,
                        borderColor: cuisineFilter === cuisine ? colors.blue[400] : colors.border,
                      },
                    ]}
                    onPress={() => setCuisineFilter(cuisineFilter === cuisine ? "" : cuisine)}
                  >
                    <Text
                      style={[
                        styles.cuisineButtonText,
                        { color: cuisineFilter === cuisine ? colors.blue[700] : colors.text },
                      ]}
                    >
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.filterItem, { marginLeft: 16 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{t("restaurants.language")}</Text>
              <View style={styles.languageButtons}>
                {["Inglés", "Italiano", "Japonés", "Francés", "Español", "Alemán"].map((language: string) => (
                  <TouchableOpacity
                    key={language}
                    style={[
                      styles.languageButton,
                      {
                        backgroundColor: languageFilter === language ? colors.purple[100] : colors.background,
                        borderColor: languageFilter === language ? colors.purple[400] : colors.border,
                      },
                    ]}
                    onPress={() => setLanguageFilter(languageFilter === language ? "" : language)}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        { color: languageFilter === language ? colors.purple[700] : colors.text },
                      ]}
                    >
                      {language}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </Card>
      )}

      {view === "list" ? (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={60} color={colors.text + "40"} />
              <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>
                {t("restaurants.noResults")}
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: colors.blue[600] }]}
                onPress={() => {
                  setSearchQuery("")
                  setPriceFilter("")
                  setCuisineFilter("")
                  setLanguageFilter("")
                }}
              >
                <Text style={styles.emptyStateButtonText}>{t("restaurants.clearFilters")}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.mapContainer}>
          <LinearGradient
            colors={[colors.background, colors.blue[50]]}
            style={[
              styles.mapPlaceholder,
              {
                borderColor: colors.blue[200],
              },
            ]}
          >
            <Ionicons name="map-outline" size={60} color={colors.blue[300]} />
            <Text style={[styles.mapPlaceholderText, { color: colors.blue[700] }]}>
              {t("restaurants.mapTitle").replace("{count}", filteredRestaurants.length.toString())}
            </Text>
            <Text style={[styles.mapPlaceholderSubtext, { color: colors.text + "80" }]}>
              {t("restaurants.mapDescription")}
            </Text>

            <View style={styles.mapRestaurantsList}>
              {filteredRestaurants.slice(0, 3).map((restaurant: Restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[styles.mapRestaurantItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate("RestaurantDetail", { id: restaurant.id, name: restaurant.name })}
                >
                  <Image source={{ uri: restaurant.image }} style={styles.mapRestaurantImage} />
                  <View style={styles.mapRestaurantInfo}>
                    <Text style={[styles.mapRestaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                    <Text style={[styles.mapRestaurantLocation, { color: colors.text + "80" }]}>
                      {restaurant.location}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.blue[400]} />
                </TouchableOpacity>
              ))}
              {filteredRestaurants.length > 3 && (
                <TouchableOpacity
                  style={[styles.viewAllButton, { backgroundColor: colors.blue[50], borderColor: colors.blue[200] }]}
                >
                  <Text style={[styles.viewAllText, { color: colors.blue[700] }]}>
                    {t("restaurants.viewAll").replace("{count}", filteredRestaurants.length.toString())}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.blue[700]} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
  },
  searchIcon: {
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewToggle: {
    flexDirection: "row",
    marginLeft: 8,
  },
  viewToggleButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  filtersCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  filterItem: {
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  priceButtons: {
    flexDirection: "row",
  },
  priceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  priceButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cuisineButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cuisineButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  languageButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 16,
  },
  restaurantCardWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantCard: {
    padding: 0,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  featuredText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  ratingContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "bold",
    fontSize: 14,
  },
  restaurantContent: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  priceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  restaurantDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
  },
  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  languageTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  languageText: {
    fontSize: 12,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bookButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  mapRestaurantsList: {
    width: "100%",
    marginTop: 16,
  },
  mapRestaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  mapRestaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  mapRestaurantInfo: {
    flex: 1,
  },
  mapRestaurantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  mapRestaurantLocation: {
    fontSize: 14,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})
