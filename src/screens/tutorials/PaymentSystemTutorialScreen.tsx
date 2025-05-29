"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

export default function PaymentSystemTutorialScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLanguage()

  const paymentMethods = [
    {
      title: t("tutorial.payment.method1Title"),
      description: t("tutorial.payment.method1Desc"),
      icon: "card-outline"
    },
    {
      title: t("tutorial.payment.method2Title"),
      description: t("tutorial.payment.method2Desc"),
      icon: "logo-paypal"
    },
    {
      title: t("tutorial.payment.method3Title"),
      description: t("tutorial.payment.method3Desc"),
      icon: "phone-portrait-outline"
    }
  ]

  const steps = [
    {
      title: t("tutorial.payment.step1Title"),
      description: t("tutorial.payment.step1Desc"),
      icon: "person-outline"
    },
    {
      title: t("tutorial.payment.step2Title"),
      description: t("tutorial.payment.step2Desc"),
      icon: "add-circle-outline"
    },
    {
      title: t("tutorial.payment.step3Title"),
      description: t("tutorial.payment.step3Desc"),
      icon: "checkmark-circle-outline"
    },
    {
      title: t("tutorial.payment.step4Title"),
      description: t("tutorial.payment.step4Desc"),
      icon: "wallet-outline"
    }
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("help.tutorial2")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card style={styles.introCard}>
          <Text style={[styles.introTitle, { color: colors.text }]}>{t("tutorial.payment.introTitle")}</Text>
          <Text style={[styles.introText, { color: colors.text + "80" }]}>
            {t("tutorial.payment.introText")}
          </Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("tutorial.payment.methodsTitle")}</Text>

        {paymentMethods.map((method, index) => (
          <Card key={index} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name={method.icon as any} size={28} color={colors.primary} />
              </View>
              <Text style={[styles.methodTitle, { color: colors.text }]}>{method.title}</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <Text style={[styles.methodDescription, { color: colors.text + "80" }]}>
              {method.description}
            </Text>
          </Card>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("tutorial.payment.processTitle")}</Text>

        {steps.map((step, index) => (
          <Card key={index} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.stepContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name={step.icon as any} size={28} color={colors.primary} />
              </View>
              <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
                {step.description}
              </Text>
            </View>
          </Card>
        ))}

        <Card style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark-outline" size={28} color={colors.blue[600]} />
            <Text style={[styles.securityTitle, { color: colors.text }]}>{t("tutorial.payment.securityTitle")}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.securityText, { color: colors.text + "80" }]}>
            {t("tutorial.payment.securityText")}
          </Text>
        </Card>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("PaymentMethods" as never)}
        >
          <Text style={styles.actionButtonText}>{t("tutorial.payment.manageButton")}</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },
  introCard: {
    padding: 16,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  methodCard: {
    marginBottom: 12,
    padding: 16,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  stepCard: {
    marginBottom: 12,
    padding: 0,
    overflow: "hidden",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  stepContent: {
    padding: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepDescription: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  securityCard: {
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  }
})