// import { useState, useContext, useEffect } from "react"
// import { useNavigation } from "@react-navigation/native"
// import { NativeStackNavigationProp } from "@react-navigation/native-stack"
// import { View, Text, TextInput, StyleSheet, Switch, ScrollView, TouchableOpacity } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { AppContext, AppContextType, Language } from "../nativo/AppTypes"
// import { useLanguage } from "../../contexts/LanguageContext"

// // Define the parameter list for navigation
// type AvailabilityStackParamList = {
//   NativeAvailabilityMain: undefined;
//   RestaurantSelection: { selectedRestaurants: number[] };
// };

// // Define the navigation prop type
// type AvailabilityScreenNavigationProp = NativeStackNavigationProp<
//   AvailabilityStackParamList,
//   'NativeAvailabilityMain'
// >;

// // Card component to maintain consistent styling
// const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => {
//   return (
//     <View style={[styles.card, style]}>
//       {children}
//     </View>
//   )
// }

// export default function NativeAvailabilityScreen() {
//   const { appState, updateAppState, setCurrentScreen } = useContext(AppContext) as AppContextType
//   // Use the typed navigation
//   const navigation = useNavigation<AvailabilityScreenNavigationProp>();
//   const { t } = useLanguage();
//   const [selectedDays, setSelectedDays] = useState<string[]>(appState.availableDays)
//   const [languages, setLanguages] = useState<Language[]>(appState.languages)
//   const [newLanguage, setNewLanguage] = useState("")
//   const [newLevel, setNewLevel] = useState("")
//   const [startTime, setStartTime] = useState("09:00")
//   const [endTime, setEndTime] = useState("22:00")

//   // Log when the component mounts
//   useEffect(() => {
//     console.log("NativeAvailabilityScreen mounted - navigation available:", !!navigation);
//   }, [navigation]);

//   // Theme colors (simplified version to match NativeHomeScreen)
//   const colors = {
//     background: '#f9fafb',
//     text: '#111827',
//     textSecondary: '#6b7280',
//     border: '#e5e7eb',
//     primary: '#2563eb',
//     error: '#dc2626',
//     success: '#10b981',
//     card: '#ffffff',
//     blue: {
//       50: '#eff6ff',
//       100: '#dbeafe',
//       500: '#3b82f6',
//       600: '#2563eb',
//       700: '#1d4ed8',
//       900: '#1e3a8a'
//     },
//     purple: {
//       50: '#f5f3ff',
//       100: '#ede9fe',
//       500: '#8b5cf6',
//       700: '#6d28d9',
//       900: '#4c1d95'
//     },
//     gold: {
//       50: '#fffbeb',
//       100: '#fef3c7',
//       500: '#f59e0b',
//       600: '#d97706',
//       700: '#b45309',
//       900: '#78350f'
//     }
//   }

//   const days: { key: string; label: string }[] = [
//     { key: "monday", label: t("date.day.monday") },
//     { key: "tuesday", label: t("date.day.tuesday") },
//     { key: "wednesday", label: t("date.day.wednesday") },
//     { key: "thursday", label: t("date.day.thursday") },
//     { key: "friday", label: t("date.day.friday") },
//     { key: "saturday", label: t("date.day.saturday") },
//     { key: "sunday", label: t("date.day.sunday") },
//   ]

//   const levels: string[] = [
//     t("level.a1"), 
//     t("level.b1"), 
//     t("level.c1"), 
//     t("level.native")
//   ]
//   const timeOptions: string[] = ["09:00", "10:00", "11:00", "12:00", "18:00", "20:00", "22:00", "24:00"]

//   const toggleDay = (day: string) => {
//     setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
//   }

//   const addLanguage = () => {
//     if (newLanguage && newLevel) {
//       setLanguages((prev) => [...prev, { language: newLanguage, level: newLevel }])
//       setNewLanguage("")
//       setNewLevel("")
//     }
//   }

//   const removeLanguage = (index: number) => {
//     setLanguages((prev) => prev.filter((_, i) => i !== index))
//   }

//   const saveConfiguration = () => {
//     updateAppState({
//       availableDays: selectedDays,
//       languages: languages,
//     })
//     setCurrentScreen("home")
//   }

//   return (
//     <ScrollView 
//       style={[styles.container, { backgroundColor: colors.background }]}
//       contentContainerStyle={styles.content}
//     >
//       {/* Header Section */}
//       <View style={styles.welcomeSection}>
//         <Text style={[styles.welcomeText, { color: colors.text }]}>{t("native.availability.title")}</Text>
//         <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
//           {t("native.availability.subtitle")}
//         </Text>
//       </View>

