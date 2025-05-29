"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Card } from "../../components/Card"
import { useState, useEffect } from "react"

// Transaction interface
interface Transaction {
  id: number
  title: string
  amount: string
  date: string
  status: "paid" | "pending" | "failed"
}

// Payment method interface
interface PaymentMethod {
  id: number
  type: "card" | "paypal"
  name: string
  lastDigits?: string
  expiryDate?: string
  isDefault: boolean
  icon: string
}

// Mock data for transactions
const mockTransactions: Transaction[] = [
  {
    id: 1,
    title: "Sesión con María Silva",
    amount: "€30.00",
    date: "15 Mayo, 2025",
    status: "paid"
  },
  {
    id: 2,
    title: "Sesión con Hiroshi Tanaka",
    amount: "€45.00",
    date: "10 Mayo, 2025",
    status: "paid"
  },
  {
    id: 3,
    title: "Sesión con Jean Dupont",
    amount: "€25.00",
    date: "02 Mayo, 2025",
    status: "paid"
  },
  {
    id: 4,
    title: "Añadir fondos",
    amount: "+€100.00",
    date: "01 Mayo, 2025",
    status: "paid"
  },
  {
    id: 5,
    title: "Sesión con Pablo García",
    amount: "€35.00",
    date: "22 Abril, 2025",
    status: "paid"
  },
]

// Mock data for payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    type: "card",
    name: "Visa",
    lastDigits: "4242",
    expiryDate: "05/27",
    isDefault: true,
    icon: "card-outline"
  },
  {
    id: 2,
    type: "paypal",
    name: "PayPal",
    isDefault: false,
    icon: "logo-paypal"
  }
]

export default function PaymentsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { t } = useLanguage()
  
  const [balance, setBalance] = useState("€250.00")
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods)
  const [showAllTransactions, setShowAllTransactions] = useState(false)

  // Log current language and test translation
  useEffect(() => {
    // Just log the translation without trying to access the locale
    console.log(`Current language test - Payments balance: ${t('payments.balance')}`);
  }, [t]);

  // Function to navigate to payment methods screen
  const goToPaymentMethods = () => {
    // @ts-ignore - Ignore type checking for this line
    navigation.navigate("PaymentMethods")
  }

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success
      case "pending":
        return colors.secondary
      case "failed":
        return colors.error
      default:
        return colors.text
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <View style={styles.balanceContainer}>
          <View>
            <Text style={[styles.balanceLabel, { color: colors.text + "80" }]}>
              {t("payments.balance")}
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.text }]}>{balance}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // Navigate to PaymentMethods instead of non-existent AddFunds
              // @ts-ignore - Ignore type checking for this line
              navigation.navigate("PaymentMethods")
            }}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.addButtonText}>{t("payments.add")}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Payment Methods Card */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("payments.paymentMethods")}
          </Text>
          <TouchableOpacity onPress={goToPaymentMethods}>
            <Text style={[styles.viewAllLink, { color: colors.primary }]}>
              {t("payments.methods")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentMethodItem, { borderColor: colors.border }]}
              onPress={goToPaymentMethods}
            >
              <View style={styles.paymentMethodInfo}>
                <View
                  style={[
                    styles.paymentMethodIcon,
                    { backgroundColor: colors.primary + "10" },
                  ]}
                >
                  <Ionicons name={method.icon as any} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.paymentMethodName, { color: colors.text }]}>
                    {method.name}
                    {method.lastDigits && ` •••• ${method.lastDigits}`}
                  </Text>
                  {method.expiryDate && (
                    <Text style={[styles.paymentMethodExpiry, { color: colors.text + "80" }]}>
                      {t("payments.expires").replace("{date}", method.expiryDate)}
                    </Text>
                  )}
                </View>
              </View>
              {method.isDefault && (
                <View
                  style={[
                    styles.defaultBadge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                    {t("payments.default")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.addPaymentMethodButton,
              { borderColor: colors.border, borderStyle: "dashed" },
            ]}
            onPress={() => {
              // Navigate to PaymentMethods instead of non-existent AddPaymentMethod
              // @ts-ignore - Ignore type checking for this line
              navigation.navigate("PaymentMethods")
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addPaymentMethodText, { color: colors.primary }]}>
              {t("payments.addMethod")}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Payment History Card */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("payments.history")}
          </Text>
        </View>

        <View style={styles.transactionsContainer}>
          {(showAllTransactions ? transactions : transactions.slice(0, 3)).map(
            (transaction) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.transactionInfo}>
                  <Text
                    style={[styles.transactionTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {transaction.title}
                  </Text>
                  <Text
                    style={[
                      styles.transactionDate,
                      { color: colors.text + "80" },
                    ]}
                  >
                    {transaction.date}
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.amount.includes("+")
                          ? colors.success
                          : colors.text,
                      },
                    ]}
                  >
                    {transaction.amount}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(transaction.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(transaction.status) },
                      ]}
                    >
                      {t(`payments.status.${transaction.status}`)}
                    </Text>
                  </View>
                </View>
              </View>
            )
          )}

          {transactions.length > 3 && (
            <TouchableOpacity
              style={[
                styles.viewAllButton,
                { borderColor: colors.border, borderStyle: "dashed" },
              ]}
              onPress={() => setShowAllTransactions(!showAllTransactions)}
            >
              <Text style={[styles.viewAllButtonText, { color: colors.primary }]}>
                {showAllTransactions 
                  ? t("payments.viewLess") 
                  : t("payments.viewAllHistory")
                }
              </Text>
            </TouchableOpacity>
          )}
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
  balanceCard: {
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  card: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  paymentMethodsContainer: {
    marginTop: 8,
  },
  paymentMethodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  paymentMethodExpiry: {
    fontSize: 14,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  addPaymentMethodButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  addPaymentMethodText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  transactionsContainer: {
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionDetails: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewAllButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})