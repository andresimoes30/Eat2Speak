"use client"

import { useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { register } from "../../../services/api"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"

// Languages for native selection with 20 languages from the database
const languages = [
  "Inglês",
  "Mandarim",
  "Hindi",
  "Espanhol",
  "Francês",
  "Árabe",
  "Bengali",
  "Português",
  "Russo",
  "Urdu",
  "Indonésio",
  "Alemão",
  "Japonês",
  "Marata",
  "Telugu",
  "Turco",
  "Tâmil",
  "Vietnamita",
  "Coreano",
  "Italiano"
]

// Countries with flag emojis for the nationality dropdown
const countries = [
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Andorra", flag: "🇦🇩" },
  { name: "Angola", flag: "🇦🇴" },
  { name: "Antigua and Barbuda", flag: "🇦🇬" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Azerbaijan", flag: "🇦🇿" },
  { name: "Bahamas", flag: "🇧🇸" },
  { name: "Bahrain", flag: "🇧🇭" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Barbados", flag: "🇧🇧" },
  { name: "Belarus", flag: "🇧🇾" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Belize", flag: "🇧🇿" },
  { name: "Benin", flag: "🇧🇯" },
  { name: "Bhutan", flag: "🇧🇹" },
  { name: "Bolivia", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { name: "Botswana", flag: "🇧🇼" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Brunei", flag: "🇧🇳" },
  { name: "Bulgaria", flag: "🇧🇬" },
  { name: "Burkina Faso", flag: "🇧🇫" },
  { name: "Burundi", flag: "🇧🇮" },
  { name: "Cabo Verde", flag: "🇨🇻" },
  { name: "Cambodia", flag: "🇰🇭" },
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Central African Republic", flag: "🇨🇫" },
  { name: "Chad", flag: "🇹🇩" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Comoros", flag: "🇰🇲" },
  { name: "Congo", flag: "🇨🇬" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Cyprus", flag: "🇨🇾" },
  { name: "Czech Republic", flag: "🇨🇿" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Djibouti", flag: "🇩🇯" },
  { name: "Dominica", flag: "🇩🇲" },
  { name: "Dominican Republic", flag: "🇩🇴" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "El Salvador", flag: "🇸🇻" },
  { name: "Equatorial Guinea", flag: "🇬🇶" },
  { name: "Eritrea", flag: "🇪🇷" },
  { name: "Estonia", flag: "🇪🇪" },
  { name: "Eswatini", flag: "🇸🇿" },
  { name: "Ethiopia", flag: "🇪🇹" },
  { name: "Fiji", flag: "🇫🇯" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "France", flag: "🇫🇷" },
  { name: "Gabon", flag: "🇬🇦" },
  { name: "Gambia", flag: "🇬🇲" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "Grenada", flag: "🇬🇩" },
  { name: "Guatemala", flag: "🇬🇹" },
  { name: "Guinea", flag: "🇬🇳" },
  { name: "Guinea-Bissau", flag: "🇬🇼" },
  { name: "Guyana", flag: "🇬🇾" },
  { name: "Haiti", flag: "🇭🇹" },
  { name: "Honduras", flag: "🇭🇳" },
  { name: "Hungary", flag: "🇭🇺" },
  { name: "Iceland", flag: "🇮🇸" },
  { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Iraq", flag: "🇮🇶" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Jamaica", flag: "🇯🇲" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" },
  { name: "Kazakhstan", flag: "🇰🇿" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Kiribati", flag: "🇰🇮" },
  { name: "Korea, North", flag: "🇰🇵" },
  { name: "Korea, South", flag: "🇰🇷" },
  { name: "Kuwait", flag: "🇰🇼" },
  { name: "Kyrgyzstan", flag: "🇰🇬" },
  { name: "Laos", flag: "🇱🇦" },
  { name: "Latvia", flag: "🇱🇻" },
  { name: "Lebanon", flag: "🇱🇧" },
  { name: "Lesotho", flag: "🇱🇸" },
  { name: "Liberia", flag: "🇱🇷" },
  { name: "Libya", flag: "🇱🇾" },
  { name: "Liechtenstein", flag: "🇱🇮" },
  { name: "Lithuania", flag: "🇱🇹" },
  { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Madagascar", flag: "🇲🇬" },
  { name: "Malawi", flag: "🇲🇼" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "Maldives", flag: "🇲🇻" },
  { name: "Mali", flag: "🇲🇱" },
  { name: "Malta", flag: "🇲🇹" },
  { name: "Marshall Islands", flag: "🇲🇭" },
  { name: "Mauritania", flag: "🇲🇷" },
  { name: "Mauritius", flag: "🇲🇺" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Micronesia", flag: "🇫🇲" },
  { name: "Moldova", flag: "🇲🇩" },
  { name: "Monaco", flag: "🇲🇨" },
  { name: "Mongolia", flag: "🇲🇳" },
  { name: "Montenegro", flag: "🇲🇪" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Mozambique", flag: "🇲🇿" },
  { name: "Myanmar", flag: "🇲🇲" },
  { name: "Namibia", flag: "🇳🇦" },
  { name: "Nauru", flag: "🇳🇷" },
  { name: "Nepal", flag: "🇳🇵" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "Nicaragua", flag: "🇳🇮" },
  { name: "Niger", flag: "🇳🇪" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "North Macedonia", flag: "🇲🇰" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Oman", flag: "🇴🇲" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Palau", flag: "🇵🇼" },
  { name: "Panama", flag: "🇵🇦" },
  { name: "Papua New Guinea", flag: "🇵🇬" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "Peru", flag: "🇵🇪" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Romania", flag: "🇷🇴" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Rwanda", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { name: "Saint Lucia", flag: "🇱🇨" },
  { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
  { name: "Samoa", flag: "🇼🇸" },
  { name: "San Marino", flag: "🇸🇲" },
  { name: "Sao Tome and Principe", flag: "🇸🇹" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Serbia", flag: "🇷🇸" },
  { name: "Seychelles", flag: "🇸🇨" },
  { name: "Sierra Leone", flag: "🇸🇱" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Slovakia", flag: "🇸🇰" },
  { name: "Slovenia", flag: "🇸🇮" },
  { name: "Solomon Islands", flag: "🇸🇧" },
  { name: "Somalia", flag: "🇸🇴" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "South Sudan", flag: "🇸🇸" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Sudan", flag: "🇸🇩" },
  { name: "Suriname", flag: "🇸🇷" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Syria", flag: "🇸🇾" },
  { name: "Taiwan", flag: "🇹🇼" },
  { name: "Tajikistan", flag: "🇹🇯" },
  { name: "Tanzania", flag: "🇹🇿" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Timor-Leste", flag: "🇹🇱" },
  { name: "Togo", flag: "🇹🇬" },
  { name: "Tonga", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", flag: "🇹🇹" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Turkmenistan", flag: "🇹🇲" },
  { name: "Tuvalu", flag: "🇹🇻" },
  { name: "Uganda", flag: "🇺🇬" },
  { name: "Ukraine", flag: "🇺🇦" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Uzbekistan", flag: "🇺🇿" },
  { name: "Vanuatu", flag: "🇻🇺" },
  { name: "Vatican City", flag: "🇻🇦" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Yemen", flag: "🇾🇪" },
  { name: "Zambia", flag: "🇿🇲" },
  { name: "Zimbabwe", flag: "🇿🇼" }
];

// Define proper types for the API based on database schema and backend expectations
interface BaseUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
  address: string
  userTypes: string // Changed from userType to userTypes to match backend expectations
}

interface StudentNativeUserData extends BaseUserData {
  nationality: string
  gender: string
}

interface NativeUserData extends StudentNativeUserData {
  languageName: string
}

interface RestaurantUserData extends BaseUserData {
  restaurantName: string // Backend expects restaurantName, not name
  cuisineType: string
}

// Union type for all possible user data
type UserData = BaseUserData | StudentNativeUserData | NativeUserData | RestaurantUserData

// Definir el tipo correcto para la navegación
type NavigationProp = {
  navigate: (screen: string, params?: any) => void
}

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { signUp } = useAuth()
  const { t } = useLanguage()

  // User type selection
  const [userType, setUserType] = useState("student") // student, native, restaurant

  // Form state for all fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    nativeLanguage: "",
    restaurantName: "",
    cuisineType: "",
    address: "",
    nationality: "",
    gender: "",
    customGender: ""
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false)
  const [nationalitySearch, setNationalitySearch] = useState("")
  
  // Filtered countries for nationality dropdown
  const filteredCountries = useMemo(() => {
    return countries.filter(country => 
      country.name.toLowerCase().includes(nationalitySearch.toLowerCase())
    );
  }, [nationalitySearch]);
  
  // Filtered languages for native language dropdown
  const [languageSearch, setLanguageSearch] = useState("")
  const filteredLanguages = useMemo(() => {
    return languages.filter(language => 
      language.toLowerCase().includes(languageSearch.toLowerCase())
    );
  }, [languageSearch]);

  // Gender options
  const genderOptions = [
    "Masculino",
    "Feminino", 
    "Não binário", 
    "Prefiro não dizer", 
    "Outro"
  ]

  // Validation errors
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    nativeLanguage: "",
    restaurantName: "",
    cuisineType: "",
    address: "",
    nationality: "",
    gender: "",
    customGender: ""
  })

  // Handle form input changes
  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  // Reset form when user type changes
  useEffect(() => {
    // Reset form fields specific to user types when switching between types
    if (userType === "student" || userType === "native") {
      setForm(prev => ({
        ...prev,
        restaurantName: "",
        cuisineType: "",
      }));
    } else if (userType === "restaurant") {
      setForm(prev => ({
        ...prev,
        nativeLanguage: "",
        nationality: "",
        gender: "",
      }));
    }
    // Reset errors when changing user type
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      nativeLanguage: "",
      restaurantName: "",
      cuisineType: "",
      address: "",
      nationality: "",
      gender: "",
      customGender: "",
    });
    setApiError("");
  }, [userType]);

  const validate = () => {
    let isValid = true
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      nativeLanguage: "",
      restaurantName: "",
      cuisineType: "",
      address: "",
      nationality: "",
      gender: "",
      customGender: "",
    }

    // Reset API error
    setApiError("")

    // Common validation for all user types
    if (!form.firstName.trim()) {
      newErrors.firstName = t("auth.register.firstNameRequired") || "First name is required"
      isValid = false
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = t("auth.register.lastNameRequired") || "Last name is required"
      isValid = false
    }

    if (!form.email.trim()) {
      newErrors.email = t("auth.register.emailRequired") || "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      // Stricter email validation - must have @ and domain
      newErrors.email = t("auth.register.emailInvalid") || "Please enter a valid email address"
      isValid = false
    }

    if (!form.phone.trim()) {
      newErrors.phone = t("auth.register.phoneRequired") || "Phone number is required"
      isValid = false
    }

    if (!form.password) {
      newErrors.password = t("auth.register.passwordRequired") || "Password is required"
      isValid = false
    } else if (form.password.length < 6) {
      newErrors.password = t("auth.register.passwordMinLength") || "Password must be at least 6 characters"
      isValid = false
    }
    
    // Make sure confirm password is not empty
    if (!form.confirmPassword) {
      newErrors.confirmPassword = t("auth.register.confirmPasswordRequired") || "Confirm password is required"
      isValid = false
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = t("auth.register.passwordsDoNotMatch") || "Passwords do not match"
      isValid = false
    }

    // Validate address for all user types
    if (!form.address.trim() && (userType === "student" || userType === "native")) {
      newErrors.address = t("auth.register.addressRequired")
      isValid = false
    }

    // Validate nationality for student and native
    if ((userType === "student" || userType === "native") && !form.nationality.trim()) {
      newErrors.nationality = t("auth.register.nationalityRequired")
      isValid = false
    }

    // Validate gender for student and native
    if ((userType === "student" || userType === "native") && !form.gender.trim()) {
      newErrors.gender = t("auth.register.genderRequired")
      isValid = false
    }
    
    // Validate custom gender if "Outro" is selected
    if ((userType === "student" || userType === "native") && 
        form.gender === "Outro" && 
        !form.customGender.trim()) {
      newErrors.customGender = t("auth.register.customGenderRequired") || "Por favor, especifique seu gênero"
      isValid = false
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = t("auth.register.passwordsDoNotMatch")
      isValid = false
    }

    // Native-specific validation
    if (userType === "native" && !form.nativeLanguage) {
      newErrors.nativeLanguage = t("auth.register.native.languageRequired")
      isValid = false
    }

    // Restaurant-specific validation
    if (userType === "restaurant") {
      if (!form.restaurantName.trim()) {
        newErrors.restaurantName = t("auth.register.restaurant.nameRequired")
        isValid = false
      }

      if (!form.cuisineType.trim()) {
        newErrors.cuisineType = t("auth.register.restaurant.cuisineTypeRequired")
        isValid = false
      }

      if (!form.address.trim()) {
        newErrors.address = t("auth.register.restaurant.addressRequired")
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleRegister = async () => {
    // Run validation
    if (!validate()) {
      // Show alert if validation fails
      Alert.alert(
        "Missing Required Fields",
        "Please fill in all required fields correctly.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    setApiError("");

  try {
      // Create base user data object with required fields
      const baseUserData: BaseUserData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        address: form.address,
        userTypes: userType, // This field name matches backend expectations
      };

      let userData: UserData = baseUserData;

      // Add fields based on user type - include all required fields for each type
      if (userType === "student") {
        userData = {
          ...baseUserData,
          nationality: form.nationality,
          gender: form.gender === "Outro" ? form.customGender : form.gender,
        } as StudentNativeUserData;
      } else if (userType === "native") {
        userData = {
          ...baseUserData,
          nationality: form.nationality,
          gender: form.gender === "Outro" ? form.customGender : form.gender,
          languageName: form.nativeLanguage,
        } as NativeUserData;
      } else if (userType === "restaurant") {
        userData = {
          ...baseUserData,
          restaurantName: form.restaurantName,
          cuisineType: form.cuisineType,
        } as RestaurantUserData;
      }

      console.log("Submitting registration data:", userData);

      // Use the register function
      const response = await register(userData);
      
      // Success handling - store success message for the login screen
      const successMessage = response.message || "Your account has been created successfully. Please log in.";
      
      // Show brief success message
      Alert.alert("Registration Successful", successMessage);
      
      // Automatically navigate to login screen after a brief delay
      // This ensures the user sees the success message before navigation
      setIsLoading(false);
      
      // Get the correct login screen name based on user type
      const loginScreen = getLoginScreenName();
      
      // Direct navigation to login screen with success message
      setTimeout(() => {
        navigation.navigate(loginScreen, { 
          registrationSuccess: true, 
          message: successMessage 
        });
      }, 800); // Short delay for user to see success message
      
      // Return early to prevent the finally block from executing
      return;
    } catch (error: any) {
      // Enhanced error handling with specific guidance for connectivity issues
      let errorMessage = "Registration failed. Please try again.";
      let alertTitle = "Registration Failed";
      
      // Check for server connectivity issues
      if (error?.code === 'SERVER_UNAVAILABLE' || error?.code === 'NETWORK_ERROR') {
        alertTitle = "Server Connection Error";
        errorMessage = error.message || "Cannot connect to server. Please ensure the server is running.";
        
        // Show more detailed instructions for developers
        if (__DEV__) {
          errorMessage += "\n\nDeveloper Note: Start the server with:\ncd server && node start.js";
        }
      } 
      // Check if there's a specific field error
      else if (error?.field) {
        // Map field names to user-friendly names
        const fieldNames: {[key: string]: string} = {
          email: "Email",
          password: "Password",
          firstName: "First Name",
          lastName: "Last Name",
          phoneNumber: "Phone Number",
          restaurantName: "Restaurant Name",
          cuisineType: "Cuisine Type",
          address: "Address",
          nationality: "Nationality",
          gender: "Gender",
          languageName: "Native Language"
        };
        
        const fieldName = fieldNames[error.field] || error.field;
        errorMessage = `${fieldName}: ${error.message || "Invalid value"}`;
        
        // Update the specific field error
        setErrors(prev => ({
          ...prev,
          [error.field]: error.message
        }));
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // Show alert with actionable guidance
      Alert.alert(
        alertTitle, 
        errorMessage,
        error?.code === 'SERVER_UNAVAILABLE' || error?.code === 'NETWORK_ERROR'
          ? [{ text: "OK" }]
          : [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false)
    }
  }

  // Get screen title based on user type
  const getScreenTitle = () => {
    switch (userType) {
      case "student":
        return t("auth.register.student.title")
      case "native":
        return t("auth.register.native.title")
      case "restaurant":
        return t("auth.register.restaurant.title")
      default:
        return t("auth.register.title")
    }
  }

  // Get screen subtitle based on user type
  const getScreenSubtitle = () => {
    switch (userType) {
      case "student":
        return t("auth.register.student.subtitle")
      case "native":
        return t("auth.register.native.subtitle")
      case "restaurant":
        return t("auth.register.restaurant.subtitle")
      default:
        return t("auth.register.subtitle")
    }
  }

  // Get login screen name based on user type
  const getLoginScreenName = () => {
    switch (userType) {
      case "student":
        return "StudentLogin"
      case "native":
        return "NativeLogin"
      case "restaurant":
        return "RestaurantLogin"
      default:
        return "Login"
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{getScreenTitle()}</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>{getScreenSubtitle()}</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            {[
              { label: t("auth.register.userTypes.student"), value: "student" },
              { label: t("auth.register.userTypes.native"), value: "native" },
              { label: t("auth.register.userTypes.restaurant"), value: "restaurant" },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.userTypeButton,
                  userType === item.value && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setUserType(item.value)}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    { color: userType === item.value ? "white" : colors.text }
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Show API error message if present */}
          {apiError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.apiErrorText, { color: colors.error }]}>{apiError}</Text>
            </View>
          ) : null}

          {/* Restaurant-specific fields */}
          {userType === "restaurant" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.restaurant.name")}</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.restaurantName ? colors.error : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Ionicons name="restaurant-outline" size={20} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t("auth.register.restaurant.namePlaceholder")}
                    placeholderTextColor={colors.text + "80"}
                    value={form.restaurantName}
                    onChangeText={(text) => handleChange("restaurantName", text)}
                  />
                </View>
                {errors.restaurantName ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.restaurantName}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.restaurant.cuisineType")}</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.cuisineType ? colors.error : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Ionicons name="fast-food-outline" size={20} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t("auth.register.restaurant.cuisineTypePlaceholder")}
                    placeholderTextColor={colors.text + "80"}
                    value={form.cuisineType}
                    onChangeText={(text) => handleChange("cuisineType", text)}
                  />
                </View>
                {errors.cuisineType ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.cuisineType}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.restaurant.address")}</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: errors.address ? colors.error : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Ionicons name="location-outline" size={20} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t("auth.register.restaurant.addressPlaceholder")}
                    placeholderTextColor={colors.text + "80"}
                    value={form.address}
                    onChangeText={(text) => handleChange("address", text)}
                  />
                </View>
                {errors.address ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.address}</Text>
                ) : null}
              </View>
            </>
          )}
          

          {/* Common fields for all user types */}
          {/* Name Fields */}
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.firstName")}</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.firstName ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("auth.register.firstNamePlaceholder")}
                  placeholderTextColor={colors.text + "80"}
                  value={form.firstName}
                  onChangeText={(text) => handleChange("firstName", text)}
                />
              </View>
              {errors.firstName ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.firstName}</Text>
              ) : null}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.lastName")}</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.lastName ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("auth.register.lastNamePlaceholder")}
                  placeholderTextColor={colors.text + "80"}
                  value={form.lastName}
                  onChangeText={(text) => handleChange("lastName", text)}
                />
              </View>
              {errors.lastName ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.lastName}</Text>
              ) : null}
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.email")}</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: errors.email ? colors.error : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t("auth.register.emailPlaceholder")}
                placeholderTextColor={colors.text + "80"}
                value={form.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text> : null}
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.phone")}</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: errors.phone ? colors.error : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons name="call-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t("auth.register.phonePlaceholder")}
                placeholderTextColor={colors.text + "80"}
                value={form.phone}
                onChangeText={(text) => handleChange("phone", text)}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text> : null}
          </View>

{/* Native-specific fields */}
          {userType === "native" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.native.language")}</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.nativeLanguage ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
            <Ionicons name="language-outline" size={20} color={colors.text} style={styles.inputIcon} />
            <Text
              style={[
                styles.dropdownText,
                {
                  color: form.nativeLanguage ? colors.text : colors.text + "80",
                },
              ]}
            >
              {form.nativeLanguage || t("auth.register.native.selectLanguage") || "Select your native language"}
            </Text>
            <Ionicons
              name={showLanguageDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.text}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>

          {showLanguageDropdown && (
            <View
              style={[
                styles.dropdown,
                styles.languageDropdown,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel="Language options"
            >
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search languages..."
                  placeholderTextColor={colors.text + "80"}
                  value={languageSearch}
                  onChangeText={setLanguageSearch}
                  autoFocus={true}
                />
                {languageSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setLanguageSearch("")}>
                    <Ionicons name="close-circle" size={20} color={colors.text} />
                  </TouchableOpacity>
                )}
              </View>
              
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {filteredLanguages.map((language) => (
                  <TouchableOpacity
                    key={language}
                    style={[
                      styles.dropdownItem,
                      form.nativeLanguage === language && {
                        backgroundColor: colors.primary + "20",
                      },
                    ]}
                    onPress={() => {
                      handleChange("nativeLanguage", language)
                      setShowLanguageDropdown(false)
                    }}
                    accessible={true}
                    accessibilityLabel={language}
                    accessibilityRole="button"
                  >
                    <Text style={{ color: colors.text }}>{language}</Text>
                    {form.nativeLanguage === language && (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
              )}

              {errors.nativeLanguage ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.nativeLanguage}</Text>
              ) : null}
            </View>
          )}

             {/* Address field for student and native */}
          {(userType === "student" || userType === "native") && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.address")}</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.address ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Ionicons name="location-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("auth.register.addressPlaceholder") || "Enter your address"}
                  placeholderTextColor={colors.text + "80"}
                  value={form.address}
                  onChangeText={(text) => handleChange("address", text)}
                />
              </View>
              {errors.address ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.address}</Text>
              ) : null}
            </View>
          )}

          {/* Nationality field for student and native */}
          {(userType === "student" || userType === "native") && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.nationality") || "Nationality"}</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.nationality ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() => setShowNationalityDropdown(!showNationalityDropdown)}
                accessible={true}
                accessibilityLabel="Select nationality"
                accessibilityHint="Opens a dropdown menu to select your nationality"
                accessibilityRole="button"
              >
                <Ionicons name="flag-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: form.nationality ? colors.text : colors.text + "80",
                    },
                  ]}
                >
                  {form.nationality ? 
                    countries.find(c => c.name === form.nationality)?.flag + " " + form.nationality : 
                    t("auth.register.nationalityPlaceholder") || "Select your nationality"}
                </Text>
                <Ionicons
                  name={showNationalityDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.text}
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>

              {showNationalityDropdown && (
                <View
                  style={[
                    styles.dropdown,
                    styles.nationalityDropdown,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  accessible={true}
                  accessibilityLabel="Nationality options"
                >
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Search countries..."
                      placeholderTextColor={colors.text + "80"}
                      value={nationalitySearch}
                      onChangeText={setNationalitySearch}
                      autoFocus={true}
                    />
                    {nationalitySearch.length > 0 && (
                      <TouchableOpacity onPress={() => setNationalitySearch("")}>
                        <Ionicons name="close-circle" size={20} color={colors.text} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {filteredCountries.map((country) => (
                        <TouchableOpacity
                          key={country.name}
                          style={[
                            styles.dropdownItem,
                            form.nationality === country.name && {
                              backgroundColor: colors.primary + "20",
                            },
                          ]}
                          onPress={() => {
                            handleChange("nationality", country.name);
                            setShowNationalityDropdown(false);
                          }}
                          accessible={true}
                          accessibilityLabel={country.name}
                          accessibilityRole="button"
                        >
                          <View style={styles.countryItem}>
                            <Text style={{ fontSize: 20, marginRight: 8 }}>{country.flag}</Text>
                            <Text style={{ color: colors.text }}>{country.name}</Text>
                          </View>
                          {form.nationality === country.name && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {errors.nationality ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.nationality}</Text>
              ) : null}
            </View>
          )}

          {/* Gender field for student and native */}
          {(userType === "student" || userType === "native") && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.gender") || "Gênero"}</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.gender ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              >
                <Ionicons name="person-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: form.gender ? colors.text : colors.text + "80",
                    },
                  ]}
                >
                  {form.gender || t("auth.register.genderPlaceholder") || "Selecione seu gênero"}
                </Text>
                <Ionicons
                  name={showGenderDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.text}
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>

              {showGenderDropdown && (
                <View
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {genderOptions.map((genderOption) => (
                      <TouchableOpacity
                        key={genderOption}
                        style={[
                          styles.dropdownItem,
                          form.gender === genderOption && {
                            backgroundColor: colors.primary + "20",
                          },
                        ]}
                        onPress={() => {
                          handleChange("gender", genderOption)
                          setShowGenderDropdown(false)
                        }}
                      >
                        <Text style={{ color: colors.text }}>{genderOption}</Text>
                        {form.gender === genderOption && (
                          <Ionicons name="checkmark" size={18} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {errors.gender ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.gender}</Text>
              ) : null}
            </View>
          )}

          {/* Custom Gender field when "Outro" is selected */}
          {(userType === "student" || userType === "native") && form.gender === "Outro" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("auth.register.customGender") || "Especifique seu gênero"}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: errors.customGender ? colors.error : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Ionicons name="create-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("auth.register.customGenderPlaceholder") || "Informe seu gênero"}
                  placeholderTextColor={colors.text + "80"}
                  value={form.customGender}
                  onChangeText={(text) => handleChange("customGender", text)}
                />
              </View>
              {errors.customGender ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.customGender}</Text>
              ) : null}
            </View>
          )}


          {/* Password Fields */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.password")}</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: errors.password ? colors.error : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t("auth.register.passwordPlaceholder")}
                placeholderTextColor={colors.text + "80"}
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
            ) : null}
          </View>    

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t("auth.register.confirmPassword")}</Text>
    <View
      style={[
        styles.inputContainer,
        {
          borderColor: errors.confirmPassword ? colors.error : colors.border,
          backgroundColor: colors.card,
        },
      ]}
    >
      <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={t("auth.register.confirmPasswordPlaceholder")}
        placeholderTextColor={colors.text + "80"}
        value={form.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
        secureTextEntry={!showConfirmPassword}
        // Make sure this field gets focus correctly when clicked
        onFocus={() => {
          // Clear error on focus
          if (errors.confirmPassword) {
            setErrors({...errors, confirmPassword: ""})
          }
        }}
      />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>{t("auth.register.continue")}</Text>
            )}
          </TouchableOpacity>


          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.text }]}>{t("auth.register.alreadyHaveAccount")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate(getLoginScreenName())}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>{t("auth.register.signIn")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
  },
  nationalityDropdown: {
    maxHeight: 300,
  },
  languageDropdown: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: "#FFEEEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  apiErrorText: {
    textAlign: "center",
    fontWeight: "500",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  userTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderRadius: 8,
  },
  userTypeText: {
    fontWeight: "500",
  },
  nameRow: {
    flexDirection: "row",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  dropdownIcon: {
    marginHorizontal: 10,
  },
  dropdown: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
  registerButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
})