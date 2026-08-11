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
import { Wallet, User, Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
}

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sin lógica real todavía: solo navega al Dashboard.
  // Cuando conectemos el backend, acá va la llamada a POST /auth/register.
  const handleSubmit = () => {
    router.replace('/dashboard')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <ChevronLeft size={22} color={COLORS.inkMuted} />
        </Pressable>

        <View style={styles.iconWrapper}>
          <Wallet size={36} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Empieza a controlar tus finanzas hoy</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color={COLORS.inkMuted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
              placeholderTextColor={COLORS.inkMuted}
              autoCapitalize="words"
              autoComplete="name"
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
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
              autoComplete="password-new"
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

          <Text style={[styles.label, { marginTop: 16 }]}>Confirmar contraseña</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={COLORS.inkMuted} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.inkMuted}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              style={styles.input}
            />
          </View>

          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Crear cuenta</Text>
            <ArrowRight size={18} color={COLORS.surface} />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
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
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 24,
    zIndex: 10,
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
    textAlign: 'center',
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
  loginText: {
    marginTop: 24,
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
})