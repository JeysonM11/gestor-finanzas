import { useState, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ViewToken,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import {
  ArrowRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  DollarSign,
  Target,
  CreditCard,
  ChevronLeft,
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

const slides = [
  {
    id: '1',
    title: 'Controla tus\nfinanzas',
    description: 'Registra tus ingresos y gastos en segundos, desde cualquier lugar.',
    illustration: 'accounts',
  },
  {
    id: '2',
    title: 'Ahorra sin\nesfuerzo',
    description: 'Crea metas de ahorro y sigue tu progreso en tiempo real.',
    illustration: 'goals',
  },
  {
    id: '3',
    title: 'Bienvenido a\nGestor de Finanzas',
    description: 'Tu dinero, bajo control. Empecemos.',
    illustration: 'welcome',
    isLast: true,
  },
]

// Ilustración compuesta con cards en capas + iconos flotantes, imitando el estilo de referencia
function Illustration({ type }: { type: string }) {
  if (type === 'welcome') {
    return (
      <View style={styles.illustrationWrap}>
        <View style={[styles.orbitCircle, { top: 10, left: 30 }]}>
          <DollarSign size={16} color={COLORS.surface} />
        </View>
        <View style={[styles.orbitCircle, styles.orbitCircleAlt, { top: 40, right: 10 }]}>
          <TrendingUp size={16} color={COLORS.surface} />
        </View>
        <View style={[styles.orbitCircle, { bottom: 30, left: 10 }]}>
          <PiggyBank size={16} color={COLORS.surface} />
        </View>
        <View style={styles.centerCircle}>
          <Wallet size={44} color={COLORS.primary} />
        </View>
      </View>
    )
  }

  if (type === 'goals') {
    return (
      <View style={styles.illustrationWrap}>
        <View style={[styles.card, styles.cardBack, { transform: [{ rotate: '-8deg' }] }]} />
        <View style={[styles.card, styles.cardMid, { transform: [{ rotate: '6deg' }] }]} />
        <View style={styles.cardFront}>
          <Target size={32} color={COLORS.primary} />
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.cardLabel}>Meta: Vacaciones</Text>
          <Text style={styles.cardValue}>$1,200 / $2,000</Text>
        </View>
        <View style={[styles.badge, { top: -6, right: -6 }]}>
          <ArrowRight size={12} color={COLORS.surface} />
        </View>
      </View>
    )
  }

  // 'accounts'
  return (
    <View style={styles.illustrationWrap}>
      <View style={[styles.card, styles.cardBack, { transform: [{ rotate: '-10deg' }] }]} />
      <View style={[styles.card, styles.cardMid, { transform: [{ rotate: '7deg' }] }]} />
      <View style={styles.cardFront}>
        <CreditCard size={32} color={COLORS.primary} />
        <Text style={styles.cardLabel}>Saldo disponible</Text>
        <Text style={styles.cardValue}>$4,850.00</Text>
      </View>
      <View style={[styles.badge, { bottom: -6, left: -6 }]}>
        <DollarSign size={12} color={COLORS.surface} />
      </View>
    </View>
  )
}

export default function Onboarding() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const flatListRef = useRef<FlatList>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleFinish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true')
    router.replace('/login')
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 })
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const isLast = currentIndex === slides.length - 1

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {currentIndex > 0 ? (
          <Pressable onPress={handleBack} hitSlop={12}>
            <ChevronLeft size={22} color={COLORS.inkMuted} />
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}
        {!isLast && (
          <Pressable onPress={handleFinish} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Illustration type={item.illustration} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>{isLast ? 'Comenzar' : 'Siguiente'}</Text>
          <ArrowRight size={18} color={COLORS.surface} />
        </Pressable>

        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>
            ¿Ya tienes una cuenta? <Text style={styles.loginLink}>Entrar</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    height: 56,
  },
  skipText: {
    color: COLORS.inkMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustrationWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  card: {
    position: 'absolute',
    width: 150,
    height: 190,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
  },
  cardBack: {
    backgroundColor: '#f0fdf4',
  },
  cardMid: {
    backgroundColor: COLORS.primaryLight,
  },
  cardFront: {
    width: 160,
    height: 200,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
  },
  progressTrack: {
    width: 100,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.line,
    marginTop: 4,
  },
  progressFill: {
    width: '60%',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.surfaceMuted,
  },
  orbitCircle: {
    position: 'absolute',
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitCircleAlt: {
    backgroundColor: '#0ea5e9',
  },
  centerCircle: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: COLORS.line,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  button: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  loginText: {
    marginTop: 16,
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
})