//       {/* Días Disponibles */}
//       <Card>
//         <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.availability.days")}</Text>
//         <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
//           {t("native.availability.subtitle")}
//         </Text>
        
//         <View style={styles.daysContainer}>
//           {days.map((day) => (
//             <View key={day.key} style={styles.dayRow}>
//               <Text style={[styles.dayLabel, { color: colors.text }]}>{day.label}</Text>
//               <Switch
//                 value={selectedDays.includes(day.key)}
//                 onValueChange={() => toggleDay(day.key)}
//                 trackColor={{ false: "#e5e7eb", true: colors.primary }}
//                 thumbColor="#ffffff"
//               />
//             </View>
//           ))}
//         </View>
//       </Card>

//       {/* Horarios Disponibles */}
//       <Card>
//         <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.availability.timeRange")}</Text>
//         <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
//           {t("native.availability.timeRangeDesc")}
//         </Text>
        
//         <View style={styles.timeRow}>
//           <View style={styles.timeColumn}>
//             <Text style={[styles.timeLabel, { color: colors.text }]}>{t("native.availability.startTime")}</Text>
//             <View style={[styles.picker, { borderColor: colors.border }]}>
//               <TouchableOpacity style={styles.selectButton}>
//                 <Text style={{ color: colors.text }}>{startTime}</Text>
//                 <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={styles.timeColumn}>
//             <Text style={[styles.timeLabel, { color: colors.text }]}>{t("native.availability.endTime")}</Text>
//             <View style={[styles.picker, { borderColor: colors.border }]}>
//               <TouchableOpacity style={styles.selectButton}>
//                 <Text style={{ color: colors.text }}>{endTime}</Text>
//                 <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Card>

//       {/* Idiomas */}
//       <Card>
//         <Text style={[styles.cardTitle, { color: colors.text }]}>{t("native.languages")}</Text>
//         <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
//           {t("native.languages.description")}
//         </Text>
        
//         <View style={styles.languagesContainer}>
//           {languages.map((lang: Language, index: number) => (
//             <View key={index} style={[styles.languageItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
//               <View>
//                 <Text style={[styles.languageName, { color: colors.text }]}>{lang.language}</Text>
//                 <Text style={[styles.languageLevel, { color: colors.textSecondary }]}>{t("native.languageLevel")}: {lang.level}</Text>
//               </View>
//               <View style={styles.languageActions}>
//                 <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.blue[50] }]}>
//                   <Ionicons name="pencil-outline" size={18} color={colors.blue[600]} />
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={[styles.iconButton, { backgroundColor: colors.error + "15" }]} 
//                   onPress={() => removeLanguage(index)}
//                 >
//                   <Ionicons name="trash-outline" size={18} color={colors.error} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}

//           {/* Agregar nuevo idioma */}
//           <View style={[styles.addLanguageContainer, { borderColor: colors.border }]}>
//             <View style={styles.languageInputRow}>
//               <TextInput
//                 style={[styles.input, { borderColor: colors.border, color: colors.text }]}
//                 placeholder={t("Language Name")}
//                 placeholderTextColor={colors.textSecondary}
//                 value={newLanguage}
//                 onChangeText={setNewLanguage}
//               />
//               <View style={[styles.picker, { borderColor: colors.border }]}>
//                 <TouchableOpacity style={styles.selectButton}>
//                   <Text style={{ color: newLevel ? colors.text : colors.textSecondary }}>{newLevel || t("Language Level")}</Text>
//                   <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <TouchableOpacity 
//               style={[
//                 styles.addButton, 
//                 { borderColor: colors.border },
//                 (!newLanguage || !newLevel) && styles.disabledButton
//               ]} 
//               onPress={addLanguage}
//               disabled={!newLanguage || !newLevel}
//             >
//               <Ionicons name="add" size={20} color={colors.primary} />
//               <Text style={[styles.addButtonText, { color: colors.primary }]}>{t("native.addLanguage")}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Card>

