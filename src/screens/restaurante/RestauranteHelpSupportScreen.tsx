import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeContext"

// Define FAQ item type
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function RestauranteHelpSupportScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Estado para la mensaje de soporte
  const [supportMessage, setSupportMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estado para preguntas frecuentes
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: 1,
      question: "¿Cómo puedo recibir más estudiantes en mi restaurante?",
      answer: "Para atraer más estudiantes, completa tu perfil con fotos atractivas, una descripción detallada de tu restaurante y el tipo de cocina que ofreces. Mantén actualizado tu horario de disponibilidad y ofrece un ambiente acogedor para las conversaciones. Los restaurantes con buenas calificaciones aparecen más arriba en los resultados de búsqueda.",
      expanded: false
    },
    {
      id: 2,
      question: "¿Cómo funcionan las comisiones?",
      answer: "Por cada reserva completada a través de la aplicación, se aplica una comisión del 15% sobre el precio del menú o consumición. Esta comisión se descuenta automáticamente del pago que recibes. Puedes ver un desglose detallado de tus ingresos y comisiones en la sección 'Finanzas' de tu perfil.",
      expanded: false
    },
    {
      id: 3,
      question: "¿Qué ocurre si un estudiante no se presenta?",
      answer: "Si un estudiante no se presenta a una reserva confirmada, debes marcarla como 'No asistió' en la aplicación dentro de las 24 horas. Recibirás una compensación parcial por la reserva. Si esto ocurre frecuentemente con el mismo estudiante, puedes reportarlo a nuestro equipo de soporte.",
      expanded: false
    },
    {
      id: 4,
      question: "¿Puedo rechazar una reserva?",
      answer: "Sí, puedes rechazar reservas, pero te recomendamos hacerlo con anticipación para mantener una buena calificación. Rechazar reservas frecuentemente puede afectar la visibilidad de tu restaurante en la plataforma. Procura mantener tu calendario de disponibilidad actualizado para evitar solicitudes en momentos inconvenientes.",
      expanded: false
    },
    {
      id: 5,
      question: "¿Cómo actualizo el menú y los precios?",
      answer: "Puedes actualizar tu menú y precios en la sección 'Menú' de tu perfil. Te recomendamos mantener esta información actualizada y añadir fotos de los platos para hacerlos más atractivos. Los cambios se reflejarán inmediatamente en tu perfil público.",
      expanded: false
    },
    {
      id: 6,
      question: "¿Cómo gestiono las mesas disponibles?",
      answer: "En la sección 'Disponibilidad' puedes gestionar el número de mesas disponibles para estudiantes, así como los horarios en que tu restaurante está abierto para reservas a través de la aplicación. Puedes ajustar esta configuración según tus necesidades y la ocupación de tu local.",
      expanded: false
    },
  ]);
  
  // Función para alternar expansión de la FAQ
  const toggleFAQ = (id: number) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  // Filtrar FAQs con base en la búsqueda
  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para enviar mensaje de soporte
  const sendSupportMessage = () => {
    if (supportMessage.trim()) {
      alert("Tu mensaje ha sido enviado. Te responderemos en breve.");
      setSupportMessage("");
    } else {
      alert("Por favor, escribe un mensaje antes de enviar.");
    }
  };

  // Links de contacto
  const contactLinks = [
    { 
      id: 1, 
      title: "Email de Soporte", 
      description: "restaurantes@eat2speak.com", 
      icon: "mail-outline",
      action: () => Linking.openURL("mailto:restaurantes@eat2speak.com"),
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
      color: colors.primary,
      bgColor: colors.blue[50]
    },
    { 
      id: 4, 
      title: "Centro de Ayuda", 
      description: "Visita nuestra web de ayuda", 
      icon: "help-circle-outline",
      action: () => Linking.openURL("https://ayuda.eat2speak.com/restaurantes"),
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
          <Ionicons name="search-outline" size={20} color={colors.text + '80'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar ayuda..."
            placeholderTextColor={colors.text + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.text + '80'} />
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
                <Text style={[styles.contactDescription, { color: colors.text + '80' }]}>{link.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text + '80'} />
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
                    color={colors.text + '80'} 
                  />
                </View>
                {faq.expanded && (
                  <Text style={[styles.faqAnswer, { color: colors.text + '80' }]}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.noResultsContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="search-outline" size={48} color={colors.text + '80'} />
              <Text style={[styles.noResultsText, { color: colors.text }]}>
                No se encontraron resultados para "{searchQuery}"
              </Text>
              <Text style={[styles.noResultsSubtext, { color: colors.text + '80' }]}>
                Intenta con diferentes palabras o revisa nuestra sección de contacto
              </Text>
            </View>
          )}
        </View>

        {/* Formulario de soporte */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Enviar Mensaje al Soporte</Text>
        <View style={[styles.supportCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.supportText, { color: colors.text + '80' }]}>
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
            placeholderTextColor={colors.text + '80'}
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