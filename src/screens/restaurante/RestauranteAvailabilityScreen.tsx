"use client"
import { useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Alert,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Types for availability data
interface TimeSlot {
  id: number
  start: string
  end: string
  selected: boolean
}

interface DayAvailability {
  date: string
  dayOfWeek: string
  dayNumber: number
  month: string
  available: boolean
  timeSlots: TimeSlot[]
}

// Generate 30 days from current date
const generateCalendarDays = (): DayAvailability[] => {
  const days = []
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  // Start with today's date
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Default time slots
    const defaultTimeSlots: TimeSlot[] = [
      { id: 1, start: "12:00", end: "14:00", selected: false },
      { id: 2, start: "14:00", end: "16:00", selected: false },
      { id: 3, start: "19:00", end: "21:00", selected: false },
      { id: 4, start: "21:00", end: "23:00", selected: false }
    ]
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: daysOfWeek[date.getDay()],
      dayNumber: date.getDate(),
      month: months[date.getMonth()],
      available: false,
      timeSlots: [...defaultTimeSlots]
    })
  }
  
  return days
}

// Initial calendar data
const initialCalendarData = generateCalendarDays()

export default function RestauranteAvailabilityScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // State for calendar and availability
  const [calendarData, setCalendarData] = useState<DayAvailability[]>(initialCalendarData)
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null)
  const [timeSlotsModalVisible, setTimeSlotsModalVisible] = useState(false)
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar')
  
  // Toggle day availability
  const toggleDayAvailability = (date: string) => {
    setCalendarData(prevData => 
      prevData.map(day => {
        if (day.date === date) {
          return {
            ...day,
            available: !day.available
          }
        }
        return day
      })
    )
  }
  
  // Open time slots modal for a specific day
  const openTimeSlotsModal = (day: DayAvailability) => {
    setSelectedDay(day)
    setTimeSlotsModalVisible(true)
  }
  
  // Toggle time slot selection
  const toggleTimeSlot = (timeSlotId: number) => {
    if (!selectedDay) return
    
    const updatedDay = {
      ...selectedDay,
      timeSlots: selectedDay.timeSlots.map(slot => 
        slot.id === timeSlotId ? { ...slot, selected: !slot.selected } : slot
      )
    }
    
    setSelectedDay(updatedDay)
  }
  
  // Save time slots
  const saveTimeSlots = () => {
    if (!selectedDay) return
    
    setCalendarData(prevData => 
      prevData.map(day => 
        day.date === selectedDay.date ? selectedDay : day
      )
    )
    
    setTimeSlotsModalVisible(false)
    Alert.alert(t("common.success"), t("restaurant.timeSlotsSuccessfullySaved"))
  }
  
  // Check if a day has any time slots selected
  const hasSelectedTimeSlots = (day: DayAvailability) => {
    return day.timeSlots.some(slot => slot.selected)
  }
  
  // Generate weekly view data
  const weeklyViewData = () => {
    const weeks = []
    let currentWeek = []
    
    for (let i = 0; i < calendarData.length; i++) {
      currentWeek.push(calendarData[i])
      
      if (currentWeek.length === 7 || i === calendarData.length - 1) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    }
    
    return weeks
  }

  // Save all availability
  const saveAllAvailability = () => {
    // In a real app, this would send data to the backend
    Alert.alert(
      t("restaurant.saveAvailability"),
      t("restaurant.confirmSaveAvailability"),
      [
        {
          text: t("common.cancel"),
          style: "cancel"
        },
        {
          text: t("common.save"),
          style: "default",
          onPress: () => {
            // Here would be the API call
            Alert.alert(t("common.success"), t("restaurant.availabilitySavedSuccessfully"))
          }
        }
      ]
    )
  }
  
  // Reset all availability
  const resetAllAvailability = () => {
    Alert.alert(
      t("restaurant.resetAvailability"),
      t("restaurant.confirmResetAvailability"),
      [
        {
          text: t("common.cancel"),
          style: "cancel"
        },
        {
          text: t("common.reset"),
          style: "destructive",
          onPress: () => {
            setCalendarData(generateCalendarDays())
            Alert.alert(t("common.success"), t("restaurant.availabilityResetSuccessfully"))
          }
        }
      ]
    )
  }
  
  // Render time slots modal
  const renderTimeSlotsModal = () => {
    if (!selectedDay) return null
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={timeSlotsModalVisible}
        onRequestClose={() => setTimeSlotsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("restaurant.availableTimeSlots")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTimeSlotsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dayInfoContainer}>
              <Text style={[styles.dayInfoText, { color: colors.text }]}>
                {selectedDay.dayOfWeek}, {selectedDay.dayNumber} {t("common.of")} {selectedDay.month}
              </Text>
              <View style={styles.availabilityToggleContainer}>
                <Text style={[styles.availabilityLabel, { color: colors.text }]}>
                  {t("restaurant.availableThisDay")}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.availabilityToggle,
                    {
                      backgroundColor: selectedDay.available
                        ? colors.success + "20"
                        : colors.error + "20"
                    }
                  ]}
                  onPress={() => {
                    setSelectedDay({
                      ...selectedDay,
                      available: !selectedDay.available
                    })
                  }}
                >
                  <Ionicons
                    name={selectedDay.available ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={selectedDay.available ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      styles.availabilityText,
                      { color: selectedDay.available ? colors.success : colors.error }
                    ]}
                  >
                    {selectedDay.available ? t("common.yes") : t("common.no")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("restaurant.selectAvailableTimeSlots")}
            </Text>
            
            <ScrollView style={styles.timeSlotsContainer}>
              {selectedDay.timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotItem,
                    {
                      backgroundColor: slot.selected
                        ? colors.primary + "20"
                        : colors.background,
                      borderColor: slot.selected
                        ? colors.primary
                        : colors.border
                    }
                  ]}
                  onPress={() => toggleTimeSlot(slot.id)}
                >
                  <View style={styles.timeSlotInfo}>
                    <Text style={[styles.timeSlotText, { color: colors.text }]}>
                      {slot.start} - {slot.end}
                    </Text>
                  </View>
                  <View style={styles.timeSlotCheckbox}>
                    {slot.selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary}
                      />
                    ) : (
                      <View
                        style={[
                          styles.emptyCheckbox,
                          { borderColor: colors.border }
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setTimeSlotsModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
                onPress={saveTimeSlots}
              >
                <Text style={{ color: "white" }}>{t("common.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  
  // Render calendar view
  const renderCalendarView = () => {
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.weekDaysHeader}>
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, index) => (
            <Text
              key={index}
              style={[styles.weekDayText, { color: colors.text + "80" }]}
            >
              {day}
            </Text>
          ))}
        </View>
        
        <ScrollView style={styles.weeksContainer}>
          {weeklyViewData().map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => (
                <TouchableOpacity
                  key={`${weekIndex}-${dayIndex}`}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: day.available
                        ? colors.primary + "15"
                        : colors.background,
                      borderColor: hasSelectedTimeSlots(day)
                        ? colors.primary
                        : colors.border
                    }
                  ]}
                  onPress={() => openTimeSlotsModal(day)}
                  onLongPress={() => toggleDayAvailability(day.date)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: day.available
                          ? colors.primary
                          : colors.text
                      }
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                  
                  {day.available && (
                    <View
                      style={[
                        styles.availabilityDot,
                        { backgroundColor: colors.success }
                      ]}
                    />
                  )}
                  
                  {hasSelectedTimeSlots(day) && (
                    <View style={styles.timeSlotIndicator}>
                      <Ionicons name="time" size={12} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
  
  // Render list view
  const renderListView = () => {
    return (
      <ScrollView style={styles.listContainer}>
        {calendarData.map((day, index) => (
          <Card key={index} style={styles.dayCard}>
            <TouchableOpacity
              style={styles.dayCardContent}
              onPress={() => openTimeSlotsModal(day)}
            >
              <View style={styles.dayInfo}>
                <View
                  style={[
                    styles.dateCircle,
                    {
                      backgroundColor: day.available
                        ? colors.primary + "20"
                        : colors.background,
                      borderColor: day.available
                        ? colors.primary
                        : colors.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.dateCircleDay,
                      { color: day.available ? colors.primary : colors.text }
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.dateCircleMonth,
                      { color: day.available ? colors.primary : colors.text + "80" }
                    ]}
                  >
                    {day.month.substring(0, 3)}
                  </Text>
                </View>
                
                <View style={styles.dayDetails}>
                  <Text style={[styles.dayName, { color: colors.text }]}>
                    {day.dayOfWeek}
                  </Text>
                  <View style={styles.availabilityContainer}>
                    <View
                      style={[
                        styles.availabilityIndicator,
                        {
                          backgroundColor: day.available
                            ? colors.success
                            : colors.error + "50"
                        }
                      ]}
                    />
                    <Text
                      style={[
                        styles.availabilityStatus,
                        {
                          color: day.available
                            ? colors.success
                            : colors.text + "80"
                        }
                      ]}
                    >
                      {day.available ? t("restaurant.available") : t("restaurant.notAvailable")}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.dayActions}>
                {hasSelectedTimeSlots(day) ? (
                  <View style={styles.timeSlotsSummary}>
                    <Ionicons name="time-outline" size={16} color={colors.primary} />
                    <Text style={[styles.timeSlotsText, { color: colors.primary }]}>
                      {day.timeSlots.filter(slot => slot.selected).length} {t("restaurant.timeSlots")}
                    </Text>
                  </View>
                ) : (
                  day.available && (
                    <Text style={[styles.noTimeSlotsText, { color: colors.text + "60" }]}>
                      {t("restaurant.noTimeSlots")}
                    </Text>
                  )
                )}
                
                <TouchableOpacity
                  style={[
                    styles.toggleAvailabilityButton,
                    {
                      backgroundColor: day.available
                        ? colors.error + "20"
                        : colors.success + "20"
                    }
                  ]}
                  onPress={() => toggleDayAvailability(day.date)}
                >
                  <Text
                    style={[
                      styles.toggleAvailabilityText,
                      {
                        color: day.available
                          ? colors.error
                          : colors.success
                      }
                    ]}
                  >
                    {day.available ? t("restaurant.disable") : t("restaurant.enable")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    )
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === 'ios' ? { paddingTop: 8 } : null]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("restaurant.availability")}</Text>
      </View>
      
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            {
              backgroundColor: viewType === 'calendar'
                ? colors.primary
                : colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={() => setViewType('calendar')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={viewType === 'calendar' ? "white" : colors.text}
          />
          <Text
            style={[
              styles.viewToggleText,
              { color: viewType === 'calendar' ? "white" : colors.text }
            ]}
          >
            {t("restaurant.calendar")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            {
              backgroundColor: viewType === 'list'
                ? colors.primary
                : colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={() => setViewType('list')}
        >
          <Ionicons
            name="list"
            size={20}
            color={viewType === 'list' ? "white" : colors.text}
          />
          <Text
            style={[
              styles.viewToggleText,
              { color: viewType === 'list' ? "white" : colors.text }
            ]}
          >
            {t("restaurant.list")}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Card style={styles.instructionsCard}>
        <View style={styles.instructionsHeader}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>
            {t("restaurant.instructions")}
          </Text>
        </View>
        <Text style={[styles.instructionsText, { color: colors.text + "80" }]}>
          • {t("restaurant.tapDayInstruction")}{'\n'}
          • {t("restaurant.longPressInstruction")}{'\n'}
          • {t("restaurant.timeSlotIndicatorInstruction")}
        </Text>
      </Card>
      
      {viewType === 'calendar' ? renderCalendarView() : renderListView()}
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.error }]}
          onPress={resetAllAvailability}
        >
          <Ionicons name="refresh" size={20} color={colors.error} />
          <Text style={[styles.resetButtonText, { color: colors.error }]}>
            {t("common.reset")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={saveAllAvailability}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {t("restaurant.saveAvailability")}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Time Slots Modal */}
      {renderTimeSlotsModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  viewToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  viewToggleText: {
    fontWeight: "500",
    marginLeft: 6,
    fontSize: 13,
  },
  instructionsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  weekDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    width: 38,
  },
  weeksContainer: {
    flex: 1,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayCell: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 19,
    borderWidth: 1,
    position: "relative",
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: "500",
  },
  availabilityDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  timeSlotIndicator: {
    position: "absolute",
    bottom: 2,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayCard: {
    marginBottom: 10,
  },
  dayCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  dateCircleDay: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateCircleMonth: {
    fontSize: 11,
    marginTop: -2,
  },
  dayDetails: {
    marginLeft: 12,
  },
  dayName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  availabilityStatus: {
    fontSize: 13,
  },
  dayActions: {
    alignItems: "flex-end",
  },
  timeSlotsSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeSlotsText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  noTimeSlotsText: {
    fontSize: 12,
    marginBottom: 6,
  },
  toggleAvailabilityButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  toggleAvailabilityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetButtonText: {
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 13,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
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
  dayInfoContainer: {
    marginBottom: 16,
  },
  dayInfoText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  availabilityToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  availabilityLabel: {
    fontSize: 15,
  },
  availabilityToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availabilityText: {
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  timeSlotsContainer: {
    maxHeight: 230,
    marginBottom: 16,
  },
  timeSlotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotText: {
    fontSize: 15,
  },
  timeSlotCheckbox: {
    marginLeft: 12,
  },
  emptyCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
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