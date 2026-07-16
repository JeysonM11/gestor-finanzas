# Changelog

## v1.4.0 — 2026-07-16

Tema: estabilizar y unificar módulos existentes (sin módulos nuevos).

### Sprint 1 — Estabilización
- Pipeline financiero compartido (`movimiento.service.js`) para transacciones, recurrentes y pagos.
- Recurrentes con cuenta obligatoria, sync de saldos/presupuestos e idempotencia por ocurrencia.
- Pago de deuda unificado con `PAGO_DEUDA` (descuenta cuenta, registra transacción y `PagoDeuda`).
- Reportes incluyen `PAGO_DEUDA` en gastos; rangos de fecha en UTC.
- Dashboard sin datos mock; `GET /api/health` real (API + BD).

### Sprint 2 — Completar módulos
- `PUT /api/finanzas/cuentas/:id` y edición completa en UI.
- Filtros `montoMin` / `montoMax` aplicados en backend y controles en Transacciones.
- Aportes a metas con cuenta opcional (crea GASTO + incrementa meta).
- Métricas netas/brutas e historial de inversiones en DTO/UI.

### Sprint 3 — Automatización
- Gamificación automática idempotente tras eventos financieros.
- Botón “Ejecutar ahora” en Recordatorios.
- Severidades `SUCCESS` / `WARNING` / `ERROR` (compat con tipos previos).

### Sprint 4 — UX
- Widgets de próximas deudas/metas/recordatorios y top categorías.
- Categorías con icono, color, orden y búsqueda.
- Eliminar cuenta (borrado lógico + contraseña + revocación de sesiones).

### Sprint 5 — Seguridad
- Access JWT corto + refresh opaco en cookie HttpOnly (rotación / replay revoke).
- Rechazo inmediato de JWT legacy sin `sid` (re-login global).
- Auditoría persistida: login, logout, password, profile, delete account.

### Sprint 6 — Calidad
- Tests ampliados (89 unitarios) + `coverageThreshold` progresivo en Jest/CI.
- `PLAN-1.4.md`, `docs/openapi.yaml`, README/contratos/env actualizados.

## v1.2.0 — 2026-07-16

Tema: "más útil + más confiable".

### Agregado

- **Categorías** (Sprint A): CRUD de categorías personalizadas en Configuración; modales de transacciones, presupuestos y reportes consumen la API con fallback seguro a defaults.
- **Recordatorios** (Sprint B): CRUD `/api/sistema/recordatorios`, cron con notificación in-app idempotente, página `/recordatorios`, atajos "Recordarme" desde deudas y metas (vínculos `deudaId`/`metaId`).
- **Moneda** (Sprint C): formato homogéneo con `monedaPrincipal` (`formatMoney`/`useCurrency`), fallback USD documentado, moneda en export CSV.
- **Sesiones** (Sprint D2): registro de sesión al login (token hash, dispositivo, IP), listado y revocación en Configuración → Seguridad, invalidación por middleware.
- **CI** (Sprint E): tests de integración ownership (IDOR) con Postgres en GitHub Actions; lint + build del frontend en CI.

### Diferido

- Verificación de email (D1) → backlog post v1.3.

## v1.0.0 — MVP

Cierre del MVP (Sprints 0–6): auth JWT, transacciones con sync de saldos, cuentas, inversiones, deudas + pagos, recurrentes con cron, notificaciones, reportes/CSV, metas, presupuestos con alertas y gamificación básica. Detalle en [PLAN-DE-TRABAJO.md](PLAN-DE-TRABAJO.md).
