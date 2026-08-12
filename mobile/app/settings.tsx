import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  DollarSign,
  Moon,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Wallet,
  Camera,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  danger: '#dc2626',
}

export default function Settings() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const accountItems = [
    { id: 'profile', label: 'Editar perfil', icon: User, route: '/settings/profile' },
    { id: 'password', label: 'Cambiar contraseña', icon: Lock, route: '/settings/password' },
    { id: 'currency', label: 'Moneda preferida', icon: DollarSign, value: 'USD', route: '/settings/currency' },
  ]

  const supportItems = [
    { id: 'help', label: 'Centro de ayuda', icon: HelpCircle, route: '/settings/help' },
    { id: 'terms', label: 'Términos y privacidad', icon: FileText, route: '/settings/terms' },
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={22} color={COLORS.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Wallet size={26} color={COLORS.primary} />
            <View style={styles.cameraBadge}>
              <Camera size={12} color={COLORS.surface} />
            </View>
          </View>
          <Text style={styles.profileName}>Martín Medrano</Text>
          <Text style={styles.profileEmail}>martin@email.com</Text>
        </View>

        {/* Sección: Cuenta */}
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.card}>
          {accountItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.row,
                  index < accountItems.length - 1 && styles.rowBorder,
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.rowIconWrap}>
                  <Icon size={17} color={COLORS.ink} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                {item.value && <Text style={styles.rowValue}>{item.value}</Text>}
                <ChevronRight size={16} color={COLORS.inkMuted} />
              </Pressable>
            )
          })}
        </View>

        {/* Sección: Preferencias */}
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowIconWrap}>
              <Moon size={17} color={COLORS.ink} />
            </View>
            <Text style={styles.rowLabel}>Modo oscuro</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.line, true: COLORS.primaryLight }}
              thumbColor={darkMode ? COLORS.primary : COLORS.surface}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Bell size={17} color={COLORS.ink} />
            </View>
            <Text style={styles.rowLabel}>Notificaciones</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.line, true: COLORS.primaryLight }}
              thumbColor={notifications ? COLORS.primary : COLORS.surface}
            />
          </View>
        </View>

        {/* Sección: Soporte */}
        <Text style={styles.sectionTitle}>Soporte</Text>
        <View style={styles.card}>
          {supportItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.row,
                  index < supportItems.length - 1 && styles.rowBorder,
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.rowIconWrap}>
                  <Icon size={17} color={COLORS.ink} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <ChevronRight size={16} color={COLORS.inkMuted} />
              </Pressable>
            )
          })}
        </View>

        {/* Cerrar sesión */}
        <Pressable
          style={styles.logoutButton}
          onPress={() => router.replace('/login')}
        >
          <LogOut size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.versionText}>Gestor de Finanzas · v1.4.0</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.ink,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrap: {
    height: 72,
    width: 72,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceMuted,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.ink,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.inkMuted,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  rowIconWrap: {
    height: 32,
    width: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.inkMuted,
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.inkMuted,
  },
})