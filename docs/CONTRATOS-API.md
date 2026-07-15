# Contratos API — Gestor de Finanzas

Documento de referencia para alinear **frontend**, **backend** y **Prisma**.  
Fuente de verdad de nombres de campos y enums: `backend/prisma/schema.prisma`.

> Estado: MVP (Sprints 0–4 + 6). Fuente de verdad: Prisma + este documento.

---

## Convenciones generales

| Tema | Contrato |
|------|----------|
| Prefijo API | `/api` |
| Auth | Header `Authorization: Bearer <token>` |
| IDs | Enteros (`Int`) |
| Fechas | ISO 8601 en JSON; Prisma `DateTime` |
| Montos | `Float` / número JSON (sin strings) |
| Enums | Siempre **MAYÚSCULAS** como en Prisma (`INGRESO`, no `ingreso`) |
| Errores | `{ success: false, message, code?, errors? }` |
| Éxito listados | Preferir `{ recursoPlural, resumen? }` (ej. `cuentas`, `deudas`) |

---

## Auth — `/api/auth`

| Método | Ruta | Estado |
|--------|------|--------|
| POST | `/register` | ✅ |
| POST | `/login` | ✅ |
| GET | `/me` | ✅ |
| PUT | `/profile` | ✅ |
| PUT | `/change-password` | ✅ |
| PUT | `/preferences` | ✅ |

**User (respuesta pública):** `id`, `name`, `email`, `rol`, `telefono`, `ocupacion`, `salarioMensual`, `monedaPrincipal`, `puntosAcumulados`, `nivel`, …

---

## Transacciones — `/api/transacciones`

| Campo Prisma | Usar en API / UI |
|--------------|------------------|
| `tipo` | `INGRESO` \| `GASTO` \| `TRANSFERENCIA` |
| `monto` | number > 0 |
| `metodoPago` | Ver enum abajo |
| `cuentaOrigenId` / `cuentaDestinoId` | number \| null |

### MetodoPago (Prisma)

`EFECTIVO` | `TARJETA_DEBITO` | `TARJETA_CREDITO` | `TRANSFERENCIA` | `CHEQUE` | `CRYPTO` | `OTRO`

> Alineado: UI y validator usan el enum Prisma (sin `DIGITAL`).

---

## Cuentas — `/api/finanzas/cuentas`

| Campo Prisma | No usar |
|--------------|---------|
| `tipo` | ~~`tipoCuenta`~~ |
| `saldoActual` | — |
| `saldoInicial` | — |

### TipoCuenta (Prisma)

`EFECTIVO` | `BANCO_CORRIENTE` | `BANCO_AHORROS` | `TARJETA_CREDITO` | `TARJETA_DEBITO` | `INVERSION` | `CRYPTO` | `OTRO`

> **Desalineado hoy:** UI envía `AHORRO`, `CORRIENTE`, `CREDITO`. Mapear en Sprint 1.

### Actualizar saldo

| Contrato acordado (Sprint 1) | Body |
|------------------------------|------|
| `PUT /cuentas/:id/saldo` | `{ "nuevoSaldo": number, "motivo"?: string }` |

> Frontend hoy envía `saldoActual` → alinear a `nuevoSaldo`.

---

## Inversiones — `/api/finanzas/inversiones`

| Campo Prisma | No usar (UI actual) |
|--------------|---------------------|
| `montoInvertido` | ~~`montoInicial`~~ |
| `valorActual` | ~~`montoActual`~~ |
| `cantidad` | ~~`cantidadUnidades`~~ |

### TipoInversion (Prisma)

`ACCIONES` | `BONOS` | `FONDOS_MUTUOS` | `ETF` | `CRIPTOMONEDAS` | `BIENES_RAICES` | `COMMODITIES` | `OTRO`

> UI usa `FONDOS` / `OTROS` → mapear a `FONDOS_MUTUOS` / `OTRO`.

---

## Deudas — `/api/finanzas/deudas`

| Campo Prisma | No usar (UI actual) |
|--------------|---------------------|
| `montoInicial` | ~~`montoTotal`~~ |
| `montoActual` | ~~`montoPagado`~~ (pagado = totalConInteres − actual) |
| `acreedor` | required en schema |
| `plazoMeses` | opcional; plazo en meses |
| `tasaInteres` / `tasa` | porcentaje (ej. 15 = 15%) |
| `tipoTasa` | `MENSUAL` o `ANUAL` (default efectivo: MENSUAL) |

Interés simple:
- **Mensual:** `capital × (1 + tasa% × meses)`
- **Anual:** `capital × (1 + tasa% × meses/12)`

DTO: `montoTotal` (= capital), `montoConInteres`, `montoPagado`. Sin `plazoMeses`, el comportamiento es el anterior (sin interés).

### TipoDeuda (Prisma)

`TARJETA_CREDITO` | `PRESTAMO_PERSONAL` | `HIPOTECA` | `PRESTAMO_AUTO` | `PRESTAMO_ESTUDIANTIL` | `LINEA_CREDITO` | `OTRO`

> UI usa `PRESTAMO` / `OTROS` → mapear.

### Respuesta listado

```json
{
  "deudas": [],
  "resumen": { "totalDeuda": 0, "cantidadDeudas": 0, "...": "..." }
}
```

> Frontend debe usar `response.deudas`, no `response.data`.

### Pago

`POST /deudas/:deudaId/pagos` → `{ monto, capital?, interes?, fecha?, notas? }`

---

## Recurrentes — `/api/sistema/recurrentes`

