"use client"
import { useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Alert,
  FlatList,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Interface for dish type
interface Dish {
  id: number
  name: string
  description: string
  price: string
  category: string
  available: boolean
}

// Mock data for dishes
const initialDishes: Dish[] = [
  {
    id: 1,
    name: "Paella Valenciana",
    description: "Arroz con pollo, conejo y verduras cocinado en paellera tradicional",
    price: "18€",
    category: "Platos principales",
    available: true
  },
  {
    id: 2,
    name: "Gazpacho Andaluz",
    description: "Sopa fría de tomate, pepino, pimiento y ajo",
    price: "8€",
    category: "Entrantes",
    available: true
  },
  {
    id: 3,
    name: "Tortilla Española",
    description: "Tortilla de patatas con cebolla caramelizada",
    price: "10€",
    category: "Tapas",
    available: true
  },
  {
    id: 4,
    name: "Crema Catalana",
    description: "Postre cremoso tradicional con azúcar caramelizado",
    price: "7€",
    category: "Postres",
    available: true
  },
  {
    id: 5,
    name: "Pulpo a la Gallega",
    description: "Pulpo cocido con pimentón, aceite de oliva y patatas",
    price: "22€",
    category: "Platos principales",
    available: true
  },
  {
    id: 6,
    name: "Croquetas de Jamón",
    description: "Croquetas cremosas de jamón ibérico",
    price: "9€",
    category: "Tapas",
    available: true
  }
]

// Available categories
const categories = [
  "Entrantes",
  "Tapas",
  "Platos principales",
  "Postres",
  "Bebidas"
]

export default function RestauranteMenuScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // State for dishes and modals
  const [dishes, setDishes] = useState<Dish[]>(initialDishes)
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>(initialDishes)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Form state for new dish
  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    category: "Platos principales",
    available: true
  })

  // Filter dishes by category and search query
  const filterDishes = () => {
    let filtered = [...dishes]
    
    // Filter by category
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(dish => dish.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        dish => 
          dish.name.toLowerCase().includes(query) ||
          dish.description.toLowerCase().includes(query)
      )
    }
    
    setFilteredDishes(filtered)
  }

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    if (category === "Todos") {
      setFilteredDishes(dishes)
    } else {
      setFilteredDishes(dishes.filter(dish => dish.category === category))
    }
  }

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text)
    
    if (text.trim() === "") {
      if (selectedCategory === "Todos") {
        setFilteredDishes(dishes)
      } else {
        setFilteredDishes(dishes.filter(dish => dish.category === selectedCategory))
      }
      return
    }
    
    const query = text.toLowerCase()
    const filtered = dishes.filter(
      dish => {
        const matchesSearch = 
          dish.name.toLowerCase().includes(query) ||
          dish.description.toLowerCase().includes(query)
          
        const matchesCategory = selectedCategory === "Todos" || dish.category === selectedCategory
        
        return matchesSearch && matchesCategory
      }
    )
    
    setFilteredDishes(filtered)
  }

  // Add new dish
  const handleAddDish = () => {
    if (!newDish.name || !newDish.price) {
      Alert.alert(t("common.error"), t("restaurant.nameAndPriceRequired"))
      return
    }
    
    const newId = Math.max(...dishes.map(d => d.id), 0) + 1
    const dishToAdd = {
      ...newDish,
      id: newId
    }
    
    const updatedDishes = [...dishes, dishToAdd]
    setDishes(updatedDishes)
    
    // Update filtered dishes
    if (selectedCategory === "Todos" || selectedCategory === dishToAdd.category) {
      setFilteredDishes([...filteredDishes, dishToAdd])
    }
    
    // Reset form and close modal
    setNewDish({
      name: "",
      description: "",
      price: "",
      category: "Platos principales",
      available: true
    })
    setAddModalVisible(false)
    
    Alert.alert(t("common.success"), t("restaurant.dishAddedSuccessfully"))
  }

  // Handle edit dish
  const handleEditDish = () => {
    if (!selectedDish) return
    
    if (!selectedDish.name || !selectedDish.price) {
      Alert.alert(t("common.error"), t("restaurant.nameAndPriceRequired"))
      return
    }
    
    const updatedDishes = dishes.map(dish => 
      dish.id === selectedDish.id ? selectedDish : dish
    )
    
    setDishes(updatedDishes)
    filterDishes()
    setEditModalVisible(false)
    
    Alert.alert(t("common.success"), t("restaurant.dishUpdatedSuccessfully"))
  }

  // Handle delete dish
  const handleDeleteDish = (id: number) => {
    Alert.alert(
      t("restaurant.confirmDeletion"),
      t("restaurant.confirmDeleteDishMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel"
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            const updatedDishes = dishes.filter(dish => dish.id !== id)
            setDishes(updatedDishes)
            setFilteredDishes(updatedDishes.filter(
              dish => selectedCategory === "Todos" || dish.category === selectedCategory
            ))
            Alert.alert(t("common.success"), t("restaurant.dishDeletedSuccessfully"))
          }
        }
      ]
    )
  }

  // Toggle dish availability
  const toggleAvailability = (id: number) => {
    const updatedDishes = dishes.map(dish => 
      dish.id === id ? { ...dish, available: !dish.available } : dish
    )
    
    setDishes(updatedDishes)
    filterDishes()
  }

  // Render dish item
  const renderDishItem = ({ item }: { item: Dish }) => (
    <Card style={[styles.dishCard, { opacity: item.available ? 1 : 0.6 }]}>
      <View style={styles.dishHeader}>
        <View>
          <Text style={[styles.dishName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <Text style={[styles.dishPrice, { color: colors.primary }]}>{item.price}</Text>
      </View>
      
      <Text style={[styles.dishDescription, { color: colors.text + "99" }]}>
        {item.description}
      </Text>
      
      <View style={styles.dishActions}>
        <View style={styles.availabilityContainer}>
          <Text style={[styles.availabilityLabel, { color: colors.text + "80" }]}>
            {t("restaurant.available")}:
          </Text>
          <TouchableOpacity 
            style={[
              styles.availabilityToggle, 
              { 
                backgroundColor: item.available ? colors.success + "20" : colors.error + "20" 
              }
            ]}
            onPress={() => toggleAvailability(item.id)}
          >
            <Ionicons 
              name={item.available ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={item.available ? colors.success : colors.error}
            />
            <Text 
              style={[
                styles.availabilityText, 
                { color: item.available ? colors.success : colors.error }
              ]}
            >
              {item.available ? t("common.yes") : t("common.no")}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dishButtons}>
          <TouchableOpacity
            style={[styles.editButton, { borderColor: colors.primary + "50" }]}
            onPress={() => {
              setSelectedDish(item)
              setEditModalVisible(true)
            }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>{t("common.edit")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: colors.error + "50" }]}
            onPress={() => handleDeleteDish(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>{t("common.delete")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  )

  // Add Dish Modal
  const renderAddDishModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addModalVisible}
      onRequestClose={() => setAddModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("restaurant.addNewDish")}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAddModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.name")}*</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder={t("restaurant.dishNamePlaceholder")}
              placeholderTextColor={colors.text + "60"}
              value={newDish.name}
              onChangeText={text => setNewDish({...newDish, name: text})}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.description")}</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
              placeholder={t("restaurant.dishDescriptionPlaceholder")}
              placeholderTextColor={colors.text + "60"}
              value={newDish.description}
              onChangeText={text => setNewDish({...newDish, description: text})}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.price")}*</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder={t("restaurant.dishPricePlaceholder")}
              placeholderTextColor={colors.text + "60"}
              value={newDish.price}
              onChangeText={text => setNewDish({...newDish, price: text})}
              keyboardType="numeric"
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.category")}</Text>
            <View style={styles.categoryPicker}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    { 
                      backgroundColor: newDish.category === category 
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setNewDish({...newDish, category})}
                >
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { 
                        color: newDish.category === category 
                          ? "white" 
                          : colors.text 
                      }
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.availabilityRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.available")}</Text>
              <TouchableOpacity
                style={[
                  styles.availabilityToggle,
                  { 
                    backgroundColor: newDish.available 
                      ? colors.success + "20" 
                      : colors.error + "20" 
                  }
                ]}
                onPress={() => setNewDish({...newDish, available: !newDish.available})}
              >
                <Ionicons 
                  name={newDish.available ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={newDish.available ? colors.success : colors.error}
                />
                <Text 
                  style={[
                    styles.availabilityText, 
                    { color: newDish.available ? colors.success : colors.error }
                  ]}
                >
                  {newDish.available ? t("common.yes") : t("common.no")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalCancelButton, { borderColor: colors.border }]}
              onPress={() => setAddModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
              onPress={handleAddDish}
            >
              <Text style={{ color: "white" }}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Edit Dish Modal
  const renderEditDishModal = () => {
    if (!selectedDish) return null
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("restaurant.editDish")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.name")}*</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder={t("restaurant.dishNamePlaceholder")}
                placeholderTextColor={colors.text + "60"}
                value={selectedDish.name}
                onChangeText={text => setSelectedDish({...selectedDish, name: text})}
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.description")}</Text>
              <TextInput
                style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                placeholder={t("restaurant.dishDescriptionPlaceholder")}
                placeholderTextColor={colors.text + "60"}
                value={selectedDish.description}
                onChangeText={text => setSelectedDish({...selectedDish, description: text})}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.price")}*</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder={t("restaurant.dishPricePlaceholder")}
                placeholderTextColor={colors.text + "60"}
                value={selectedDish.price}
                onChangeText={text => setSelectedDish({...selectedDish, price: text})}
                keyboardType="numeric"
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.category")}</Text>
              <View style={styles.categoryPicker}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      { 
                        backgroundColor: selectedDish.category === category 
                          ? colors.primary 
                          : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setSelectedDish({...selectedDish, category})}
                  >
                    <Text 
                      style={[
                        styles.categoryOptionText, 
                        { 
                          color: selectedDish.category === category 
                            ? "white" 
                            : colors.text 
                        }
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.availabilityRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t("restaurant.available")}</Text>
                <TouchableOpacity
                  style={[
                    styles.availabilityToggle,
                    { 
                      backgroundColor: selectedDish.available 
                        ? colors.success + "20" 
                        : colors.error + "20" 
                    }
                  ]}
                  onPress={() => setSelectedDish({...selectedDish, available: !selectedDish.available})}
                >
                  <Ionicons 
                    name={selectedDish.available ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={selectedDish.available ? colors.success : colors.error}
                  />
                  <Text 
                    style={[
                      styles.availabilityText, 
                      { color: selectedDish.available ? colors.success : colors.error }
                    ]}
                  >
                    {selectedDish.available ? t("common.yes") : t("common.no")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
                onPress={handleEditDish}
              >
                <Text style={{ color: "white" }}>{t("common.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === 'ios' ? { paddingTop: 8 } : null]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("restaurant.menu")}</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>{t("restaurant.addDish")}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.text + "80"} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("restaurant.searchDishes")}
            placeholderTextColor={colors.text + "60"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.text + "80"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            { 
              backgroundColor: selectedCategory === "Todos" 
                ? colors.primary 
                : colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={() => handleCategorySelect("Todos")}
        >
          <Text 
            style={[
              styles.categoryChipText, 
              { color: selectedCategory === "Todos" ? "white" : colors.text }
            ]}
          >
            {t("common.all")}
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              { 
                backgroundColor: selectedCategory === category 
                  ? colors.primary 
                  : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text 
              style={[
                styles.categoryChipText, 
                { color: selectedCategory === category ? "white" : colors.text }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FlatList
        data={filteredDishes}
        renderItem={renderDishItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.dishesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={colors.text + "40"} />
            <Text style={[styles.emptyStateText, { color: colors.text + "80" }]}>
              {t("restaurant.noDishesAvailable")}
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.text + "60" }]}>
              {searchQuery ? t("restaurant.tryAnotherSearch") : t("restaurant.addDishesToMenu")}
            </Text>
          </View>
        }
      />
      
      {/* Add Dish Modal */}
      {renderAddDishModal()}
      
      {/* Edit Dish Modal */}
      {renderEditDishModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  categoryChipText: {
    fontWeight: "500",
    fontSize: 13,
  },
  dishesList: {
    padding: 16,
    paddingTop: 4,
  },
  dishCard: {
    marginBottom: 16,
  },
  dishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    color: "#64748b",
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  dishDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  dishActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityLabel: {
    fontSize: 13,
    marginRight: 8,
  },
  availabilityToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  dishButtons: {
    flexDirection: "row",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 13,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
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
  formContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
    minHeight: 100,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontWeight: "500",
    fontSize: 13,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
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
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
});