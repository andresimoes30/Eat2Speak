"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Datos ficticios de seguridad
const securityData = {
  twoFactorEnabled: true,
  loginAlerts: true,
  lastPasswordChange: "12/01/2024",
  passwordStrength: "Fuerte",
  deviceHistory: [
    {
      device: "iPhone 13",
      location: "Madrid, España",
      date: "Hoy, 10:45",
      current: true,
      ip: "192.168.1.1",
    },
    {
      device: "MacBook Pro",
      location: "Madrid, España",
      date: "Ayer, 18:30",
      current: false,
      ip: "192.168.1.2",
    },
    {
      device: "iPad Air",
      location: "Barcelona, España",
      date: "15/04/2024, 14:20",
      current: false,
      ip: "192.168.1.3",
    },
  ],
  securityLog: [
    {
      action: "Inicio de sesión",
      date: "Hoy, 10:45",
      details: "Desde iPhone 13 en Madrid, España",
    },
    {
      action: "Cambio de contraseña",
      date: "12/01/2024, 15:30",
      details: "Desde MacBook Pro en Madrid, España",
    },
    {
      action: "Activación de 2FA",
      date: "10/01/2024, 09:15",
      details: "Desde MacBook Pro en Madrid, España",
    },
  ],
}

export default function SecurityScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(securityData.twoFactorEnabled)
  const [loginAlerts, setLoginAlerts] = useState(securityData.loginAlerts)

  const { t } = useLanguage()

  const handleChangePassword = () => {
    Alert.alert(t("security.changePassword"), "Se enviará un enlace a tu correo electrónico para cambiar la contraseña.", [
      {
        text: t("button.cancel"),
        style: "cancel",
      },
      {
        text: "Enviar enlace",
        onPress: () => Alert.alert("Enlace enviado", "Revisa tu correo electrónico para cambiar la contraseña."),
      },
    ])
  }

  const handleRemoveDevice = (device: string) => {
    Alert.alert("Eliminar dispositivo", `¿Estás seguro de que quieres eliminar el dispositivo "${device}"?`, [
      {
        text: t("button.cancel"),
        style: "cancel",
      },
      {
        text: "Eliminar",
        onPress: () => Alert.alert("Dispositivo eliminado", `El dispositivo "${device}" ha sido eliminado.`),
        style: "destructive",
      },
    ])
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 42 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("security.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.securityCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("security.settings")}</Text>

          <View style={styles.securityItem}>
            <View style={styles.securityItemContent}>
              <Text style={[styles.securityItemTitle, { color: colors.text }]}>{t("security.twoFactor")}</Text>
              <Text style={[styles.securityItemDescription, { color: colors.text + "80" }]}>
                {t("security.twoFactorDesc")}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={(value) => {
                if (!value) {
                  Alert.alert(
                    "Desactivar 2FA",
                    "Desactivar la autenticación de dos factores reduce la seguridad de tu cuenta. ¿Estás seguro?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Desactivar",
                        onPress: () => setTwoFactorEnabled(false),
                        style: "destructive",
                      },
                    ],
                  )
                } else {
                  setTwoFactorEnabled(true)
                }
              }}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={twoFactorEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.securityItem}>
            <View style={styles.securityItemContent}>
              <Text style={[styles.securityItemTitle, { color: colors.text }]}>{t("security.loginAlerts")}</Text>
              <Text style={[styles.securityItemDescription, { color: colors.text + "80" }]}>
                {t("security.loginAlertsDesc")}
              </Text>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={loginAlerts ? colors.primary : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.securityAction} onPress={handleChangePassword}>
            <Ionicons name="key-outline" size={20} color={colors.primary} style={styles.securityActionIcon} />
            <View style={styles.securityActionContent}>
              <Text style={[styles.securityActionText, { color: colors.text }]}>{t("security.changePassword")}</Text>
              <Text style={[styles.securityActionSubtext, { color: colors.text + "60" }]}>
                {t("security.lastChange").replace("{date}", securityData.lastPasswordChange)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={styles.passwordStrength}>
            <Text style={[styles.passwordStrengthLabel, { color: colors.text + "80" }]}>
              {t("security.passwordStrength")}
            </Text>
            <View
              style={[
                styles.passwordStrengthTag,
                {
                  backgroundColor:
                    securityData.passwordStrength === "Fuerte"
                      ? colors.blue[50]
                      : securityData.passwordStrength === "Media"
                        ? colors.gold[50]
                        : colors.error + "15",
                },
              ]}
            >
              <Text
                style={[
                  styles.passwordStrengthText,
                  {
                    color:
                      securityData.passwordStrength === "Fuerte"
                        ? colors.blue[700]
                        : securityData.passwordStrength === "Media"
                          ? colors.gold[700]
                          : colors.error,
                  },
                ]}
              >
                {securityData.passwordStrength === "Fuerte" 
                  ? t("security.strong") 
                  : securityData.passwordStrength === "Media" 
                    ? t("security.medium") 
                    : t("security.weak")}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.securityCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("security.connectedDevices")}</Text>

          {securityData.deviceHistory.map((device, index) => (
            <View key={index} style={styles.deviceItem}>
              <View style={styles.deviceItemIcon}>
                <Ionicons
                  name={
                    device.device.includes("iPhone")
                      ? "phone-portrait-outline"
                      : device.device.includes("iPad")
                        ? "tablet-portrait-outline"
                        : "laptop-outline"
                  }
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.deviceItemContent}>
                <View style={styles.deviceItemHeader}>
                  <Text style={[styles.deviceItemName, { color: colors.text }]}>{device.device}</Text>
                  {device.current && (
                    <View style={[styles.currentDeviceTag, { backgroundColor: colors.blue[100] }]}>
                      <Text style={[styles.currentDeviceText, { color: colors.blue[700] }]}>{t("security.current")}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.deviceItemLocation, { color: colors.text + "80" }]}>
                  {device.location} • IP: {device.ip}
                </Text>
                <Text style={[styles.deviceItemDate, { color: colors.text + "60" }]}>{device.date}</Text>
              </View>
              {!device.current && (
                <TouchableOpacity style={styles.deviceItemAction} onPress={() => handleRemoveDevice(device.device)}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>

        <Card style={styles.securityCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("security.activityLog")}</Text>

          {securityData.securityLog.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={styles.logItemIcon}>
                <Ionicons
                  name={
                    log.action.includes("Inicio")
                      ? "log-in-outline"
                      : log.action.includes("contraseña")
                        ? "key-outline"
                        : "shield-checkmark-outline"
                  }
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.logItemContent}>
                <Text style={[styles.logItemAction, { color: colors.text }]}>{log.action}</Text>
                <Text style={[styles.logItemDetails, { color: colors.text + "80" }]}>{log.details}</Text>
                <Text style={[styles.logItemDate, { color: colors.text + "60" }]}>{log.date}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={[styles.viewAllButton, { borderColor: colors.border }]}>
            <Text style={[styles.viewAllButtonText, { color: colors.text }]}>{t("security.viewAllHistory")}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </Card>

        <Card style={[styles.dangerZoneCard, { borderColor: colors.error + "30" }]}>
          <Text style={[styles.dangerZoneTitle, { color: colors.error }]}>{t("security.dangerZone")}</Text>

          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: colors.error }]}
            onPress={() => {
              Alert.alert(
                t("security.confirmDeleteTitle"),
                t("security.confirmDelete"),
                [
                  {
                    text: t("button.cancel"),
                    style: "cancel",
                  },
                  {
                    text: "Eliminar",
                    onPress: () => Alert.alert(t("security.confirmDeleteTitle"), t("security.accountDeleted")),
                    style: "destructive",
                  },
                ],
              )
            }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} style={styles.dangerButtonIcon} />
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>{t("security.deleteAccount")}</Text>
          </TouchableOpacity>
        </Card>
      </View>
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
  content: {
    padding: 16,
  },
  securityCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  securityItemContent: {
    flex: 1,
    marginRight: 16,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  securityItemDescription: {
    fontSize: 14,
  },
  securityAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  securityActionIcon: {
    marginRight: 12,
  },
  securityActionContent: {
    flex: 1,
  },
  securityActionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  securityActionSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  passwordStrength: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  passwordStrengthTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  deviceItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deviceItemContent: {
    flex: 1,
  },
  deviceItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  deviceItemName: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  currentDeviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentDeviceText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  deviceItemLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  deviceItemDate: {
    fontSize: 12,
  },
  deviceItemAction: {
    padding: 8,
  },
  logItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  logItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logItemContent: {
    flex: 1,
  },
  logItemAction: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  logItemDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  logItemDate: {
    fontSize: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  dangerZoneCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  dangerButtonIcon: {
    marginRight: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
})
