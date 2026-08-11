import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Plus,
  BellRing,
  CheckCircle2,
  Circle,
  Home as HomeIcon,
  CreditCard,
  Smartphone,
  Wifi,
  GraduationCap,
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

// Datos de ejemplo — se reemplazan por datos reales luego
const initialReminders = [
  {
    id: '1',
    name: 'Tarjeta de crédito Nu',
    icon: CreditCard,
    amount: 120,
    date: '15 Ago',
    daysLeft: 2,
    paid: false,
  },
  {
    id: '2',
    name: 'Internet',
    icon: Wifi,
    amount: 42,
    date: '18 Ago',
    daysLeft: 5,
    paid: false,
  },
  {
    id: '3',
    name: 'Alquiler',
    icon: HomeIcon,
    amount: 650,
    date: '1 Sep',
    daysLeft: 19,
    paid: false,
  },
  {
    id: '4',
    name: 'Financiamiento celular',
    icon: Smartphone,
    amount: 50,
    date: '10 Ago',
    daysLeft: -3,
    paid: true,
  },
  {
    id: '5',
    name: 'Préstamo estudiantil',
    icon: GraduationCap,
    amount: 250,
    date: '5 Ago',
    daysLeft: -8,
    paid: true,
  },
]

export default function Reminders() {
  const router = useRouter()
  const [reminders, setReminders] = useState(initialReminders)

  const togglePaid = (id: string) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paid: !item.paid } : item))
    )
  }

  const pending = useMemo(
    () => reminders.filter((r) => !r.paid).sort((a, b) => a.daysLeft - b.daysLeft),
    [reminders]
  )
  const paid = useMemo(() => reminders.filter((r) => r.paid), [reminders])

  const totalPending = pending.reduce((sum, r) => sum + r.amount, 0)

  const getUrgencyStyle = (daysLeft: number) => {
    if (daysLeft <= 3) return { color: COLORS.danger, bg: COLORS.dangerBg, label: `En ${daysLeft}d` }
    if (daysLeft <= 7) return { color: COLORS.warning, bg: COLORS.warningBg, label: `En ${daysLeft}d` }
    return { color: COLORS.inkMuted, bg: COLORS.surfaceMuted, label: `En ${daysLeft}d` }
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
          <Text style={styles.headerTitle}>Recordatorios</Text>
          <Pressable onPress={() => router.push('/reminders/new' as any)} hitSlop={12}>
            <Plus size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Resumen general */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <BellRing size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.summaryLabel}>Pendiente por pagar</Text>
          <Text style={styles.summaryValue}>${totalPending.toLocaleString('es-ES')}</Text>
          <Text style={styles.summaryCaption}>
            {pending.length} {pending.length === 1 ? 'recordatorio pendiente' : 'recordatorios pendientes'}
          </Text>
        </View>

        {/* Pendientes */}
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Próximos</Text>
            <View style={styles.list}>
              {pending.map((item) => {
                const Icon = item.icon
                const urgency = getUrgencyStyle(item.daysLeft)
                return (
                  <View key={item.id} style={styles.reminderCard}>
                    <Pressable onPress={() => togglePaid(item.id)} hitSlop={8}>
                      <Circle size={22} color={COLORS.line} />
                    </Pressable>

                    <View style={styles.reminderIconWrap}>
                      <Icon size={17} color={COLORS.ink} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.reminderName}>{item.name}</Text>
                      <Text style={styles.reminderDate}>{item.date}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={styles.reminderAmount}>${item.amount.toFixed(2)}</Text>
                      <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                        <Text style={[styles.urgencyText, { color: urgency.color }]}>
                          {urgency.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* Pagados */}
        {paid.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Pagados recientemente</Text>
            <View style={styles.list}>
              {paid.map((item) => {
                const Icon = item.icon
                return (
                  <View key={item.id} style={[styles.reminderCard, styles.reminderCardPaid]}>
                    <Pressable onPress={() => togglePaid(item.id)} hitSlop={8}>
                      <CheckCircle2 size={22} color={COLORS.primary} />
                    </Pressable>

                    <View style={[styles.reminderIconWrap, { backgroundColor: COLORS.primaryLight }]}>
                      <Icon size={17} color={COLORS.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reminderName, styles.strikethrough]}>{item.name}</Text>
                      <Text style={styles.reminderDate}>Pagado</Text>
                    </View>

                    <Text style={[styles.reminderAmount, { color: COLORS.inkMuted }]}>
                      ${item.amount.toFixed(2)}
                    </Text>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* Nuevo recordatorio */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/reminders/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Crear recordatorio</Text>
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
    marginBottom: 22,
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
  summaryValue: {
    color: COLORS.surface,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.inkMuted,
    marginBottom: 10,
    marginTop: 4,
  },
  list: {
    gap: 10,
    marginBottom: 20,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
  },
  reminderCardPaid: {
    opacity: 0.7,
  },
  reminderIconWrap: {
    height: 38,
    width: 38,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: COLORS.inkMuted,
  },
  reminderDate: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  reminderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  urgencyText: {
    fontSize: 10,
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