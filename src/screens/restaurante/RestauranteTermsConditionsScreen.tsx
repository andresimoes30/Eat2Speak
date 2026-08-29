"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

export default function RestauranteTermsConditionsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLanguage()

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
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>{t("terms.introductionText")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.services")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>{t("terms.servicesText")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.privacy")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>{t("terms.privacyText")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.payment")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>{t("terms.paymentText")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.userConduct")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>{t("terms.userConductText")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("terms.cancellation")}</Text>
            <Text style={[styles.sectionText, { color: colors.text + "80" }]}>{t("terms.cancellationText")}</Text>
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
})