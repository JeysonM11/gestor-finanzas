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

## Recordatorios — `/api/sistema/recordatorios`

Modelo Prisma: `Recordatorio` (`titulo`, `descripcion?`, `tipo`, `fechaRecordatorio`, `repetir`, `frecuencia?`, `completado`, `activo`, `notificacionEnviada`, `userId`).

### TipoRecordatorio

`PAGO` | `META` | `PRESUPUESTO` | `INVERSION` | `DEUDA` | `GENERAL`

### Frecuencia (si `repetir`)

`DIARIA` | `SEMANAL` | `MENSUAL`

### Endpoints (JWT salvo interno)

| Método | Ruta | Notas |
|--------|------|--------|
| GET | `/` | Query: `soloPendientes`, `fechaInicio`, `fechaFin`, `tipo`. Solo `activo: true` del usuario. |
| GET | `/:id` | Ownership. |
| POST | `/` | Body: `{ titulo, fechaRecordatorio, tipo?, descripcion?, repetir?, frecuencia?, activo? }`. |
| PUT | `/:id` | Body parcial. Cambiar fecha resetea `notificacionEnviada`. |
| PUT | `/:id/completar` | `completado: true`. |
| PUT | `/:id/reactivar` | `completado: false`, `activo: true`, resetea notificación. |
| DELETE | `/:id` | Soft-delete (`activo: false`). |
| POST | `/ejecutar` | Fuerza notificación de vencidos del usuario. |
| POST | `/ejecutar-interno` | Cron global; header `X-Cron-Secret`. |

### Cron

- Env: `CRON_RECORDATORIOS`, `CRON_RECORDATORIOS_SCHEDULE` (default `5 * * * *`).
- Al vencer: crea `Notificacion` tipo `RECORDATORIO` con `datos.recordatorioId`.
- Idempotencia: flag `notificacionEnviada`. Si `repetir`, avanza `fechaRecordatorio` y deja el flag en `false`.

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

## Reportes

| Recurso | Estado |
|---------|--------|
| `/api/reportes` (mensual, agregados, export) | ✅ |
| Frontend reportes | Usa `/reportes/agregados`; breakdown por categoría de transacciones (incluye personalizadas usadas) |

Enums en agregaciones: siempre `INGRESO` / `GASTO` (nunca minúsculas).

---

## Categorías — `/api/categorias`

Modelo Prisma: `CategoriaPersonalizada` (`nombre`, `tipo` `INGRESO|GASTO`, `color`, `icono`, `descripcion`, `activa`, `orden`, `userId`).  
Las transacciones / presupuestos / recurrentes / metas guardan `categoria` como **string** (sin FK).

### Predefinidas (catálogo del servidor)

Lista canónica en `backend/utils/categorias.js` (con acentos), unida al listado GET.  
Tipos: `INGRESO` | `GASTO` | `AMBOS` (solo predefinidas; personalizadas solo `INGRESO`|`GASTO`).

### Endpoints (todos con JWT)

| Método | Ruta | Notas |
|--------|------|--------|
| GET | `/` | Catálogo: personalizadas activas + usadas en transacciones + predefinidas. Query `soloPersonalizadas=true` → solo CRUD del usuario. |
| GET | `/estadisticas` | Query opcional `fechaInicio` + `fechaFin` (juntos). Agrega ingresos/gastos por categoría. |
| POST | `/` | Body: `{ nombre, tipo, color?, icono?, descripcion? }`. 409 si nombre activo duplicado; reactiva si existía soft-deleted. |
| PUT | `/:id` | Body parcial: `nombre?`, `tipo?`, `color?`, `icono?`, `descripcion?`, `activa?`. Ownership por `userId`. |
| DELETE | `/:id` | **Soft-delete** (`activa: false`). Históricos por string no se modifican. |

Ítem de catálogo (GET `/`):

| Campo | Notas |
|-------|--------|
| `nombre` | string |
| `origen` | `personalizada` \| `transaccion` \| `predefinida` |
| `tipo` | presente en personalizada/predefinida |
| `id`, `color`, `icono` | solo personalizada |
| `count`, `total` | uso en transacciones del usuario |

Frontend: Configuración → pestaña Categorías (CRUD); modales de transacciones/presupuestos/recurrentes usan API con fallback a `CATEGORIAS_DEFAULT`.

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
