import React, { useState } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"

export default function RestauranteSecurityScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  // Estados para las opciones de seguridad
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(true);

  // Manejadores de eventos
  const handleChangePassword = () => {
    Alert.alert(t("security.changePassword"), t("security.changePasswordDescription"));
  };

  const handleSessionManagement = () => {
    Alert.alert(t("security.sessionManagement"), t("security.sessionManagementDescription"));
  };

  const handleTwoFactorAuth = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        t("security.enableTwoFactor"),
        t("security.twoFactorEnableDescription"),
        [
          {
            text: t("common.cancel"),
            style: "cancel"
          },
          {
            text: t("common.continue"),
            onPress: () => setTwoFactorEnabled(true)
          }
        ]
      );
    } else {
      Alert.alert(
        t("security.disableTwoFactor"),
        t("security.twoFactorDisableDescription"),
        [
          {
            text: t("common.cancel"),
            style: "cancel"
          },
          {
            text: t("common.disable"),
            onPress: () => setTwoFactorEnabled(false),
            style: "destructive"
          }
        ]
      );
    }
  };

  const handlePrivacySettings = () => {
    Alert.alert(t("privacy.settings"), t("privacy.settingsDescription"));
  };

  const handleDeviceManagement = () => {
    Alert.alert(t("security.authorizedDevices"), t("security.authorizedDevicesDescription"));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("common.security")}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.sectionTitle, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitleText, { color: colors.text }]}>{t("restaurant.accountAccess")}</Text>
        </View>

        {/* Cambiar contraseña */}
        <TouchableOpacity 
          style={[styles.optionItem, { borderBottomColor: colors.border }]} 
          onPress={handleChangePassword}
        >
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="key-outline" size={20} color={colors.blue[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("security.changePassword")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("security.updatePasswordRegularly")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
        </TouchableOpacity>

        {/* Autenticación de dos factores */}
        <TouchableOpacity 
          style={[styles.optionItem, { borderBottomColor: colors.border }]} 
          onPress={handleTwoFactorAuth}
        >
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.purple[50] }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.purple[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("security.twoFactorAuthentication")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("security.addExtraSecurityLayer")}
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{ false: colors.border, true: colors.primary + "80" }}
            thumbColor={twoFactorEnabled ? colors.primary : "#f4f3f4"}
          />
        </TouchableOpacity>

        {/* Gestión de sesiones */}
        <TouchableOpacity 
          style={[styles.optionItem, { borderBottomColor: colors.border }]} 
          onPress={handleSessionManagement}
        >
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.purple[50] }]}>
              <Ionicons name="exit-outline" size={20} color={colors.purple[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("security.sessionManagement")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("security.reviewAndCloseSessions")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
        </TouchableOpacity>

        {/* Autenticación biométrica */}
        <TouchableOpacity 
          style={[styles.optionItem, { borderBottomColor: colors.border }]} 
        >
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.gold[50] }]}>
              <Ionicons name="finger-print-outline" size={20} color={colors.gold[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("security.biometricAuthentication")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("security.useFingerprintOrFaceId")}
            </Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: colors.border, true: colors.primary + "80" }}
            thumbColor={biometricEnabled ? colors.primary : "#f4f3f4"}
          />
        </TouchableOpacity>

        {/* Dispositivos autorizados */}
        <TouchableOpacity 
          style={[styles.optionItem, { borderBottomColor: colors.border }]} 
          onPress={handleDeviceManagement}
        >
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.blue[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("security.authorizedDevices")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("security.manageDevicesWithAccess")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
        </TouchableOpacity>

        <View style={[styles.sectionTitle, { borderBottomColor: colors.border, marginTop: 20 }]}>
          <Text style={[styles.sectionTitleText, { color: colors.text }]}>{t("common.privacy")}</Text>
        </View>

        {/* Configuración de privacidad */}
        <TouchableOpacity 
          style={[styles.optionItem, { borderBottomColor: colors.border }]} 
          onPress={handlePrivacySettings}
        >
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.purple[50] }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.purple[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("privacy.settings")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("privacy.controlVisibleInformation")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
        </TouchableOpacity>

        {/* Seguimiento de ubicación */}
        <TouchableOpacity style={[styles.optionItem, { borderBottomColor: colors.border }]}>
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="location-outline" size={20} color={colors.blue[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("privacy.locationTracking")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("privacy.allowAppToAccessLocation")}
            </Text>
          </View>
          <Switch
            value={locationTracking}
            onValueChange={setLocationTracking}
            trackColor={{ false: colors.border, true: colors.primary + "80" }}
            thumbColor={locationTracking ? colors.primary : "#f4f3f4"}
          />
        </TouchableOpacity>

        {/* Compartir datos */}
        <TouchableOpacity style={[styles.optionItem, { borderBottomColor: colors.border }]}>
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.purple[50] }]}>
              <Ionicons name="share-outline" size={20} color={colors.purple[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("privacy.dataSharing")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("privacy.shareAnonymousData")}
            </Text>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: colors.border, true: colors.primary + "80" }}
            thumbColor={dataSharing ? colors.primary : "#f4f3f4"}
          />
        </TouchableOpacity>

        {/* Notificaciones de marketing */}
        <TouchableOpacity style={[styles.optionItem, { borderBottomColor: colors.border }]}>
          <View style={styles.optionIcon}>
            <View style={[styles.iconBackground, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="mail-outline" size={20} color={colors.blue[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{t("privacy.marketingNotifications")}</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              {t("privacy.receiveEmailsAboutOffers")}
            </Text>
          </View>
          <Switch
            value={marketingNotifications}
            onValueChange={setMarketingNotifications}
            trackColor={{ false: colors.border, true: colors.primary + "80" }}
            thumbColor={marketingNotifications ? colors.primary : "#f4f3f4"}
          />
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={[styles.dangerZoneTitle, { color: colors.error }]}>{t("common.dangerZone")}</Text>
          
          <TouchableOpacity 
            style={[styles.dangerButton, { borderColor: colors.error }]}
            onPress={() => {
              Alert.alert(
                t("account.deleteAccount"),
                t("account.deleteAccountConfirmation"),
                [
                  {
                    text: t("common.cancel"),
                    style: "cancel"
                  },
                  {
                    text: t("common.delete"),
                    onPress: () => Alert.alert(t("common.demoFeature"), t("account.deleteAccountDemoMessage")),
                    style: "destructive"
                  }
                ]
              );
            }}
          >
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>{t("account.deleteAccount")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
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
    paddingTop: 30,
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
  rightPlaceholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionIcon: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  dangerZone: {
    marginTop: 32,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE5E5",
    backgroundColor: "#FFF5F5",
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  dangerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});