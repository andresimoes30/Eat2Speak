"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { Language } from "../../translations"
import api from "../../../services/api"

// Language options with names and flags
const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
]

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showBugHuntModal, setShowBugHuntModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [bugHuntForm, setBugHuntForm] = useState({
    email: user?.email || "",
    name: user ? `${user.firstName} ${user.lastName}` : "",
    description: "",
    hasScreenshot: false,
    screenshotUri: ""
  })

  // Fetch user profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Try path without /api prefix since the API client might be adding it automatically
        const response = await api.get('/user/me')
        setProfileData(response.data)
        console.log('Profile data loaded successfully:', response.data)
      } catch (err: any) {
        console.error('Error fetching profile data:', err)
        
        // Attempt to show a more helpful error message
        let errorMessage = 'Failed to load profile data'
        if (err.response) {
          // The request was made and the server responded with a status code
          errorMessage = `Server error: ${err.response.status}`
          console.log('Error response:', err.response.data)
          
          // Try a fallback endpoint if the first one failed with 404
          if (err.response.status === 404) {
            try {
              console.log('Trying alternative endpoint...')
              const fallbackResponse = await api.get('/user/profile')
              setProfileData(fallbackResponse.data)
              console.log('Profile data loaded from fallback endpoint:', fallbackResponse.data)
              setError(null)
              setIsLoading(false)
              return
            } catch (fallbackErr) {
              console.error('Fallback endpoint also failed:', fallbackErr)
              errorMessage = 'Could not find user profile endpoint'
            }
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server'
        } else {
          // Something happened in setting up the request
          errorMessage = err.message || 'Unknown error'
        }
        
        setError(errorMessage)
        // Continue using existing user data from AuthContext as fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  // Helper function to get user's full name
  const getUserFullName = () => {
    if (profileData) {
      return `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
    }
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return ''
  }

  // Helper function to get user's email
  const getUserEmail = () => {
    if (profileData) {
      return profileData.email
    }
    if (user) {
      return user.email
    }
    return ''
  }

  // Helper function to get user's initials for avatar
  const getUserInitials = () => {
    const fullName = getUserFullName()
    if (!fullName) return ''
    
    const nameParts = fullName.split(' ').filter(part => part.length > 0)
    if (nameParts.length === 0) return ''
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase()
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

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
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.initialsText}>{getUserInitials()}</Text>
            )}
          </View>
          <View>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            ) : (
              <>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {getUserFullName()}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.text + "80" }]}>
                  {getUserEmail()}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile.account")}</Text>

        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("PersonalInfo" as never)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="person-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.personalInfo")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Security" as never)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.security")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile.preferences")}</Text>

        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Notifications" as never)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.notifications")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="language-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.language")}</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: colors.text + "60" }]}>{getLanguageName(language)}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
            </View>
          </TouchableOpacity>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile.more")}</Text>

        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("HelpSupport" as never)}>
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

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("TermsConditions" as never)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t("profile.terms")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => signOut()}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.error + "15" }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.error }]}>{t("profile.logout")}</Text>
            </View>
          </TouchableOpacity>
        </Card>

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
                  alert('Bug report submitted! Thank you for your feedback.');
                  setShowBugHuntModal(false);
                }}
              >
                <Text style={styles.submitButtonText}>{t("bugHunt.submit")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
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
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
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
  editButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    fontWeight: "600",
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
    padding: 0,
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
})
