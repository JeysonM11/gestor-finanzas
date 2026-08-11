import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ChevronLeft,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bell,
} from 'lucide-react-native'

const COLORS = {
  primary: '#16a34a',
  ink: '#0f172a',
  inkMuted: '#64748b',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  line: '#e2e8f0',
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#d97706',
  warningBg: '#fffbeb',
  error: '#dc2626',
  errorBg: '#fef2f2',
}

const typeStyles = {
  SUCCESS: { icon: CheckCircle2, color: COLORS.success, bg: COLORS.successBg },
  WARNING: { icon: AlertTriangle, color: COLORS.warning, bg: COLORS.warningBg },
  ERROR: { icon: XCircle, color: COLORS.error, bg: COLORS.errorBg },
} as const

// Datos de ejemplo — se reemplazan por datos reales luego
const initialNotifications = [
  {
    id: '1',
    type: 'SUCCESS' as const,
    title: 'Meta alcanzada',
    message: 'Llegaste al 60% de tu meta "Vacaciones".',
    time: 'Hace 2h',
    group: 'Hoy',
    read: false,
  },
  {
    id: '2',
    type: 'WARNING' as const,
    title: 'Presupuesto por excederse',
    message: 'Ya usaste el 85% de tu presupuesto en "Comida fuera".',
    time: 'Hace 5h',
    group: 'Hoy',
    read: false,
  },
  {
    id: '3',
    type: 'ERROR' as const,
    title: 'Pago fallido',
    message: 'No se pudo procesar el pago automático de "Netflix".',
    time: 'Hace 8h',
    group: 'Hoy',
    read: false,
  },
  {
    id: '4',
    type: 'SUCCESS' as const,
    title: 'Transacción registrada',
    message: 'Se agregó tu salario de $2,500 correctamente.',
    time: 'Ayer',
    group: 'Anteriores',
    read: true,
  },
  {
    id: '5',
    type: 'WARNING' as const,
    title: 'Recordatorio próximo',
    message: 'Tu pago de "Tarjeta de crédito Nu" vence en 2 días.',
    time: 'Hace 2 días',
    group: 'Anteriores',
    read: true,
  },
]

export default function Notifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const groups = useMemo(() => {
    const order = ['Hoy', 'Anteriores']
    return order
      .map((group) => ({
        group,
        items: notifications.filter((n) => n.group === group),
      }))
      .filter((g) => g.items.length > 0)
  }, [notifications])

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
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 ? (
            <Pressable onPress={markAllAsRead} hitSlop={12}>
              <CheckCheck size={20} color={COLORS.primary} />
            </Pressable>
          ) : (
            <View style={{ width: 22 }} />
          )}
        </View>

        {unreadCount > 0 && (
          <Text style={styles.unreadCaption}>
            Tienes {unreadCount} {unreadCount === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}
          </Text>
        )}

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={32} color={COLORS.inkMuted} />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.group} style={styles.group}>
              <Text style={styles.groupTitle}>{group.group}</Text>
              <View style={styles.groupList}>
                {group.items.map((notification) => {
                  const config = typeStyles[notification.type]
                  const Icon = config.icon
                  return (
                    <Pressable
                      key={notification.id}
                      style={styles.notificationCard}
                      onPress={() => markAsRead(notification.id)}
                    >
                      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
                        <Icon size={18} color={config.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          {!notification.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))
        )}
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
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.ink,
  },
  unreadCaption: {
    fontSize: 13,
    color: COLORS.inkMuted,
    marginBottom: 20,
  },
  group: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.inkMuted,
    marginBottom: 10,
    marginTop: 4,
  },
  groupList: {
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
  },
  iconWrap: {
    height: 38,
    width: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  unreadDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 6,
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
})