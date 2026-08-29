import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"

// Define the parameter list for the Native Navigator stack
type NativeStackParamList = {
  NativeProfileMain: undefined;
  NativeHelpSupport: undefined;
};

// Define the navigation prop type
type NativeHelpSupportNavigationProp = NativeStackNavigationProp<
  NativeStackParamList,
  'NativeHelpSupport'
>;

// Define FAQ item type
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function NativeHelpSupportScreen() {
  const navigation = useNavigation<NativeHelpSupportNavigationProp>();
  
  // Estado para a mensagem de suporte
  const [supportMessage, setSupportMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estado para perguntas frequentes
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: 1,
      question: "¿Cómo puedo recibir más solicitudes de estudiantes?",
      answer: "Para recibir más solicitudes, asegúrate de completar tu perfil con información detallada, añadir certificaciones, mantener tu disponibilidad actualizada y seleccionar varios restaurantes donde puedas dar clases. También es importante responder rápidamente a las solicitudes y mantener una buena calificación.",
      expanded: false
    },
    {
      id: 2,
      question: "¿Cómo funcionan los pagos?",
      answer: "Los pagos se procesan automáticamente después de cada sesión completada. Los estudiantes pagan a través de la aplicación, y tú recibirás el pago en tu cuenta bancaria registrada dentro de los 3-5 días hábiles siguientes. Puedes ver tu historial de pagos y ganancias en la sección 'Finanzas' de tu perfil.",
      expanded: false
    },
    {
      id: 3,
      question: "¿Qué hago si un estudiante no se presenta a la sesión?",
      answer: "Si un estudiante no se presenta a una sesión confirmada, debes marcar la sesión como 'No asistió' en la aplicación dentro de las 24 horas. Recibirás una compensación parcial por el tiempo reservado. Si esto ocurre frecuentemente con el mismo estudiante, puedes reportarlo a nuestro equipo de soporte.",
      expanded: false
    },
    {
      id: 4,
      question: "¿Puedo cancelar una sesión programada?",
      answer: "Sí, puedes cancelar sesiones, pero te recomendamos hacerlo con al menos 24 horas de anticipación para evitar afectar tu calificación. Las cancelaciones frecuentes pueden reducir la visibilidad de tu perfil en las búsquedas de los estudiantes. En caso de emergencia, comunícate directamente con el estudiante y con nuestro equipo de soporte.",
      expanded: false
    },
    {
      id: 5,
      question: "¿Cómo actualizo mis idiomas y niveles?",
      answer: "Puedes actualizar tus idiomas y niveles en la sección 'Información Personal' de tu perfil. Es importante ser honesto sobre tu nivel de dominio de cada idioma. Para añadir un nuevo idioma, necesitarás pasar por un breve proceso de verificación que puede incluir una entrevista con uno de nuestros evaluadores.",
      expanded: false
    },
    {
      id: 6,
      question: "¿Qué hago si tengo un problema con un restaurante?",
      answer: "Si experimentas algún problema con un restaurante asociado, puedes reportarlo a través de la aplicación en la sección de 'Restaurantes'. Nuestro equipo se pondrá en contacto contigo para resolver la situación. También puedes temporalmente eliminar ese restaurante de tu lista de lugares preferidos.",
      expanded: false
    },
  ]);
  
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

  // Função para alternar expansão da FAQ
  const toggleFAQ = (id: number) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  // Filtrar FAQs com base na pesquisa
  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para enviar mensagem de suporte
  const sendSupportMessage = () => {
    if (supportMessage.trim()) {
      alert("Tu mensaje ha sido enviado. Te responderemos en breve.");
      setSupportMessage("");
    } else {
      alert("Por favor, escribe un mensaje antes de enviar.");
    }
  };

  // Links de contato
  const contactLinks = [
    { 
      id: 1, 
      title: "Email de Soporte", 
      description: "soporte@empresa.com", 
      icon: "mail-outline",
      action: () => Linking.openURL("mailto:soporte@empresa.com"),
      color: colors.blue[600],
      bgColor: colors.blue[50]
    },
    { 
      id: 2, 
      title: "Teléfono", 
      description: "+34 900 123 456", 
      icon: "call-outline",
      action: () => Linking.openURL("tel:+34900123456"),
      color: colors.purple[600],
      bgColor: colors.purple[50]
    },
    { 
      id: 3, 
      title: "WhatsApp", 
      description: "Chat en vivo", 
      icon: "logo-whatsapp",
      action: () => Linking.openURL("https://wa.me/34900123456"),
      color: colors.success,
      bgColor: '#e6f7ef'
    },
    { 
      id: 4, 
      title: "Centro de Ayuda", 
      description: "Visita nuestra web de ayuda", 
      icon: "help-circle-outline",
      action: () => Linking.openURL("https://ayuda.empresa.com"),
      color: colors.gold[600],
      bgColor: colors.gold[50]
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: 30 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayuda y Soporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Búsqueda */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar ayuda..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Contactos rápidos */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contacto Rápido</Text>
        <View style={styles.contactLinksContainer}>
          {contactLinks.map(link => (
            <TouchableOpacity
              key={link.id}
              style={[styles.contactLink, { backgroundColor: colors.card }]}
              onPress={link.action}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: link.bgColor }]}>
                <Ionicons name={link.icon as any} size={24} color={link.color} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>{link.title}</Text>
                <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>{link.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preguntas Frecuentes</Text>
        <View style={styles.faqsContainer}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(faq => (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqItem, { backgroundColor: colors.card }]}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                  <Ionicons 
                    name={faq.expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
                {faq.expanded && (
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.noResultsContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noResultsText, { color: colors.text }]}>
                No se encontraron resultados para "{searchQuery}"
              </Text>
              <Text style={[styles.noResultsSubtext, { color: colors.textSecondary }]}>
                Intenta con diferentes palabras o revisa nuestra sección de contacto
              </Text>
            </View>
          )}
        </View>

        {/* Formulario de soporte */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Enviar Mensaje al Soporte</Text>
        <View style={[styles.supportCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.supportText, { color: colors.textSecondary }]}>
            Envíanos un mensaje detallado sobre tu consulta o problema y te responderemos en breve.
          </Text>
          
          <TextInput
            style={[
              styles.supportInput, 
              { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }
            ]}
            placeholder="Describe tu problema o pregunta..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={supportMessage}
            onChangeText={setSupportMessage}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { 
                backgroundColor: supportMessage.trim() ? colors.primary : colors.primary + '60' 
              }
            ]}
            disabled={!supportMessage.trim()}
            onPress={sendSupportMessage}
          >
            <Ionicons name="send" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.sendButtonText}>Enviar Mensaje</Text>
          </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  contactLinksContainer: {
    marginBottom: 24,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
  },
  faqsContainer: {
    marginBottom: 24,
  },
  faqItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    padding: 16,
    paddingTop: 0,
  },
  noResultsContainer: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  supportCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  supportText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  supportInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});