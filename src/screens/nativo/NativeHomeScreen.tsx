import { useContext, useState, useMemo, useEffect } from "react"
import { View, Text, Image, ScrollView, Switch, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Notification, Session, Restaurant, mockData } from "./AppTypes"
import * as favoriteApi from "../../../services/favoriteApi"
import * as restaurantApi from "../../../services/restaurantApi"
import * as userApi from "../../../services/userApi"
import { useLanguage } from "../../contexts/LanguageContext"

// Define the parameter list for the HomeStack navigator
type HomeStackParamList = {
  NativeHomeMain: undefined;
  NativeSelectRestaurants: undefined;
  NativeHistoryMain: undefined; // Added for cross-stack navigation
};

// Define the navigation prop type
type HomeScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'NativeHomeMain'
>;

// Handle both API response and mock data for favorites
interface RestaurantWithFavorite extends Restaurant {
  isFavorite: boolean;
}

// ProgressBar component for language teaching progress
const ProgressBar = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View 
        style={[
          styles.progressBarFill, 
          { width: `${progress}%`, backgroundColor: color }
        ]} 
      />
    </View>
  )
}

// Card component to maintain consistent styling
const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )
}

export default function NativeHomeScreen() {
  const { appState, updateAppState } = useContext(AppContext) as AppContextType
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useLanguage();
  
  // Use local state to track availability to ensure UI updates immediately
  const [isAvailable, setIsAvailable] = useState(appState.isAvailable)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  
  // State for favorite restaurants
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<RestaurantWithFavorite[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([])
  
  // State for session details modal
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  
  // Get restaurant details from their IDs
  const selectedRestaurantsDetails = useMemo(() => {
    return mockData.restaurants.filter(restaurant => 
      appState.selectedRestaurants.includes(restaurant.id)
    );
  }, [appState.selectedRestaurants]);
  
  // Fetch favorite restaurants on component mount
  useEffect(() => {
    fetchFavoriteRestaurants()
  }, [])
  
  // Function to fetch favorite restaurants
  const fetchFavoriteRestaurants = async () => {
    setLoadingFavorites(true)
    setFavoritesError(null)
    
    try {
      // Fetch favorites from the real API
      const favorites = await favoriteApi.getFavoriteRestaurants();
      
      // Process the returned favorites and add image URLs
      const favoritesWithImages = favorites.map(restaurant => ({
        ...restaurant,
        id: restaurant.restaurantid || restaurant.id,
        cuisine: restaurant.cuisineType || restaurant.cuisine,
        location: restaurant.address || restaurant.location,
        // Generate additional properties if they don't exist in the API response
        rating: restaurant.rating || (Math.random() * 2 + 3).toFixed(1),
        languages: restaurant.languages || getRandomLanguages(),
        available: true,
        isFavorite: true,
        imageUrl: restaurantApi.getRestaurantImage(restaurant.restaurantid || restaurant.id)
      }));
      
      setFavoriteRestaurants(favoritesWithImages);
      setLoadingFavorites(false);
    } catch (error) {
      console.error("Error fetching favorite restaurants:", error)
      setFavoritesError("Failed to load favorite restaurants")
      setLoadingFavorites(false)
    }
  }
  
  // Toggle favorite status of a restaurant
  const toggleFavorite = async (restaurantId: number) => {
    // Add restaurant ID to updating list to show loading indicator
    setUpdatingFavorites(prev => [...prev, restaurantId])
    
    try {
      // Check if restaurant is already a favorite
      const isCurrentlyFavorite = favoriteRestaurants.some(r => r.id === restaurantId && r.isFavorite)
      
      if (isCurrentlyFavorite) {
        // Remove from favorites - make real API call
        await favoriteApi.removeFromFavorites(restaurantId)
        
        // Update local state
        setFavoriteRestaurants(prev => 
          prev.filter(restaurant => restaurant.id !== restaurantId)
        )
        
        // Show success message
        Alert.alert(
          t("native.favorites.removedTitle") || "Removed from Favorites",
          t("native.favorites.removedMessage") || "Restaurant removed from your favorites"
        )
      } else {
        try {
          // Add to favorites - make real API call
          await favoriteApi.addToFavorites(restaurantId)
          
          // Fetch the restaurant details
          const restaurant = await restaurantApi.getRestaurantDetails(restaurantId)
          
          // Update local state with the fetched restaurant
          setFavoriteRestaurants(prev => [
            ...prev,
            { 
              ...restaurant,
              isFavorite: true
            } as RestaurantWithFavorite
          ])
          
          // Show success message
          Alert.alert(
            t("native.favorites.addedTitle") || "Added to Favorites",
            t("native.favorites.addedMessage") || "Restaurant added to your favorites"
          )
        } catch (error) {
          console.error("Error adding restaurant to favorites:", error)
          Alert.alert(
            t("native.favorites.errorTitle") || "Error",
            t("native.favorites.errorAddingMessage") || "Failed to add restaurant to favorites"
          )
        }
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error)
      Alert.alert(
        t("native.favorites.errorTitle") || "Error",
        t("native.favorites.errorMessage") || "Failed to update favorites"
      )
    } finally {
      // Remove from updating list
      setUpdatingFavorites(prev => prev.filter(id => id !== restaurantId))
    }
  }
  
  const toggleAvailability = () => {
    if (!isAvailable) {
      // If currently not available and trying to become available,
      // show the confirmation modal
      setShowAvailabilityModal(true);
    } else {
      // If turning off availability, just do it directly
      setIsAvailable(false);
      updateAppState({ 
        isAvailable: false,
        user: {
          ...appState.user,
          isAvailable: false
        }
      });
      
      Alert.alert(
        t("native.availability.unavailableTitle"),
        t("native.availability.unavailableMessage"),
        [{ text: t("common.ok") }]
      );
    }
  }
  
  const confirmAvailability = () => {
    // Update local state
    setIsAvailable(true);
    
    // Update context state
    updateAppState({ 
      isAvailable: true,
      user: {
        ...appState.user,
        isAvailable: true
      }
    });
    
    // Close the modal
    setShowAvailabilityModal(false);
  }

  // Helper function to generate random languages - only used if API doesn't provide them
  const getRandomLanguages = (): string[] => {
    const allLanguages = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão'];
    const numLanguages = Math.floor(Math.random() * 2) + 1; // 1 to 2 languages
    
    const languages: string[] = [];
    for (let i = 0; i < numLanguages; i++) {
      const randomIndex = Math.floor(Math.random() * allLanguages.length);
      const language = allLanguages[randomIndex];
      
      if (!languages.includes(language)) {
        languages.push(language);
      }
    }
    
    return languages;
  };
  const unreadNotifications = appState.notifications.filter((n: Notification) => !n.read).length
  
  // Theme colors (simplified version since we don't have ThemeContext)
  const colors = {
    background: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    error: '#dc2626',
    success: '#10b981',
    card: '#ffffff',
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      500: '#8b5cf6',
      700: '#6d28d9',
      900: '#4c1d95'
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      900: '#78350f'
    }
  }
  
  // Handle showing session details
  const handleShowDetails = (session: Session) => {
    setSelectedSession(session)
    setDetailsModalVisible(true)
  }
  
  // Handle session cancellation
  const handleCancelSession = (sessionId: number) => {
    Alert.alert(
      t("native.session.cancelTitle"),
      t("native.session.cancelConfirmation"),
      [
        {
          text: t("common.cancel"),
          style: "cancel"
        },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: () => {
            // In a real app, you would call an API here
            Alert.alert(
              t("native.session.cancelledTitle"),
              t("native.session.cancelledMessage"),
              [{ text: t("common.ok") }]
            )
          }
        }
      ]
    )
  }
  
  // Session details modal
  const renderSessionDetailsModal = () => {
    if (!selectedSession) return null

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("native.session.details")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("native.session.student")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.student}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="globe-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("native.session.language")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.language}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("native.session.restaurant")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.restaurant}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text + "80" }]}>
                    {t("native.session.dateAndTime")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedSession.date} {t("session.at")} {selectedSession.time}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.error + "30" }]}
                onPress={() => {
                  setDetailsModalVisible(false)
                  if (selectedSession.id) {
                    handleCancelSession(selectedSession.id)
                  }
                }}
              >
                <Text style={{ color: colors.error }}>{t("native.session.cancel")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={{ color: "white" }}>{t("common.close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            {t("native.home.greeting")}, {appState.user.name.split(' ')[0]}
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
            {t("native.home.subtitle")}
          </Text>
        </View>

        {/* Availability Status */}
        <Card style={styles.availabilityCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.availability.status")}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t("native.availability.statusDescription")}
          </Text>
          
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityStatusContainer}>
              <View style={[
                styles.availabilityStatusIndicator, 
                { backgroundColor: isAvailable ? colors.success : colors.error + "50" }
              ]} />
              <Text style={[styles.availabilityStatusText, { color: isAvailable ? colors.success : colors.text }]}>
                {isAvailable ? t("native.availability.available") : t("native.availability.unavailable")}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#d1d5db', true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        {/* Unified Favorites and Restaurant Selection Section */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t("native.favorites.title") || "Favorite Restaurants"}
            </Text>
            <TouchableOpacity onPress={fetchFavoriteRestaurants}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t("native.favorites.subtitle") || "Restaurants you've marked as favorites"}
          </Text>
          
          {loadingFavorites ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {t("native.favorites.loading") || "Loading favorites..."}
              </Text>
            </View>
          ) : favoritesError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{favoritesError}</Text>
              <TouchableOpacity 
                style={[styles.retryButton, { borderColor: colors.primary }]}
                onPress={fetchFavoriteRestaurants}
              >
                <Text style={{ color: colors.primary }}>
                  {t("native.favorites.retry") || "Retry"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : favoriteRestaurants.length > 0 ? (
            // User has favorite restaurants - show them
            <View style={styles.favoritesContainer}>
              {favoriteRestaurants.map((restaurant) => (
                <View key={restaurant.id} style={[styles.favoriteItem, { borderColor: colors.border }]}>
                  <View style={styles.favoriteContent}>
                    <View style={styles.favoriteHeader}>
                      <Text style={[styles.favoriteName, { color: colors.text }]}>{restaurant.name}</Text>
                      <View style={styles.favoriteRating}>
                        <Ionicons name="star" size={16} color={colors.gold[600]} />
                        <Text style={styles.favoriteRatingText}>{restaurant.rating}</Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.favoriteLocation, { color: colors.textSecondary }]}>
                      {restaurant.location}
                    </Text>
                    
                    <View style={styles.cuisineBadge}>
                      <Text style={styles.cuisineBadgeText}>{restaurant.cuisine}</Text>
                    </View>
                    
                    <View style={styles.favoriteLanguages}>
                      {restaurant.languages.map((language, index) => (
                        <View key={index} style={styles.languageTag}>
                          <Text style={styles.languageTagText}>{language}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.favoriteAction}
                    onPress={() => toggleFavorite(restaurant.id)}
                    disabled={updatingFavorites.includes(restaurant.id)}
                  >
                    {updatingFavorites.includes(restaurant.id) ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons 
                        name="heart" 
                        size={24} 
                        color={colors.error}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* Add button to select more restaurants */}
              <TouchableOpacity 
                style={[styles.addMoreButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('NativeSelectRestaurants')}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.addMoreButtonText, { color: colors.primary }]}>
                  {t("native.restaurants.addMore") || "Add more restaurants"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // User has no favorites - show restaurant selection prompt
            <TouchableOpacity 
              onPress={() => navigation.navigate('NativeSelectRestaurants')}
              activeOpacity={0.7}
              style={styles.restaurantSelectionPrompt}
            >
              <View style={styles.emptyFavoritesState}>
                <Ionicons name="heart-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  {t("native.favorites.empty") || "You haven't added any favorite restaurants yet"}
                </Text>
                
                <View style={[styles.selectRestaurantsButton, { backgroundColor: colors.primary + "15" }]}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
                  <Text style={[styles.selectRestaurantsText, { color: colors.primary }]}>
                    {t("native.selectRestaurants") || "Select your favorite restaurants"}
                  </Text>
                </View>
                
                <View style={styles.restaurantPreview}>
                  {selectedRestaurantsDetails.length > 0 && (
                    <View style={styles.selectedRestaurantsSummary}>
                      <View style={styles.restaurantCountBadge}>
                        <Text style={styles.restaurantCountText}>
                          {selectedRestaurantsDetails.length} {t(selectedRestaurantsDetails.length === 1 
                            ? "native.restaurants.singleCount" 
                            : "native.restaurants.multipleCount")}
                        </Text>
                      </View>
                      <Text style={[styles.restaurantInfoText, { color: colors.textSecondary }]}>
                        {selectedRestaurantsDetails.map(r => r.name).slice(0, 2).join(', ') + 
                          (selectedRestaurantsDetails.length > 2 ? ` ${t("native.restaurants.andMore", { count: selectedRestaurantsDetails.length - 2 })}` : '')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Card>

        {/* Statistics Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.statistics.title")}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t("native.statistics.subtitle")}
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="people-outline" size={24} color={colors.blue[600]} />
              </View>
              <Text style={[styles.statValue, { color: colors.blue[600] }]}>{mockData.stats.students}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("native.statistics.students")}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="time-outline" size={24} color={(colors.purple as any)[600]} />
              </View>
              <Text style={[styles.statValue, { color: (colors.purple as any)[600] }]}>{mockData.stats.hoursTeached}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("native.statistics.hours")}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.gold[50] }]}>
                <Ionicons name="star-outline" size={24} color={(colors.gold as any)[600]} />
              </View>
              <Text style={[styles.statValue, { color: (colors.gold as any)[600] }]}>{mockData.stats.averageRating}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("native.statistics.rating")}</Text>
            </View>
          </View>
        </Card>

        {/* Upcoming Sessions */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.upcomingSessions.title")}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t("native.upcomingSessions.subtitle")}
          </Text>

          {mockData.upcomingSessions.length > 0 ? (
            <View style={styles.sessionsContainer}>
              {mockData.upcomingSessions.map((session) => (
                <View key={session.id} style={[styles.sessionItem, { borderColor: colors.border }]}>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionTitle, { color: colors.text }]}>
                      {t("native.session.with", { language: session.language, student: session.student })}
                    </Text>
                    <View style={styles.sessionMeta}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={styles.sessionIcon} />
                      <Text style={[styles.sessionMetaText, { color: colors.textSecondary }]}>
                        {session.date} {t("session.at")} {session.time}
                      </Text>
                    </View>
                    <Text style={[styles.sessionLocation, { color: colors.textSecondary }]}>{session.restaurant}</Text>
                  </View>
                  <View style={styles.sessionActions}>
                    <TouchableOpacity 
                      style={[styles.sessionButton, { borderColor: colors.border }]}
                      onPress={() => handleShowDetails(session)}
                    >
                      <Text style={[styles.sessionButtonText, { color: colors.text }]}>{t("native.session.details")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.sessionButton,
                        {
                          borderColor: colors.error + "30",
                          marginTop: 8,
                        },
                      ]}
                      onPress={() => handleCancelSession(session.id)}
                    >
                      <Text style={{ color: colors.error }}>{t("common.cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {t("native.upcomingSessions.empty")}
              </Text>
            </View>
          )}
        </Card>

        {/* Recent Sessions History */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.recentHistory.title")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NativeHistoryMain')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>{t("native.recentHistory.viewAll")} →</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t("native.recentHistory.subtitle")}
          </Text>

          <View style={styles.sessionsContainer}>
            {mockData.recentSessions.slice(0, 2).map((session) => (
              <View key={session.id} style={[styles.sessionItem, { borderColor: colors.border }]}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTitle, { color: colors.text }]}>
                    {t("native.session.with", { language: session.language, student: session.student })}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={styles.sessionIcon} />
                    <Text style={[styles.sessionMetaText, { color: colors.textSecondary }]}>
                      {session.date}
                    </Text>
                  </View>
                  <Text style={[styles.sessionLocation, { color: colors.textSecondary }]}>{session.restaurant}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <View style={[styles.ratingBadge, { backgroundColor: colors.gold[50] }]}>
                    <Ionicons name="star" size={14} color={(colors.gold as any)[600]} />
                    <Text style={[styles.ratingText, { color: colors.gold[700] }]}>{session.rating}</Text>
                  </View>
                  {!session.hasFeedback && (
                    <View style={[styles.outlineBadge, { borderColor: colors.border }]}>
                      <Text style={[styles.outlineBadgeText, { color: colors.textSecondary }]}>{t("native.session.noFeedback")}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>
      
        {/* Session Details Modal */}
        {renderSessionDetailsModal()}
        
        {/* Availability Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAvailabilityModal}
          onRequestClose={() => setShowAvailabilityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t("native.availability.modalTitle")}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowAvailabilityModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalDescription, { color: colors.text }]}>
                {t("native.availability.modalDescription")}
              </Text>
              
              <View style={styles.restaurantList}>
                {selectedRestaurantsDetails.length > 0 ? (
                  selectedRestaurantsDetails.map((restaurant) => (
                    <View key={restaurant.id} style={[styles.restaurantItem, { borderColor: colors.border }]}>
                      <View style={[styles.restaurantIconContainer, { backgroundColor: colors.blue[50] }]}>
                        <Ionicons name="location" size={20} color={colors.blue[600]} />
                      </View>
                      <View style={styles.restaurantInfo}>
                        <Text style={[styles.restaurantName, { color: colors.text }]}>
                          {restaurant.name}
                        </Text>
                        <Text style={[styles.restaurantAddress, { color: colors.text + "80" }]}>
                          {restaurant.address || restaurant.location}
                        </Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noRestaurantsText, { color: colors.text + "80" }]}>
                    {t("native.availability.noRestaurantsSelected")}
                  </Text>
                )}
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowAvailabilityModal(false)}
                >
                  <Text style={{ color: colors.text }}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
                  onPress={confirmAvailability}
                >
                  <Text style={{ color: "white" }}>{t("native.availability.confirm")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Container and general styles
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
  },
  
  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },

  // Availability styles
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  availabilityStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  availabilityStatusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Restaurant preview styles
  restaurantPreview: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  selectedRestaurantsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  restaurantCountBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  restaurantCountText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  restaurantInfoText: {
    flex: 1,
    fontSize: 14,
    flexWrap: 'wrap',
  },
  noRestaurantsSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  
  // Favorites styles
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  favoritesContainer: {
    marginTop: 8,
  },
  favoriteItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteRatingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#b45309',
  },
  favoriteLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  cuisineBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  cuisineBadgeText: {
    fontSize: 12,
    color: '#4b5563',
  },
  favoriteLanguages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  languageTagText: {
    fontSize: 12,
    color: '#2563eb',
  },
  favoriteAction: {
    justifyContent: 'center',
    paddingLeft: 12,
  },

  // ProgressBar styles
  progressContainer: {
    marginTop: 12,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Unified section styles
  restaurantSelectionPrompt: {
    marginTop: 8,
  },
  emptyFavoritesState: {
    alignItems: "center",
    padding: 20,
  },
  selectRestaurantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  selectRestaurantsText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addMoreButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },

  // Stats styles
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },

  // Sessions styles
  sessionsContainer: {
    marginTop: 8,
  },
  sessionItem: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sessionIcon: {
    marginRight: 4,
  },
  sessionMetaText: {
    fontSize: 14,
  },
  sessionLocation: {
    fontSize: 14,
  },
  sessionActions: {
    justifyContent: "center",
  },
  sessionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  sessionButtonText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  outlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineBadgeText: {
    fontSize: 12,
  },
  linkText: {
    fontSize: 14,
  },

  // Restaurant modal styles
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  restaurantList: {
    marginBottom: 20,
    maxHeight: 300,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  restaurantIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
  },
  noRestaurantsText: {
    textAlign: 'center',
    fontSize: 14,
    padding: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
});