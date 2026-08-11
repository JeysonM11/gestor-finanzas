import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Plus,
  CreditCard,
  GraduationCap,
  Car,
  Home as HomeIcon,
  Smartphone,
  Calendar,
  Bot,
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
  dangerBg: '#fef2f2',
}

// Datos de ejemplo — se reemplazan por datos reales luego
const debts = [
  {
    id: '1',
    name: 'Tarjeta de crédito Nu',
    icon: CreditCard,
    color: '#dc2626',
    total: 1200,
    paid: 880,
    nextPayment: '20 Ago',
    nextAmount: 120,
  },
  {
    id: '2',
    name: 'Préstamo estudiantil',
    icon: GraduationCap,
    color: '#7c3aed',
    total: 5000,
    paid: 1500,
    nextPayment: '5 Sep',
    nextAmount: 250,
  },
  {
    id: '3',
    name: 'Crédito auto',
    icon: Car,
    color: '#0ea5e9',
    total: 8000,
    paid: 5900,
    nextPayment: '1 Sep',
    nextAmount: 320,
  },
  {
    id: '4',
    name: 'Financiamiento celular',
    icon: Smartphone,
    color: '#d97706',
    total: 600,
    paid: 400,
    nextPayment: '15 Ago',
    nextAmount: 50,
  },
]

export default function Debts() {
  const router = useRouter()

  const totalDebt = debts.reduce((sum, d) => sum + (d.total - d.paid), 0)
  const totalOriginal = debts.reduce((sum, d) => sum + d.total, 0)
  const totalPaid = debts.reduce((sum, d) => sum + d.paid, 0)
  const overallPercent = (totalPaid / totalOriginal) * 100

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
          <Text style={styles.headerTitle}>Deudas</Text>
          <Pressable onPress={() => router.push('/debts/new' as any)} hitSlop={12}>
            <Plus size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Resumen general */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Deuda pendiente</Text>
          <Text style={styles.summaryValue}>${totalDebt.toLocaleString('es-ES')}</Text>

          <View style={styles.summaryProgressTrack}>
            <View style={[styles.summaryProgressFill, { width: `${overallPercent}%` }]} />
          </View>
          <Text style={styles.summaryCaption}>
            Has pagado {overallPercent.toFixed(0)}% de ${totalOriginal.toLocaleString('es-ES')} en total
          </Text>
        </View>

        {/* Acceso al Asesor IA */}
        <Pressable
          style={styles.advisorBanner}
          onPress={() => router.push('/advisor' as any)}
        >
          <View style={styles.advisorIconWrap}>
            <Bot size={20} color={COLORS.surface} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.advisorTitle}>Asesor IA de deudas</Text>
            <Text style={styles.advisorSubtitle}>Recibe un plan personalizado para pagar más rápido</Text>
          </View>
        </Pressable>

        {/* Lista de deudas */}
        <View style={styles.debtsList}>
          {debts.map((debt) => {
            const Icon = debt.icon
            const remaining = debt.total - debt.paid
            const percent = (debt.paid / debt.total) * 100

            return (
              <Pressable
                key={debt.id}
                style={styles.debtCard}
                onPress={() => router.push(`/debts/${debt.id}` as any)}
              >
                <View style={styles.debtTopRow}>
                  <View style={[styles.debtIconWrap, { backgroundColor: `${debt.color}1A` }]}>
                    <Icon size={20} color={debt.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    <Text style={styles.debtRemaining}>
                      ${remaining.toLocaleString('es-ES')} pendiente
                    </Text>
                  </View>
                </View>

                <View style={styles.debtProgressTrack}>
                  <View
                    style={[
                      styles.debtProgressFill,
                      { width: `${percent}%`, backgroundColor: debt.color },
                    ]}
                  />
                </View>
                <Text style={styles.debtProgressCaption}>
                  ${debt.paid.toLocaleString('es-ES')} pagado de ${debt.total.toLocaleString('es-ES')}
                </Text>

                <View style={styles.debtBottomRow}>
                  <View style={styles.debtNextPayment}>
                    <Calendar size={13} color={COLORS.inkMuted} />
                    <Text style={styles.debtNextPaymentText}>
                      Próximo pago: {debt.nextPayment}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.payButton, { backgroundColor: debt.color }]}
                    onPress={() => router.push(`/debts/${debt.id}/pay` as any)}
                  >
                    <Text style={styles.payButtonText}>
                      Pagar ${debt.nextAmount}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Nueva deuda */}
        <Pressable
          style={styles.addDebtButton}
          onPress={() => router.push('/debts/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addDebtText}>Registrar deuda</Text>
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
  summaryProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 18,
  },
  summaryProgressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  summaryCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 10,
  },
  advisorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  advisorIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
  },
  advisorSubtitle: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  debtsList: {
    gap: 12,
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
  },
  debtTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  debtIconWrap: {
    height: 42,
    width: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  debtRemaining: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  debtProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceMuted,
  },
  debtProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  debtProgressCaption: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 6,
    marginBottom: 12,
  },
  debtBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtNextPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  debtNextPaymentText: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface,
  },
  addDebtButton: {
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
  addDebtText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})