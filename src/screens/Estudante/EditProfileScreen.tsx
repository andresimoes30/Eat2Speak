"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"

export default function EditProfileScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // Initialize state with user data or default values
  const [firstName, setFirstName] = useState(user?.firstName || "Carlos")
  const [lastName, setLastName] = useState(user?.lastName || "Rodríguez")
  const [email, setEmail] = useState(user?.email || "carlos.rodriguez@example.com")
  const [phone, setPhone] = useState("+1 234 567 8900")
  const [bio, setBio] = useState("Language enthusiast passionate about learning through immersive experiences.")

  const handleSave = () => {
    // In a real app, this would save the profile updates to a backend
    // For this example, we'll just navigate back
    navigation.goBack()
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 42 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("profile.edit")}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>{t("button.save")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: "https://via.placeholder.com/150" }} style={styles.profileImage} />
          <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("personalInfo.basicData")}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("personalInfo.firstName")}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("personalInfo.lastName")}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("personalInfo.email")}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("personalInfo.phone")}</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("personalInfo.biography")}</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
              ]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.text + "60"}
            />
          </View>
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
})