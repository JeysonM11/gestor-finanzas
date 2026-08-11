import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Plus,
  ShoppingBag,
  Utensils,
  Car,
  Home as HomeIcon,
  Zap,
  Shirt,
  AlertTriangle,
  Wallet,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  warning: '#d97706',
  warningBg: '#fffbeb',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
}

// Umbral de colores según % usado del presupuesto
const getStatusColor = (percent: number) => {
  if (percent >= 100) return COLORS.danger
  if (percent >= 80) return COLORS.warning
  return COLORS.primary
}

// Datos de ejemplo — se reemplazan por datos reales luego
const budgets = [
  { id: '1', name: 'Alimentación', icon: ShoppingBag, spent: 340, limit: 400 },
  { id: '2', name: 'Transporte', icon: Car, spent: 180, limit: 200 },
  { id: '3', name: 'Comida fuera', icon: Utensils, spent: 145, limit: 120 },
  { id: '4', name: 'Vivienda', icon: HomeIcon, spent: 650, limit: 700 },
  { id: '5', name: 'Suscripciones', icon: Zap, spent: 38, limit: 50 },
  { id: '6', name: 'Ropa', icon: Shirt, spent: 60, limit: 150 },
]

export default function Budgets() {
  const router = useRouter()

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
  const overallPercent = (totalSpent / totalLimit) * 100
  const exceededCount = budgets.filter((b) => b.spent > b.limit).length

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
          <Text style={styles.headerTitle}>Presupuestos</Text>
          <Pressable onPress={() => router.push('/budgets/new' as any)} hitSlop={12}>
            <Plus size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Resumen general */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Gastado este mes</Text>
              <Text style={styles.summaryValue}>${totalSpent.toLocaleString('es-ES')}</Text>
            </View>
            <View style={styles.summaryIconWrap}>
              <Wallet size={22} color={COLORS.surface} />
            </View>
          </View>
          <View style={styles.summaryProgressTrack}>
            <View
              style={[
                styles.summaryProgressFill,
                {
                  width: `${Math.min(overallPercent, 100)}%`,
                  backgroundColor: getStatusColor(overallPercent),
                },
              ]}
            />
          </View>
          <Text style={styles.summaryCaption}>
            {overallPercent.toFixed(0)}% de ${totalLimit.toLocaleString('es-ES')} presupuestado
          </Text>
        </View>

        {/* Alerta si hay categorías excedidas */}
        {exceededCount > 0 && (
          <View style={styles.alertBanner}>
            <AlertTriangle size={18} color={COLORS.danger} />
            <Text style={styles.alertText}>
              {exceededCount} {exceededCount === 1 ? 'categoría excedió' : 'categorías excedieron'} su presupuesto este mes
            </Text>
          </View>
        )}

        {/* Lista de presupuestos por categoría */}
        <View style={styles.budgetsList}>
          {budgets.map((budget) => {
            const Icon = budget.icon
            const percent = (budget.spent / budget.limit) * 100
            const statusColor = getStatusColor(percent)
            const isExceeded = percent >= 100

            return (
              <Pressable
                key={budget.id}
                style={styles.budgetCard}
                onPress={() => router.push(`/budgets/${budget.id}` as any)}
              >
                <View style={styles.budgetTopRow}>
                  <View style={[styles.budgetIconWrap, { backgroundColor: `${statusColor}1A` }]}>
                    <Icon size={18} color={statusColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.budgetName}>{budget.name}</Text>
                    <Text style={styles.budgetAmountText}>
                      <Text style={{ fontWeight: '700', color: COLORS.ink }}>
                        ${budget.spent}
                      </Text>{' '}
                      de ${budget.limit}
                    </Text>
                  </View>
                  {isExceeded && <AlertTriangle size={16} color={COLORS.danger} />}
                </View>

                <View style={styles.budgetProgressTrack}>
                  <View
                    style={[
                      styles.budgetProgressFill,
                      { width: `${Math.min(percent, 100)}%`, backgroundColor: statusColor },
                    ]}
                  />
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Nuevo presupuesto */}
        <Pressable
          style={styles.addBudgetButton}
          onPress={() => router.push('/budgets/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addBudgetText}>Crear presupuesto</Text>
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
    marginBottom: 14,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  summaryValue: {
    color: COLORS.surface,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryIconWrap: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 18,
  },
  summaryProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  summaryCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 10,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.dangerBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },
  budgetsList: {
    gap: 12,
    marginBottom: 16,
  },
  budgetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
  },
  budgetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  budgetIconWrap: {
    height: 38,
    width: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  budgetAmountText: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  budgetProgressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceMuted,
  },
  budgetProgressFill: {
    height: 7,
    borderRadius: 4,
  },
  addBudgetButton: {
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
  addBudgetText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})