"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { translations, type Language } from "../translations"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => Promise<void>
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("es")
  const [isLoading, setIsLoading] = useState(true)

  // Load language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("language")
        if (storedLanguage && Object.keys(translations).includes(storedLanguage)) {
          setLanguageState(storedLanguage as Language)
        }
      } catch (error) {
        console.error("Error loading language preference:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguage()
  }, [])

  // Function to change the language
  const setLanguage = async (newLanguage: Language): Promise<void> => {
    try {
      // First store in AsyncStorage to ensure persistence
      await AsyncStorage.setItem("language", newLanguage)
      // Then update state to trigger UI updates
      setLanguageState(newLanguage)
    } catch (error) {
      console.error("Error setting language:", error)
    }
  }

  // Force refresh when language changes
  useEffect(() => {
    // This empty effect ensures components re-render when language changes
  }, [language])

  // Translation function with parameter interpolation support
  const t = (key: string, params?: Record<string, any>): string => {
    // Verify the language is valid, fall back to Spanish if not
    const currentTranslations = translations[language] || translations.es
    
    // Get translation for the key
    let translatedText = currentTranslations[key];
    
    if (!translatedText) {
      // If the key doesn't exist in translations, return the key itself as fallback
      console.warn(`Translation missing for key: "${key}" in language: ${language}`)
      return key
    }
    
    // Handle parameter interpolation if params are provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(`{${paramKey}}`, paramValue.toString())
      })
    }
    
    return translatedText
  }

  if (isLoading) {
    return null // Or a loading component
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}