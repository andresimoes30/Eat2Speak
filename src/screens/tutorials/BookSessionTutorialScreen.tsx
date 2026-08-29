"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

export default function BookSessionTutorialScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLanguage()

  const steps = [
    {
      title: t("tutorial.bookSession.step1Title"),
      description: t("tutorial.bookSession.step1Desc"),
      icon: "restaurant-outline"
    },
    {
      title: t("tutorial.bookSession.step2Title"),
      description: t("tutorial.bookSession.step2Desc"),
      icon: "search-outline"
    },
    {
      title: t("tutorial.bookSession.step3Title"),
      description: t("tutorial.bookSession.step3Desc"),
      icon: "person-outline"
    },
    {
      title: t("tutorial.bookSession.step4Title"),
      description: t("tutorial.bookSession.step4Desc"),
      icon: "calendar-outline"
    },
    {
      title: t("tutorial.bookSession.step5Title"),
      description: t("tutorial.bookSession.step5Desc"),
      icon: "card-outline"
    },
    {
      title: t("tutorial.bookSession.step6Title"),
      description: t("tutorial.bookSession.step6Desc"),
      icon: "checkmark-circle-outline"
    }
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("help.tutorial1")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card style={styles.introCard}>
          <Text style={[styles.introTitle, { color: colors.text }]}>{t("tutorial.bookSession.introTitle")}</Text>
          <Text style={[styles.introText, { color: colors.text + "80" }]}>
            {t("tutorial.bookSession.introText")}
          </Text>
        </Card>

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
                <Ionicons name={step.icon as any} size={32} color={colors.primary} />
              </View>
              <Text style={[styles.stepDescription, { color: colors.text + "80" }]}>
                {step.description}
              </Text>
            </View>
          </Card>
        ))}

        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>{t("tutorial.bookSession.tipsTitle")}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.gold[600]} style={styles.tipIcon} />
              <Text style={[styles.tipText, { color: colors.text + "90" }]}>
                {t("tutorial.bookSession.tip1")}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.gold[600]} style={styles.tipIcon} />
              <Text style={[styles.tipText, { color: colors.text + "90" }]}>
                {t("tutorial.bookSession.tip2")}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.gold[600]} style={styles.tipIcon} />
              <Text style={[styles.tipText, { color: colors.text + "90" }]}>
                {t("tutorial.bookSession.tip3")}
              </Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Restaurants" as never)}
        >
          <Text style={styles.actionButtonText}>{t("tutorial.bookSession.tryNowButton")}</Text>
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
  stepCard: {
    marginBottom: 16,
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
  divider: {
    height: 1,
  },
  stepContent: {
    padding: 16,
    paddingTop: 12,
    flexDirection: "row",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepDescription: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipsCard: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    paddingBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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