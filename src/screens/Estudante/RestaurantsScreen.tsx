"use client"

import React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { LinearGradient } from "expo-linear-gradient"
import api from "../../../services/api"

// TypeScript interfaces for restaurant data structure
interface RestaurantOwner {
  userId: number
  firstName: string
  lastName: string
  email: string
}

interface Restaurant {
  restaurantId: number
  name: string
  cuisineType: string
  address: string
  commissionPercent: number
  createdAt: string
  owner?: RestaurantOwner
  // Additional fields for UI that may not be in the API response
  image?: string
  price?: string
  rating?: number
  languages?: string[]
  featured?: boolean
}

// Interface for API response
interface RestaurantsResponse {
  status: string
  data: {
    restaurants: Restaurant[]
    pagination: {
      total: number
      totalPages: number
      currentPage: number
      limit: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

// Interface for filtering options
interface FilterOptions {
  search: string
  cuisine: string
  price: string
  language: string
}

// Error interface
interface ApiError {
  message: string
  code?: string
}

// Defining types for the routes of navigation
type RootStackParamList = {
  RestaurantDetail: { id: number; name: string }
  NuevaSesion: { restaurantId: number; restaurantName: string }
}

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params: RootStackParamList[keyof RootStackParamList]) => void
}

// Default restaurant image and placeholder URLs
const DEFAULT_RESTAURANT_IMAGE = "https://via.placeholder.com/300x200"
const PLACEHOLDER_IMAGES = [
  "https://via.placeholder.com/300x200/FF5733/FFFFFF?text=Eat2Speak",
  "https://via.placeholder.com/300x200/33A8FF/FFFFFF?text=Restaurant",
  "https://via.placeholder.com/300x200/33FF57/FFFFFF?text=Food",
  "https://via.placeholder.com/300x200/F033FF/FFFFFF?text=Cuisine",
  "https://via.placeholder.com/300x200/FFFF33/000000?text=Dining",
]

// Price ranges for filtering
const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"]

// ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("Error in RestaurantsScreen:", error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function RestaurantsScreenWrapper() {
  // Wrap the main component in ErrorBoundary
  const { colors } = useTheme()
  return (
    <ErrorBoundary
      fallback={
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>Something went wrong</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>
            We're having trouble loading the restaurants. Please try again later.
          </Text>
        </View>
      }
    >
      <RestaurantsScreen />
    </ErrorBoundary>
  )
}

