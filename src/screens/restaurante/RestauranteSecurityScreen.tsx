import React, { useState } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"

export default function RestauranteSecurityScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Estados para las opciones de seguridad
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(true);

  // Manejadores de eventos
  const handleChangePassword = () => {
    Alert.alert("Cambiar Contraseña", "Esta funcionalidad te permitirá cambiar tu contraseña actual por una nueva.");
  };

  const handleSessionManagement = () => {
    Alert.alert("Gestión de Sesiones", "Aquí podrás ver y cerrar sesiones activas en otros dispositivos.");
  };

  const handleTwoFactorAuth = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        "Activar Autenticación de Dos Factores",
        "Esto mejorará significativamente la seguridad de tu cuenta. ¿Deseas continuar?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Continuar",
            onPress: () => setTwoFactorEnabled(true)
          }
        ]
      );
    } else {
      Alert.alert(
        "Desactivar Autenticación de Dos Factores",
        "Esto disminuirá la seguridad de tu cuenta. ¿Estás seguro?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Desactivar",
            onPress: () => setTwoFactorEnabled(false),
            style: "destructive"
          }
        ]
      );
    }
  };

  const handlePrivacySettings = () => {
    Alert.alert("Configuración de Privacidad", "Aquí podrás gestionar qué información se comparte y con quién.");
  };

  const handleDeviceManagement = () => {
    Alert.alert("Dispositivos Autorizados", "Gestiona los dispositivos que tienen acceso a tu cuenta.");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Seguridad</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.sectionTitle, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitleText, { color: colors.text }]}>Acceso a la cuenta</Text>
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Actualiza tu contraseña regularmente para mayor seguridad
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Autenticación de Dos Factores</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Añade una capa extra de seguridad a tu cuenta
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Gestión de Sesiones</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Revisa y cierra sesiones activas en otros dispositivos
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Autenticación Biométrica</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Usa tu huella digital o reconocimiento facial para iniciar sesión
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Dispositivos Autorizados</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Gestiona los dispositivos que tienen acceso a tu cuenta
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
        </TouchableOpacity>

        <View style={[styles.sectionTitle, { borderBottomColor: colors.border, marginTop: 20 }]}>
          <Text style={[styles.sectionTitleText, { color: colors.text }]}>Privacidad</Text>
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Configuración de Privacidad</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Controla qué información es visible para los demás
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Seguimiento de Ubicación</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Permitir que la app acceda a tu ubicación
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Compartir Datos</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Compartir datos anónimos para mejorar el servicio
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
            <Text style={[styles.optionTitle, { color: colors.text }]}>Notificaciones de Marketing</Text>
            <Text style={[styles.optionDescription, { color: colors.text + "80" }]}>
              Recibir correos sobre ofertas y novedades
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
          <Text style={[styles.dangerZoneTitle, { color: colors.error }]}>Zona de peligro</Text>
          
          <TouchableOpacity 
            style={[styles.dangerButton, { borderColor: colors.error }]}
            onPress={() => {
              Alert.alert(
                "Eliminar Cuenta",
                "Esta acción es irreversible. ¿Estás seguro de que quieres eliminar tu cuenta permanentemente?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  {
                    text: "Eliminar",
                    onPress: () => Alert.alert("Función de demostración", "En una aplicación real, esto eliminaría tu cuenta."),
                    style: "destructive"
                  }
                ]
              );
            }}
          >
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>Eliminar Cuenta</Text>
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