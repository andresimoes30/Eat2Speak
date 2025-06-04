import { useContext, useState, useMemo } from "react"
import { View, Text, Image, ScrollView, Switch, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Notification, Session, mockData } from "./AppTypes"
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
  
  // Get restaurant details from their IDs
  const selectedRestaurantsDetails = useMemo(() => {
    return mockData.restaurants.filter(restaurant => 
      appState.selectedRestaurants.includes(restaurant.id)
    );
  }, [appState.selectedRestaurants]);
  
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
  
  // State for session details modal
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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

      {/* Restaurant Selection Card */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('NativeSelectRestaurants')}
        activeOpacity={0.7}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t("native.selectRestaurants")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t("native.restaurants.selectionDescription")}
          </Text>
          
          <View style={styles.restaurantPreview}>
            {selectedRestaurantsDetails.length > 0 ? (
              <View style={styles.selectedRestaurantsSummary}>
                <View style={styles.restaurantCountBadge}>
                  <Text style={styles.restaurantCountText}>
                    {selectedRestaurantsDetails.length} {t(selectedRestaurantsDetails.length === 1 
                      ? "native.restaurants.singleCount" 
                      : "native.restaurants.multipleCount")}
                  </Text>
                </View>
                <Text style={[styles.restaurantInfoText, { color: colors.textSecondary }]}>
                  {selectedRestaurantsDetails.length > 0 
                    ? selectedRestaurantsDetails.map(r => r.name).slice(0, 2).join(', ') + 
                      (selectedRestaurantsDetails.length > 2 ? ` ${t("native.restaurants.andMore", { count: selectedRestaurantsDetails.length - 2 })}` : '')
                    : t("native.restaurants.noSelection")
                  }
                </Text>
              </View>
            ) : (
              <View style={styles.noRestaurantsSelected}>
                <Ionicons name="restaurant-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.noRestaurantsText, { color: colors.textSecondary }]}>
                  {t("native.selectRestaurants")}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>

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
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 14,
  },
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