import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  Award,
  Star,
  Flame,
  Target,
  PiggyBank,
  TrendingUp,
  Crown,
  Zap,
  Lock,
  Trophy,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  gold: '#d97706',
  goldBg: '#fffbeb',
}

const currentLevel = 7
const currentPoints = 2340
const pointsForNextLevel = 3000
const progressPercent = (currentPoints / pointsForNextLevel) * 100

// Datos de ejemplo — se reemplazan por datos reales luego
const achievements = [
  { id: '1', name: 'Primer paso', description: 'Registra tu primera transacción', icon: Star, unlocked: true },
  { id: '2', name: 'Constante', description: '7 días seguidos registrando gastos', icon: Flame, unlocked: true },
  { id: '3', name: 'Ahorrador', description: 'Alcanza tu primera meta de ahorro', icon: PiggyBank, unlocked: true },
  { id: '4', name: 'Enfocado', description: 'Cumple un presupuesto durante 1 mes', icon: Target, unlocked: true },
  { id: '5', name: 'Inversor', description: 'Registra tu primera inversión', icon: TrendingUp, unlocked: false },
  { id: '6', name: 'Racha de oro', description: '30 días seguidos activo en la app', icon: Zap, unlocked: false },
  { id: '7', name: 'Libre de deudas', description: 'Salda una deuda por completo', icon: Trophy, unlocked: false },
  { id: '8', name: 'Maestro financiero', description: 'Alcanza el nivel 15', icon: Crown, unlocked: false },
]

export default function Gamification() {
  const router = useRouter()
  const unlockedCount = achievements.filter((a) => a.unlocked).length

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
          <Text style={styles.headerTitle}>Logros</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Card de nivel */}
        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Crown size={28} color={COLORS.gold} />
          </View>
          <Text style={styles.levelTitle}>Nivel {currentLevel}</Text>
          <Text style={styles.levelSubtitle}>
            {currentPoints.toLocaleString('es-ES')} / {pointsForNextLevel.toLocaleString('es-ES')} puntos
          </Text>

          <View style={styles.levelProgressTrack}>
            <View style={[styles.levelProgressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.levelCaption}>
            {(pointsForNextLevel - currentPoints).toLocaleString('es-ES')} puntos para el nivel {currentLevel + 1}
          </Text>
        </View>

        {/* Resumen de logros */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Award size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {unlockedCount}/{achievements.length}
            </Text>
            <Text style={styles.statLabel}>Logros</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={18} color={COLORS.gold} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Días de racha</Text>
          </View>
        </View>

        {/* Grid de logros */}
        <Text style={styles.sectionTitle}>Todos los logros</Text>
        <View style={styles.grid}>
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <View
                key={achievement.id}
                style={[styles.badgeCard, !achievement.unlocked && styles.badgeCardLocked]}
              >
                <View
                  style={[
                    styles.badgeIconWrap,
                    { backgroundColor: achievement.unlocked ? COLORS.goldBg : COLORS.surfaceMuted },
                  ]}
                >
                  {achievement.unlocked ? (
                    <Icon size={24} color={COLORS.gold} />
                  ) : (
                    <Lock size={20} color={COLORS.inkMuted} />
                  )}
                </View>
                <Text
                  style={[
                    styles.badgeName,
                    !achievement.unlocked && { color: COLORS.inkMuted },
                  ]}
                  numberOfLines={1}
                >
                  {achievement.name}
                </Text>
                <Text style={styles.badgeDescription} numberOfLines={2}>
                  {achievement.description}
                </Text>
              </View>
            )
          })}
        </View>
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
  levelCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  levelBadge: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(217,119,6,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    color: COLORS.surface,
    fontSize: 22,
    fontWeight: '700',
  },
  levelSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 3,
  },
  levelProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 16,
  },
  levelProgressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  levelCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.ink,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.inkMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconWrap: {
    height: 52,
    width: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 10,
    color: COLORS.inkMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
})