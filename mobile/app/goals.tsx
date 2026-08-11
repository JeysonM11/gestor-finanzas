import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Plus,
  Plane,
  Laptop,
  GraduationCap,
  Car,
  Target,
} from 'lucide-react-native'

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
const goals = [
  {
    id: '1',
    name: 'Vacaciones',
    icon: Plane,
    color: '#0ea5e9',
    current: 1200,
    target: 2000,
    deadline: 'Dic 2026',
  },
  {
    id: '2',
    name: 'Laptop nueva',
    icon: Laptop,
    color: '#7c3aed',
    current: 800,
    target: 1500,
    deadline: 'Oct 2026',
  },
  {
    id: '3',
    name: 'Curso de especialización',
    icon: GraduationCap,
    color: '#d97706',
    current: 450,
    target: 600,
    deadline: 'Sep 2026',
  },
  {
    id: '4',
    name: 'Cuota inicial auto',
    icon: Car,
    color: '#16a34a',
    current: 2100,
    target: 8000,
    deadline: 'Jun 2027',
  },
]

export default function Goals() {
  const router = useRouter()

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)
  const overallPercent = (totalSaved / totalTarget) * 100

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
          <Text style={styles.headerTitle}>Metas</Text>
          <Pressable onPress={() => router.push('/goals/new' as any)} hitSlop={12}>
            <Plus size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Resumen general */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Ahorrado en total</Text>
              <Text style={styles.summaryValue}>${totalSaved.toLocaleString('es-ES')}</Text>
            </View>
            <View style={styles.summaryIconWrap}>
              <Target size={22} color={COLORS.surface} />
            </View>
          </View>
          <View style={styles.summaryProgressTrack}>
            <View style={[styles.summaryProgressFill, { width: `${overallPercent}%` }]} />
          </View>
          <Text style={styles.summaryCaption}>
            {overallPercent.toFixed(0)}% de ${totalTarget.toLocaleString('es-ES')} en {goals.length} metas
          </Text>
        </View>

        {/* Lista de metas */}
        <View style={styles.goalsList}>
          {goals.map((goal) => {
            const Icon = goal.icon
            const percent = Math.min((goal.current / goal.target) * 100, 100)
            return (
              <Pressable
                key={goal.id}
                style={styles.goalCard}
                onPress={() => router.push(`/goals/${goal.id}` as any)}
              >
                <View style={styles.goalTopRow}>
                  <View style={[styles.goalIconWrap, { backgroundColor: `${goal.color}1A` }]}>
                    <Icon size={20} color={goal.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalDeadline}>Meta: {goal.deadline}</Text>
                  </View>
                </View>

                <View style={styles.goalProgressTrack}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      { width: `${percent}%`, backgroundColor: goal.color },
                    ]}
                  />
                </View>

                <View style={styles.goalBottomRow}>
                  <Text style={styles.goalAmountText}>
                    <Text style={{ fontWeight: '700', color: COLORS.ink }}>
                      ${goal.current.toLocaleString('es-ES')}
                    </Text>{' '}
                    de ${goal.target.toLocaleString('es-ES')}
                  </Text>
                  <Pressable
                    style={[styles.contributeButton, { backgroundColor: `${goal.color}1A` }]}
                    onPress={() => router.push(`/goals/${goal.id}/contribute` as any)}
                  >
                    <Plus size={12} color={goal.color} />
                    <Text style={[styles.contributeText, { color: goal.color }]}>Aportar</Text>
                  </Pressable>
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Nueva meta */}
        <Pressable
          style={styles.addGoalButton}
          onPress={() => router.push('/goals/new' as any)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addGoalText}>Crear nueva meta</Text>
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
    backgroundColor: COLORS.primary,
  },
  summaryCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 10,
  },
  goalsList: {
    gap: 12,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  goalIconWrap: {
    height: 42,
    width: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  goalDeadline: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  goalProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceMuted,
    marginBottom: 10,
  },
  goalProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  goalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalAmountText: {
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  contributeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addGoalButton: {
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
  addGoalText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})