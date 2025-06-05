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
  Alert 
} from "react-native"
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
const restaurantDetails: RestaurantDetail = {
  id: 1,
  name: "La Pasta Italiana",
  image: "https://via.placeholder.com/600x400",
  cuisine: "Italiana",
  price: "$$",
  rating: 4.7,
  location: "Rua Augusta, 1200",
  phone: "(11) 3456-7890",
  website: "www.lapastaitaliana.com.br",
  hours: "Segunda a Sábado: 12h às 23h, Domingo: 12h às 17h",
  description:
    "Restaurante italiano autêntico com ambiente acolhedor e pratos tradicionais da culinária italiana. Nossos chefs são nativos da Itália e oferecem uma experiência gastronômica única.",
  languages: ["Italiano", "Inglês"],
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

export default function RestaurantDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RestaurantDetail">>()
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("info")

  // In a real app, you would fetch the restaurant details based on the ID from the route params
  const restaurantId = route.params?.id || 1

  const restaurant = restaurantDetails // This would be fetched from an API

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: restaurant.image }} style={styles.coverImage} />

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

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={18} color={colors.primary} style={styles.contactIcon} />
                  <Text style={[styles.contactText, { color: colors.text }]}>{restaurant.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="globe-outline" size={18} color={colors.primary} style={styles.contactIcon} />
                  <Text style={[styles.contactText, { color: colors.text }]}>{restaurant.website}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="time-outline" size={18} color={colors.primary} style={styles.contactIcon} />
                  <Text style={[styles.contactText, { color: colors.text }]}>{restaurant.hours}</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.infoCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("restaurant.sections.location")}</Text>
              <View
                style={[
                  styles.mapPlaceholder,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Ionicons name="map-outline" size={30} color={colors.text + "40"} />
                <Text style={[styles.mapPlaceholderText, { color: colors.text + "80" }]}>
                  {t("restaurant.mapPlaceholder")}
                </Text>
              </View>
              <Text style={[styles.address, { color: colors.text + "90" }]}>{restaurant.location}</Text>
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
  mapPlaceholder: {
    height: 150,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 14,
    marginTop: 8,
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