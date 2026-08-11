import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  error: '#dc2626',
  errorBg: '#fef2f2',
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sin lógica real todavía: solo navega al Dashboard.
  // Cuando conectemos el backend, acá vuelve la llamada a la API.
  const handleSubmit = () => {
    router.replace('/dashboard')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconWrapper}>
          <Wallet size={36} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={COLORS.inkMuted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.inkMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={COLORS.inkMuted} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.inkMuted}
              secureTextEntry={!showPassword}
              autoComplete="password"
              style={styles.input}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              {showPassword ? (
                <EyeOff size={18} color={COLORS.inkMuted} />
              ) : (
                <Eye size={18} color={COLORS.inkMuted} />
              )}
            </Pressable>
          </View>

          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
            <ArrowRight size={18} color={COLORS.surface} />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate aquí</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  iconWrapper: {
    height: 72,
    width: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.inkMuted,
    marginTop: 6,
    marginBottom: 28,
  },
  errorBox: {
    width: '100%',
    backgroundColor: COLORS.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.ink,
  },
  button: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  registerText: {
    marginTop: 24,
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
})