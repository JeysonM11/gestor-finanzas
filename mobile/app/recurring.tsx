import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Plus,
  Repeat,
  Home as HomeIcon,
  Zap,
  Dumbbell,
  Wifi,
  Wallet,
  Calendar,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  income: '#16a34a',
  expense: '#dc2626',
}

// Datos de ejemplo — se reemplazan por datos reales luego
const initialRecurring = [
  {
    id: '1',
    name: 'Alquiler',
    category: 'Vivienda',
    icon: HomeIcon,
    amount: -650,
    frequency: 'Cada mes',
    nextDate: '1 Sep',
    active: true,
  },
  {
    id: '2',
    name: 'Salario',
    category: 'Ingreso',
    icon: Wallet,
    amount: 2500,
    frequency: 'Cada mes',
    nextDate: '30 Ago',
    active: true,
  },
  {
    id: '3',
    name: 'Netflix',
    category: 'Suscripción',
    icon: Zap,
    amount: -13.99,
    frequency: 'Cada mes',
    nextDate: '18 Ago',
    active: true,
  },
  {
    id: '4',
    name: 'Gimnasio',
    category: 'Salud',
    icon: Dumbbell,
    amount: -35,
    frequency: 'Cada mes',
    nextDate: '5 Sep',
    active: false,
  },
  {
    id: '5',
    name: 'Internet',
    category: 'Servicios',
    icon: Wifi,
    amount: -42,
    frequency: 'Cada mes',
    nextDate: '22 Ago',
    active: true,
  },
]

export default function Recurring() {
  const router = useRouter()
  const [recurring, setRecurring] = useState(initialRecurring)

  const toggleActive = (id: string) => {
    setRecurring((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    )
  }

  const activeItems = recurring.filter((item) => item.active)
  const monthlyIncome = activeItems
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)
  const monthlyExpense = activeItems
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0)

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
          <Text style={styles.headerTitle}>Recurrentes</Text>
          <Pressable onPress={() => router.push('/recurring/new' as any)} hitSlop={12}>
            <Plus size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Resumen general */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Repeat size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.summaryLabel}>Movimientos automáticos mensuales</Text>

          <View style={styles.summaryStatsRow}>
            <View>
              <Text style={styles.summaryStatLabel}>Ingresos fijos</Text>
              <Text style={[styles.summaryStatValue, { color: '#4ade80' }]}>
                +${monthlyIncome.toLocaleString('es-ES')}
              </Text>
            </View>
            <View>
              <Text style={styles.summaryStatLabel}>Gastos fijos</Text>
              <Text style={[styles.summaryStatValue, { color: '#f87171' }]}>
                -${monthlyExpense.toLocaleString('es-ES')}
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de recurrentes */}
        <View style={styles.recurringList}>
          {recurring.map((item) => {
            const Icon = item.icon
            const isPositive = item.amount > 0

            return (
              <View
                key={item.id}
                style={[styles.recurringCard, !item.active && styles.recurringCardInactive]}
              >
                <View
                  style={[
                    styles.recurringIconWrap,
                    { backgroundColor: isPositive ? '#dcfce7' : COLORS.surfaceMuted },
                  ]}
                >
                  <Icon size={18} color={isPositive ? COLORS.income : COLORS.inkMuted} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.recurringName}>{item.name}</Text>
                  <View style={styles.recurringMetaRow}>
                    <View style={styles.frequencyBadge}>
                      <Repeat size={10} color={COLORS.primary} />
                      <Text style={styles.frequencyText}>{item.frequency}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Calendar size={11} color={COLORS.inkMuted} />
                      <Text style={styles.dateText}>{item.nextDate}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Text
                    style={[
                      styles.recurringAmount,
                      { color: isPositive ? COLORS.income : COLORS.expense },
                    ]}
                  >
                    {isPositive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                  </Text>
                  <Switch
                    value={item.active}
                    onValueChange={() => toggleActive(item.id)}
                    trackColor={{ false: COLORS.line, true: COLORS.primaryLight }}
                    thumbColor={item.active ? COLORS.primary : COLORS.surface}
                  />
                </View>
              </View>
            )
          })}
        </View>

        {/* Nuevo recurrente */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/recurring/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Crear recurrente</Text>
        </Pressable>
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
  summaryCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 16,
  },
  summaryStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryStatValue: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 3,
  },
  recurringList: {
    gap: 10,
    marginBottom: 16,
  },
  recurringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
  },
  recurringCardInactive: {
    opacity: 0.55,
  },
  recurringIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurringName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  recurringMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  frequencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.inkMuted,
  },
  recurringAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
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
  addButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})