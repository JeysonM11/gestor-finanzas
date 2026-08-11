import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Plus,
  Bell,
  Menu,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShoppingBag,
  Utensils,
  Car,
  BarChart3,
  CreditCard,
} from 'lucide-react-native'
import BottomTabBar from '../components/BottomTabBar'
import SideMenu from '../components/SideMenu'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  income: '#16a34a',
  incomeBg: '#dcfce7',
  expense: '#dc2626',
  expenseBg: '#fef2f2',
  warning: '#d97706',
  warningBg: '#fffbeb',
}

// Datos de ejemplo — se reemplazan por datos reales cuando conectemos el backend
const recentTransactions = [
  { id: '1', name: 'Supermercado', category: 'Alimentación', amount: -85.4, icon: ShoppingBag, date: 'Hoy' },
  { id: '2', name: 'Salario', category: 'Ingreso', amount: 2500, icon: Wallet, date: 'Ayer' },
  { id: '3', name: 'Restaurante', category: 'Comida', amount: -32.9, icon: Utensils, date: 'Ayer' },
  { id: '4', name: 'Gasolina', category: 'Transporte', amount: -45, icon: Car, date: '2 días' },
]

export default function Dashboard() {
  const router = useRouter()
  const [menuVisible, setMenuVisible] = useState(false)

  const income = 2500
  const expenses = 163.3
  const balance = 4850.0
  const spentPercent = Math.min((expenses / income) * 100, 100)

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => setMenuVisible(true)} style={styles.menuButton} hitSlop={8}>
            <Menu size={20} color={COLORS.ink} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>Hola, Martín 👋</Text>
            <Text style={styles.headerSubtitle}>Así va tu mes</Text>
          </View>
          <Pressable style={styles.bellButton} hitSlop={8}>
            <Bell size={20} color={COLORS.ink} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        {/* Botón principal: Añadir transacción — lo primero y más prominente */}
        <Pressable
          onPress={() => router.push('/transactions/new' as any)}
          style={styles.addButton}
        >
          <View style={styles.addButtonIconWrap}>
            <Plus size={22} color={COLORS.surface} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addButtonTitle}>Añadir transacción</Text>
            <Text style={styles.addButtonSubtitle}>Registra un ingreso o gasto</Text>
          </View>
          <ArrowUpRight size={20} color={COLORS.surface} />
        </Pressable>

        {/* Saldo total */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo total</Text>
          <Text style={styles.balanceValue}>${balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Text>

          <View style={styles.balanceStatsRow}>
            <View style={styles.balanceStat}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <ArrowUpRight size={14} color={COLORS.surface} />
              </View>
              <View>
                <Text style={styles.statLabel}>Ingresos</Text>
                <Text style={styles.statValue}>${income.toLocaleString('es-ES')}</Text>
              </View>
            </View>
            <View style={styles.balanceStat}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <ArrowDownRight size={14} color={COLORS.surface} />
              </View>
              <View>
                <Text style={styles.statLabel}>Gastos</Text>
                <Text style={styles.statValue}>${expenses.toLocaleString('es-ES')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Presupuesto del mes */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Presupuesto del mes</Text>
            <Text style={styles.sectionLink}>{spentPercent.toFixed(0)}% usado</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${spentPercent}%` }]} />
          </View>
          <Text style={styles.progressCaption}>
            ${expenses.toFixed(2)} de ${income.toFixed(2)}
          </Text>
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickAction} onPress={() => router.push('/reports' as any)}>
            <View style={styles.quickActionIcon}>
              <BarChart3 size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Ver reportes</Text>
          </Pressable>
          <Pressable style={styles.quickAction} onPress={() => router.push('/accounts' as any)}>
            <View style={styles.quickActionIcon}>
              <CreditCard size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Mis cuentas</Text>
          </Pressable>
        </View>

        {/* Transacciones recientes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transacciones recientes</Text>
          <Pressable onPress={() => router.push('/transactions' as any)}>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </Pressable>
        </View>

        <View style={styles.transactionsList}>
          {recentTransactions.map((tx) => {
            const Icon = tx.icon
            const isPositive = tx.amount > 0
            return (
              <View key={tx.id} style={styles.transactionRow}>
                <View
                  style={[
                    styles.transactionIconWrap,
                    { backgroundColor: isPositive ? COLORS.incomeBg : COLORS.surfaceMuted },
                  ]}
                >
                  <Icon size={18} color={isPositive ? COLORS.income : COLORS.inkMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transactionName}>{tx.name}</Text>
                  <Text style={styles.transactionCategory}>
                    {tx.category} · {tx.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: isPositive ? COLORS.income : COLORS.expense },
                  ]}
                >
                  {isPositive ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="dashboard" />
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
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
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ink,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  bellButton: {
    height: 42,
    width: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: COLORS.expense,
  },
  menuButton: {
    height: 42,
    width: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  addButtonIconWrap: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonTitle: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  addButtonSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    padding: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  balanceValue: {
    color: COLORS.surface,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  balanceStatsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  balanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconWrap: {
    height: 26,
    width: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  statValue: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
  },
  sectionLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.line,
    marginTop: 12,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressCaption: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    height: 38,
    width: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  transactionsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  transactionIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  transactionCategory: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
})