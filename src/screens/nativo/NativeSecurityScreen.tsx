import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"

// Define the parameter list for the Native Navigator stack
type NativeStackParamList = {
  NativeProfileMain: undefined;
  NativeSecurity: undefined;
};

// Define the navigation prop type
type NativeSecurityNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativeSecurity'
>;

export default function NativeSecurityScreen() {
  const navigation = useNavigation<NativeSecurityNavigationProp>();
  
  // Estados para as opções de segurança
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  
  // Estado para modal de alterar senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Theme colors - simplified version since we don't have ThemeContext
  const colors = {
    background: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    error: '#dc2626',
    success: '#10b981',
    card: '#ffffff',
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      600: '#7c3aed',
      700: '#6d28d9'
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      600: '#ca8a04',
      700: '#a16207'
    }
  };

  // Função para alterar a senha
  const handleChangePassword = () => {
    // Validar inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Por favor, completa todos los campos");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }
    
    // Simulação de mudança de senha
    alert("Contraseña cambiada con éxito");
    setShowPasswordModal(false);
    
    // Limpar os campos
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 30 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Seguridad</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contraseña y Autenticación</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="key-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Cambiar Contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.purple[600]} />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Autenticación de dos factores</Text>
                <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                  Protege tu cuenta con una capa adicional de seguridad
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="finger-print-outline" size={20} color={colors.blue[600]} />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Autenticación biométrica</Text>
                <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                  Accede con tu huella dactilar o reconocimiento facial
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas de Seguridad</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.gold[50] }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.gold[600]} />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Alertas de sesiones</Text>
                <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                  Recibe notificaciones sobre reservas y cambios en tus sesiones
                </Text>
              </View>
            </View>
            <Switch
              value={sessionAlerts}
              onValueChange={setSessionAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="log-in-outline" size={20} color={colors.purple[600]} />
              </View>
              <View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Alertas de inicio de sesión</Text>
                <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                  Recibe alertas cuando alguien inicie sesión en tu cuenta
                </Text>
              </View>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacidad</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="eye-off-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Configuración de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="list-outline" size={20} color={colors.purple[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Registro de actividad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.error + "15" }]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.error }]}>Eliminar cuenta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
            
            <View style={styles.passwordInputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contraseña actual</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.card
                  }]}
                  placeholder="Introduce tu contraseña actual"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nueva contraseña</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.card
                  }]}
                  placeholder="Introduce tu nueva contraseña"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirmar contraseña</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[styles.passwordInput, { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.card
                  }]}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
            
            <View style={styles.passwordStrengthContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Seguridad de la contraseña</Text>
              <View style={styles.strengthIndicator}>
                <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${newPassword.length * 10}%`, 
                        backgroundColor: newPassword.length > 8 ? colors.success : 
                                          newPassword.length > 5 ? colors.gold[600] : 
                                          colors.error
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: colors.textSecondary }]}>
                  {newPassword.length > 8 ? "Fuerte" : 
                   newPassword.length > 5 ? "Media" : 
                   newPassword.length > 0 ? "Débil" : ""}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E5E5E5' }]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: (currentPassword && newPassword && confirmPassword) ? 
                                    colors.primary : colors.primary + '60'
                  }
                ]}
                onPress={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Guardar</Text>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  // Modal styles
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  passwordInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 44,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  passwordStrengthContainer: {
    marginBottom: 24,
  },
  strengthIndicator: {
    marginTop: 8,
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
});