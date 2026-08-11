import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Home as HomeIcon,
  Receipt,
  CreditCard,
  BarChart3,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  line: '#e2e8f0',
}

export const tabs = [
  { id: 'dashboard', label: 'Inicio', icon: HomeIcon, route: '/dashboard' },
  { id: 'transactions', label: 'Transac.', icon: Receipt, route: '/transactions' },
  { id: 'accounts', label: 'Cuentas', icon: CreditCard, route: '/accounts' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, route: '/reports' },
] as const

type TabId = (typeof tabs)[number]['id']

type Props = {
  activeTab: TabId
}

export default function BottomTabBar({ activeTab }: Props) {
  const router = useRouter()

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    if (tab.id !== activeTab) {
      router.push(tab.route as any)
    }
  }

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <Pressable key={tab.id} onPress={() => handleTabPress(tab)} style={styles.tabItem}>
            <Icon size={22} color={isActive ? COLORS.primary : COLORS.inkMuted} />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.inkMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
})