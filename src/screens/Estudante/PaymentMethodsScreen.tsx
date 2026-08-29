"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"

// Payment method interface
interface PaymentMethod {
  id: number
  type: "card" | "paypal"
  name: string
  lastDigits?: string
  expiryDate?: string
  cardHolder?: string
  isDefault: boolean
  icon: string
}

// Mock data for payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    type: "card",
    name: "Visa",
    lastDigits: "4242",
    expiryDate: "05/27",
    cardHolder: "John Doe",
    isDefault: true,
    icon: "card-outline"
  },
  {
    id: 2,
    type: "card",
    name: "Mastercard",
    lastDigits: "8163",
    expiryDate: "09/26",
    cardHolder: "John Doe",
    isDefault: false,
    icon: "card-outline"
  },
  {
    id: 3,
    type: "paypal",
    name: "PayPal",
    isDefault: false,
    icon: "logo-paypal"
  }
]

export default function PaymentMethodsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLanguage()
  
  // Handle setting a payment method as default
  const handleSetDefault = (id: number) => {
    // In a real app, this would update the server
    Alert.alert(
      t("payments.methodSetAsDefault"),
      "",
      [{ text: t("common.ok") }]
    )
  }
  
  // Handle removing a payment method
  const handleRemove = (id: number, type: string) => {
    Alert.alert(
      type === "card" ? t("payments.cardRemoved") : t("payments.paypalRemoved"),
      "",
      [{ text: t("common.ok") }]
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Credit/Debit Cards Section */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("payments.creditDebitCards")}
        </Text>
        
        <View style={styles.methodsContainer}>
          {mockPaymentMethods
            .filter(method => method.type === "card")
            .map(card => (
              <View 
                key={card.id}
                style={[styles.methodItem, { borderColor: colors.border }]}
              >
                <View style={styles.methodHeader}>
                  <View style={styles.methodTitleContainer}>
                    <View
                      style={[
                        styles.methodIcon,
                        { backgroundColor: colors.primary + "10" },
                      ]}
                    >
                      <Ionicons name="card-outline" size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.methodName, { color: colors.text }]}>
                        {card.name} •••• {card.lastDigits}
                      </Text>
                      {card.isDefault && (
                        <View
                          style={[
                            styles.defaultBadge,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            {t("payments.defaultMethod")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardDetails}>
                  <View style={styles.cardDetailRow}>
                    <Text style={[styles.cardDetailLabel, { color: colors.text + "80" }]}>
                      {t("payments.cardHolder")}
                    </Text>
                    <Text style={[styles.cardDetailValue, { color: colors.text }]}>
                      {card.cardHolder}
                    </Text>
                  </View>
                  
                  <View style={styles.cardDetailRow}>
                    <Text style={[styles.cardDetailLabel, { color: colors.text + "80" }]}>
                      {t("payments.expiryDate")}
                    </Text>
                    <Text style={[styles.cardDetailValue, { color: colors.text }]}>
                      {card.expiryDate}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.methodActions}>
                  {!card.isDefault && (
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        { borderColor: colors.primary + "30", marginRight: 8 },
                      ]}
                      onPress={() => handleSetDefault(card.id)}
                    >
                      <Text style={{ color: colors.primary }}>
                        {t("payments.makeDefault")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      { borderColor: colors.error + "30" },
                    ]}
                    onPress={() => handleRemove(card.id, "card")}
                  >
                    <Text style={{ color: colors.error }}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          
          <TouchableOpacity
            style={[
              styles.addMethodButton,
              { borderColor: colors.border, borderStyle: "dashed" },
            ]}
            onPress={() => {
              // @ts-ignore - Ignore type checking for this line
              navigation.navigate("AddPaymentMethod")
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addMethodText, { color: colors.primary }]}>
              {t("payments.addNewCard")}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
      
      {/* Digital Wallets Section */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("payments.digitalWallets")}
        </Text>
        
        <View style={styles.methodsContainer}>
          {mockPaymentMethods
            .filter(method => method.type === "paypal")
            .map(wallet => (
              <View 
                key={wallet.id}
                style={[styles.methodItem, { borderColor: colors.border }]}
              >
                <View style={styles.methodHeader}>
                  <View style={styles.methodTitleContainer}>
                    <View
                      style={[
                        styles.methodIcon,
                        { backgroundColor: colors.primary + "10" },
                      ]}
                    >
                      <Ionicons name={wallet.icon as any} size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.methodName, { color: colors.text }]}>
                        {wallet.name}
                      </Text>
                      {wallet.isDefault && (
                        <View
                          style={[
                            styles.defaultBadge,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            {t("payments.defaultMethod")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                
                <View style={styles.methodActions}>
                  {!wallet.isDefault && (
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        { borderColor: colors.primary + "30", marginRight: 8 },
                      ]}
                      onPress={() => handleSetDefault(wallet.id)}
                    >
                      <Text style={{ color: colors.primary }}>
                        {t("payments.makeDefault")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      { borderColor: colors.error + "30" },
                    ]}
                    onPress={() => handleRemove(wallet.id, "paypal")}
                  >
                    <Text style={{ color: colors.error }}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          
          <TouchableOpacity
            style={[
              styles.addMethodButton,
              { borderColor: colors.border, borderStyle: "dashed" },
            ]}
            onPress={() => {
              // @ts-ignore - Ignore type checking for this line
              navigation.navigate("ConnectWallet")
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addMethodText, { color: colors.primary }]}>
              {t("payments.connectNewWallet")}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
      
      {/* Secure Payments Section */}
      <Card style={styles.card}>
        <View style={styles.securePaymentsContainer}>
          <View
            style={[
              styles.securePaymentsIcon,
              { backgroundColor: colors.success + "20" },
            ]}
          >
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          </View>
          <Text style={[styles.securePaymentsTitle, { color: colors.text }]}>
            {t("payments.securePayments")}
          </Text>
          <Text style={[styles.securePaymentsText, { color: colors.text + "80" }]}>
            {t("payments.securityMessage")}
          </Text>
        </View>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  methodsContainer: {
    marginTop: 8,
  },
  methodItem: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  methodTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardDetails: {
    marginBottom: 16,
  },
  cardDetailRow: {
    marginBottom: 8,
  },
  cardDetailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardDetailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  methodActions: {
    flexDirection: "row",
  },
  methodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  addMethodButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  addMethodText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  securePaymentsContainer: {
    alignItems: "center",
    padding: 16,
  },
  securePaymentsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  securePaymentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  securePaymentsText: {
    fontSize: 14,
    textAlign: "center",
  },
})