import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Download,
  ShoppingBag,
  Utensils,
  Car,
  Home as HomeIcon,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native'
import BottomTabBar from '../components/BottomTabBar'

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

const periods = ['Semana', 'Mes', 'Trimestre', 'Año']

// Datos de ejemplo — se reemplazan por datos reales luego
const monthlyTrend = [
  { label: 'Mar', income: 60, expense: 40 },
  { label: 'Abr', income: 80, expense: 55 },
  { label: 'May', income: 70, expense: 65 },
  { label: 'Jun', income: 90, expense: 50 },
  { label: 'Jul', income: 75, expense: 60 },
  { label: 'Ago', income: 100, expense: 45 },
]

const categoryBreakdown = [
  { name: 'Alimentación', amount: 340, percent: 32, icon: ShoppingBag, color: '#16a34a' },
  { name: 'Vivienda', amount: 650, percent: 28, icon: HomeIcon, color: '#0ea5e9' },
  { name: 'Transporte', amount: 180, percent: 18, icon: Car, color: '#d97706' },
  { name: 'Comida fuera', amount: 120, percent: 14, icon: Utensils, color: '#dc2626' },
  { name: 'Suscripciones', amount: 45, percent: 8, icon: Zap, color: '#7c3aed' },
]

export default function Reports() {
  const router = useRouter()
  const [activePeriod, setActivePeriod] = useState('Mes')

  const maxTrendValue = Math.max(...monthlyTrend.flatMap((m) => [m.income, m.expense]))
  const totalIncome = 2500
  const totalExpense = 1335
  const net = totalIncome - totalExpense

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
          <Text style={styles.headerTitle}>Reportes</Text>
          <Pressable hitSlop={12}>
            <Download size={20} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Selector de periodo */}
        <View style={styles.periodRow}>
          {periods.map((period) => {
            const isActive = activePeriod === period
            return (
              <Pressable
                key={period}
                onPress={() => setActivePeriod(period)}
                style={[styles.periodChip, isActive && styles.periodChipActive]}
              >
                <Text style={[styles.periodText, isActive && styles.periodTextActive]}>
                  {period}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Resumen: ingresos, gastos, balance */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#dcfce7' }]}>
              <TrendingUp size={16} color={COLORS.income} />
            </View>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={styles.summaryValue}>${totalIncome.toLocaleString('es-ES')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#fef2f2' }]}>
              <TrendingDown size={16} color={COLORS.expense} />
            </View>
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={styles.summaryValue}>${totalExpense.toLocaleString('es-ES')}</Text>
          </View>
        </View>

        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Balance neto del periodo</Text>
          <Text style={[styles.netValue, { color: net >= 0 ? COLORS.income : COLORS.expense }]}>
            {net >= 0 ? '+' : ''}${net.toLocaleString('es-ES')}
          </Text>
        </View>

        {/* Tendencia mensual (barras) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tendencia</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.income }]} />
              <Text style={styles.legendText}>Ingresos</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.expense }]} />
              <Text style={styles.legendText}>Gastos</Text>
            </View>
          </View>

          <View style={styles.chartRow}>
            {monthlyTrend.map((month) => (
              <View key={month.label} style={styles.chartColumn}>
                <View style={styles.barsGroup}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (month.income / maxTrendValue) * 100,
                        backgroundColor: COLORS.income,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (month.expense / maxTrendValue) * 100,
                        backgroundColor: COLORS.expense,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{month.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gastos por categoría */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Gastos por categoría</Text>
          <View style={styles.categoryList}>
            {categoryBreakdown.map((cat) => {
              const Icon = cat.icon
              return (
                <View key={cat.name} style={styles.categoryRow}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: `${cat.color}1A` }]}>
                    <Icon size={16} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.categoryTopRow}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryAmount}>${cat.amount}</Text>
                    </View>
                    <View style={styles.categoryTrack}>
                      <View
                        style={[
                          styles.categoryFill,
                          { width: `${cat.percent}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Exportar */}
        <Pressable style={styles.exportButton}>
          <Download size={18} color={COLORS.primary} />
          <Text style={styles.exportText}>Exportar a CSV</Text>
        </Pressable>
      </ScrollView>

      <BottomTabBar activeTab="reports" />
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
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkMuted,
  },
  periodTextActive: {
    color: COLORS.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    gap: 6,
  },
  summaryIconWrap: {
    height: 30,
    width: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.ink,
  },
  netCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  netLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  netValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartColumn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  barsGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 100,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: COLORS.inkMuted,
  },
  categoryList: {
    gap: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconWrap: {
    height: 36,
    width: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
  },
  categoryTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceMuted,
  },
  categoryFill: {
    height: 6,
    borderRadius: 3,
  },
  exportButton: {
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
  exportText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})