function RestaurantsScreen() {
  const { colors, isMounted } = useTheme()
  const { t } = useLanguage()
  const navigation = useNavigation<NavigationProp>()

  // View state (list or map)
  const [view, setView] = useState<"list" | "map">("list")
  const [showFilters, setShowFilters] = useState(false)

  // Restaurants data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  // Pagination state
  const [page, setPage] = useState(1)
  // Use number type for setTimeout compatibility 
  const retryTimeoutRef = useRef<number | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalRestaurants, setTotalRestaurants] = useState(0)

  // Filtering state
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    cuisine: "",
    price: "",
    language: "",
  })

  // Ref to store the last filters applied to the API call
  const lastAppliedFilters = useRef<FilterOptions>({ ...filters })

  // Ref for FlatList to scroll to top when filters change
  const flatListRef = useRef<FlatList>(null)

  // Cache expiration time (30 minutes - increased to reduce API calls)
  const CACHE_EXPIRATION = 30 * 60 * 1000
  const cacheTimestamp = useRef<number | null>(null)
  const cachedRestaurants = useRef<Restaurant[]>([])
  
  // Queue state for API requests to prevent multiple calls
  const isRequestPendingRef = useRef<boolean>(false)
  const pendingRequestParamsRef = useRef<{ page: number, refresh: boolean } | null>(null)

  // Get random placeholder image for restaurants without images
  const getRandomPlaceholderImage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)
    return PLACEHOLDER_IMAGES[randomIndex]
  }, [])

  // Enhance restaurant data with additional UI fields if missing
  const enhanceRestaurantData = useCallback((restaurant: Restaurant): Restaurant => {
    // Generate a semi-random but consistent price based on restaurantId
    const getPriceCategory = (id: number) => {
      const categories = ["$", "$$", "$$$", "$$$$"]
      return categories[id % categories.length]
    }

    // Generate a semi-random but consistent rating based on restaurantId
    const getRating = (id: number) => {
      // Base rating between 3.5 and 5.0
      return (3.5 + (id % 15) / 10).toFixed(1)
    }

    // Derive languages from cuisine type if not provided
    const getLanguages = (cuisine: string) => {
      const cuisineToLanguageMap: { [key: string]: string[] } = {
        Italian: ["Italian", "English"],
        Japanese: ["Japanese", "English"],
        French: ["French", "English"],
        Spanish: ["Spanish", "English"],
        German: ["German", "English"],
        Chinese: ["Chinese", "English"],
        Mexican: ["Spanish", "English"],
        Thai: ["Thai", "English"],
        Indian: ["Hindi", "English"],
        Greek: ["Greek", "English"],
        // Add more mappings as needed
      }

      // Try to match cuisine to a known language
      const normalizedCuisine = Object.keys(cuisineToLanguageMap).find(
        (key) => cuisine.toLowerCase().includes(key.toLowerCase())
      )

      return normalizedCuisine ? cuisineToLanguageMap[normalizedCuisine] : ["English"]
    }

    return {
      ...restaurant,
      image: restaurant.image || getRandomPlaceholderImage(),
      price: restaurant.price || getPriceCategory(restaurant.restaurantId),
      rating: restaurant.rating || parseFloat(getRating(restaurant.restaurantId)),
      languages: restaurant.languages || getLanguages(restaurant.cuisineType),
      featured: restaurant.featured || restaurant.restaurantId % 5 === 0, // Every 5th restaurant is featured
    }
  }, [getRandomPlaceholderImage])

  // Translation fallbacks for missing keys
  const translationFallbacks: { [key: string]: string } = {
    "restaurants.retry": "Retry",
    "restaurants.loadingMore": "Loading more...",
    "restaurants.rateLimited": "Too many requests. Please wait...",
  }

  // Helper to get translations with fallbacks
  const getTranslation = useCallback(
    (key: string) => {
      const translation = t(key)
      // If translation is the same as the key, it means it's missing
      if (translation === key && translationFallbacks[key]) {
        return translationFallbacks[key]
      }
      return translation
    },
    [t]
  )

  // Debounce delay for filter changes (milliseconds)
  const FILTER_DEBOUNCE_DELAY = 800
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Function to fetch restaurants from the API with request queue
  const fetchRestaurants = useCallback(
    async (pageNum = 1, refresh = false) => {
      // If we're rate limited, don't make another request until the timeout has passed
      if (isRateLimited && retryAfter > 0) {
        console.log(`Skipping request due to rate limiting. Will retry in ${retryAfter} seconds.`)
        return
      }
      
      // If there's already a request in progress, queue this one instead of sending it
      if (isRequestPendingRef.current) {
        console.log(`Request already in progress. Queuing page ${pageNum}, refresh: ${refresh}`)
        pendingRequestParamsRef.current = { page: pageNum, refresh }
        return
      }
      
      // Mark that we're starting a request
      isRequestPendingRef.current = true
      
      try {
        // Clear any existing retry timeouts
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }

        // Check if we can use cached data (for first page only and if not refreshing)
        const now = Date.now()
        if (
          pageNum === 1 &&
          !refresh &&
          cachedRestaurants.current.length > 0 &&
          cacheTimestamp.current &&
          now - cacheTimestamp.current < CACHE_EXPIRATION
        ) {
          console.log("Using cached restaurant data from", new Date(cacheTimestamp.current).toLocaleTimeString())
          setRestaurants(cachedRestaurants.current)
          setLoading(false)
          setRefreshing(false)
          isRequestPendingRef.current = false
          
          // Process any queued requests
          if (pendingRequestParamsRef.current) {
            const { page, refresh } = pendingRequestParamsRef.current
            pendingRequestParamsRef.current = null
            console.log(`Processing queued request: page ${page}, refresh: ${refresh}`)
            
            // Only process the queued request if it's different from what we just did
            if (page !== pageNum || refresh !== false) {
              // Small delay to prevent immediate re-request
              setTimeout(() => {
                fetchRestaurants(page, refresh)
              }, 100)
            }
          }
          return
        }

        // If refreshing or changing filters, we need to reset the page
        if (refresh || JSON.stringify(filters) !== JSON.stringify(lastAppliedFilters.current)) {
          pageNum = 1
          if (!refresh) {
            setPage(1)
            setRestaurants([])
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
          lastAppliedFilters.current = { ...filters }
        }

        // Log what we're fetching for debugging
        console.log(`Fetching restaurants: page ${pageNum}, refresh: ${refresh}, filters:`, 
          JSON.stringify(filters, null, 2).substring(0, 100) + "...")

        // Prepare query parameters
        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
          sort: "name",
          order: "ASC",
        })

        // Add search and cuisine filters if provided
        if (filters.search) queryParams.append("search", filters.search)
        if (filters.cuisine) queryParams.append("cuisine", filters.cuisine)

        // Add a cache-busting parameter to avoid browser caching
        queryParams.append("_t", Date.now().toString())

        // Make API request with exponential backoff
        let attempt = 0
        const maxAttempts = 3
        let response = null
        
        while (attempt < maxAttempts && !response) {
          if (attempt > 0) {
            // Exponential backoff - wait longer between each retry
            const backoffDelay = Math.pow(2, attempt) * 1000
            console.log(`Retry attempt ${attempt}/${maxAttempts}, waiting ${backoffDelay}ms`)
            await new Promise(resolve => setTimeout(resolve, backoffDelay))
          }
          
          try {
            response = await api.get<RestaurantsResponse>(`/api/restaurants?${queryParams.toString()}`)
          } catch (backoffErr: any) {
            attempt++
            if (backoffErr.response?.status === 429) {
              // Don't keep retrying on rate limit errors - we'll handle these separately
              throw backoffErr
            }
            if (attempt >= maxAttempts) {
              throw backoffErr
            }
            console.log(`Request failed (attempt ${attempt}/${maxAttempts}): ${backoffErr.message}`)
          }
        }

        // Reset rate limiting if we were previously rate limited
        if (isRateLimited) {
          setIsRateLimited(false)
          setRetryAfter(0)
        }

        // Process response data
        const { restaurants: fetchedRestaurants, pagination } = response.data.data

        // Enhance restaurant data with additional UI fields
        const enhancedRestaurants = fetchedRestaurants.map(enhanceRestaurantData)

        // Update state based on whether we're refreshing, loading more, or initial load
        if (refresh || pageNum === 1) {
          setRestaurants(enhancedRestaurants)
          // Update cache for first page
          cachedRestaurants.current = enhancedRestaurants
          cacheTimestamp.current = Date.now()
          console.log("Updated cache at", new Date(cacheTimestamp.current).toLocaleTimeString())
        } else {
          setRestaurants((prev) => [...prev, ...enhancedRestaurants])
        }

        // Update pagination info
        setHasMore(pagination.hasNext)
        setTotalRestaurants(pagination.total)
        setPage(pagination.currentPage)

        // Clear any existing errors
        setError(null)
        
        console.log(`Successfully fetched ${enhancedRestaurants.length} restaurants for page ${pageNum}`)
      } catch (err: any) {
        // Handle rate limiting (429 Too Many Requests)
        if (err.response && err.response.status === 429) {
          // Get retry-after header or default to 60 seconds
          const retryAfterHeader = err.response.headers?.["retry-after"]
          const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60
          
          console.log(`Rate limited detected. API suggests waiting ${retryAfterSeconds} seconds`)
          console.log("Rate limited detected, but ignoring for testing")
          
          // Set rate limiting state
          setIsRateLimited(true)
          setRetryAfter(retryAfterSeconds)
          
          // Use cached data if available
          if (cachedRestaurants.current.length > 0) {
            console.log("Using cached data due to rate limiting")
            setRestaurants(cachedRestaurants.current)
            setError("Rate limited. Using cached data.")
          } else {
            setError(`Rate limited. Please try again in ${retryAfterSeconds} seconds`)
          }
          
          // Schedule automatic retry with a longer delay than suggested
          // to ensure we don't hit rate limits again
          const actualRetryDelay = retryAfterSeconds * 1500 // 1.5x the suggested wait time
          console.log(`Will retry automatically after ${actualRetryDelay/1000} seconds`)
          
          retryTimeoutRef.current = setTimeout(() => {
            console.log("Attempting retry after rate limit cooldown")
            setIsRateLimited(false)
            setRetryAfter(0)
            fetchRestaurants(pageNum, refresh)
          }, actualRetryDelay)
        } else {
          // Handle other errors
          const apiError = err as ApiError
          const errorMessage = apiError.message || "Failed to load restaurants"
          console.error("Error fetching restaurants:", errorMessage)
          setError(errorMessage)

          // If this is not the first page, we still keep previous results
          if (pageNum === 1 && cachedRestaurants.current.length > 0) {
            console.log("Using cached data due to API error")
            setRestaurants(cachedRestaurants.current)
          } else if (pageNum === 1) {
            setRestaurants([])
          }
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
        
        // Mark that the request is complete
        isRequestPendingRef.current = false
        
        // Process any queued requests
        if (pendingRequestParamsRef.current) {
          const { page, refresh } = pendingRequestParamsRef.current
          pendingRequestParamsRef.current = null
          console.log(`Processing queued request after completion: page ${page}, refresh: ${refresh}`)
          
          // Small delay to prevent immediate re-request
          setTimeout(() => {
            fetchRestaurants(page, refresh)
          }, 300)
        }
      }
    },
    [filters, enhanceRestaurantData, isRateLimited, retryAfter]
  )

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    if (isMounted) {
      fetchRestaurants()
    }
  }, [fetchRestaurants, isMounted])

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRestaurants(1, true)
  }, [fetchRestaurants])

  // Handle loading more data (pagination/infinite scroll)
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !refreshing) {
      setLoadingMore(true)
      fetchRestaurants(page + 1)
    }
  }, [fetchRestaurants, hasMore, loadingMore, page, refreshing])

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: prev[key] === value ? "" : value, // Toggle if already selected
      }))
    },
    []
  )

  // Apply filters (for performance optimization, debounce search)
  const applyFilters = useCallback(() => {
    setLoading(true)
    fetchRestaurants(1)
  }, [fetchRestaurants])

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(applyFilters, 500) // Debounce for better UX
    return () => clearTimeout(timeoutId)
  }, [filters, applyFilters])

  // Filter restaurants client-side for price and language (these aren't supported by the API)
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesPrice = filters.price ? restaurant.price === filters.price : true
    const matchesLanguage = filters.language
      ? restaurant.languages && restaurant.languages.includes(filters.language)
      : true
    return matchesPrice && matchesLanguage
  })

  // Loading skeleton component
  const renderSkeleton = useCallback(() => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={`skeleton-${index}`} style={[styles.restaurantCard, { backgroundColor: colors.card }]}>
          <View style={[styles.skeletonImage, { backgroundColor: colors.border }]} />
          <View style={styles.restaurantContent}>
            <View style={[styles.skeletonTitle, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: "70%" }]} />
            <View style={styles.buttonContainer}>
              <View style={[styles.skeletonButton, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonButton, { backgroundColor: colors.border }]} />
            </View>
          </View>
        </Card>
      ))
  }, [colors.border, colors.card])

  // Footer component for FlatList (loading indicator for infinite scroll)
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.blue[600]} />
        <Text style={[styles.loadingMoreText, { color: colors.text }]}>{getTranslation("restaurants.loadingMore")}</Text>
      </View>
    )
  }, [loadingMore, colors.blue, colors.text, t])

  // Empty state component when no restaurants are found
  const renderEmptyState = useCallback(() => {
    if (loading && !refreshing) return null
    return (
      <View style={styles.emptyState}>
        <Ionicons name="restaurant-outline" size={60} color={colors.text + "40"} />
        <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>{t("restaurants.noResults")}</Text>
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: colors.blue[600] }]}
          onPress={() => {
            setFilters({
              search: "",
              cuisine: "",
              price: "",
              language: "",
            })
          }}
        >
          <Text style={styles.emptyStateButtonText}>{t("restaurants.clearFilters")}</Text>
        </TouchableOpacity>
      </View>
    )
  }, [loading, refreshing, colors.text, colors.blue, t])

  // Error state component
  const renderError = useCallback(() => {
    if (!error) return null
    return (
      <View style={[styles.errorState, { backgroundColor: colors.error + "10" }]}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.blue[600] }]}
          onPress={() => {
            setLoading(true)
            setError(null)
            fetchRestaurants(1, true)
          }}
        >
          <Text style={styles.retryButtonText}>{t("restaurants.retry")}</Text>
        </TouchableOpacity>
      </View>
    )
  }, [error, colors.error, colors.blue, fetchRestaurants, t])

  // Restaurant card component
  const renderRestaurantItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <TouchableOpacity
        style={styles.restaurantCardWrapper}
        onPress={() =>
          navigation.navigate("RestaurantDetail", { id: item.restaurantId, name: item.name })
        }
        activeOpacity={0.7}
      >
        <Card style={[styles.restaurantCard, { backgroundColor: colors.card }]}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image || DEFAULT_RESTAURANT_IMAGE }}
              style={styles.restaurantImage}
              // Handle image loading errors
              onError={(e) => {
                console.log("Image loading error", e.nativeEvent.error)
                // The component will use the fallback image via the default props
              }}
            />
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
                <Ionicons
                  name="restaurant-outline"
                  size={16}
                  color={colors.blue[500]}
                  style={styles.detailIcon}
                />
                <Text style={[styles.detailText, { color: colors.text + "90" }]}>{item.cuisineType}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.blue[500]}
                  style={styles.detailIcon}
                />
                <Text style={[styles.detailText, { color: colors.text + "90" }]}>{item.address}</Text>
              </View>
            </View>

            <View style={styles.languagesContainer}>
              {item.languages &&
                item.languages.map((language: string) => (
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
                onPress={() =>
                  navigation.navigate("RestaurantDetail", { id: item.restaurantId, name: item.name })
                }
              >
                <Text style={[styles.detailsButtonText, { color: colors.gold[700] }]}>
                  {t("restaurants.viewDetails")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: colors.blue[600] }]}
                onPress={() =>
                  navigation.navigate("NuevaSesion", {
                    restaurantId: item.restaurantId,
                    restaurantName: item.name,
                  })
                }
              >
                <Text style={styles.bookButtonText}>{t("restaurants.book")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    ),
    [colors, navigation, t]
  )

  // Verification of safety to ensure that colors is defined
  if (!isMounted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text>{t("restaurants.loading")}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search and Filter Header */}
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
            value={filters.search}
            onChangeText={(text) => setFilters((prev) => ({ ...prev, search: text }))}
          />
          {filters.search ? (
            <TouchableOpacity
              onPress={() => setFilters((prev) => ({ ...prev, search: "" }))}
              style={styles.clearSearch}
            >
              <Ionicons name="close-circle" size={16} color={colors.text + "80"} />
            </TouchableOpacity>
          ) : null}
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

      {/* Results Count Banner */}
      {!loading && !error && filteredRestaurants.length > 0 && (
        <View
          style={[
            styles.resultsBanner,
            {
              backgroundColor: colors.blue[50],
              borderColor: colors.blue[100],
            },
          ]}
        >
          <Text style={[styles.resultsText, { color: colors.blue[700] }]}>
            {t("restaurants.resultsCount").replace(
              "{count}",
              filteredRestaurants.length.toString()
            )}
          </Text>
        </View>
      )}

      {/* Error Message */}
      {renderError()}

      {/* Filters */}
      {showFilters && (
        <Card style={[styles.filtersCard, { backgroundColor: colors.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{t("restaurants.price")}</Text>
              <View style={styles.priceButtons}>
                {PRICE_RANGES.map((price: string) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceButton,
                      {
                        backgroundColor: filters.price === price ? colors.gold[100] : colors.background,
                        borderColor: filters.price === price ? colors.gold[400] : colors.border,
                      },
                    ]}
                    onPress={() => handleFilterChange("price", price)}
                  >
                    <Text
                      style={[
                        styles.priceButtonText,
                        { color: filters.price === price ? colors.gold[700] : colors.text },
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
                        backgroundColor: filters.cuisine === cuisine ? colors.blue[100] : colors.background,
                        borderColor: filters.cuisine === cuisine ? colors.blue[400] : colors.border,
                      },
                    ]}
                    onPress={() => handleFilterChange("cuisine", cuisine)}
                  >
                    <Text
                      style={[
                        styles.cuisineButtonText,
                        { color: filters.cuisine === cuisine ? colors.blue[700] : colors.text },
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
                {["Inglés", "Italiano", "Japonés", "Francés", "Español", "Alemán"].map(
                  (language: string) => (
                    <TouchableOpacity
                      key={language}
                      style={[
                        styles.languageButton,
                        {
                          backgroundColor:
                            filters.language === language ? colors.purple[100] : colors.background,
                          borderColor:
                            filters.language === language ? colors.purple[400] : colors.border,
                        },
                      ]}
                      onPress={() => handleFilterChange("language", language)}
                    >
                      <Text
                        style={[
                          styles.languageButtonText,
                          { color: filters.language === language ? colors.purple[700] : colors.text },
                        ]}
                      >
                        {language}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </ScrollView>

          {/* Clear filters button */}
          {(filters.search || filters.cuisine || filters.price || filters.language) && (
            <TouchableOpacity
              style={[styles.clearFiltersButton, { backgroundColor: colors.error + "10" }]}
              onPress={() => {
                setFilters({
                  search: "",
                  cuisine: "",
                  price: "",
                  language: "",
                })
              }}
            >
              <Ionicons name="close-circle-outline" size={16} color={colors.error} />
              <Text style={[styles.clearFiltersText, { color: colors.error }]}>
                {t("restaurants.clearFilters")}
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Main Content - List or Map View */}
      {view === "list" ? (
        <>
          {loading && !refreshing && !loadingMore ? (
            <ScrollView
              style={styles.listContainer}
              contentContainerStyle={styles.skeletonContainer}
              showsVerticalScrollIndicator={false}
            >
              {renderSkeleton()}
            </ScrollView>
          ) : (
            <FlatList
              ref={flatListRef}
              data={filteredRestaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.restaurantId.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.blue[600]]}
                  tintColor={colors.blue[600]}
                />
              }
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={10}
              removeClippedSubviews={Platform.OS !== "web"}
              getItemLayout={(data, index) => ({
                length: 320, // Approximate height of each item
                offset: 320 * index,
                index,
              })}
            />
          )}
        </>
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
                  key={restaurant.restaurantId}
                  style={[
                    styles.mapRestaurantItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() =>
                    navigation.navigate("RestaurantDetail", {
                      id: restaurant.restaurantId,
                      name: restaurant.name,
                    })
                  }
                >
                  <Image source={{ uri: restaurant.image }} style={styles.mapRestaurantImage} />
                  <View style={styles.mapRestaurantInfo}>
                    <Text style={[styles.mapRestaurantName, { color: colors.text }]}>
                      {restaurant.name}
                    </Text>
                    <Text style={[styles.mapRestaurantLocation, { color: colors.text + "80" }]}>
                      {restaurant.address}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.blue[400]} />
                </TouchableOpacity>
              ))}
              {filteredRestaurants.length > 3 && (
                <TouchableOpacity
                  style={[
                    styles.viewAllButton,
                    { backgroundColor: colors.blue[50], borderColor: colors.blue[200] },
                  ]}
                  onPress={() => setView("list")}
                >
                  <Text style={[styles.viewAllText, { color: colors.blue[700] }]}>
                    {t("restaurants.viewAll").replace(
                      "{count}",
                      filteredRestaurants.length.toString()
                    )}
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
    gap: 10,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 12,
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
  clearSearch: {
    padding: 8,
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
  resultsBanner: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "500",
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
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  skeletonContainer: {
    paddingBottom: 16,
    gap: 20,
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
  skeletonImage: {
    height: 180,
    width: "100%",
  },
  skeletonTitle: {
    height: 24,
    width: "70%",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 16,
    width: "100%",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonButton: {
    height: 36,
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 4,
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
  loadingMore: {
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorState: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
})