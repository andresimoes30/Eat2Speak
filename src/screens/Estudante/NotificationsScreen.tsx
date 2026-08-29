"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  
  // Notification states
  const [allNotifications, setAllNotifications] = useState(false)
  const [newMessages, setNewMessages] = useState(false)
  const [sessionReminders, setSessionReminders] = useState(true)
  const [restaurantUpdates, setRestaurantUpdates] = useState(true)
  const [promotions, setPromotions] = useState(false)

  const handleAllNotificationsToggle = (value: boolean) => {
    setAllNotifications(value)
    // If turning on all notifications, show the confirmation popup
    if (value && !allNotifications) {
      setShowModal(true)
    }
    
    // Update all notification settings
    setNewMessages(value)
    setSessionReminders(value)
    setRestaurantUpdates(value)
    setPromotions(value)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("profile.notifications")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card style={styles.notificationCard}>
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{t("notifications.all")}</Text>
              <Text style={[styles.notificationDesc, { color: colors.text + "80" }]}>
                {t("notifications.allDesc")}
              </Text>
            </View>
            <Switch
              value={allNotifications}
              onValueChange={handleAllNotificationsToggle}
              trackColor={{ false: colors.text + "30", true: colors.primary + "70" }}
              thumbColor={allNotifications ? colors.primary : colors.text + "40"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{t("notifications.messages")}</Text>
              <Text style={[styles.notificationDesc, { color: colors.text + "80" }]}>
                {t("notifications.messagesDesc")}
              </Text>
            </View>
            <Switch
              value={newMessages}
              onValueChange={setNewMessages}
              trackColor={{ false: colors.text + "30", true: colors.primary + "70" }}
              thumbColor={newMessages ? colors.primary : colors.text + "40"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{t("notifications.sessions")}</Text>
              <Text style={[styles.notificationDesc, { color: colors.text + "80" }]}>
                {t("notifications.sessionsDesc")}
              </Text>
            </View>
            <Switch
              value={sessionReminders}
              onValueChange={setSessionReminders}
              trackColor={{ false: colors.text + "30", true: colors.primary + "70" }}
              thumbColor={sessionReminders ? colors.primary : colors.text + "40"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{t("notifications.restaurants")}</Text>
              <Text style={[styles.notificationDesc, { color: colors.text + "80" }]}>
                {t("notifications.restaurantsDesc")}
              </Text>
            </View>
            <Switch
              value={restaurantUpdates}
              onValueChange={setRestaurantUpdates}
              trackColor={{ false: colors.text + "30", true: colors.primary + "70" }}
              thumbColor={restaurantUpdates ? colors.primary : colors.text + "40"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{t("notifications.promotions")}</Text>
              <Text style={[styles.notificationDesc, { color: colors.text + "80" }]}>
                {t("notifications.promotionsDesc")}
              </Text>
            </View>
            <Switch
              value={promotions}
              onValueChange={setPromotions}
              trackColor={{ false: colors.text + "30", true: colors.primary + "70" }}
              thumbColor={promotions ? colors.primary : colors.text + "40"}
            />
          </View>
        </Card>
      </View>

      {/* Popup modal for notification activation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="notifications" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("notifications.activateTitle")}</Text>
            <Text style={[styles.modalText, { color: colors.text + "80" }]}>
              {t("notifications.activateDesc")}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>{t("button.accept")}</Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  notificationDesc: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
})