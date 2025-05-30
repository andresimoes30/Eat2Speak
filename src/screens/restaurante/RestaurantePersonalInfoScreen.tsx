import React, { useState, useContext } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"

// Country codes with flags
const countryCodes = [
  { code: "+93", country: "Afganistán", flag: "🇦🇫" },
  { code: "+49", country: "Alemania", flag: "🇩🇪" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+32", country: "Bélgica", flag: "🇧🇪" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+1", country: "Canadá", flag: "🇨🇦" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+82", country: "Corea del Sur", flag: "🇰🇷" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+45", country: "Dinamarca", flag: "🇩🇰" },
  { code: "+20", country: "Egipto", flag: "🇪🇬" },
  { code: "+971", country: "Emiratos Árabes Unidos", flag: "🇦🇪" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+63", country: "Filipinas", flag: "🇵🇭" },
  { code: "+358", country: "Finlandia", flag: "🇫🇮" },
  { code: "+33", country: "Francia", flag: "🇫🇷" },
  { code: "+30", country: "Grecia", flag: "🇬🇷" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+509", country: "Haití", flag: "🇭🇹" },
  { code: "+31", country: "Holanda", flag: "🇳🇱" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+36", country: "Hungría", flag: "🇭🇺" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+44", country: "Inglaterra", flag: "🇬🇧" },
  { code: "+98", country: "Irán", flag: "🇮🇷" },
  { code: "+964", country: "Iraq", flag: "🇮🇶" },
  { code: "+353", country: "Irlanda", flag: "🇮🇪" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+39", country: "Italia", flag: "🇮🇹" },
  { code: "+1", country: "Jamaica", flag: "🇯🇲" },
  { code: "+81", country: "Japón", flag: "🇯🇵" },
  { code: "+961", country: "Líbano", flag: "🇱🇧" },
  { code: "+60", country: "Malasia", flag: "🇲🇾" },
  { code: "+212", country: "Marruecos", flag: "🇲🇦" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+258", country: "Mozambique", flag: "🇲🇿" },
  { code: "+64", country: "Nueva Zelanda", flag: "🇳🇿" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+47", country: "Noruega", flag: "🇳🇴" },
  { code: "+92", country: "Pakistán", flag: "🇵🇰" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+48", country: "Polonia", flag: "🇵🇱" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+40", country: "Rumanía", flag: "🇷🇴" },
  { code: "+7", country: "Rusia", flag: "🇷🇺" },
  { code: "+966", country: "Arabia Saudita", flag: "🇸🇦" },
  { code: "+221", country: "Senegal", flag: "🇸🇳" },
  { code: "+381", country: "Serbia", flag: "🇷🇸" },
  { code: "+65", country: "Singapur", flag: "🇸🇬" },
  { code: "+27", country: "Sudáfrica", flag: "🇿🇦" },
  { code: "+46", country: "Suecia", flag: "🇸🇪" },
  { code: "+41", country: "Suiza", flag: "🇨🇭" },
  { code: "+963", country: "Siria", flag: "🇸🇾" },
  { code: "+66", country: "Tailandia", flag: "🇹🇭" },
  { code: "+216", country: "Túnez", flag: "🇹🇳" },
  { code: "+90", country: "Turquía", flag: "🇹🇷" },
  { code: "+380", country: "Ucrania", flag: "🇺🇦" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+263", country: "Zimbabue", flag: "🇿🇼" },
];

// Cuisine types
const cuisineTypes = [
  "Española", "Italiana", "Francesa", "Mexicana", "China", "Japonesa", 
  "Tailandesa", "India", "Griega", "Libanesa", "Marroquí", "Americana", 
  "Brasileña", "Peruana", "Argentina", "Coreana", "Vietnamita", "Mediterránea",
  "Vegetariana", "Vegana", "Fusión", "Mariscos", "Carnes", "Tapas"
];

// Types for restaurant data
interface RestaurantData {
  id: string;
  restaurantName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  profileImage: string;
  address: string;
  cuisineType: string;
  taxId: string;
  openingHours: string;
  description: string;
  tableCapacity: number;
  totalTables: number;
  languages: string[];
  commissionRate: number;
}

// Datos ficticios del restaurante
const restaurantData: RestaurantData = {
  id: "12345",
  restaurantName: "La Paella de Valencia",
  firstName: "Carlos",
  lastName: "Martínez",
  email: "carlos@lapaella.com",
  phone: "623 456 789",
  countryCode: "+34",
  profileImage: "https://via.placeholder.com/150",
  address: "Calle Gran Vía 25, Madrid, España",
  cuisineType: "Española",
  taxId: "B12345678",
  openingHours: "12:00-16:00, 20:00-23:30",
  description: "Restaurante especializado en paellas tradicionales valencianas y tapas españolas. Ambiente acogedor y terraza con vistas. Ideal para practicar español mientras se disfruta de la auténtica gastronomía española.",
  tableCapacity: 4,
  totalTables: 12,
  languages: ["Español", "Inglés", "Francés"],
  commissionRate: 15
}

export default function RestaurantePersonalInfoScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedRestaurant, setEditedRestaurant] = useState<RestaurantData>(restaurantData);
  
  // Modals
  const [showCountryCodeModal, setShowCountryCodeModal] = useState<boolean>(false);
  const [showCuisineTypeModal, setShowCuisineTypeModal] = useState<boolean>(false);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState<boolean>(false);
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState<boolean>(false);
  
  // New inputs
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+34");
  const [newLanguage, setNewLanguage] = useState<string>("");
  
  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    setIsEditing(false);
    alert("Cambios guardados correctamente");
  }
  
  // Select country code
  const handleSelectCountryCode = (code: string): void => {
    setSelectedCountryCode(code);
    setEditedRestaurant(prev => ({ ...prev, countryCode: code }));
    setShowCountryCodeModal(false);
  }
  
  // Select cuisine type
  const handleSelectCuisineType = (cuisine: string): void => {
    setEditedRestaurant(prev => ({ ...prev, cuisineType: cuisine }));
    setShowCuisineTypeModal(false);
  }
  
  // Add language
  const handleAddLanguage = (): void => {
    if (newLanguage && !editedRestaurant.languages.includes(newLanguage)) {
      const updatedLanguages = [...editedRestaurant.languages, newLanguage];
      setEditedRestaurant(prev => ({ ...prev, languages: updatedLanguages }));
      setNewLanguage("");
      setShowAddLanguageModal(false);
    }
  }
  
  // Remove language
  const handleRemoveLanguage = (index: number): void => {
    const updatedLanguages = [...editedRestaurant.languages];
    updatedLanguages.splice(index, 1);
    setEditedRestaurant(prev => ({ ...prev, languages: updatedLanguages }));
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = restaurantData.restaurantName || "Restaurante";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 30 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Información Personal</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
          <Text style={[styles.editButtonText, { color: colors.primary }]}>
            {isEditing ? "Guardar" : "Editar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: restaurantData.profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: "white" }]}>
            <Ionicons name="camera" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={[styles.infoCard, { marginTop: 0, backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos del Restaurante</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Nombre del Restaurante</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.restaurantName}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, restaurantName: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.restaurantName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Tipo de Cocina</Text>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.selectInput, { borderColor: colors.border }]}
                onPress={() => setShowCuisineTypeModal(true)}
              >
                <Text style={{ color: colors.text }}>{editedRestaurant.cuisineType}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.cuisineType}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Dirección</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.address}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, address: text })}
                multiline
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.address}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>CIF/NIF</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.taxId}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, taxId: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.taxId}</Text>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos del Propietario</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Nombre</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.firstName}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, firstName: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.firstName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Apellidos</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.lastName}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, lastName: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.lastName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Email</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.email}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, email: text })}
                keyboardType="email-address"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.email}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Teléfono</Text>
            {isEditing ? (
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity 
                  style={[styles.countryCodeButton, { borderColor: colors.border }]}
                  onPress={() => setShowCountryCodeModal(true)}
                >
                  <Text style={{ fontSize: 16 }}>
                    {countryCodes.find(c => c.code === editedRestaurant.countryCode)?.flag} {editedRestaurant.countryCode}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.phoneInput, { color: colors.text, borderColor: colors.border }]}
                  value={editedRestaurant.phone}
                  onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, phone: text })}
                  keyboardType="phone-pad"
                  placeholder="623 456 789"
                />
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {countryCodes.find(c => c.code === restaurantData.countryCode)?.flag} {restaurantData.countryCode} {restaurantData.phone}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos de Operación</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Horario de Apertura</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedRestaurant.openingHours}
                onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, openingHours: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.openingHours}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Capacidad por Mesa</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={String(editedRestaurant.tableCapacity)}
                onChangeText={(text) => {
                  const capacity = parseInt(text);
                  if (!isNaN(capacity)) {
                    setEditedRestaurant({ ...editedRestaurant, tableCapacity: capacity });
                  }
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.tableCapacity} personas</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Número de Mesas</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={String(editedRestaurant.totalTables)}
                onChangeText={(text) => {
                  const tables = parseInt(text);
                  if (!isNaN(tables)) {
                    setEditedRestaurant({ ...editedRestaurant, totalTables: tables });
                  }
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.totalTables} mesas</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Comisión de Servicio</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{restaurantData.commissionRate}%</Text>
            <Text style={[styles.readOnlyText, { color: colors.text + "60" }]}>(Solo lectura)</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Idiomas Disponibles</Text>

          <View style={styles.languagesContainer}>
            {editedRestaurant.languages.map((language, index) => (
              <View 
                key={index} 
                style={[
                  styles.languageTag, 
                  { 
                    backgroundColor: colors.blue[50],
                    borderColor: colors.blue[200],
                  }
                ]}
              >
                <Text style={[styles.languageText, { color: colors.blue[700] }]}>{language}</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.removeLanguageButton}
                    onPress={() => handleRemoveLanguage(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.blue[700]} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isEditing && (
              <TouchableOpacity
                style={[
                  styles.addLanguageButton,
                  {
                    borderColor: colors.primary,
                    borderStyle: "dashed",
                  },
                ]}
                onPress={() => setShowAddLanguageModal(true)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={[styles.addLanguageText, { color: colors.primary }]}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.descriptionInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
              value={editedRestaurant.description}
              onChangeText={(text) => setEditedRestaurant({ ...editedRestaurant, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.descriptionText, { color: colors.text }]}>{restaurantData.description}</Text>
          )}
        </View>
      </View>

      {/* Country Code Modal */}
      <Modal
        visible={showCountryCodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Código de País</Text>
            <FlatList
              data={countryCodes}
              keyExtractor={(item) => `${item.code}-${item.country}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryCodeItem,
                    selectedCountryCode === item.code && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => handleSelectCountryCode(item.code)}
                >
                  <Text style={{ fontSize: 16 }}>{item.flag} {item.code}</Text>
                  <Text style={{ color: colors.text, marginLeft: 10 }}>{item.country}</Text>
                  {selectedCountryCode === item.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCountryCodeModal(false)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cuisine Type Modal */}
      <Modal
        visible={showCuisineTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCuisineTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Tipo de Cocina</Text>
            <FlatList
              data={cuisineTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    editedRestaurant.cuisineType === item && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => handleSelectCuisineType(item)}
                >
                  <Text style={{ color: colors.text }}>{item}</Text>
                  {editedRestaurant.cuisineType === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCuisineTypeModal(false)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Add Language Modal */}
      <Modal
        visible={showAddLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Añadir Idioma</Text>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalLabel, { color: colors.text + "80" }]}>Selecciona los idiomas que se hablan en tu restaurante</Text>
              
              <FlatList
                data={[
                  "Español", "Inglés", "Francés", "Alemán", "Italiano", 
                  "Portugués", "Chino", "Japonés", "Coreano", "Árabe", 
                  "Ruso", "Holandés", "Sueco", "Noruego", "Finlandés"
                ]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      newLanguage === item && { backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => setNewLanguage(item)}
                    disabled={editedRestaurant.languages.includes(item)}
                  >
                    <Text 
                      style={{ 
                        color: editedRestaurant.languages.includes(item) ? colors.text + "40" : colors.text 
                      }}
                    >
                      {item}
                    </Text>
                    {newLanguage === item && !editedRestaurant.languages.includes(item) && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                    )}
                    {editedRestaurant.languages.includes(item) && (
                      <Text style={{ color: colors.text + "40", marginLeft: 'auto' }}>Ya añadido</Text>
                    )}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 300 }}
              />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E5E5E5', flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setNewLanguage("");
                  setShowAddLanguageModal(false);
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: newLanguage && !editedRestaurant.languages.includes(newLanguage) 
                      ? colors.primary 
                      : colors.primary + '60',
                    flex: 1,
                    marginLeft: 8
                  }
                ]}
                onPress={handleAddLanguage}
                disabled={!newLanguage || editedRestaurant.languages.includes(newLanguage)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 16,
  },
  photoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#EEEEEE",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  readOnlyText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  infoInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeButton: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  languageTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeLanguageButton: {
    marginLeft: 6,
  },
  addLanguageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  addLanguageText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  countryCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
});