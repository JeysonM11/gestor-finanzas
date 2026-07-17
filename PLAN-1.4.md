# Plan v1.4 — Estabilizar y unificar

> **Estado: IMPLEMENTADO** (código en rama de entrega).  
> Tema: completar, estabilizar y unificar módulos existentes. Sin módulos nuevos.  
> Base: [`PLAN-1.3.md`](PLAN-1.3.md) · [`docs/CONTRATOS-API.md`](docs/CONTRATOS-API.md)

## Decisiones de producto

| Tema | Decisión |
|------|----------|
| Entrega | Sprint por sprint |
| Tokens legacy | Rechazo inmediato (re-login global) |
| Refresh | Cookie HttpOnly + access en memoria |
| Aporte a meta con cuenta | Crea `GASTO` (categoría Ahorro/catálogo) + incrementa meta |
| Borrar cuenta | Borrado lógico (`activo=false`) + revocar sesiones |
| Cobertura | Umbral progresivo en Jest (utils críticos con umbral propio; global baseline ~12%) |

## Checklist

### Sprint 1 — Estabilización
- [x] Pipeline compartido `movimiento.service.js`
- [x] Recurrentes con cuenta + efectos saldo/presupuesto + idempotencia
- [x] Unificar pago de deuda → `PAGO_DEUDA`
- [x] Reportes incluyen `PAGO_DEUDA` + fechas UTC
- [x] Dashboard sin mocks + `GET /api/health`

### Sprint 2 — Completar módulos
- [x] `PUT /api/finanzas/cuentas/:id`
- [x] Filtros `montoMin` / `montoMax`
- [x] Aportes de meta con cuenta opcional
- [x] Métricas e historial de inversiones

### Sprint 3 — Automatización
- [x] Gamificación automática idempotente
- [x] Botón ejecutar recordatorios
- [x] Severidades `SUCCESS` / `WARNING` / `ERROR`

### Sprint 4 — UX
- [x] Widgets dashboard (deudas/metas/recordatorios/categorías)
- [x] Categorías icono/color/orden/búsqueda
- [x] Eliminar cuenta (lógico + password)

### Sprint 5 — Seguridad
- [x] Access JWT corto + refresh rotatorio
- [x] Rechazo de JWT sin `sid`
- [x] Auditoría login/logout/password/profile/delete
- [x] Frontend refresh + cola de retry

### Sprint 6 — Calidad
- [x] Tests unitarios ampliados + coverageThreshold
- [x] OpenAPI, PLAN-1.4, README, CHANGELOG, contratos

## Archivos clave nuevos

- `backend/services/movimiento.service.js`
- `backend/services/gamificacion.service.js`
- `backend/services/auditoria-acceso.service.js`
- `backend/utils/transaccion-filtros.js`
- `docs/openapi.yaml`
- `frontend/src/components/dashboard/FinancialWidgets.jsx`
