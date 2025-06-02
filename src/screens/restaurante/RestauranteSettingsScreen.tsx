"use client"
import { useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Modal,
  Alert,
  TextInput,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"

// Define type for language codes
type LanguageType = "es" | "en" | "pt" | "fr" | "de" | "it";

// Language options with names and flags (matching student implementation)
const languageOptions = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
]

// Languages interface (for restaurant's offered languages)
interface Language {
  id: number
  name: string
  code: string
  selected: boolean
  level?: string // For proficiency level
}

// Initial languages
const initialLanguages: Language[] = [
  { id: 1, name: "Español", code: "es", selected: true, level: "Nativo" },
  { id: 2, name: "Inglés", code: "en", selected: true, level: "Avanzado" },
  { id: 3, name: "Francés", code: "fr", selected: false },
  { id: 4, name: "Italiano", code: "it", selected: false },
  { id: 5, name: "Alemán", code: "de", selected: false },
  { id: 6, name: "Portugués", code: "pt", selected: false },
  { id: 7, name: "Japonés", code: "ja", selected: false },
  { id: 8, name: "Chino", code: "zh", selected: false }
]

export default function RestauranteSettingsScreen() {
  const navigation = useNavigation()
  // Get theme context values including toggleTheme function
  const { colors, theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  
  // State for settings
  const [languages, setLanguages] = useState<Language[]>(initialLanguages)
  const [tableCapacity, setTableCapacity] = useState(8)
  const [commission, setCommission] = useState(15) // Read-only
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  
  // State for modals (for restaurant's offered languages)
  const [languagesModalVisible, setLanguagesModalVisible] = useState(false)
  const [capacityModalVisible, setCapacityModalVisible] = useState(false)
  const [tempCapacity, setTempCapacity] = useState(tableCapacity.toString())
  
  // Helper function to get language name from code (for app language)
  const getLanguageName = (code: string) => {
    const lang = languageOptions.find(lang => lang.code === code)
    return lang ? lang.name : "Español"
  }
  
  // Handle language change (for app language)
  const handleLanguageChange = async (languageCode: LanguageType) => {
    await setLanguage(languageCode)
    setShowLanguageModal(false)
  }
  
  // Get selected languages (for restaurant's offered languages)
  const getSelectedLanguages = () => {
    return languages.filter(lang => lang.selected)
  }
  
  // Toggle language selection
  const toggleLanguage = (id: number) => {
    setLanguages(langs => 
      langs.map(lang => 
        lang.id === id ? { ...lang, selected: !lang.selected } : lang
      )
    )
  }
  
  // Update language level
  const updateLanguageLevel = (id: number, level: string) => {
    setLanguages(langs => 
      langs.map(lang => 
        lang.id === id ? { ...lang, level } : lang
      )
    )
  }
  
  // Save table capacity
  const saveTableCapacity = () => {
    const capacity = parseInt(tempCapacity)
    
    if (isNaN(capacity) || capacity < 1) {
      Alert.alert("Error", "Por favor ingresa un número válido mayor a 0")
      return
    }
    
    setTableCapacity(capacity)
    setCapacityModalVisible(false)
    Alert.alert("Éxito", "Capacidad por mesa actualizada correctamente")
  }
  
  // State for tracking logout loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Sign out
  const handleSignOut = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true)
              await signOut()
              // Navigate to login screen after successful logout
              // Using reset to prevent going back to authenticated screens
              navigation.reset({
                index: 0,
                routes: [{ name: "RestaurantLogin" as never }]
              })
            } catch (error) {
              console.error("Error signing out:", error)
              setIsLoggingOut(false)
              // Show error message to user
              Alert.alert(
                "Error",
                "Hubo un problema al cerrar sesión. Por favor intenta de nuevo.",
                [{ text: "OK" }]
              )
            }
          }
        }
      ]
    )
  }
  
  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.firstName || "Restaurante"
    const nameParts = name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`
    }
    return name.substring(0, 2).toUpperCase()
  }
  
  // Languages modal
  const renderLanguagesModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={languagesModalVisible}
        onRequestClose={() => setLanguagesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Idiomas Disponibles
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setLanguagesModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languagesList}>
              <Text style={[styles.languagesDescription, { color: colors.text + "80" }]}>
                Selecciona los idiomas que se hablan en tu restaurante. Los clientes podrán ver esta información al elegir un restaurante para su sesión.
              </Text>
              
              {languages.map((language) => (
                <View 
                  key={language.id} 
                  style={[
                    styles.languageItem, 
                    { borderColor: colors.border }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.languageCheckbox}
                    onPress={() => toggleLanguage(language.id)}
                  >
                    <View 
                      style={[
                        styles.checkbox, 
                        { 
                          backgroundColor: language.selected 
                            ? colors.primary 
                            : 'transparent',
                          borderColor: language.selected
                            ? colors.primary
                            : colors.border
                        }
                      ]}
                    >
                      {language.selected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={[styles.languageName, { color: colors.text }]}>
                      {language.name}
                    </Text>
                  </TouchableOpacity>
                  
                  {language.selected && (
                    <View style={styles.languageLevelContainer}>
                      <Text style={[styles.languageLevelLabel, { color: colors.text + "80" }]}>
                        Nivel:
                      </Text>
                      
                      <View style={styles.levelButtons}>
                        {["Básico", "Intermedio", "Avanzado", "Nativo"].map((level) => (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.levelButton,
                              { 
                                backgroundColor: language.level === level
                                  ? colors.primary
                                  : colors.background,
                                borderColor: colors.border
                              }
                            ]}
                            onPress={() => updateLanguageLevel(language.id, level)}
                          >
                            <Text 
                              style={[
                                styles.levelButtonText, 
                                { 
                                  color: language.level === level
                                    ? "white"
                                    : colors.text
                                }
                              ]}
                            >
                              {level}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setLanguagesModalVisible(false)
                Alert.alert("Éxito", "Idiomas actualizados correctamente")
              }}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
  
  // Table capacity modal
  const renderCapacityModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={capacityModalVisible}
        onRequestClose={() => setCapacityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Capacidad por Mesa
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCapacityModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.capacityDescription, { color: colors.text + "80" }]}>
              Establece la capacidad máxima de personas por mesa en tu restaurante. Esto ayudará a los estudiantes a planificar sus sesiones.
            </Text>
            
            <View style={styles.capacityInputContainer}>
              <Text style={[styles.capacityInputLabel, { color: colors.text }]}>
                Número de personas:
              </Text>
              <TextInput
                style={[styles.capacityInput, { borderColor: colors.border, color: colors.text }]}
                value={tempCapacity}
                onChangeText={setTempCapacity}
                keyboardType="numeric"
                placeholder="Ej: 8"
                placeholderTextColor={colors.text + "60"}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setCapacityModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveModalButton, { backgroundColor: colors.primary }]}
                onPress={saveTableCapacity}
              >
                <Text style={{ color: "white" }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          Platform.OS === 'ios' ? { paddingTop: 16 } : null
        ]}
      >
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={[styles.initialsAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.initialsText}>{getUserInitials()}</Text>
            </View>
            
            <View>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.firstName || "Restaurante"} {user?.lastName || ""}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.text + "80" }]}>
                {user?.email || "restaurante@example.com"}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cuenta
        </Text>
        
        <View style={styles.menuCard}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("RestaurantePersonalInfo" as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="person-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Información Personal
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("RestauranteSecurity" as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Seguridad
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configuración del Restaurante
        </Text>
        
        <View style={styles.menuCard}>
         
          {/* Table Capacity */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setTempCapacity(tableCapacity.toString())
              setCapacityModalVisible(true)
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="people-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Capacidad por Mesa
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: colors.text + "60" }]}>
                {tableCapacity} personas
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Commission (Read-only) */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.gold[50] }]}>
                <Ionicons name="cash-outline" size={20} color={colors.gold[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Comisión de Servicio
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: colors.text + "60" }]}>
                {commission}%
              </Text>
              <View style={[styles.readOnlyBadge, { backgroundColor: colors.text + "20" }]}>
                <Text style={[styles.readOnlyText, { color: colors.text + "80" }]}>
                  Solo lectura
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preferencias de la Aplicación
        </Text>
        
        <View style={styles.menuCard}>
          {/* App language selection - matching student implementation */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="language-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {t("profile.language")}
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: colors.text + "60" }]}>
                {getLanguageName(language)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {/* Dark Mode - Connected to global theme context */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name={theme === "dark" ? "moon" : "moon-outline"} size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Modo Oscuro
              </Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={theme === "dark" ? colors.primary : "#f4f3f4"}
            />
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Notifications */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons 
                  name={notificationsEnabled ? "notifications" : "notifications-off-outline"} 
                  size={20} 
                  color={colors.purple[600]} 
                />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Notificaciones
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Soporte
        </Text>
        
        <View style={styles.menuCard}>
          {/* Help & Support */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("RestauranteHelpSupport" as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="help-circle-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Ayuda y Soporte
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("RestauranteTermsConditions" as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Términos y Condiciones
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          
          {/* Sign Out */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSignOut}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.error + "15" }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                Cerrar Sesión
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.versionText, { color: colors.text + "60" }]}>
          Versión 1.0.0
        </Text>
        
        {/* App Language Selection Modal - matching student implementation */}
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
                {languageOptions.map((langOption) => (
                  <TouchableOpacity
                    key={langOption.code}
                    style={[
                      styles.languageOption,
                      language === langOption.code && {
                        backgroundColor: colors.primary + "15", 
                        borderColor: colors.primary 
                      },
                    ]}
                    onPress={() => handleLanguageChange(langOption.code as LanguageType)}
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
        
        {/* Restaurant's Languages Modal - original implementation */}
        {renderLanguagesModal()}
        
        {/* Capacity Modal */}
        {renderCapacityModal()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  initialsAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 16,
  },
  menuCard: {
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
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
    padding: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 15,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValue: {
    marginRight: 8,
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  readOnlyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  readOnlyText: {
    fontSize: 11,
  },
  versionText: {
    textAlign: "center",
    marginTop: 24,
    marginBottom: 16,
    fontSize: 13,
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
    maxWidth: 450,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  // Languages modal styles
  // App language modal styles (matching student implementation)
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontWeight: "500",
    fontSize: 16,
  },
  
  // Restaurant's languages modal styles (original)
  languagesList: {
    marginBottom: 16,
  },
  languagesDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  languageItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  languageCheckbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  languageName: {
    fontSize: 15,
    fontWeight: "500",
  },
  languageLevelContainer: {
    marginTop: 10,
    marginLeft: 30,
  },
  languageLevelLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  levelButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  levelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  levelButtonText: {
    fontSize: 11,
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  // Capacity modal styles
  capacityDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  capacityInputContainer: {
    marginBottom: 20,
  },
  capacityInputLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  capacityInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
});