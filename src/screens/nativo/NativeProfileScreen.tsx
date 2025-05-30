import React, { useState, useContext } from "react"
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType, Notification, Restaurant, mockData } from "./AppTypes"
import { useLanguage } from "../../contexts/LanguageContext"
import { useTheme } from "../../contexts/ThemeContext"
import { Language } from "../../translations"

// Define the parameter list for the Native Navigator stack
type NativeStackParamList = {
  NativeProfileMain: undefined;
  NativePersonalInfo: undefined;
  NativeSecurity: undefined;
  NativeNotifications: undefined;
  NativeHelpSupport: undefined;
  NativeTermsConditions: undefined;
  NativeAvailabilityMain: undefined;
  NativeSelectRestaurants: undefined;
};

// Define the navigation prop type
type NativeProfileNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativeProfileMain'
>;

// Language options with names and flags
const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
]

export default function NativeProfileScreen() {
  const { appState, updateAppState } = useContext(AppContext) as AppContextType
  const navigation = useNavigation<NativeProfileNavigationProp>();
  const { language, setLanguage, t } = useLanguage()
  const { colors, theme, toggleTheme } = useTheme()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showBugHuntModal, setShowBugHuntModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [isAvailable, setIsAvailable] = useState(appState.isAvailable)
  
  // Get restaurant details from their IDs
  const selectedRestaurantsDetails = React.useMemo(() => {
    return mockData.restaurants.filter(restaurant => 
      appState.selectedRestaurants.includes(restaurant.id)
    );
  }, [appState.selectedRestaurants]);

  const toggleAvailability = (value: boolean) => {
    setIsAvailable(value);
    updateAppState({ isAvailable: value });
    setShowAvailabilityModal(false);
  };
  
  const [bugHuntForm, setBugHuntForm] = useState({
    email: "usuario@example.com",
    name: appState.user.name || "Usuario",
    description: "",
    hasScreenshot: false,
    screenshotUri: ""
  })

  // Get user initials for avatar
  const getUserInitials = () => {
    const nameParts = appState.user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };
  
  const handleLanguageChange = async (languageCode: Language) => {
    await setLanguage(languageCode)
    setShowLanguageModal(false)
  }

  // Helper function to get language name from code
  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.code === code)
    return language ? language.name : "Español"
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 42 }]}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={[styles.initialsAvatar, { backgroundColor: colors.blue[500] }]}>
            <Text style={styles.initialsText}>{getUserInitials()}</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {appState.user.name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.text + "80" }]}>
              {"usuario@example.com"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile.account")}</Text>

        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("NativePersonalInfo")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="person-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.personalInfo")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("NativeSecurity")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.security")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile.preferences")}</Text>

        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("NativeAvailabilityMain")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.availability")}</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: colors.text + "60" }]}>
                {appState.availableDays.length} {t("native.profile.days")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => toggleTheme()}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name={theme === "dark" ? "moon" : "moon-outline"} size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.darkMode")}</Text>
            </View>
            <View style={styles.toggleContainer}>
              <View 
                style={[
                  styles.toggleSwitch, 
                  { 
                    backgroundColor: theme === "dark" ? colors.primary + "80" : colors.border 
                  }
                ]}
              >
                <View 
                  style={[
                    styles.toggleHandle, 
                    { 
                      transform: [{ translateX: theme === "dark" ? 24 : 0 }],
                      backgroundColor: theme === "dark" ? colors.primary : '#f4f3f4'
                    }
                  ]} 
                />
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="language-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.language")}</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: colors.text + "60" }]}>{getLanguageName(language)}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile.more")}</Text>

        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("NativeHelpSupport")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="help-circle-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.help")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => setShowBugHuntModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.gold[50] }]}>
                <Ionicons name="bug-outline" size={20} color={colors.gold[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.bugHunt")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("NativeTermsConditions")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.terms")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => {
            // Logout functionality
            // Reset app state and navigate to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: "NativeProfileMain" }],
            });
            // Aqui seria chamada a função de logout da API/Auth Context
          }}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.error + "15" }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.error }]}>{t("profile.logout")}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: colors.text + "60" }]}>{t("profile.version")}</Text>
      </View>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("language.select")}</Text>
            
            <View style={styles.languageList}>
              {languages.map((langOption) => (
                <TouchableOpacity
                  key={langOption.code}
                  style={[
                    styles.languageOption,
                    language === langOption.code && {
                      backgroundColor: colors.primary + "15", 
                      borderColor: colors.primary 
                    },
                  ]}
                  onPress={() => handleLanguageChange(langOption.code as Language)}
                >
                  <Text style={styles.languageFlag}>{langOption.flag}</Text>
                  <Text style={[styles.languageName, { color: colors.text }]}>{langOption.name}</Text>
                  {language === langOption.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t("language.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bug Hunt Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showBugHuntModal}
        onRequestClose={() => setShowBugHuntModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, width: "90%", maxHeight: "80%" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("bugHunt.title")}</Text>
            <ScrollView style={styles.bugHuntForm}>
              <Text style={[styles.formLabel, { color: colors.text }]}>{t("bugHunt.email")}</Text>
              <TextInput
                style={[styles.formInput, { 
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border 
                }]}
                value={bugHuntForm.email}
                onChangeText={(text) => setBugHuntForm({...bugHuntForm, email: text})}
                placeholder={t("bugHunt.emailPlaceholder")}
                placeholderTextColor={colors.text + "60"}
              />

              <Text style={[styles.formLabel, { color: colors.text }]}>{t("bugHunt.name")}</Text>
              <TextInput
                style={[styles.formInput, { 
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border 
                }]}
                value={bugHuntForm.name}
                onChangeText={(text) => setBugHuntForm({...bugHuntForm, name: text})}
                placeholder={t("bugHunt.namePlaceholder")}
                placeholderTextColor={colors.text + "60"}
              />

              <Text style={[styles.formLabel, { color: colors.text }]}>{t("bugHunt.description")}</Text>
              <TextInput
                style={[styles.formTextArea, { 
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  textAlignVertical: 'top'
                }]}
                value={bugHuntForm.description}
                onChangeText={(text) => setBugHuntForm({...bugHuntForm, description: text})}
                placeholder={t("bugHunt.descriptionPlaceholder")}
                placeholderTextColor={colors.text + "60"}
                multiline
                numberOfLines={5}
              />

              <View style={styles.screenshotSection}>
                <Text style={[styles.formLabel, { color: colors.text }]}>{t("bugHunt.addScreenshot")}</Text>
                
                {bugHuntForm.hasScreenshot ? (
                  <View style={styles.screenshotPreview}>
                    <Image 
                      source={{ uri: bugHuntForm.screenshotUri || 'https://via.placeholder.com/150' }} 
                      style={styles.screenshotImage} 
                    />
                    <TouchableOpacity 
                      style={[styles.removeButton, { backgroundColor: colors.error + "20" }]}
                      onPress={() => setBugHuntForm({...bugHuntForm, hasScreenshot: false, screenshotUri: ""})}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.uploadButton, { borderColor: colors.border, borderStyle: 'dashed' }]}
                    onPress={() => setBugHuntForm({...bugHuntForm, hasScreenshot: true, screenshotUri: "https://via.placeholder.com/300"})}
                  >
                    <Ionicons name="camera-outline" size={24} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>{t("bugHunt.uploadScreenshot")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowBugHuntModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t("bugHunt.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  // Handle form submission here
                  setShowBugHuntModal(false);
                }}
              >
                <Text style={styles.submitButtonText}>{t("bugHunt.submit")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Availability Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAvailabilityModal}
        onRequestClose={() => setShowAvailabilityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, width: "90%", maxWidth: 450 }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("native.availability.title.modal")}
            </Text>
            
            <Text style={[styles.modalDescription, { color: colors.text }]}>
              {t("native.availability.description")}
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
                  {t("native.availability.noRestaurants")}
                </Text>
              )}
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowAvailabilityModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t("native.availability.cancelButton")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={() => toggleAvailability(true)}
              >
                <Text style={styles.submitButtonText}>{t("native.availability.confirmButton")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  formTextArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  bugHuntForm: {
    marginBottom: 20,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  screenshotSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  uploadButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  uploadText: {
    marginTop: 12,
    fontWeight: '500',
  },
  screenshotPreview: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  screenshotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  languageList: {
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButtonText: {
    fontWeight: "500",
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  initialsAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
  },
  menuCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValue: {
    marginRight: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  versionText: {
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
    fontSize: 14,
  },
  // Toggle switch styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleSwitch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  // Availability modal styles
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  restaurantList: {
    marginBottom: 24,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
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
    fontWeight: '500',
    marginBottom: 2,
  },
  restaurantAddress: {
    fontSize: 14,
  },
  noRestaurantsText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});