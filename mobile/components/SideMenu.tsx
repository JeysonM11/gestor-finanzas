import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  X,
  Target,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Repeat,
  BellRing,
  Bell,
  Award,
  Bot,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react-native'

const { width } = Dimensions.get('window')
const MENU_WIDTH = width * 0.78

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
}

const menuSections = [
  { id: 'goals', label: 'Metas', icon: Target, route: '/goals' },
  { id: 'budgets', label: 'Presupuestos', icon: PiggyBank, route: '/budgets' },
  { id: 'debts', label: 'Deudas', icon: CreditCard, route: '/debts' },
  { id: 'investments', label: 'Inversiones', icon: TrendingUp, route: '/investments' },
  { id: 'recurring', label: 'Recurrentes', icon: Repeat, route: '/recurring' },
  { id: 'reminders', label: 'Recordatorios', icon: BellRing, route: '/reminders' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, route: '/notifications' },
  { id: 'gamification', label: 'Logros', icon: Award, route: '/gamification' },
  { id: 'advisor', label: 'Asesor IA', icon: Bot, route: '/advisor' },
  { id: 'settings', label: 'Configuración', icon: Settings, route: '/settings' },
]

type Props = {
  visible: boolean
  onClose: () => void
}

export default function SideMenu({ visible, onClose }: Props) {
  const router = useRouter()
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: visible ? 0 : -MENU_WIDTH,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: visible ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible])

  const handleNavigate = (route: string) => {
    onClose()
    router.push(route as any)
  }

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Overlay oscuro, tocarlo cierra el menú */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel deslizable */}
      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <View style={styles.panelHeader}>
          <View style={styles.avatarWrap}>
            <Wallet size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Martín Medrano</Text>
            <Text style={styles.userEmail}>martin@email.com</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={20} color={COLORS.inkMuted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.menuList}>
          {menuSections.map((section) => {
            const Icon = section.icon
            return (
              <Pressable
                key={section.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(section.route)}
              >
                <View style={styles.menuIconWrap}>
                  <Icon size={18} color={COLORS.ink} />
                </View>
                <Text style={styles.menuLabel}>{section.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <Pressable
          style={styles.logoutButton}
          onPress={() => handleNavigate('/login')}
        >
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: COLORS.surface,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 18,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  avatarWrap: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  menuIconWrap: {
    height: 34,
    width: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
})