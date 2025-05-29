import React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Define the parameter list for the Native Navigator stack
type NativeStackParamList = {
  NativeProfileMain: undefined;
  NativeTermsConditions: undefined;
};

// Define the navigation prop type
type NativeTermsConditionsNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativeTermsConditions'
>;

export default function NativeTermsConditionsScreen() {
  const navigation = useNavigation<NativeTermsConditionsNavigationProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("profile.terms")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.lastUpdated")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>15/05/2025</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.introduction")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Estos Términos y Condiciones específicos para Profesores Nativos rigen su participación en la plataforma Eat2Speak. Al registrarse y utilizar nuestros servicios como profesor nativo, usted acepta cumplir con estos términos en su totalidad.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Elegibilidad</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Para ser elegible como profesor nativo en nuestra plataforma, debe:
              {"\n\n"}• Ser hablante nativo del idioma que desea enseñar o tener un nivel certificado C2.
              {"\n"}• Tener al menos 18 años de edad.
              {"\n"}• Proporcionar documentación válida que verifique su identidad.
              {"\n"}• Completar satisfactoriamente nuestro proceso de verificación.
              {"\n"}• Tener una cuenta bancaria válida para recibir pagos.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Servicios del Profesor</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Como profesor nativo, usted acepta:
              {"\n\n"}• Proporcionar servicios de conversación en el idioma especificado.
              {"\n"}• Mantener un entorno respetuoso y profesional durante las sesiones.
              {"\n"}• Asistir puntualmente a las sesiones programadas.
              {"\n"}• Proporcionar retroalimentación constructiva a los estudiantes.
              {"\n"}• Mantener actualizada su disponibilidad en la plataforma.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.payment")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Nuestra plataforma facilita los pagos entre estudiantes y profesores nativos. Al utilizar nuestros servicios, usted acepta:
              {"\n\n"}• Que la plataforma retiene una comisión del 20% sobre el monto pagado por el estudiante.
              {"\n"}• Los pagos se procesarán dentro de los 3-5 días hábiles después de completar una sesión.
              {"\n"}• Es su responsabilidad cumplir con las obligaciones fiscales locales respecto a los ingresos generados.
              {"\n"}• Las tarifas se establecen en la moneda local del país donde opera la plataforma.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cancelaciones y No Asistencias</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Entendemos que pueden surgir imprevistos, sin embargo, para mantener la calidad del servicio:
              {"\n\n"}• Las cancelaciones deben realizarse con al menos 24 horas de anticipación.
              {"\n"}• Las cancelaciones frecuentes pueden resultar en la suspensión de su cuenta.
              {"\n"}• Si un estudiante no asiste, debe marcar la sesión como "No asistió" dentro de las 24 horas para recibir una compensación parcial.
              {"\n"}• Si usted no asiste a una sesión programada sin previo aviso, podrían aplicarse penalizaciones.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.userConduct")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Para mantener un ambiente positivo y profesional, todos los profesores nativos deben:
              {"\n\n"}• Tratar a todos los estudiantes con respeto y profesionalismo.
              {"\n"}• No discriminar por motivos de raza, género, religión, orientación sexual u origen.
              {"\n"}• No compartir contenido inapropiado, ofensivo o ilegal.
              {"\n"}• No solicitar información personal o financiera de los estudiantes.
              {"\n"}• No acordar sesiones fuera de la plataforma para evitar las comisiones.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Propiedad Intelectual</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              Todo el contenido generado durante las sesiones, incluyendo pero no limitado a materiales didácticos, ejercicios y conversaciones, está sujeto a las siguientes condiciones:
              {"\n\n"}• La plataforma se reserva el derecho de utilizar contenido anónimo para mejorar sus servicios.
              {"\n"}• No debe compartir materiales protegidos por derechos de autor sin la debida autorización.
              {"\n"}• Los materiales didácticos proporcionados por la plataforma son para uso exclusivo en las sesiones.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.privacy")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              La privacidad y seguridad de los datos son fundamentales para nuestra plataforma. Como profesor nativo, usted:
              {"\n\n"}• Acepta que sus datos personales sean procesados según nuestra Política de Privacidad.
              {"\n"}• Se compromete a mantener la confidencialidad de la información de los estudiantes.
              {"\n"}• Autoriza el uso de su perfil público para fines promocionales de la plataforma.
              {"\n"}• Acepta que las sesiones pueden ser monitoreadas para control de calidad.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Terminación del Acuerdo</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              La plataforma se reserva el derecho de suspender o terminar su cuenta si:
              {"\n\n"}• Viola estos términos y condiciones.
              {"\n"}• Recibe quejas recurrentes de estudiantes.
              {"\n"}• Mantiene una calificación consistentemente baja.
              {"\n"}• Realiza transacciones fuera de la plataforma.
              {"\n"}• Incurre en comportamiento inapropiado o ilegal.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.contact")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>
              {t("terms.contactText")}
              {"\n\n"}
              legal@eat2speak.com
            </Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>© 2025 Eat2Speak</Text>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>Designed and made by:</Text>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>André Simões</Text>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>João Silva</Text>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>Nicolas Santos</Text>
        </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  }
});