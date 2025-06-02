"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ActivityIndicator, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { useAuth } from "../../contexts/AuthContext"
import { Card } from "../../components/Card"
import api from "../../../services/api"

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
  { language: "language.spanish", flag: "🇪🇸" },
  { language: "language.english", flag: "🇬🇧" },
  { language: "language.french", flag: "🇫🇷" },
  { language: "language.german", flag: "🇩🇪" },
  { language: "language.italian", flag: "🇮🇹" },
  { language: "language.japanese", flag: "🇯🇵" },
];

// Available interests
const availableInterests = [
  "interest.cooking",
  "interest.travel",
  "interest.sports",
  "interest.music",
  "interest.reading",
  "interest.movies",
  "interest.technology",
  "interest.photography",
  "interest.art",
  "interest.languages",
  "interest.fashion",
  "interest.gaming",
  "interest.fitness",
  "interest.dance",
  "interest.nature",
];

// Language proficiency levels keys
const languageLevelKeys = [
  "level.a1",
  "level.a2",
  "level.b1",
  "level.b2", 
  "level.c1",
  "level.c2",
  "level.native"
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
}

// Default empty user data (used while loading)
const defaultUserData: UserData = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "+34",
  profileImage: "https://via.placeholder.com/150",
  address: "",
  birthDate: "",
  gender: "",
  nationality: "",
  occupation: "",
  company: "",
  languages: [],
  interests: [],
  bio: "",
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [editedUser, setEditedUser] = useState<UserData>(defaultUserData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showCountryCodeModal, setShowCountryCodeModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showGenderModal, setShowGenderModal] = useState<boolean>(false);
  const [showNationalityModal, setShowNationalityModal] = useState<boolean>(false);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState<boolean>(false);
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState<boolean>(false);
  const [showLanguageLevelModal, setShowLanguageLevelModal] = useState<boolean>(false);
  const [showAddInterestModal, setShowAddInterestModal] = useState<boolean>(false);
  
  // New inputs
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+34");
  const [newLanguage, setNewLanguage] = useState<Language>({ language: "", level: "" });
  const [newInterest, setNewInterest] = useState<string>("");
  
  // Current date for calendar
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Get gender options based on the current language
  const getGenderOptions = (): string[] => {
    return [
      t("gender.male"),
      t("gender.female"),
      t("gender.nonBinary"),
      t("gender.preferNotToSay")
    ];
  };

  // Get nationalities based on the current language
  const getNationalities = (): string[] => {
    if (language === "en") {
      return [
        "Afghan", "German", "Angolan", "Argentine", "Australian", "Austrian", "Belgian", "Bolivian", 
        "Brazilian", "Canadian", "Chilean", "Chinese", "Colombian", "Korean", "Cuban", "Danish", 
        "Egyptian", "Emirati", "Ecuadorian", "Spanish", "American", "Filipino", "Finnish", "French", 
        "Greek", "Guatemalan", "Haitian", "Dutch", "Honduran", "Hungarian", "Indian", "Indonesian", 
        "British", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Jamaican", "Japanese", 
        "Lebanese", "Malaysian", "Moroccan", "Mexican", "Mozambican", "New Zealander", "Nigerian", 
        "Norwegian", "Pakistani", "Panamanian", "Paraguayan", "Peruvian", "Polish", "Portuguese", 
        "Romanian", "Russian", "Saudi", "Senegalese", "Serbian", "Singaporean", "South African", 
        "Swedish", "Swiss", "Syrian", "Thai", "Tunisian", "Turkish", "Ukrainian", "Uruguayan", 
        "Venezuelan", "Vietnamese", "Zimbabwean"
      ];
    } else if (language === "pt") {
      return [
        "Afegão", "Alemão", "Angolano", "Argentino", "Australiano", "Austríaco", "Belga", "Boliviano", 
        "Brasileiro", "Canadense", "Chileno", "Chinês", "Colombiano", "Coreano", "Cubano", "Dinamarquês", 
        "Egípcio", "Emiradense", "Equatoriano", "Espanhol", "Estadunidense", "Filipino", "Finlandês", 
        "Francês", "Grego", "Guatemalteco", "Haitiano", "Holandês", "Hondurenho", "Húngaro", "Indiano", 
        "Indonésio", "Inglês", "Iraniano", "Iraquiano", "Irlandês", "Israelense", "Italiano", "Jamaicano", 
        "Japonês", "Libanês", "Malaio", "Marroquino", "Mexicano", "Moçambicano", "Neozelandês", "Nigeriano", 
        "Norueguês", "Paquistanês", "Panamenho", "Paraguaio", "Peruano", "Polonês", "Português", "Romeno", 
        "Russo", "Saudita", "Senegalês", "Sérvio", "Singapurense", "Sul-africano", "Sueco", "Suíço", 
        "Sírio", "Tailandês", "Tunisiano", "Turco", "Ucraniano", "Uruguaio", "Venezuelano", "Vietnamita", 
        "Zimbabuense"
      ];
    } else if (language === "fr") {
      return [
        "Afghan", "Allemand", "Angolais", "Argentin", "Australien", "Autrichien", "Belge", "Bolivien", 
        "Brésilien", "Canadien", "Chilien", "Chinois", "Colombien", "Coréen", "Cubain", "Danois", 
        "Égyptien", "Émirati", "Équatorien", "Espagnol", "Américain", "Philippin", "Finlandais", 
        "Français", "Grec", "Guatémaltèque", "Haïtien", "Néerlandais", "Hondurien", "Hongrois", "Indien", 
        "Indonésien", "Anglais", "Iranien", "Irakien", "Irlandais", "Israélien", "Italien", "Jamaïcain", 
        "Japonais", "Libanais", "Malaisien", "Marocain", "Mexicain", "Mozambicain", "Néo-Zélandais", 
        "Nigérian", "Norvégien", "Pakistanais", "Panaméen", "Paraguayen", "Péruvien", "Polonais", 
        "Portugais", "Roumain", "Russe", "Saoudien", "Sénégalais", "Serbe", "Singapourien", "Sud-Africain", 
        "Suédois", "Suisse", "Syrien", "Thaïlandais", "Tunisien", "Turc", "Ukrainien", "Uruguayen", 
        "Vénézuélien", "Vietnamien", "Zimbabwéen"
      ];
    } else {
      // Default Spanish
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
    }
  };

  // Helper function to get nationality display name from key
  const getNationalityFromKey = (key: string, currentLanguage: string): string => {
    // If it's not a translation key, return as-is
    if (!key.startsWith("nationality.")) {
      return key;
    }

    // Map translation keys to their display values in different languages
    // This should ideally come from the translations file, this is a simplified version
    if (key === "nationality.spanish") {
      if (currentLanguage === "en") return "Spanish";
      else if (currentLanguage === "pt") return "Espanhol";
      else if (currentLanguage === "fr") return "Espagnol";
      else return "Español"; // Default to Spanish
    } else if (key === "nationality.afghan") {
      if (currentLanguage === "en") return "Afghan";
      else if (currentLanguage === "pt") return "Afegão";
      else if (currentLanguage === "fr") return "Afghan";
      else return "Afgano";
    } else if (key === "nationality.german") {
      if (currentLanguage === "en") return "German";
      else if (currentLanguage === "pt") return "Alemão";
      else if (currentLanguage === "fr") return "Allemand";
      else return "Alemán";
    } else if (key === "nationality.brazilian") {
      if (currentLanguage === "en") return "Brazilian";
      else if (currentLanguage === "pt") return "Brasileiro";
      else if (currentLanguage === "fr") return "Brésilien";
      else return "Brasileño";
    } else if (key === "nationality.french") {
      if (currentLanguage === "en") return "French";
      else if (currentLanguage === "pt") return "Francês";
      else if (currentLanguage === "fr") return "Français";
      else return "Francés";
    } else if (key === "nationality.american") {
      if (currentLanguage === "en") return "American";
      else if (currentLanguage === "pt") return "Estadunidense";
      else if (currentLanguage === "fr") return "Américain";
      else return "Estadounidense";
    } else if (key === "nationality.italian") {
      if (currentLanguage === "en") return "Italian";
      else if (currentLanguage === "pt") return "Italiano";
      else if (currentLanguage === "fr") return "Italien";
      else return "Italiano";
    } else if (key === "nationality.japanese") {
      if (currentLanguage === "en") return "Japanese";
      else if (currentLanguage === "pt") return "Japonês";
      else if (currentLanguage === "fr") return "Japonais";
      else return "Japonés";
    } else if (key === "nationality.portuguese") {
      if (currentLanguage === "en") return "Portuguese";
      else if (currentLanguage === "pt") return "Português";
      else if (currentLanguage === "fr") return "Portugais";
      else return "Portugués";
    }
    
    // Fallback to using the translation system directly
    return t(key);
  };

  // Fetch user data from API
  useEffect(() => {
    fetchUserProfile();
  }, []);

      // Mock user data for fallback when API fails
      const mockUserData: UserData = {
        id: authUser?.id || "123456",
        firstName: authUser?.firstName || "Carlos",
        lastName: authUser?.lastName || "Rodríguez",
        email: authUser?.email || "carlos.rodriguez@example.com",
        phone: "612 345 678",
        countryCode: "+34",
        profileImage: "https://via.placeholder.com/150",
        address: "Calle Gran Vía 28, Madrid, España",
        birthDate: "15/04/1988",
        gender: "gender.male",
        nationality: "nationality.spanish",
        occupation: "Ingeniero de Software",
        company: "TechSolutions S.L.",
        languages: [
          { language: "language.spanish", level: "level.native" },
          { language: "language.english", level: "level.c1" },
          { language: "language.french", level: "level.b1" },
        ],
        interests: ["Gastronomía", "Viajes", "Idiomas", "Tecnología"],
        bio: "Apasionado por los idiomas y la gastronomía. Me encanta viajar y conocer nuevas culturas a través de su comida. Trabajo como ingeniero de software y utilizo LEWET para mejorar mi nivel de francés mientras disfruto de buena comida.",
      };

      const fetchUserProfile = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Use the correct endpoint path - remove '/api' prefix since it's added by the API client
          const response = await api.get('/user/me');
          
          if (response && response.data) {
            // Transform API data to match our UserData interface
            const apiUser = response.data;
            
            // Handle languages - check if UserLanguages exists and is not empty
            let userLanguages: Language[] = [];
            if (apiUser.UserLanguages && Array.isArray(apiUser.UserLanguages) && apiUser.UserLanguages.length > 0) {
              userLanguages = apiUser.UserLanguages.map((lang: any) => ({
                language: `language.${lang.languageName.toLowerCase()}`,
                level: mapProficiencyToLevel(lang.proficiencyLevel)
              }));
            }
            
            // Handle interests - check if interests exists and is not empty
            let userInterests: string[] = [];
            if (apiUser.interests && typeof apiUser.interests === 'string' && apiUser.interests.trim() !== '') {
              userInterests = apiUser.interests.split(',').map((interest: string) => interest.trim());
            }
            
            const transformedUserData: UserData = {
              id: apiUser.userId?.toString() || authUser?.id || "",
              firstName: apiUser.firstName || "",
              lastName: apiUser.lastName || "",
              email: apiUser.email || "",
              phone: apiUser.phoneNumber?.replace(/^\+\d+\s*/, '') || "", // Remove country code if present
              countryCode: getCountryCodeFromPhone(apiUser.phoneNumber) || "+34",
              profileImage: apiUser.profileImage || "https://via.placeholder.com/150",
              address: apiUser.address || "",
              birthDate: apiUser.birthDate || "",
              gender: apiUser.gender || "",
              nationality: apiUser.nationality || "",
              occupation: apiUser.occupation || "",
              company: apiUser.company || "",
              languages: userLanguages,
              interests: userInterests,
              bio: apiUser.bio || ""
            };
            
            setUserData(transformedUserData);
            setEditedUser(transformedUserData);
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          
          // Use mock data as fallback when API fails
          console.log('Using mock data as fallback');
          setUserData(mockUserData);
          setEditedUser(mockUserData);
          
          // Set a user-friendly error message
          if (err.response?.status === 404) {
            setError(t("errors.profileNotFound") || 'User profile not found. Using sample data.');
          } else if (err.message?.includes('Network Error')) {
            setError(t("errors.networkError") || 'Network error. Check your connection and try again.');
          } else {
            setError(t("errors.genericError") || 'Could not load profile data. Using sample data.');
          }
        } finally {
          setIsLoading(false);
        }
      };

  // Helper to extract country code from phone number
  const getCountryCodeFromPhone = (phone: string | undefined): string => {
    if (!phone) return "+34"; // Default
    
    // Try to extract country code like +XX or +XXX
    const match = phone.match(/^\+(\d{1,3})/);
    if (match && match[0]) {
      return match[0];
    }
    
    return "+34"; // Default
  };
  
  // Map server proficiency levels to our level format
  const mapProficiencyToLevel = (proficiency: string): string => {
    switch (proficiency) {
      case 'A1': return 'level.a1';
      case 'A2': return 'level.a2';
      case 'B1': return 'level.b1';
      case 'B2': return 'level.b2';
      case 'C1': return 'level.c1';
      case 'C2': return 'level.c2';
      case 'Nativo': return 'level.native';
      default: return proficiency;
    }
  };
  
  // Map our level format to server proficiency
  const mapLevelToProficiency = (level: string): string => {
    switch (level) {
      case 'level.a1': return 'A1';
      case 'level.a2': return 'A2';
      case 'level.b1': return 'B1';
      case 'level.b2': return 'B2';
      case 'level.c1': return 'C1';
      case 'level.c2': return 'C2';
      case 'level.native': return 'Nativo';
      default: return level;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Prepare data for API
      const updateData: any = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
        phoneNumber: `${editedUser.countryCode} ${editedUser.phone}`,
        address: editedUser.address,
        gender: editedUser.gender,
        nationality: editedUser.nationality,
        occupation: editedUser.occupation,
        company: editedUser.company,
        bio: editedUser.bio
      };
      
      // Only include languages if they exist
      if (editedUser.languages && editedUser.languages.length > 0) {
        updateData.languages = editedUser.languages.map(lang => ({
          languageName: lang.language.replace('language.', ''),
          proficiencyLevel: mapLevelToProficiency(lang.level)
        }));
      }
      
      // Only include interests if they exist
      if (editedUser.interests && editedUser.interests.length > 0) {
        updateData.interests = editedUser.interests.join(',');
      }
      
      try {
        // Use the correct endpoint path - remove '/api' prefix
        await api.put('/user/me', updateData);
        
        // Update local state with edited data
        setUserData(editedUser);
        setIsEditing(false);
        
        // Show success message
        Alert.alert(
          t('success') || 'Success', 
          t('personalInfo.updateSuccess') || 'Profile updated successfully'
        );
      } catch (apiError: any) {
        console.error('Error calling API:', apiError);
        
        // Show user-friendly error but still save locally
        Alert.alert(
          t('warning') || 'Warning',
          t('personalInfo.offlineUpdate') || 'Could not save to server, but changes are saved locally.',
          [
            { 
              text: t('button.ok') || 'OK',
              onPress: () => {
                // Update local state despite API error
                setUserData(editedUser);
                setIsEditing(false);
              }
            }
          ]
        );
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err?.message || t('errors.updateFailed') || 'Failed to update profile');
      Alert.alert(
        t('error') || 'Error', 
        t('errors.updateFailed') || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
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
    // Map the translated gender text back to its key
    let genderKey = "gender.male"; // Default
    if (gender === t("gender.female")) {
      genderKey = "gender.female";
    } else if (gender === t("gender.nonBinary")) {
      genderKey = "gender.nonBinary";
    } else if (gender === t("gender.preferNotToSay")) {
      genderKey = "gender.preferNotToSay";
    }
    
    setEditedUser(prev => ({ ...prev, gender: genderKey }));
    setShowGenderModal(false);
  }
  
  // Select nationality
  const handleSelectNationality = (nationality: string): void => {
    // Map the selected nationality to its key
    let nationalityKey = "";
    
    // Map based on the current language
    if (language === "en") {
      if (nationality === "Spanish") nationalityKey = "nationality.spanish";
      else if (nationality === "Afghan") nationalityKey = "nationality.afghan";
      else if (nationality === "German") nationalityKey = "nationality.german";
      else if (nationality === "Brazilian") nationalityKey = "nationality.brazilian";
      else if (nationality === "French") nationalityKey = "nationality.french";
      else if (nationality === "American") nationalityKey = "nationality.american";
      else if (nationality === "Italian") nationalityKey = "nationality.italian";
      else if (nationality === "Japanese") nationalityKey = "nationality.japanese";
      else if (nationality === "Portuguese") nationalityKey = "nationality.portuguese";
      // Add other mappings as needed
      else nationalityKey = nationality; // Fallback to direct value if no mapping
    } else if (language === "pt") {
      if (nationality === "Espanhol") nationalityKey = "nationality.spanish";
      else if (nationality === "Afegão") nationalityKey = "nationality.afghan";
      else if (nationality === "Alemão") nationalityKey = "nationality.german";
      else if (nationality === "Brasileiro") nationalityKey = "nationality.brazilian";
      else if (nationality === "Francês") nationalityKey = "nationality.french";
      else if (nationality === "Estadunidense") nationalityKey = "nationality.american";
      else if (nationality === "Italiano") nationalityKey = "nationality.italian";
      else if (nationality === "Japonês") nationalityKey = "nationality.japanese";
      else if (nationality === "Português") nationalityKey = "nationality.portuguese";
      // Add other mappings as needed
      else nationalityKey = nationality; // Fallback to direct value if no mapping
    } else if (language === "fr") {
      if (nationality === "Espagnol") nationalityKey = "nationality.spanish";
      else if (nationality === "Afghan") nationalityKey = "nationality.afghan";
      else if (nationality === "Allemand") nationalityKey = "nationality.german";
      else if (nationality === "Brésilien") nationalityKey = "nationality.brazilian";
      else if (nationality === "Français") nationalityKey = "nationality.french";
      else if (nationality === "Américain") nationalityKey = "nationality.american";
      else if (nationality === "Italien") nationalityKey = "nationality.italian";
      else if (nationality === "Japonais") nationalityKey = "nationality.japanese";
      else if (nationality === "Portugais") nationalityKey = "nationality.portuguese";
      // Add other mappings as needed
      else nationalityKey = nationality; // Fallback to direct value if no mapping
    } else {
      // Default Spanish
      if (nationality === "Español") nationalityKey = "nationality.spanish";
      else if (nationality === "Afgano") nationalityKey = "nationality.afghan";
      else if (nationality === "Alemán") nationalityKey = "nationality.german";
      else if (nationality === "Brasileño") nationalityKey = "nationality.brazilian";
      else if (nationality === "Francés") nationalityKey = "nationality.french";
      else if (nationality === "Estadounidense") nationalityKey = "nationality.american";
      else if (nationality === "Italiano") nationalityKey = "nationality.italian";
      else if (nationality === "Japonés") nationalityKey = "nationality.japanese";
      else if (nationality === "Portugués") nationalityKey = "nationality.portuguese";
      // Add other mappings as needed
      else nationalityKey = nationality; // Fallback to direct value if no mapping
    }
    
    setEditedUser(prev => ({ ...prev, nationality: nationalityKey }));
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
      // Add the translated version of the interest instead of the key
      const translatedInterest = t(newInterest);
      const updatedInterests = [...editedUser.interests, translatedInterest];
      setEditedUser(prev => ({ ...prev, interests: updatedInterests }));
      setNewInterest("");
      setShowAddInterestModal(false);
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

  // Custom translations for retry button to avoid the missing translation warning
  const getRetryText = () => {
    switch(language) {
      case 'en':
        return 'Retry';
      case 'pt':
        return 'Tentar novamente';
      case 'fr':
        return 'Réessayer';
      default:
        return 'Reintentar'; // Spanish default
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>{t("loading")}</Text>
      </View>
    );
  }

  // Show error overlay if there's an error, but still display the data if available
  // This allows us to show mock data with an error message when the API fails
  const showErrorOverlay = error && userData.id;

  // Show complete error state only if there's an error and no data to display
  if (error && !userData.id) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchUserProfile}
        >
          <Text style={{ color: 'white' }}>{getRetryText()}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 30 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("personalInfo.title")}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.editButtonText, { color: colors.primary }]}>
              {isEditing ? t("personalInfo.save") : t("personalInfo.edit")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: "white" }]}>
            <Ionicons name="camera" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>

        <Card style={[styles.infoCard, { marginTop: 0 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("personalInfo.basicData")}</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.firstName")}</Text>
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
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.lastName")}</Text>
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
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.email")}</Text>
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
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.phone")}</Text>
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
                  placeholder="612 345 678"
                />
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {countryCodes.find(c => c.code === userData.countryCode)?.flag} {userData.countryCode} {userData.phone}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.birthDate")}</Text>
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
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.gender")}</Text>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.selectInput, { borderColor: colors.border }]}
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={{ color: colors.text }}>{editedUser.gender.startsWith("gender.") ? t(editedUser.gender) : editedUser.gender}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{userData.gender.startsWith("gender.") ? t(userData.gender) : userData.gender}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.nationality")}</Text>
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
                      
                      // Check if it's a translation key
                      if (name.startsWith("nationality.")) {
                        // Get the actual nationality name in current language
                        name = getNationalityFromKey(name, language);
                      }
                      const countryFlags: {[key: string]: string} = {
                        "Española": "🇪🇸", "Spanish": "🇪🇸", "Espanhol": "🇪🇸",
                        "Afgano": "🇦🇫", "Afghan": "🇦🇫", "Afegão": "🇦🇫", 
                        "Alemán": "🇩🇪", "German": "🇩🇪", "Alemão": "🇩🇪",
                        "Angoleño": "🇦🇴", "Angolan": "🇦🇴", "Angolano": "🇦🇴",
                        "Argentino": "🇦🇷", "Argentine": "🇦🇷",
                        "Australiano": "🇦🇺", "Australian": "🇦🇺",
                        "Brasileño": "🇧🇷", "Brazilian": "🇧🇷", "Brasileiro": "🇧🇷",
                        "Canadiense": "🇨🇦", "Canadian": "🇨🇦", "Canadense": "🇨🇦",
                        "Francés": "🇫🇷", "French": "🇫🇷", "Francês": "🇫🇷",
                        "Estadounidense": "🇺🇸", "American": "🇺🇸", "Estadunidense": "🇺🇸",
                        "Italiano": "🇮🇹", "Italian": "🇮🇹",
                        "Japonés": "🇯🇵", "Japanese": "🇯🇵", "Japonês": "🇯🇵",
                        "Mexicano": "🇲🇽", "Mexican": "🇲🇽",
                        "Portugués": "🇵🇹", "Portuguese": "🇵🇹", "Português": "🇵🇹"
                      };
                      return countryFlags[name] || "🌎"; // Default world flag
                    };
                    
                    return <Text style={{ fontSize: 18, marginRight: 8 }}>{getFlag(editedUser.nationality)}</Text>;
                  })()}
                  <Text style={{ color: colors.text }}>{editedUser.nationality.startsWith("nationality.") ? t(editedUser.nationality) : editedUser.nationality}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {(() => {
                  // Get flag based on nationality
                  const getFlag = (name: string | undefined) => {
                    if (!name) return "🌎";
                    
                    // Check if it's a translation key
                    if (name.startsWith("nationality.")) {
                      // Get the actual nationality name in current language
                      name = getNationalityFromKey(name, language);
                    }
                    const countryFlags: {[key: string]: string} = {
                      "Española": "🇪🇸", "Spanish": "🇪🇸", "Espanhol": "🇪🇸",
                      "Afgano": "🇦🇫", "Afghan": "🇦🇫", "Afegão": "🇦🇫", 
                      "Alemán": "🇩🇪", "German": "🇩🇪", "Alemão": "🇩🇪",
                      "Angoleño": "🇦🇴", "Angolan": "🇦🇴", "Angolano": "🇦🇴",
                      "Argentino": "🇦🇷", "Argentine": "🇦🇷",
                      "Australiano": "🇦🇺", "Australian": "🇦🇺",
                      "Brasileño": "🇧🇷", "Brazilian": "🇧🇷", "Brasileiro": "🇧🇷",
                      "Canadiense": "🇨🇦", "Canadian": "🇨🇦", "Canadense": "🇨🇦",
                      "Francés": "🇫🇷", "French": "🇫🇷", "Francês": "🇫🇷",
                      "Estadounidense": "🇺🇸", "American": "🇺🇸", "Estadunidense": "🇺🇸",
                      "Italiano": "🇮🇹", "Italian": "🇮🇹",
                      "Japonés": "🇯🇵", "Japanese": "🇯🇵", "Japonês": "🇯🇵",
                      "Mexicano": "🇲🇽", "Mexican": "🇲🇽",
                      "Portugués": "🇵🇹", "Portuguese": "🇵🇹", "Português": "🇵🇹"
                    };
                    return countryFlags[name] || "🌎"; // Default world flag
                  };
                  
                  return <Text style={{ fontSize: 18, marginRight: 8 }}>{getFlag(userData.nationality)}</Text>;
                })()}
                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.nationality.startsWith("nationality.") ? t(userData.nationality) : userData.nationality}</Text>
              </View>
            )}
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("personalInfo.address")}</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + "80" }]}>{t("personalInfo.fullAddress")}</Text>
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
        </Card>

        {/* Profession section removed as requested */}

        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("personalInfo.languages")}</Text>

          {editedUser.languages.length > 0 ? (
            editedUser.languages.map((item, index) => (
              <View key={index} style={styles.languageItem}>
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {item.language.startsWith("language.") ? t(item.language) : item.language}
                  </Text>
                  <Text style={[styles.languageLevel, { color: colors.text + "80" }]}>
                    {item.level.startsWith("level.") ? t(item.level) : item.level}
                  </Text>
                </View>
                {isEditing && (
                  <TouchableOpacity onPress={() => handleRemoveLanguage(index)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={{ color: colors.text + "80", fontStyle: "italic", marginBottom: 12 }}>
              {t("personalInfo.noLanguagesAdded")}
            </Text>
          )}

          {isEditing && (
            <TouchableOpacity 
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={() => setShowAddLanguageModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>{t("personalInfo.addLanguage")}</Text>
            </TouchableOpacity>
          )}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("personalInfo.interests")}</Text>

          <View style={styles.interestsContainer}>
            {editedUser.interests.length > 0 ? (
              editedUser.interests.map((interest, index) => (
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
              ))
            ) : (
              <Text style={{ color: colors.text + "80", fontStyle: "italic", marginBottom: 12 }}>
                {t("personalInfo.noInterestsAdded")}
              </Text>
            )}

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
                <Text style={[styles.addInterestText, { color: colors.primary }]}>{t("personalInfo.add")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("personalInfo.biography")}</Text>
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
        </Card>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("Select Country Code")}</Text>
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
              <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.cancel")}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("personalInfo.selectDate")}</Text>
            
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
                  {currentDate.toLocaleString(language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : language === 'fr' ? 'fr-FR' : 'es-ES', { month: 'long', year: 'numeric' })}
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
                <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSelectDate(currentDate)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.save")}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("personalInfo.gender")}</Text>
            {getGenderOptions().map((gender, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  (editedUser.gender.startsWith("gender.") ? t(editedUser.gender) === gender : editedUser.gender === gender) && { backgroundColor: colors.primary + '15' }
                ]}
                onPress={() => handleSelectGender(gender)}
              >
                <Text style={{ color: colors.text }}>{gender}</Text>
                {(editedUser.gender.startsWith("gender.") ? t(editedUser.gender) === gender : editedUser.gender === gender) && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.cancel")}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("personalInfo.nationality")}</Text>
            <FlatList
              data={getNationalities().map((nationality) => {
                // Get appropriate flag based on nationality
                const getFlag = (name: string) => {
                  const countryFlags: {[key: string]: string} = {
                    // Simplified mapping for key nationalities
                    "Española": "🇪🇸", "Spanish": "🇪🇸", "Espanhol": "🇪🇸",
                    "Afgano": "🇦🇫", "Afghan": "🇦🇫", "Afegão": "🇦🇫", 
                    "Alemán": "🇩🇪", "German": "🇩🇪", "Alemão": "🇩🇪",
                    "Angoleño": "🇦🇴", "Angolan": "🇦🇴", "Angolano": "🇦🇴",
                    "Argentino": "🇦🇷", "Argentine": "🇦🇷",
                    "Australiano": "🇦🇺", "Australian": "🇦🇺",
                    "Brasileño": "🇧🇷", "Brazilian": "🇧🇷", "Brasileiro": "🇧🇷",
                    "Canadiense": "🇨🇦", "Canadian": "🇨🇦", "Canadense": "🇨🇦",
                    "Francés": "🇫🇷", "French": "🇫🇷", "Francês": "🇫🇷",
                    "Estadounidense": "🇺🇸", "American": "🇺🇸", "Estadunidense": "🇺🇸",
                    "Italiano": "🇮🇹", "Italian": "🇮🇹",
                    "Japonés": "🇯🇵", "Japanese": "🇯🇵", "Japonês": "🇯🇵",
                    "Mexicano": "🇲🇽", "Mexican": "🇲🇽",
                    "Portugués": "🇵🇹", "Portuguese": "🇵🇹", "Português": "🇵🇹"
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
                    (editedUser.nationality.startsWith("nationality.") ? 
                      getNationalityFromKey(editedUser.nationality, language) === item.name : 
                      editedUser.nationality === item.name) && 
                    { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => handleSelectNationality(item.name)}
                >
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{item.flag}</Text>
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                  {(editedUser.nationality.startsWith("nationality.") ? 
                    getNationalityFromKey(editedUser.nationality, language) === item.name : 
                    editedUser.nationality === item.name) && (
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
              <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Improved Add Language Modal with Dropdowns */}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("personalInfo.addLanguage")}</Text>
            
            {/* Language Dropdown */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalLabel, { color: colors.text + "80" }]}>{t("Language Name")}</Text>
              
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
                          {t(newLanguage.language)}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ color: colors.text + '80' }}>{t("Select Language")}</Text>
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
                          <Text style={{ color: colors.text, marginLeft: 10 }}>{t(item.language)}</Text>
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
              <Text style={[styles.modalLabel, { color: colors.text + "80" }]}>{t("Language Level")}</Text>
              
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
                    {newLanguage.level ? (newLanguage.level.startsWith("level.") ? t(newLanguage.level) : newLanguage.level) : t("Select Level")}
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
                      {languageLevelKeys.map((levelKey) => (
                        <TouchableOpacity
                          key={levelKey}
                          style={[
                            styles.dropdownItem,
                            newLanguage.level === levelKey && { backgroundColor: colors.primary + '15' }
                          ]}
                          onPress={() => {
                            setNewLanguage(prev => ({ ...prev, level: levelKey }));
                            setShowLanguageLevelModal(false);
                          }}
                        >
                          <Text style={{ color: colors.text }}>{t(levelKey)}</Text>
                          {newLanguage.level === levelKey && (
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
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t("button.cancel")}</Text>
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
                <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.save")}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("Add Interest")}</Text>
            
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
                  <Text style={{ color: colors.text }}>{t(item)}</Text>
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
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t("button.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddInterest}
                disabled={!newInterest}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>{t("button.save")}</Text>
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
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
})