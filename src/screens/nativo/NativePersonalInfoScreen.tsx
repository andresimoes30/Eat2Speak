import React, { useState, useContext, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { AppContext, AppContextType } from "./AppTypes"

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

// Available languages with their flags and levels
const availableLanguages = [
  { language: "Español", flag: "🇪🇸" },
  { language: "Inglés", flag: "🇬🇧" },
  { language: "Francés", flag: "🇫🇷" },
  { language: "Alemán", flag: "🇩🇪" },
  { language: "Italiano", flag: "🇮🇹" },
  { language: "Japonés", flag: "🇯🇵" },
];

// Available interests for native speakers
const availableInterests = [
  "Enseñanza",
  "Cocina",
  "Viajes",
  "Deportes",
  "Música",
  "Lectura",
  "Cine",
  "Tecnología",
  "Fotografía",
  "Arte",
  "Idiomas",
  "Moda",
  "Videojuegos",
  "Fitness",
  "Baile",
  "Naturaleza",
];

// Language proficiency levels
const languageLevelKeys = [
  "A1 (Principiante)",
  "A2 (Elemental)",
  "B1 (Intermedio)",
  "B2 (Intermedio alto)", 
  "C1 (Avanzado)",
  "C2 (Maestría)",
  "Nativo"
];

// Types for language and user data
interface Language {
  language: string;
  level: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  profileImage: string;
  address: string;
  birthDate: string;
  gender: string;
  nationality: string;
  occupation: string;
  company: string;
  languages: Language[];
  interests: string[];
  bio: string;
  yearsOfExperience: number;
  teaching: {
    rates: {
      standard: number;
      premium: number;
    };
    certifications: string[];
  }
}

// Datos ficticios del profesor nativo
const userData: UserData = {
  id: "234567",
  firstName: "María",
  lastName: "González",
  email: "maria.gonzalez@example.com",
  phone: "623 456 789",
  countryCode: "+34",
  profileImage: "https://via.placeholder.com/150",
  address: "Calle de Alcalá 42, Madrid, España",
  birthDate: "23/06/1990",
  gender: "Femenino",
  nationality: "Española",
  occupation: "Profesora de español",
  company: "Academia de Idiomas Cervantes",
  languages: [
    { language: "Español", level: "Nativo" },
    { language: "Inglés", level: "C1 (Avanzado)" },
    { language: "Francés", level: "B2 (Intermedio alto)" },
  ],
  interests: ["Enseñanza", "Cocina española", "Literatura", "Viajes", "Música"],
  bio: "Profesora de español con más de 5 años de experiencia enseñando a estudiantes internacionales. Me encanta compartir mi cultura y mi idioma a través de conversaciones en restaurantes locales. Soy paciente y adaptable a diferentes niveles y necesidades de aprendizaje.",
  yearsOfExperience: 5,
  teaching: {
    rates: {
      standard: 25,
      premium: 35
    },
    certifications: ["DELE Examiner", "Máster en ELE", "Certificado de Aptitud Pedagógica"]
  }
}

// Define the parameter list for the Native Navigator stack
type NativeStackParamList = {
  NativeProfileMain: undefined;
  NativePersonalInfo: undefined;
};

// Define the navigation prop type
type NativePersonalInfoNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativePersonalInfo'
>;

export default function NativePersonalInfoScreen() {
  const navigation = useNavigation<NativePersonalInfoNavigationProp>();
  const { appState } = useContext(AppContext) as AppContextType;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<UserData>(userData);
  
  // Modals
  const [showCountryCodeModal, setShowCountryCodeModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showGenderModal, setShowGenderModal] = useState<boolean>(false);
  const [showNationalityModal, setShowNationalityModal] = useState<boolean>(false);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState<boolean>(false);
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState<boolean>(false);
  const [showLanguageLevelModal, setShowLanguageLevelModal] = useState<boolean>(false);
  const [showAddInterestModal, setShowAddInterestModal] = useState<boolean>(false);
  const [showAddCertificationModal, setShowAddCertificationModal] = useState<boolean>(false);
  
  // New inputs
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+34");
  const [newLanguage, setNewLanguage] = useState<Language>({ language: "", level: "" });
  const [newInterest, setNewInterest] = useState<string>("");
  const [newCertification, setNewCertification] = useState<string>("");
  
  // Current date for calendar
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Get gender options
  const getGenderOptions = (): string[] => {
    return [
      "Masculino",
      "Femenino",
      "No binario",
      "Prefiero no decirlo"
    ];
  };

  // Get nationalities
  const getNationalities = (): string[] => {
    return [
      "Afgano", "Alemán", "Angoleño", "Argentino", "Australiano", "Austríaco", "Belga", "Boliviano", 
      "Brasileño", "Canadiense", "Chileno", "Chino", "Colombiano", "Coreano", "Cubano", "Danés", 
      "Egipcio", "Emiratí", "Ecuatoriano", "Español", "Estadounidense", "Filipino", "Finlandés", 
      "Francés", "Griego", "Guatemalteco", "Haitiano", "Holandés", "Hondureño", "Húngaro", "Indio", 
      "Indonesio", "Inglés", "Iraní", "Iraquí", "Irlandés", "Israelí", "Italiano", "Jamaicano", 
      "Japonés", "Libanés", "Malasio", "Marroquí", "Mexicano", "Mozambiqueño", "Neozelandés", "Nigeriano", 
      "Noruego", "Pakistaní", "Panameño", "Paraguayo", "Peruano", "Polaco", "Portugués", "Rumano", 
      "Ruso", "Saudí", "Senegalés", "Serbio", "Singapurense", "Sudafricano", "Sueco", "Suizo", 
      "Sirio", "Tailandés", "Tunecino", "Turco", "Ucraniano", "Uruguayo", "Venezolano", "Vietnamita", 
      "Zimbabuense"
    ];
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    setIsEditing(false);
  }
  
  // Helper function to format date as DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // Select country code
  const handleSelectCountryCode = (code: string): void => {
    setSelectedCountryCode(code);
    setEditedUser(prev => ({ ...prev, countryCode: code }));
    setShowCountryCodeModal(false);
  }
  
  // Select date
  const handleSelectDate = (date: Date): void => {
    setCurrentDate(date);
    setEditedUser(prev => ({ ...prev, birthDate: formatDate(date) }));
    setShowCalendarModal(false);
  }
  
  // Select gender
  const handleSelectGender = (gender: string): void => {
    setEditedUser(prev => ({ ...prev, gender: gender }));
    setShowGenderModal(false);
  }
  
  // Select nationality
  const handleSelectNationality = (nationality: string): void => {
    setEditedUser(prev => ({ ...prev, nationality: nationality }));
    setShowNationalityModal(false);
  }
  
  // Select language for new language
  const handleSelectLanguage = (language: string): void => {
    setNewLanguage(prev => ({ ...prev, language }));
    setShowLanguageSelectionModal(false);
  }
  
  // Select level for new language
  const handleSelectLanguageLevel = (level: string): void => {
    setNewLanguage(prev => ({ ...prev, level }));
    setShowLanguageLevelModal(false);
  }
  
  // Add language
  const handleAddLanguage = (): void => {
    if (newLanguage.language && newLanguage.level) {
      const updatedLanguages = [...editedUser.languages, newLanguage];
      setEditedUser(prev => ({ ...prev, languages: updatedLanguages }));
      setNewLanguage({ language: "", level: "" });
      setShowAddLanguageModal(false);
    }
  }
  
  // Add interest
  const handleAddInterest = (): void => {
    if (newInterest) {
      const updatedInterests = [...editedUser.interests, newInterest];
      setEditedUser(prev => ({ ...prev, interests: updatedInterests }));
      setNewInterest("");
      setShowAddInterestModal(false);
    }
  }

  // Add certification
  const handleAddCertification = (): void => {
    if (newCertification) {
      const updatedCertifications = [...editedUser.teaching.certifications, newCertification];
      setEditedUser(prev => ({ 
        ...prev, 
        teaching: {
          ...prev.teaching,
          certifications: updatedCertifications
        }
      }));
      setNewCertification("");
      setShowAddCertificationModal(false);
    }
  }
  
  // Remove language
  const handleRemoveLanguage = (index: number): void => {
    const updatedLanguages = [...editedUser.languages];
    updatedLanguages.splice(index, 1);
    setEditedUser(prev => ({ ...prev, languages: updatedLanguages }));
  }
  
  // Remove interest
  const handleRemoveInterest = (index: number): void => {
    const updatedInterests = [...editedUser.interests];
    updatedInterests.splice(index, 1);
    setEditedUser(prev => ({ ...prev, interests: updatedInterests }));
  }

  // Remove certification
  const handleRemoveCertification = (index: number): void => {
    const updatedCertifications = [...editedUser.teaching.certifications];
    updatedCertifications.splice(index, 1);
    setEditedUser(prev => ({ 
      ...prev, 
      teaching: {
        ...prev.teaching,
        certifications: updatedCertifications
      }
    }));
  }

  // Theme colors - simplified version since we don't have ThemeContext
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
      200: '#bfdbfe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      600: '#7c3aed',
      700: '#6d28d9'
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      600: '#ca8a04',
      700: '#a16207'
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={{ flex: 1 }}>
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
      </ScrollView>
    </SafeAreaView>
      <View style={styles.photoContainer}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: "white" }]}>
            <Ionicons name="camera" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>

        <View style={[styles.infoCard, { marginTop: 0, backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos Básicos</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Nombre</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUser.firstName}
                onChangeText={(text) => setEditedUser({ ...editedUser, firstName: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.firstName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Apellidos</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUser.lastName}
                onChangeText={(text) => setEditedUser({ ...editedUser, lastName: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.lastName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Email</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                keyboardType="email-address"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.email}</Text>
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
                    {countryCodes.find(c => c.code === editedUser.countryCode)?.flag} {editedUser.countryCode}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.phoneInput, { color: colors.text, borderColor: colors.border }]}
                  value={editedUser.phone}
                  onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                  keyboardType="phone-pad"
                  placeholder="623 456 789"
                />
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {countryCodes.find(c => c.code === userData.countryCode)?.flag} {userData.countryCode} {userData.phone}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Fecha de nacimiento</Text>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.dateInput, { borderColor: colors.border }]}
                onPress={() => setShowCalendarModal(true)}
              >
                <Text style={{ color: colors.text }}>{editedUser.birthDate}</Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.birthDate}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Género</Text>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.selectInput, { borderColor: colors.border }]}
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={{ color: colors.text }}>{editedUser.gender}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.gender}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Nacionalidad</Text>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.selectInput, { borderColor: colors.border }]}
                onPress={() => setShowNationalityModal(true)}
              >
                {/* Get flag for nationality */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {(() => {
                    // Get flag based on nationality
                    const getFlag = (name: string | undefined) => {
                      if (!name) return "🌎";
                      const countryFlags: {[key: string]: string} = {
                        "Española": "🇪🇸", "Español": "🇪🇸",
                        "Afgano": "🇦🇫",
                        "Alemán": "🇩🇪",
                        "Angoleño": "🇦🇴",
                        "Argentino": "🇦🇷",
                        "Australiano": "🇦🇺",
                        "Brasileño": "🇧🇷",
                        "Canadiense": "🇨🇦",
                        "Francés": "🇫🇷",
                        "Estadounidense": "🇺🇸",
                        "Italiano": "🇮🇹",
                        "Japonés": "🇯🇵",
                        "Mexicano": "🇲🇽",
                        "Portugués": "🇵🇹"
                      };
                      return countryFlags[name] || "🌎"; // Default world flag
                    };
                    
                    return <Text style={{ fontSize: 18, marginRight: 8 }}>{getFlag(editedUser.nationality)}</Text>;
                  })()}
                  <Text style={{ color: colors.text }}>{editedUser.nationality}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {(() => {
                  // Get flag based on nationality
                  const getFlag = (name: string | undefined) => {
                    if (!name) return "🌎";
                    const countryFlags: {[key: string]: string} = {
                      "Española": "🇪🇸", "Español": "🇪🇸",
                      "Afgano": "🇦🇫",
                      "Alemán": "🇩🇪",
                      "Angoleño": "🇦🇴",
                      "Argentino": "🇦🇷",
                      "Australiano": "🇦🇺",
                      "Brasileño": "🇧🇷",
                      "Canadiense": "🇨🇦",
                      "Francés": "🇫🇷",
                      "Estadounidense": "🇺🇸",
                      "Italiano": "🇮🇹",
                      "Japonés": "🇯🇵",
                      "Mexicano": "🇲🇽",
                      "Portugués": "🇵🇹"
                    };
                    return countryFlags[name] || "🌎"; // Default world flag
                  };
                  
                  return <Text style={{ fontSize: 18, marginRight: 8 }}>{getFlag(userData.nationality)}</Text>;
                })()}
                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.nationality}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dirección</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Dirección Completa</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUser.address}
                onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
                multiline
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.address}</Text>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profesión</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Ocupación</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUser.occupation}
                onChangeText={(text) => setEditedUser({ ...editedUser, occupation: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.occupation}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Empresa / Centro</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUser.company}
                onChangeText={(text) => setEditedUser({ ...editedUser, company: text })}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.company}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Años de experiencia</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={String(editedUser.yearsOfExperience)}
                onChangeText={(text) => {
                  const years = parseInt(text);
                  if (!isNaN(years)) {
                    setEditedUser({ ...editedUser, yearsOfExperience: years });
                  }
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.yearsOfExperience}</Text>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tarifas</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Tarifa estándar (€/hora)</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={String(editedUser.teaching.rates.standard)}
                onChangeText={(text) => {
                  const rate = parseInt(text);
                  if (!isNaN(rate)) {
                    setEditedUser({ 
                      ...editedUser, 
                      teaching: {
                        ...editedUser.teaching,
                        rates: {
                          ...editedUser.teaching.rates,
                          standard: rate
                        }
                      }
                    });
                  }
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.teaching.rates.standard}€</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>Tarifa premium (€/hora)</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
                value={String(editedUser.teaching.rates.premium)}
                onChangeText={(text) => {
                  const rate = parseInt(text);
                  if (!isNaN(rate)) {
                    setEditedUser({ 
                      ...editedUser, 
                      teaching: {
                        ...editedUser.teaching,
                        rates: {
                          ...editedUser.teaching.rates,
                          premium: rate
                        }
                      }
                    });
                  }
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.teaching.rates.premium}€</Text>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Certificaciones</Text>

          {editedUser.teaching.certifications.map((cert, index) => (
            <View key={index} style={styles.languageItem}>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: colors.text }]}>{cert}</Text>
              </View>
              {isEditing && (
                <TouchableOpacity onPress={() => handleRemoveCertification(index)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditing && (
            <TouchableOpacity 
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={() => setShowAddCertificationModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Añadir Certificación</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Idiomas</Text>

          {editedUser.languages.map((item, index) => (
            <View key={index} style={styles.languageItem}>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: colors.text }]}>
                  {item.language}
                </Text>
                <Text style={[styles.languageLevel, { color: colors.text + "80" }]}>
                  {item.level}
                </Text>
              </View>
              {isEditing && (
                <TouchableOpacity onPress={() => handleRemoveLanguage(index)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditing && (
            <TouchableOpacity 
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={() => setShowAddLanguageModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Añadir Idioma</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Intereses</Text>

          <View style={styles.interestsContainer}>
            {editedUser.interests.map((interest, index) => (
              <View
                key={index}
                style={[
                  styles.interestTag,
                  {
                    backgroundColor: colors.blue[50],
                    borderColor: colors.blue[200],
                  },
                ]}
              >
                <Text style={[styles.interestText, { color: colors.blue[700] }]}>{interest}</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.removeInterestButton}
                    onPress={() => handleRemoveInterest(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.blue[700]} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isEditing && (
              <TouchableOpacity
                style={[
                  styles.addInterestButton,
                  {
                    borderColor: colors.primary,
                    borderStyle: "dashed",
                  },
                ]}
                onPress={() => setShowAddInterestModal(true)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={[styles.addInterestText, { color: colors.primary }]}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Biografía</Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.bioInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
              value={editedUser.bio}
              onChangeText={(text) => setEditedUser({ ...editedUser, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.bioText, { color: colors.text }]}>{userData.bio}</Text>
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

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Fecha</Text>
            
            {/* Simple calendar view - in a real app, you'd use a proper calendar component */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentDate(newDate);
                }}>
                  <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.calendarTitle, { color: colors.text }]}>
                  {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentDate(newDate);
                }}>
                  <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarDays}>
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                  <Text key={index} style={[styles.calendarDay, { color: colors.text }]}>{day}</Text>
                ))}
              </View>
              
              {/* Simplified calendar grid */}
              <View style={styles.calendarDates}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <TouchableOpacity 
                    key={day}
                    style={[
                      styles.calendarDate,
                      day === currentDate.getDate() && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(day);
                      handleSelectDate(newDate);
                    }}
                  >
                    <Text style={{
                      color: day === currentDate.getDate() ? 'white' : colors.text
                    }}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCalendarModal(false)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSelectDate(currentDate)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Género</Text>
            {getGenderOptions().map((gender, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  (editedUser.gender === gender) && { backgroundColor: colors.primary + '15' }
                ]}
                onPress={() => handleSelectGender(gender)}
              >
                <Text style={{ color: colors.text }}>{gender}</Text>
                {editedUser.gender === gender && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Nationality Modal */}
      <Modal
        visible={showNationalityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNationalityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nacionalidad</Text>
            <FlatList
              data={getNationalities().map((nationality) => {
                // Get appropriate flag based on nationality
                const getFlag = (name: string) => {
                  const countryFlags: {[key: string]: string} = {
                    // Simplified mapping for key nationalities
                    "Española": "🇪🇸", "Español": "🇪🇸",
                    "Afgano": "🇦🇫",
                    "Alemán": "🇩🇪",
                    "Angoleño": "🇦🇴",
                    "Argentino": "🇦🇷",
                    "Australiano": "🇦🇺",
                    "Brasileño": "🇧🇷",
                    "Canadiense": "🇨🇦",
                    "Francés": "🇫🇷",
                    "Estadounidense": "🇺🇸",
                    "Italiano": "🇮🇹",
                    "Japonés": "🇯🇵",
                    "Mexicano": "🇲🇽",
                    "Portugués": "🇵🇹"
                  };
                  return countryFlags[name] || "🌎"; // Default world flag if not found
                };
                
                return {
                  name: nationality,
                  flag: getFlag(nationality)
                };
              })}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    (editedUser.nationality === item.name) && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => handleSelectNationality(item.name)}
                >
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{item.flag}</Text>
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                  {editedUser.nationality === item.name && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowNationalityModal(false)}
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
        onRequestClose={() => {
          setNewLanguage({ language: "", level: "" });
          setShowAddLanguageModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Añadir Idioma</Text>
            
            {/* Language Dropdown */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalLabel, { color: colors.text + "80" }]}>Idioma</Text>
              
              {/* Language Selection Dropdown */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.selectInput, 
                    { 
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      marginBottom: showLanguageSelectionModal ? 5 : 0
                    }
                  ]}
                  onPress={() => setShowLanguageSelectionModal(!showLanguageSelectionModal)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {newLanguage.language ? (
                      <>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>
                          {availableLanguages.find(l => l.language === newLanguage.language)?.flag}
                        </Text>
                        <Text style={{ color: colors.text }}>
                          {newLanguage.language}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ color: colors.text + '80' }}>Seleccionar Idioma</Text>
                    )}
                  </View>
                  <Ionicons 
                    name={showLanguageSelectionModal ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
                
                {/* Language Dropdown Menu */}
                {showLanguageSelectionModal && (
                  <View style={[
                    styles.dropdownMenu,
                    { 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  ]}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {availableLanguages.map((item) => (
                        <TouchableOpacity
                          key={item.language}
                          style={[
                            styles.dropdownItem,
                            newLanguage.language === item.language && { backgroundColor: colors.primary + '15' }
                          ]}
                          onPress={() => {
                            setNewLanguage(prev => ({ ...prev, language: item.language }));
                            setShowLanguageSelectionModal(false);
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>{item.flag}</Text>
                          <Text style={{ color: colors.text, marginLeft: 10 }}>{item.language}</Text>
                          {newLanguage.language === item.language && (
                            <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
            
            {/* Level Dropdown */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalLabel, { color: colors.text + "80" }]}>Nivel</Text>
              
              {/* Level Selection Dropdown */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[
                    styles.selectInput, 
                    { 
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      marginBottom: showLanguageLevelModal ? 5 : 0
                    }
                  ]}
                  onPress={() => setShowLanguageLevelModal(!showLanguageLevelModal)}
                >
                  <Text style={{ color: newLanguage.level ? colors.text : colors.text + '80' }}>
                    {newLanguage.level ? newLanguage.level : "Seleccionar Nivel"}
                  </Text>
                  <Ionicons 
                    name={showLanguageLevelModal ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
                
                {/* Level Dropdown Menu */}
                {showLanguageLevelModal && (
                  <View style={[
                    styles.dropdownMenu,
                    { 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  ]}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {languageLevelKeys.map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.dropdownItem,
                            newLanguage.level === level && { backgroundColor: colors.primary + '15' }
                          ]}
                          onPress={() => {
                            setNewLanguage(prev => ({ ...prev, level: level }));
                            setShowLanguageLevelModal(false);
                          }}
                        >
                          <Text style={{ color: colors.text }}>{level}</Text>
                          {newLanguage.level === level && (
                            <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E5E5E5', flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setNewLanguage({ language: "", level: "" });
                  setShowLanguageSelectionModal(false);
                  setShowLanguageLevelModal(false);
                  setShowAddLanguageModal(false);
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: newLanguage.language && newLanguage.level ? colors.primary : colors.primary + '60',
                    flex: 1,
                    marginLeft: 8
                  }
                ]}
                onPress={() => {
                  handleAddLanguage();
                  setShowLanguageSelectionModal(false);
                  setShowLanguageLevelModal(false);
                }}
                disabled={!newLanguage.language || !newLanguage.level}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Certification Modal */}
      <Modal
        visible={showAddCertificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCertificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Añadir Certificación</Text>
            
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              value={newCertification}
              onChangeText={setNewCertification}
              placeholder="Nombre de la certificación"
              placeholderTextColor={colors.text + "60"}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E5E5E5', flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setNewCertification("");
                  setShowAddCertificationModal(false);
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: newCertification ? colors.primary : colors.primary + '60',
                    flex: 1,
                    marginLeft: 8
                  }
                ]}
                onPress={handleAddCertification}
                disabled={!newCertification}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Interest Modal */}
      <Modal
        visible={showAddInterestModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddInterestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Añadir Interés</Text>
            
            <FlatList
              data={availableInterests}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    newInterest === item && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => setNewInterest(item)}
                >
                  <Text style={{ color: colors.text }}>{item}</Text>
                  {newInterest === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E5E5E5' }]}
                onPress={() => setShowAddInterestModal(false)}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddInterest}
                disabled={!newInterest}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // Added new styles for dropdown menu
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
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
  infoInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  languageLevel: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeInterestButton: {
    marginLeft: 6,
  },
  addInterestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  addInterestText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  bioInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  modalInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 45,
  },
  // New styles for interactive inputs
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
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarDay: {
    width: 30,
    textAlign: 'center',
  },
  calendarDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDate: {
    width: 30,
    height: 30,
    margin: 2,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
});