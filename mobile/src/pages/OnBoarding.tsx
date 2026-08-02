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
import { Wallet, TrendingUp, Target } from 'lucide-react-native'

const slides = [
  {
    id: '1',
    icon: Wallet,
    title: 'Controla tus finanzas',
    description: 'Registra tus ingresos y gastos en segundos, desde cualquier lugar.',
  },
  {
    id: '2',
    icon: TrendingUp,
    title: 'Visualiza tu progreso',
    description: 'Gráficos claros que te muestran a dónde va tu dinero cada mes.',
  },
  {
    id: '3',
    icon: Target,
    title: 'Alcanza tus metas',
    description: 'Crea metas de ahorro y sigue tu avance en tiempo real.',
  },
]

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

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFinish} style={styles.skipButton}>
        <Text style={styles.skipText}>Saltar</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => {
          const Icon = item.icon
          return (
            <View style={[styles.slide, { width }]}>
              <View style={styles.iconWrapper}>
                <Icon size={40} color="#2563eb" />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )
        }}
      />

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 15,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    height: 96,
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2563eb',
  },
  footer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})