//       {/* Restaurantes Preferidos */}
//       <Card>
//         <View style={styles.cardHeader}>
//           <Text style={[styles.cardTitle, { color: colors.text }]}>{t("profile.favoriteRestaurants")}</Text>
//           <TouchableOpacity 
//             onPress={() => {
//               console.log("Gestionar clicked - navigating to restaurants");
//               setCurrentScreen("restaurants");
//             }}
//             activeOpacity={0.5}
//           >
//             <Text style={[styles.manageText, { color: colors.primary }]}>{t("native.restaurants.manage")}</Text>
//           </TouchableOpacity>
//         </View>
//         <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
//           {t("native.restaurants.preferredPlaces")}
//         </Text>
        
        
//         {/* Restaurant selection card with enhanced visibility and multiple navigation approaches */}
//         <TouchableOpacity 
//           style={[styles.quickAccessCard, { 
//             backgroundColor: appState.selectedRestaurants.length > 0 ? colors.gold[50] : colors.blue[50],
//             borderWidth: 2,
//             borderColor: colors.primary,
//             marginTop: 10
//           }]}
//           onPress={() => {
//             console.log("Navigating to RestaurantSelection with:", appState.selectedRestaurants);
//             navigation.navigate("RestaurantSelection", {
//               selectedRestaurants: appState.selectedRestaurants
//             });
//           }}
//           activeOpacity={0.7}
//           accessible={true}
//           accessibilityRole="button"
//           accessibilityLabel={t("native.selectRestaurants")}
//           accessibilityHint={t("native.restaurants.navigationHint")}
//         >
//           <View style={[styles.quickAccessIcon, { 
//             backgroundColor: appState.selectedRestaurants.length > 0 ? colors.gold[100] : colors.blue[100] 
//           }]}>
//             <Ionicons 
//               name="restaurant-outline" 
//               size={24} 
//               color={appState.selectedRestaurants.length > 0 ? colors.gold[700] : colors.blue[700]} 
//             />
//           </View>
//           <View style={styles.quickAccessContent}>
//             <Text style={[styles.quickAccessTitle, { 
//               color: appState.selectedRestaurants.length > 0 ? colors.gold[900] : colors.blue[900] 
//             }]}>
//               {appState.selectedRestaurants.length} {t("native.selectedRestaurants")}
//             </Text>
//             <Text style={[styles.quickAccessSubtitle, { 
//               color: appState.selectedRestaurants.length > 0 ? colors.gold[700] : colors.blue[700] 
//             }]}>
//               {appState.selectedRestaurants.length > 0 
//                 ? t("native.restaurants.exploreMore")
//                 : t("native.restaurants.tapToSelect")
//               }
//             </Text>
//           </View>
//           <Ionicons 
//             name="chevron-forward" 
//             size={20} 
//             color={appState.selectedRestaurants.length > 0 ? colors.gold[500] : colors.blue[500]} 
//           />
//         </TouchableOpacity>
//       </Card>

//       {/* Botón Guardar */}
//       <TouchableOpacity 
//         style={[styles.saveButton, { backgroundColor: colors.primary }]} 
//         onPress={saveConfiguration}
//       >
//         <Ionicons name="save-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
//         <Text style={styles.saveButtonText}>{t("native.availability.confirmSettings")}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   welcomeSection: {
//     marginBottom: 24,
//   },
//   welcomeText: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   welcomeSubtext: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 24,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   daysContainer: {
//     marginTop: 8,
//   },
//   dayRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   dayLabel: {
//     fontSize: 16,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 16,
//     marginTop: 12,
//   },
//   timeColumn: {
//     flex: 1,
//   },
//   timeLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 12,
//   },
//   picker: {
//     borderWidth: 1,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   selectButton: {
//     padding: 12,
//     backgroundColor: '#fff',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   languagesContainer: {
//     marginTop: 12,
//   },
//   languageItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderWidth: 1,
//   },
//   languageName: {
//     fontWeight: '600',
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   languageLevel: {
//     fontSize: 14,
//   },
//   languageActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   iconButton: {
//     padding: 8,
//     borderRadius: 20,
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addLanguageContainer: {
//     padding: 16,
//     borderWidth: 2,
//     borderStyle: 'dashed',
//     borderRadius: 12,
//   },
//   languageInputRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//     marginBottom: 16,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#fff',
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#fff',
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   addButtonText: {
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   manageText: {
//     fontWeight: '500',
//   },
//   restaurantInfo: {
//     marginTop: 8,
//   },
//   quickAccessCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   quickAccessIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   quickAccessContent: {
//     flex: 1,
//   },
//   quickAccessTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   quickAccessSubtitle: {
//     fontSize: 14,
//   },
//   ratesContainer: {
//     marginTop: 12,
//   },
//   rateItem: {
//     marginBottom: 16,
//   },
//   rateLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 12,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     paddingVertical: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 8,
//     marginBottom: 30,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   debugButton: {
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
