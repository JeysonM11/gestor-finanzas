import { useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft, Bot, Send, Sparkles, User } from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
}

type Message = {
  id: string
  from: 'user' | 'ai'
  text: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    from: 'ai',
    text: 'Hola Martín 👋 Soy tu asesor de deudas. Puedo ayudarte a armar un plan de pago según tus deudas actuales. ¿En qué te gustaría enfocarte?',
  },
]

const quickReplies = [
  '¿Qué deuda debería pagar primero?',
  'Arma un plan para 6 meses',
  '¿Cómo bajo mis intereses?',
]

// Respuestas de ejemplo — se reemplazan por la llamada real a Gemini luego
const canDetectResponse = (text: string) => {
  return 'Buena pregunta. Cuando conectemos el backend, voy a analizar tus deudas reales (montos, tasas y fechas) para darte una recomendación precisa. Por ahora esto es solo una vista de ejemplo.'
}

export default function Advisor() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useRef<ScrollView>(null)

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return

    const userMessage: Message = { id: Date.now().toString(), from: 'user', text: content }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Simula respuesta del asesor — placeholder hasta conectar el backend
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: canDetectResponse(content),
      }
      setMessages((prev) => [...prev, aiMessage])
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 500)

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={22} color={COLORS.ink} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconWrap}>
            <Bot size={16} color={COLORS.surface} />
          </View>
          <Text style={styles.headerTitle}>Asesor IA</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Mensajes */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => {
          const isUser = message.from === 'user'
          return (
            <View
              key={message.id}
              style={[styles.messageRow, isUser && styles.messageRowUser]}
            >
              {!isUser && (
                <View style={styles.avatarWrap}>
                  <Bot size={15} color={COLORS.primary} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleAi,
                ]}
              >
                <Text style={[styles.bubbleText, isUser && { color: COLORS.surface }]}>
                  {message.text}
                </Text>
              </View>
              {isUser && (
                <View style={[styles.avatarWrap, { backgroundColor: COLORS.ink }]}>
                  <User size={15} color={COLORS.surface} />
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      {/* Chips de sugerencias rápidas */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {quickReplies.map((reply) => (
            <Pressable
              key={reply}
              style={styles.chip}
              onPress={() => handleSend(reply)}
            >
              <Sparkles size={12} color={COLORS.primary} />
              <Text style={styles.chipText}>{reply}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor={COLORS.inkMuted}
          style={styles.input}
          multiline
          onSubmitEditing={() => handleSend()}
        />
        <Pressable
          onPress={() => handleSend()}
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          disabled={!input.trim()}
        >
          <Send size={18} color={COLORS.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconWrap: {
    height: 26,
    width: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
  },
  messagesContent: {
    padding: 20,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    height: 28,
    width: 28,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAi: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: COLORS.ink,
    lineHeight: 20,
  },
  chipsRow: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.ink,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.line,
  },
})