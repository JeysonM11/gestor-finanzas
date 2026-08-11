import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  LineChart,
  Landmark,
  Coins,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  positive: '#16a34a',
  negative: '#dc2626',
}

// Datos de ejemplo — se reemplazan por datos reales luego.
// "history" son puntos relativos (0-100) para el sparkline.
const investments = [
  {
    id: '1',
    name: 'Fondo Indexado S&P 500',
    type: 'Fondo',
    icon: LineChart,
    value: 3200,
    changePercent: 8.4,
    history: [30, 40, 35, 55, 50, 70, 65, 85],
  },
  {
    id: '2',
    name: 'Bitcoin',
    type: 'Cripto',
    icon: Bitcoin,
    value: 1450,
    changePercent: -4.2,
    history: [70, 65, 75, 60, 55, 45, 50, 40],
  },
  {
    id: '3',
    name: 'CDT Bancolombia',
    type: 'Renta fija',
    icon: Landmark,
    value: 2000,
    changePercent: 2.1,
    history: [40, 42, 44, 45, 47, 48, 49, 51],
  },
  {
    id: '4',
    name: 'Acciones Ecopetrol',
    type: 'Acciones',
    icon: Coins,
    value: 680,
    changePercent: 12.7,
    history: [20, 30, 25, 45, 50, 60, 75, 90],
  },
]

// Mini gráfico de tendencia hecho con barras finas (sin librerías externas)
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <View style={styles.sparkline}>
      {data.map((point, index) => (
        <View
          key={index}
          style={[
            styles.sparklineBar,
            { height: `${(point / max) * 100}%`, backgroundColor: color },
          ]}
        />
      ))}
    </View>
  )
}

export default function Investments() {
  const router = useRouter()

  const totalInvested = investments.reduce((sum, i) => sum + i.value, 0)
  const avgReturn =
    investments.reduce((sum, i) => sum + i.changePercent, 0) / investments.length
  const isOverallPositive = avgReturn >= 0

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
          <Text style={styles.headerTitle}>Inversiones</Text>
          <Pressable onPress={() => router.push('/investments/new' as any)} hitSlop={12}>
            <Plus size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Resumen del portafolio */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Valor del portafolio</Text>
          <Text style={styles.summaryValue}>${totalInvested.toLocaleString('es-ES')}</Text>

          <View style={styles.returnRow}>
            <View
              style={[
                styles.returnBadge,
                { backgroundColor: isOverallPositive ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)' },
              ]}
            >
              {isOverallPositive ? (
                <TrendingUp size={13} color="#4ade80" />
              ) : (
                <TrendingDown size={13} color="#f87171" />
              )}
              <Text
                style={[
                  styles.returnBadgeText,
                  { color: isOverallPositive ? '#4ade80' : '#f87171' },
                ]}
              >
                {isOverallPositive ? '+' : ''}
                {avgReturn.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.returnCaption}>rendimiento promedio</Text>
          </View>
        </View>

        {/* Lista de inversiones */}
        <View style={styles.investmentsList}>
          {investments.map((inv) => {
            const Icon = inv.icon
            const isPositive = inv.changePercent >= 0
            const trendColor = isPositive ? COLORS.positive : COLORS.negative

            return (
              <Pressable
                key={inv.id}
                style={styles.investmentCard}
                onPress={() => router.push(`/investments/${inv.id}` as any)}
              >
                <View style={styles.investmentIconWrap}>
                  <Icon size={20} color={COLORS.ink} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.investmentName}>{inv.name}</Text>
                  <Text style={styles.investmentType}>{inv.type}</Text>
                </View>

                <Sparkline data={inv.history} color={trendColor} />

                <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                  <Text style={styles.investmentValue}>
                    ${inv.value.toLocaleString('es-ES')}
                  </Text>
                  <View style={styles.changeRow}>
                    {isPositive ? (
                      <TrendingUp size={11} color={trendColor} />
                    ) : (
                      <TrendingDown size={11} color={trendColor} />
                    )}
                    <Text style={[styles.changeText, { color: trendColor }]}>
                      {isPositive ? '+' : ''}
                      {inv.changePercent.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Nueva inversión */}
        <Pressable
          style={styles.addInvestmentButton}
          onPress={() => router.push('/investments/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addInvestmentText}>Añadir inversión</Text>
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
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  returnBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  returnCaption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  investmentsList: {
    gap: 10,
    marginBottom: 16,
  },
  investmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    gap: 10,
  },
  investmentIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
  },
  investmentType: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  investmentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 32,
    width: 48,
  },
  sparklineBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  addInvestmentButton: {
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
  addInvestmentText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})