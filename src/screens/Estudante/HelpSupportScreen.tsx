"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

type ProfileStackParamList = {
  ProfileMain: undefined;
  PersonalInfo: undefined;
  Security: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  Languages: undefined;
  HelpSupport: undefined;
  TermsConditions: undefined;
  BookSessionTutorial: undefined;
  PaymentSystemTutorial: undefined;
}

type HelpSupportScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>

export default function HelpSupportScreen() {
  const navigation = useNavigation<HelpSupportScreenNavigationProp>()
  const { colors } = useTheme()
  const { t } = useLanguage()

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@eat2speak.com")
  }

  const handlePhoneSupport = () => {
    Linking.openURL("tel:+123456789")
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("profile.help")}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("help.contactTitle")}</Text>
        
        <Card style={styles.card}>
          <TouchableOpacity style={styles.supportItem} onPress={handleEmailSupport}>
            <View style={[styles.iconContainer, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="mail-outline" size={24} color={colors.blue[600]} />
            </View>
            <View style={styles.supportItemContent}>
              <Text style={[styles.supportItemTitle, { color: colors.text }]}>{t("help.emailSupport")}</Text>
              <Text style={[styles.supportItemSubtitle, { color: colors.text + "80" }]}>support@eat2speak.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.supportItem} onPress={handlePhoneSupport}>
            <View style={[styles.iconContainer, { backgroundColor: colors.gold[50] }]}>
              <Ionicons name="call-outline" size={24} color={colors.gold[600]} />
            </View>
            <View style={styles.supportItemContent}>
              <Text style={[styles.supportItemTitle, { color: colors.text }]}>{t("help.phoneSupport")}</Text>
              <Text style={[styles.supportItemSubtitle, { color: colors.text + "80" }]}>+1 234 567 89</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("help.faqTitle")}</Text>
        
        <Card style={styles.card}>
          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>{t("help.faq1Question")}</Text>
            <Text style={[styles.faqAnswer, { color: colors.text + "80" }]}>{t("help.faq1Answer")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>{t("help.faq2Question")}</Text>
            <Text style={[styles.faqAnswer, { color: colors.text + "80" }]}>{t("help.faq2Answer")}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>{t("help.faq3Question")}</Text>
            <Text style={[styles.faqAnswer, { color: colors.text + "80" }]}>{t("help.faq3Answer")}</Text>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("help.tutorialTitle")}</Text>
        
        <Card style={styles.card}>
          <TouchableOpacity style={styles.tutorialItem} onPress={() => navigation.navigate('BookSessionTutorial')}>
            <View style={[styles.iconContainer, { backgroundColor: colors.purple[50] }]}>
              <Ionicons name="book-outline" size={24} color={colors.purple[600]} />
            </View>
            <View style={styles.supportItemContent}>
              <Text style={[styles.supportItemTitle, { color: colors.text }]}>{t("help.tutorial1")}</Text>
              <Text style={[styles.supportItemSubtitle, { color: colors.text + "80" }]}>{t("help.tutorial1Desc")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.tutorialItem} onPress={() => navigation.navigate('PaymentSystemTutorial')}>
            <View style={[styles.iconContainer, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="play-outline" size={24} color={colors.blue[600]} />
            </View>
            <View style={styles.supportItemContent}>
              <Text style={[styles.supportItemTitle, { color: colors.text }]}>{t("help.tutorial2")}</Text>
              <Text style={[styles.supportItemSubtitle, { color: colors.text + "80" }]}>{t("help.tutorial2Desc")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + "60"} />
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
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  supportItemContent: {
    flex: 1,
  },
  supportItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  supportItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  faqItem: {
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  tutorialItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  }
})