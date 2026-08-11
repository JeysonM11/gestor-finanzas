import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Search,
  SlidersHorizontal,
  Plus,
  ShoppingBag,
  Utensils,
  Car,
  Wallet,
  Home as HomeIcon,
  Zap,
  Receipt,
  ChevronLeft,
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
  incomeBg: '#dcfce7',
  expense: '#dc2626',
}

// Datos de ejemplo agrupados por fecha — se reemplazan por datos reales luego
const transactionGroups = [
  {
    date: 'Hoy',
    items: [
      { id: '1', name: 'Supermercado', category: 'Alimentación', amount: -85.4, icon: ShoppingBag },
      { id: '2', name: 'Uber', category: 'Transporte', amount: -12.5, icon: Car },
    ],
  },
  {
    date: 'Ayer',
    items: [
      { id: '3', name: 'Salario', category: 'Ingreso', amount: 2500, icon: Wallet },
      { id: '4', name: 'Restaurante', category: 'Comida', amount: -32.9, icon: Utensils },
      { id: '5', name: 'Netflix', category: 'Suscripción', amount: -13.99, icon: Zap },
    ],
  },
  {
    date: '12 de agosto',
    items: [
      { id: '6', name: 'Alquiler', category: 'Vivienda', amount: -650, icon: HomeIcon },
      { id: '7', name: 'Gasolina', category: 'Transporte', amount: -45, icon: Car },
    ],
  },
]

const filters = ['Todas', 'Ingresos', 'Gastos', 'Este mes']

export default function Transactions() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todas')

  const filteredGroups = useMemo(() => {
    return transactionGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
          const matchesFilter =
            activeFilter === 'Todas' ||
            (activeFilter === 'Ingresos' && item.amount > 0) ||
            (activeFilter === 'Gastos' && item.amount < 0) ||
            activeFilter === 'Este mes'
          return matchesSearch && matchesFilter
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [search, activeFilter])

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
          <Text style={styles.headerTitle}>Transacciones</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Búsqueda */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Search size={18} color={COLORS.inkMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar transacción..."
              placeholderTextColor={COLORS.inkMuted}
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterIconButton}>
            <SlidersHorizontal size={18} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Chips de filtro */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter
            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Lista agrupada por fecha */}
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Receipt size={32} color={COLORS.inkMuted} />
            <Text style={styles.emptyText}>No hay transacciones que coincidan</Text>
          </View>
        ) : (
          filteredGroups.map((group) => (
            <View key={group.date} style={styles.group}>
              <Text style={styles.groupDate}>{group.date}</Text>
              <View style={styles.groupList}>
                {group.items.map((tx) => {
                  const Icon = tx.icon
                  const isPositive = tx.amount > 0
                  return (
                    <Pressable
                      key={tx.id}
                      style={styles.transactionRow}
                      onPress={() => router.push(`/transactions/${tx.id}` as any)}
                    >
                      <View
                        style={[
                          styles.transactionIconWrap,
                          { backgroundColor: isPositive ? COLORS.incomeBg : COLORS.surfaceMuted },
                        ]}
                      >
                        <Icon size={18} color={isPositive ? COLORS.income : COLORS.inkMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.transactionName}>{tx.name}</Text>
                        <Text style={styles.transactionCategory}>{tx.category}</Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          { color: isPositive ? COLORS.income : COLORS.expense },
                        ]}
                      >
                        {isPositive ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botón flotante de añadir */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/transactions/new' as any)}
      >
        <Plus size={26} color={COLORS.surface} />
      </Pressable>

      <BottomTabBar activeTab="transactions" />
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
    paddingBottom: 100,
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
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkMuted,
  },
  chipTextActive: {
    color: COLORS.surface,
  },
  group: {
    marginBottom: 18,
  },
  groupDate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.inkMuted,
    marginBottom: 10,
  },
  groupList: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  transactionIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  transactionCategory: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.inkMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
})