Campos: `nombre`, `descripcion`, `tipo`, `monto`, `categoria`, `frecuencia`, `diaEjecucion`, `diaSemana`, `fechaInicio`, `fechaFin`, `proximaEjecucion`, `activa`.

### FrecuenciaRecurrencia

`DIARIA` | `SEMANAL` | `QUINCENAL` | `MENSUAL` | `BIMESTRAL` | `TRIMESTRAL` | `SEMESTRAL` | `ANUAL`

| Ruta | Estado |
|------|--------|
| GET/POST `/` | ✅ |
| PUT/DELETE `/:id` | ✅ |
| PUT `/:id/toggle` | ✅ |
| POST `/ejecutar` | ✅ (usuario: solo sus pendientes; UI = “Forzar ahora”) |
| POST `/ejecutar-interno` | ✅ (header `X-Cron-Secret`; global; también job `node-cron`) |

> Cron: cada hora (`CRON_RECURRENTES_SCHEDULE`, default `0 * * * *`). Desactivar con `CRON_RECURRENTES=false`.

---

## Roles

El JWT incluye `rol` (`ADMIN` | `USUARIO`). `requireRole('ADMIN')` se usa en rutas admin (ej. `GET /api/sistema/admin/health`). El resto de la API es por ownership (`userId`), no por rol.

---

## Notificaciones — `/api/sistema/notificaciones`

| Campo Prisma | No usar |
|--------------|---------|
| `fechaEnvio` | ~~`createdAt`~~ |
| `fechaLeida` | — |

### TipoNotificacion

`INFO` | `ALERTA` | `RECORDATORIO` | `LOGRO` | `SISTEMA` | `PROMOCION`

### Query listado

`?soloNoLeidas=true` | `limit` | `offset`

> Query: `?soloNoLeidas=true` | `?leida=true|false` | `limit` | `offset`

---

## Gamificación — `/api/finanzas/logros`

### Respuesta actual `GET /logros`

```json
{
  "logrosObtenidos": [],
  "todosLosLogros": [],
  "estadisticas": {
    "puntosTotal": 0,
    "nivel": 1,
    "logrosObtenidos": 0,
    "logrosDisponibles": 0,
    "porcentajeCompletado": 0
  }
}
```

| Ruta | Estado |
|------|--------|
| GET `/logros` | ✅ |
| POST `/logros/verificar` | ✅ (incompleto) |
| GET `/logros/resumen` | ❌ Sprint 2 |
| GET `/logros/historial` | ❌ Sprint 2 |

---

## Reportes / Categorías

| Recurso | Estado |
|---------|--------|
| `/api/reportes` (mensual, agregados, export) | ✅ |
| `/api/categorias` (CRUD + estadísticas) | ✅ |
| Frontend reportes | Usa `/reportes/agregados` |
| Frontend categorías en modales | Lista default (`constants.js`); service listo |

Enums en agregaciones: siempre `INGRESO` / `GASTO` (nunca minúsculas).

---

## Metas — `/api/finanzas/metas`

Campos: `titulo`, `descripcion`, `tipo` (`AHORRO|GASTO|INVERSION|DEUDA|EMERGENCIA`), `montoObjetivo`, `montoActual`, `fechaLimite`, `categoria`, `prioridad`, `progreso`, `completada`.

| Ruta | Estado |
|------|--------|
| GET/POST `/` | ✅ |
| GET/PUT/DELETE `/:id` | ✅ |
| POST `/:id/aportar` | ✅ `{ monto }` |

---

## Presupuestos — `/api/finanzas/presupuestos`

Campos: `categoria`, `limite`, `gastado` (calculado), `mes`, `año` (API también acepta `anio`), `alertaEn`, `activo`.

DTO: `anio`, `porcentajeUsado`, `restante`, `excedido`.

| Ruta | Estado |
|------|--------|
| GET `?mes=&anio=` | ✅ |
| POST `/` | ✅ |
| PUT/DELETE `/:id` | ✅ |
| POST `/sincronizar` | ✅ |

Al crear/editar/eliminar un `GASTO`, se recalcula `gastado` y puede emitir notificación `ALERTA`.

---

## Checklist de alineación (por sprint)

- [x] **Sprint 0:** este documento creado
- [x] **Sprint 1:** cuentas (tipo + saldo), deudas (campos + POST), ownership
- [x] **Sprint 2:** inversiones, recurrentes CRUD, notificaciones, gamificación, config
- [x] **Sprint 3:** reportes montados, categorías, metodoPago unificado
- [x] **Sprint 4:** cron recurrentes, helmet/rate-limit, catchAsync, CI, toasts
- [x] **Sprint 5:** metas + presupuestos (API + UI + alertas)
- [x] **Sprint 6:** limpieza, README honesto, 404, búsqueda transacciones

---

## Mapa rápido frontend → Prisma

| Módulo | UI (incorrecto / actual) | Prisma (correcto) |
|--------|--------------------------|-------------------|
| Cuenta tipo | `AHORRO` | `BANCO_AHORROS` |
| Cuenta tipo | `CORRIENTE` | `BANCO_CORRIENTE` |
| Cuenta tipo | `CREDITO` | `TARJETA_CREDITO` |
| Cuenta campo | `tipoCuenta` | `tipo` |
| Saldo update | `saldoActual` | `nuevoSaldo` |
| Inversión | `montoInicial` | `montoInvertido` |
| Inversión | `montoActual` | `valorActual` |
| Deuda | `montoTotal` | `montoInicial` |
| Deuda | `montoPagado` | calcular o exponer en DTO |
| Notificación fecha | `createdAt` | `fechaEnvio` |
| Método pago | `DIGITAL` | `OTRO` o ampliar enum |
