# Backend — Gestor de Finanzas

API REST con Node.js, Express 5, Prisma y PostgreSQL.

## Stack

- Express + Helmet + CORS + rate-limit (auth)
- Prisma ORM + PostgreSQL
- JWT (`authMiddleware`, `requireRole`)
- Joi (validación)
- Winston + Morgan
- node-cron (recurrentes cada hora)
- Jest

## Setup

```bash
cd backend
cp .env.example .env   # o copy en Windows
npm install
npx prisma migrate dev
npx prisma generate
npm run prisma:seed    # opcional: admin + datos demo
npm run dev
```

Servidor: `http://localhost:5000`

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | sí | Connection string PostgreSQL |
| `JWT_SECRET` | sí | Firma JWT (fail-fast si falta) |
| `PORT` | no | Default `5000` |
| `NODE_ENV` | no | `development` / `production` / `test` |
| `CORS_ORIGIN` | prod | Origen permitido del frontend |
| `CRON_RECURRENTES` | no | `false` desactiva el job |
| `CRON_RECURRENTES_SCHEDULE` | no | Default `0 * * * *` |
| `CRON_SECRET` | para interno | Header `X-Cron-Secret` en ejecutar-interno |
| `AUTH_RATE_LIMIT_MAX` | no | Default 20 / 15 min |
| `API_RATE_LIMIT_MAX` | no | Default 300 / 15 min |
| `LOG_LEVEL` | no | Default `info` |

## Endpoints principales

| Prefijo | Recursos |
|---------|----------|
| `/api/auth` | register, login, me, profile, change-password, preferences |
| `/api/transacciones` | CRUD, resumen (ownership + sync saldos) |
| `/api/finanzas/cuentas` | CRUD / soft delete |
| `/api/finanzas/inversiones` | CRUD |
| `/api/finanzas/deudas` | CRUD + pagos |
| `/api/finanzas/metas` | CRUD + aportar |
| `/api/finanzas/presupuestos` | CRUD + sincronizar + alertas |
| `/api/finanzas/logros` | listado, resumen, historial, verificar |
| `/api/sistema/recurrentes` | CRUD, toggle, ejecutar (usuario), ejecutar-interno (cron) |
| `/api/sistema/notificaciones` | listado, CRUD, marcar leídas |
| `/api/reportes` | mensual, agregados, export CSV |
| `/api/categorias` | listado, CRUD personalizadas, estadísticas |
| `/api/sistema/admin/health` | solo `ADMIN` |

Contratos de campos/enums: [docs/CONTRATOS-API.md](../docs/CONTRATOS-API.md).

## Scripts

```bash
npm run dev
npm start                 # aplica migraciones pendientes y arranca (producción)
npm test
npm run prisma:migrate    # solo desarrollo
npm run prisma:deploy     # solo aplicar migraciones (sin arrancar)
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
```

### Migraciones en producción

`npm start` ejecuta `prisma migrate deploy` antes de levantar el API. La migración `plazoMeses` es **aditiva y nullable**: no borra datos ni cambia préstamos existentes hasta que se asigne un plazo.

## Estructura

```
backend/
??? app.js
??? controllers/
??? routes/
??? middlewares/
??? validators/
??? services/          # lógica compartida (recurrentes)
??? jobs/              # cron
??? utils/             # errors, logger, mappers, saldo
??? lib/prisma.js
??? prisma/
??? tests/
```

## Seguridad

- JWT obligatorio en rutas privadas; ownership por `userId`
- Helmet + rate limit en login/register
- Cron interno con `CRON_SECRET`
- Rol `ADMIN` solo en rutas admin explícitas; el resto es multi-tenant por usuario

## Notas

- Logs en `logs/` (gitignored)
- En `NODE_ENV=test` no se hace `listen` ni se arranca el cron
- Recurrentes crean transacciones; no actualizan saldo de cuenta (el modelo recurrente no tiene `cuentaId`)
