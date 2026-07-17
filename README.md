# Gestor de Finanzas Personales

Aplicación full-stack de finanzas personales: autenticación JWT, transacciones con sync de saldos, cuentas, inversiones, deudas, recurrentes (cron), notificaciones, reportes/CSV, gamificación básica y configuración real.

> **MVP, v1.2 y v1.3 cerrados.** Plan activo/cerrado: [PLAN-1.4.md](PLAN-1.4.md) (estabilizar y unificar). Histórico: [PLAN-1.3.md](PLAN-1.3.md), [PLAN-1.2.md](PLAN-1.2.md).

## Arquitectura

```
gestor-finanzas/
├── backend/     # Express + Prisma + PostgreSQL
├── frontend/    # React + Vite + Tailwind
├── docs/        # CONTRATOS-API.md
├── PLAN-DE-TRABAJO.md
└── .github/workflows/ci.yml
```

## Requisitos

- Node.js 18+ (recomendado 20)
- PostgreSQL 13+
- npm

## Inicio rápido

### 1. Backend

```powershell
cd backend
copy .env.example .env
# Editar DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate dev
npm run prisma:seed   # opcional
npm run dev           # http://localhost:5000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev           # http://localhost:5173 (o 5174 si está ocupado)
```

## Estado por módulo

| Módulo | Estado |
|--------|--------|
| Auth + refresh HttpOnly + auditoría | ✅ v1.4 |
| Transacciones + sync saldos + filtros monto | ✅ |
| Cuentas (CRUD + edición completa) | ✅ |
| Inversiones (métricas + historial) | ✅ |
| Deudas + pagos unificados (`PAGO_DEUDA`) | ✅ |
| Recurrentes + cron (con cuenta y saldos) | ✅ |
| Notificaciones (SUCCESS/WARNING/ERROR) | ✅ |
| Reportes / agregados / export CSV | ✅ |
| Categorías (icono/color/orden/búsqueda) | ✅ |
| Gamificación automática idempotente | ✅ |
| Metas (aportes con cuenta opcional) | ✅ |
| Presupuestos + alertas | ✅ |
| Recordatorios (API + cron + Ejecutar ahora) | ✅ |
| Dashboard (sin mocks + health real) | ✅ |
| Asesor IA de deudas (Gemini) | ✅ v1.3 |
| Email verify | → backlog |

## Documentación

- [docs/MANUAL-USUARIO.md](docs/MANUAL-USUARIO.md) — manual de usuario (guía funcional)
- [docs/MANUAL-USUARIO.html](docs/MANUAL-USUARIO.html) — mismo manual en HTML (imprimible)
- [backend/README.md](backend/README.md) — endpoints, env, seed, deploy
- [frontend/README.md](frontend/README.md) — estructura UI
- [docs/CONTRATOS-API.md](docs/CONTRATOS-API.md) — enums y contratos de campos
- [PLAN-DE-TRABAJO.md](PLAN-DE-TRABAJO.md) — MVP cerrado (histórico Sprints 0–6)
- [PLAN-1.2.md](PLAN-1.2.md) — v1.2 cerrada (categorías, recordatorios, moneda, sesiones, CI)
- [PLAN-1.3.md](PLAN-1.3.md) — v1.3 Asesor IA
- [PLAN-1.4.md](PLAN-1.4.md) — v1.4 estabilización/unificación
- [docs/openapi.yaml](docs/openapi.yaml) — OpenAPI 3
- [CHANGELOG.md](CHANGELOG.md) — historial de versiones

## Checklist de despliegue

1. PostgreSQL accesible; crear DB `gestor_finanzas`
2. `backend/.env`: `DATABASE_URL`, `JWT_SECRET` fuerte, `NODE_ENV=production`, `CORS_ORIGIN` = URL del frontend
3. Opcional: `CRON_SECRET`, `CRON_RECURRENTES_SCHEDULE`
4. `cd backend && npm ci && npx prisma migrate deploy && npm run prisma:seed` (seed solo si hace falta)
5. `npm start` (o process manager)
6. Frontend: `npm ci && npm run build`; servir `dist/` o proxy `/api` → backend
7. Verificar `GET /` del API y login

## Puertos

| Servicio | Puerto |
|----------|--------|
| Backend | 5000 |
| Frontend (dev) | 5173 |
| PostgreSQL | 5432 |

## Tests / CI

```powershell
cd backend
npm test
```

GitHub Actions: install + `prisma generate` + `npm test` en push/PR a `main`.

## Autor

Jeyson Miranda — Licencia ISC
