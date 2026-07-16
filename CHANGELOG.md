# Changelog

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
