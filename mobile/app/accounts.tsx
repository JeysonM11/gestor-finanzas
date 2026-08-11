import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Wallet,
  PiggyBank,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react-native'
import { useState } from 'react'
import BottomTabBar from '../components/BottomTabBar'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
}

// Datos de ejemplo — se reemplazan por datos reales luego
const accounts = [
  {
    id: '1',
    name: 'Cuenta Corriente',
    bank: 'Bancolombia',
    balance: 3250.8,
    type: 'Corriente',
    icon: Landmark,
    color: '#16a34a',
  },
  {
    id: '2',
    name: 'Ahorros',
    bank: 'Bancolombia',
    balance: 1400.0,
    type: 'Ahorros',
    icon: PiggyBank,
    color: '#0ea5e9',
  },
  {
    id: '3',
    name: 'Efectivo',
    bank: 'Billetera física',
    balance: 199.2,
    type: 'Efectivo',
    icon: Wallet,
    color: '#d97706',
  },
  {
    id: '4',
    name: 'Tarjeta de crédito',
    bank: 'Nu',
    balance: -320.5,
    type: 'Crédito',
    icon: CreditCard,
    color: '#dc2626',
  },
]

export default function Accounts() {
  const router = useRouter()
  const [hideBalances, setHideBalances] = useState(false)

  const totalBalance = accounts
    .filter((a) => a.type !== 'Crédito')
    .reduce((sum, a) => sum + a.balance, 0)

  const formatAmount = (value: number) => {
    if (hideBalances) return '••••••'
    const sign = value < 0 ? '-' : ''
    return `${sign}$${Math.abs(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

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
          <Text style={styles.headerTitle}>Cuentas</Text>
          <Pressable onPress={() => setHideBalances(!hideBalances)} hitSlop={12}>
            {hideBalances ? (
              <EyeOff size={20} color={COLORS.ink} />
            ) : (
              <Eye size={20} color={COLORS.ink} />
            )}
          </Pressable>
        </View>

        {/* Resumen total */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Patrimonio total</Text>
          <Text style={styles.summaryValue}>{formatAmount(totalBalance)}</Text>
          <Text style={styles.summaryCaption}>{accounts.length} cuentas conectadas</Text>
        </View>

        {/* Lista de cuentas */}
        <View style={styles.listSection}>
          {accounts.map((account) => {
            const Icon = account.icon
            const isNegative = account.balance < 0
            return (
              <Pressable
                key={account.id}
                style={styles.accountCard}
                onPress={() => router.push(`/accounts/${account.id}` as any)}
              >
                <View
                  style={[styles.accountIconWrap, { backgroundColor: `${account.color}1A` }]}
                >
                  <Icon size={22} color={account.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountBank}>
                    {account.bank} · {account.type}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.accountBalance,
                      isNegative && { color: '#dc2626' },
                    ]}
                  >
                    {formatAmount(account.balance)}
                  </Text>
                  <ChevronRight size={16} color={COLORS.inkMuted} />
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Botón añadir cuenta */}
        <Pressable
          style={styles.addAccountButton}
          onPress={() => router.push('/accounts/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addAccountText}>Añadir cuenta</Text>
        </Pressable>
      </ScrollView>

      <BottomTabBar activeTab="accounts" />
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
  summaryCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  summaryValue: {
    color: COLORS.surface,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 10,
  },
  listSection: {
    gap: 10,
    marginBottom: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
  },
  accountIconWrap: {
    height: 44,
    width: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  accountBank: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 2,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
  },
  addAccountText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})