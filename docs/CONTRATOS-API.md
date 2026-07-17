# Contratos API — Gestor de Finanzas

Documento de referencia para alinear **frontend**, **backend** y **Prisma**.  
Fuente de verdad de nombres de campos y enums: `backend/prisma/schema.prisma`.

> Estado: contratos vigentes al cierre de **v1.4** (estabilización + unificación). Fuente de verdad: Prisma + este documento + [`docs/openapi.yaml`](openapi.yaml).

---

## Convenciones generales


| Tema           | Contrato                                                         |
| -------------- | ---------------------------------------------------------------- |
| Prefijo API    | `/api`                                                           |
| Auth           | Header `Authorization: Bearer <token>`                           |
| IDs            | Enteros (`Int`)                                                  |
| Fechas         | ISO 8601 en JSON; Prisma `DateTime`                              |
| Montos         | `Float` / número JSON (sin strings)                              |
| Enums          | Siempre **MAYÚSCULAS** como en Prisma (`INGRESO`, no `ingreso`)  |
| Errores        | `{ success: false, message, code?, errors? }`                    |
| Éxito listados | Preferir `{ recursoPlural, resumen? }` (ej. `cuentas`, `deudas`) |


---



## Moneda (Sprint C / v1.2)

Reglas de producto:

1. La UI formatea montos con `user.monedaPrincipal` por defecto (`useCurrency` → `formatMoney` en `frontend/src/utils/currency.js`).
2. Si una **cuenta** tiene `moneda` distinta, se muestra el código de esa moneda en esa fila/opción (sin conversión automática).
3. Export CSV (`GET /api/reportes/export`) incluye columna `Moneda` y cabecera `# moneda_preferencia=XXX`. Por fila: `monedaOriginal` si existe y difiere; si no, `monedaPrincipal`.
4. v1.2 **no** incluye tasas de cambio en vivo.

**Fallback:** código vacío o inválido → `USD` (`resolveCurrencyCode` / `MONEDA_DEFAULT`).  
**Display:** `Intl` con `currencyDisplay: 'code'` (ej. `COP 10.000`) para no confundir símbolos `$`.

Códigos de catálogo UI: `USD`, `EUR`, `MXN`, `COP`, `ARS`, `PEN`, `CLP`, `BOB`.

---



## Auth — `/api/auth`


| Método | Ruta               | Estado                         |
| ------ | ------------------ | ------------------------------ |
| POST   | `/register`        | ✅ access + refresh cookie      |
| POST   | `/login`           | ✅ access + refresh cookie      |
| POST   | `/refresh`         | ✅ rota refresh (v1.4)          |
| GET    | `/me`              | ✅                              |
| PUT    | `/profile`         | ✅ + auditoría                  |
| PUT    | `/change-password` | ✅ revoca otras sesiones        |
| PUT    | `/preferences`     | ✅                              |
| DELETE | `/account`         | ✅ borrado lógico + password    |
| GET    | `/sessions`        | ✅ listar sesiones activas      |
| DELETE | `/sessions/:id`    | ✅ cerrar sesión (ownership)    |
| DELETE | `/sessions/others` | ✅ cerrar todas menos la actual |
| POST   | `/logout`          | ✅ cerrar sesión actual         |




### JWT y sesiones (v1.4)

- Login/register crean `SesionUsuario` con access JWT corto (`type=access`, `sid`) + refresh opaco hasheado.
- Access TTL: `JWT_ACCESS_TTL_SECONDS` (default 900). Refresh TTL: `REFRESH_TOKEN_TTL_DAYS` (default 30).
- Refresh en cookie HttpOnly (`gf_refresh`); `POST /auth/refresh` rota el refresh (replay → revoke). Sin cookie → `204` (sin sesión).
- `authMiddleware` **rechaza** tokens sin `sid` (`code: LEGACY_TOKEN`) — re-login obligatorio.
- Access expirado: `code: ACCESS_TOKEN_EXPIRED` (el frontend renueva una vez).
- TTL de sesión = vida del refresh; el hash del access actual vive en `SesionUsuario.token`.

**DTO sesión (GET** `/sessions`**):** `id`, `dispositivo`, `ip`, `activa`, `createdAt`, `fechaExpiracion`, `actual` (boolean).

**User (respuesta pública):** `id`, `name`, `email`, `rol`, `telefono`, `ocupacion`, `salarioMensual`, `monedaPrincipal`, `puntosAcumulados`, `nivel`, …

---



## Transacciones — `/api/transacciones`


| Campo Prisma                         | Usar en API / UI                      |
| ------------------------------------ | ------------------------------------- |
| `tipo`                               | `INGRESO` | `GASTO` | `TRANSFERENCIA` |
| `monto`                              | number > 0                            |
| `metodoPago`                         | Ver enum abajo                        |
| `cuentaOrigenId` / `cuentaDestinoId` | number | null                         |




### MetodoPago (Prisma)

`EFECTIVO` | `TARJETA_DEBITO` | `TARJETA_CREDITO` | `TRANSFERENCIA` | `CHEQUE` | `CRYPTO` | `OTRO`

> Alineado: UI y validator usan el enum Prisma (sin `DIGITAL`).

---



## Cuentas — `/api/finanzas/cuentas`


| Campo Prisma   | No usar      |
| -------------- | ------------ |
| `tipo`         | `tipoCuenta` |
| `saldoActual`  | —            |
| `saldoInicial` | —            |




### TipoCuenta (Prisma)

`EFECTIVO` | `BANCO_CORRIENTE` | `BANCO_AHORROS` | `TARJETA_CREDITO` | `TARJETA_DEBITO` | `INVERSION` | `CRYPTO` | `OTRO`

> **Desalineado hoy:** UI envía `AHORRO`, `CORRIENTE`, `CREDITO`. Mapear en Sprint 1.



### Actualizar saldo


| Contrato acordado (Sprint 1) | Body                                          |
| ---------------------------- | --------------------------------------------- |
| `PUT /cuentas/:id/saldo`     | `{ "nuevoSaldo": number, "motivo"?: string }` |


> Frontend hoy envía `saldoActual` → alinear a `nuevoSaldo`.

---



## Inversiones — `/api/finanzas/inversiones`


| Campo Prisma     | No usar (UI actual) |
| ---------------- | ------------------- |
| `montoInvertido` | `montoInicial`      |
| `valorActual`    | `montoActual`       |
| `cantidad`       | `cantidadUnidades`  |




### TipoInversion (Prisma)

`ACCIONES` | `BONOS` | `FONDOS_MUTUOS` | `ETF` | `CRIPTOMONEDAS` | `BIENES_RAICES` | `COMMODITIES` | `OTRO`

> UI usa `FONDOS` / `OTROS` → mapear a `FONDOS_MUTUOS` / `OTRO`.

---



## Deudas — `/api/finanzas/deudas`


| Campo Prisma           | No usar (UI actual)                               |
| ---------------------- | ------------------------------------------------- |
| `montoInicial`         | `montoTotal`                                      |
| `montoActual`          | `montoPagado` (pagado = totalConInteres − actual) |
| `acreedor`             | required en schema                                |
| `plazoMeses`           | opcional; plazo en meses                          |
| `tasaInteres` / `tasa` | porcentaje (ej. 15 = 15%)                         |
| `tipoTasa`             | `MENSUAL` o `ANUAL` (default efectivo: MENSUAL)   |


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


| Ruta                     | Estado                                                      |
| ------------------------ | ----------------------------------------------------------- |
| GET/POST `/`             | ✅                                                           |
| PUT/DELETE `/:id`        | ✅                                                           |
| PUT `/:id/toggle`        | ✅                                                           |
| POST `/ejecutar`         | ✅ (usuario: solo sus pendientes; UI = “Forzar ahora”)       |
| POST `/ejecutar-interno` | ✅ (header `X-Cron-Secret`; global; también job `node-cron`) |


> Cron: cada hora (`CRON_RECURRENTES_SCHEDULE`, default `0 * * * *`). Desactivar con `CRON_RECURRENTES=false`.

---



## Roles

El JWT incluye `rol` (`ADMIN` | `USUARIO`). `requireRole('ADMIN')` se usa en rutas admin (ej. `GET /api/sistema/admin/health`). El resto de la API es por ownership (`userId`), no por rol.

---



## Notificaciones — `/api/sistema/notificaciones`


| Campo Prisma | No usar     |
| ------------ | ----------- |
| `fechaEnvio` | `createdAt` |
| `fechaLeida` | —           |




### TipoNotificacion

`INFO` | `ALERTA` | `RECORDATORIO` | `LOGRO` | `SISTEMA` | `PROMOCION`

### Query listado

`?soloNoLeidas=true` | `limit` | `offset`

> Query: `?soloNoLeidas=true` | `?leida=true|false` | `limit` | `offset`

---



## Recordatorios — `/api/sistema/recordatorios`

Modelo Prisma: `Recordatorio` (`titulo`, `descripcion?`, `tipo`, `fechaRecordatorio`, `repetir`, `frecuencia?`, `completado`, `activo`, `notificacionEnviada`, `userId`, `deudaId?`, `metaId?`).

Vínculos opcionales (v1.2 B.3): `deudaId` y `metaId` asocian el recordatorio a una deuda o meta (`onDelete: SetNull`). El listado con filtro `tipo=DEUDA` / `tipo=META` los expone para los atajos "Recordarme" de la UI.

### TipoRecordatorio

`PAGO` | `META` | `PRESUPUESTO` | `INVERSION` | `DEUDA` | `GENERAL`

### Frecuencia (si `repetir`)

`DIARIA` | `SEMANAL` | `MENSUAL`

### Endpoints (JWT salvo interno)


| Método | Ruta                | Notas                                                                                        |
| ------ | ------------------- | -------------------------------------------------------------------------------------------- |
| GET    | `/`                 | Query: `soloPendientes`, `fechaInicio`, `fechaFin`, `tipo`. Solo `activo: true` del usuario. |
| GET    | `/:id`              | Ownership.                                                                                   |
| POST   | `/`                 | Body: `{ titulo, fechaRecordatorio, tipo?, descripcion?, repetir?, frecuencia?, activo? }`.  |
| PUT    | `/:id`              | Body parcial. Cambiar fecha resetea `notificacionEnviada`.                                   |
| PUT    | `/:id/completar`    | `completado: true`.                                                                          |
| PUT    | `/:id/reactivar`    | `completado: false`, `activo: true`, resetea notificación.                                   |
| DELETE | `/:id`              | Soft-delete (`activo: false`).                                                               |
| POST   | `/ejecutar`         | Fuerza notificación de vencidos del usuario.                                                 |
| POST   | `/ejecutar-interno` | Cron global; header `X-Cron-Secret`.                                                         |




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


| Ruta                     | Estado         |
| ------------------------ | -------------- |
| GET `/logros`            | ✅              |
| POST `/logros/verificar` | ✅ (incompleto) |
| GET `/logros/resumen`    | ❌ Sprint 2     |
| GET `/logros/historial`  | ❌ Sprint 2     |


---



## Reportes


| Recurso                                      | Estado                                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/api/reportes` (mensual, agregados, export) | ✅                                                                                                   |
| Frontend reportes                            | Usa `/reportes/agregados`; breakdown por categoría de transacciones (incluye personalizadas usadas) |


Enums en agregaciones: siempre `INGRESO` / `GASTO` (nunca minúsculas).

---



## Categorías — `/api/categorias`

Modelo Prisma: `CategoriaPersonalizada` (`nombre`, `tipo` `INGRESO|GASTO`, `color`, `icono`, `descripcion`, `activa`, `orden`, `userId`).  
Las transacciones / presupuestos / recurrentes / metas guardan `categoria` como **string** (sin FK).

### Predefinidas (catálogo del servidor)

Lista canónica en `backend/utils/categorias.js` (con acentos), unida al listado GET.  
Tipos: `INGRESO` | `GASTO` | `AMBOS` (solo predefinidas; personalizadas solo `INGRESO`|`GASTO`).

### Endpoints (todos con JWT)


| Método | Ruta            | Notas                                                                                                                               |
| ------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`             | Catálogo: personalizadas activas + usadas en transacciones + predefinidas. Query `soloPersonalizadas=true` → solo CRUD del usuario. |
| GET    | `/estadisticas` | Query opcional `fechaInicio` + `fechaFin` (juntos). Agrega ingresos/gastos por categoría.                                           |
| POST   | `/`             | Body: `{ nombre, tipo, color?, icono?, descripcion? }`. 409 si nombre activo duplicado; reactiva si existía soft-deleted.           |
| PUT    | `/:id`          | Body parcial: `nombre?`, `tipo?`, `color?`, `icono?`, `descripcion?`, `activa?`. Ownership por `userId`.                            |
| DELETE | `/:id`          | **Soft-delete** (`activa: false`). Históricos por string no se modifican.                                                           |


Ítem de catálogo (GET `/`):


| Campo                  | Notas                                           |
| ---------------------- | ----------------------------------------------- |
| `nombre`               | string                                          |
| `origen`               | `personalizada` | `transaccion` | `predefinida` |
| `tipo`                 | presente en personalizada/predefinida           |
| `id`, `color`, `icono` | solo personalizada                              |
| `count`, `total`       | uso en transacciones del usuario                |


Frontend: Configuración → pestaña Categorías (CRUD); modales de transacciones/presupuestos/recurrentes usan API con fallback a `CATEGORIAS_DEFAULT`.

---



## Metas — `/api/finanzas/metas`

Campos: `titulo`, `descripcion`, `tipo` (`AHORRO|GASTO|INVERSION|DEUDA|EMERGENCIA`), `montoObjetivo`, `montoActual`, `fechaLimite`, `categoria`, `prioridad`, `progreso`, `completada`.


| Ruta                  | Estado        |
| --------------------- | ------------- |
| GET/POST `/`          | ✅             |
| GET/PUT/DELETE `/:id` | ✅             |
| POST `/:id/aportar`   | ✅ `{ monto }` |


---



## Presupuestos — `/api/finanzas/presupuestos`

Campos: `categoria`, `tipo` (`INGRESO|GASTO`, default `GASTO`), `limite`, `gastado` (monto real sincronizado), `mes`, `año` (API también acepta `anio`), `alertaEn`, `activo`.

DTO: `anio`, `montoReal`, `porcentajeUsado`, `restante`, `excedido` (gasto), `cumplido` (ingreso).

El resumen de GET incluye `ingresoEsperado`, `ingresosReales`, `egresosReales`, `saldoDisponible`, `saldoPlanificado`, además de los totales históricos de límites de gasto.


| Ruta                | Estado |
| ------------------- | ------ |
| GET `?mes=&anio=`   | ✅      |
| POST `/`            | ✅      |
| PUT/DELETE `/:id`   | ✅      |
| POST `/sincronizar` | ✅      |


Al crear/editar/eliminar un `INGRESO` o `GASTO`, se sincroniza el monto real de su presupuesto. Solo los límites de gasto emiten notificación `ALERTA`.

---



## Asesor IA — `/api/finanzas/asesor` (v1.3)

Modelo Prisma: `AsesorPlan` (`estrategia` `AVALANCHE|SNOWBALL`, `resumen`, `snapshotJson`, `planJson`, `generadoPorIA`, `userId`).

Principio: **el backend calcula los números** (motor en `backend/services/asesor-deudas.service.js`); Gemini solo redacta diagnóstico/tips sobre un snapshot **agregado y anonimizado** (deudas como `D1..Dn`; sin PII, acreedores, notas ni transacciones crudas).

Fuente de ingresos: con ingresos registrados en al menos dos meses, el snapshot usa el promedio real; con historial insuficiente, usa la suma de presupuestos `INGRESO` del mes como respaldo y expone `fuenteIngresos` para que el cálculo sea auditable.

### Endpoints (todos con JWT)


| Método | Ruta          | Notas                                                                                                                                         |
| ------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/generar`    | Body: `{ estrategia?, presupuestoExtra? }`. Rate limit por usuario (`ASESOR_RATE_LIMIT_MAX`/hora). 400 `SIN_DEUDAS` si no hay deudas activas. |
| GET    | `/planes`     | Historial: `{ planes: [{ id, estrategia, resumen, generadoPorIA, createdAt }] }`.                                                             |
| GET    | `/planes/:id` | Detalle con ownership (404 si no es del usuario).                                                                                             |
| GET    | `/ultimo`     | `{ plan: PlanDto | null, iaDisponible }`.                                                                                                     |


PlanDto: `id`, `estrategia`, `resumen`, `generadoPorIA`, `snapshot`, `plan` (`diagnostico`, `tips`, `pasos`, `motivacion`, `pagos` = plan numérico, `presupuestoExtraUsado`), `createdAt`, `disclaimer`.

Fallback: sin `GEMINI_API_KEY` o error del proveedor → plan numérico + tips de plantilla, `generadoPorIA: false` (nunca éxito simulado de IA).

Env: `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-flash-latest`), `GEMINI_FALLBACK_MODEL` (default `gemini-flash-lite-latest`; se intenta si el modelo principal falla, p. ej. 503 por alta demanda), `GEMINI_TIMEOUT_MS`, `ASESOR_RATE_LIMIT_MAX`.

---



## Checklist de alineación (por sprint)

- [x] **Sprint 0:** este documento creado
- [x] **Sprint 1:** cuentas (tipo + saldo), deudas (campos + POST), ownership
- [x] **Sprint 2:** inversiones, recurrentes CRUD, notificaciones, gamificación, config
- [x] **Sprint 3:** reportes montados, categorías, metodoPago unificado
- [x] **Sprint 4:** cron recurrentes, helmet/rate-limit, catchAsync, CI, toasts
- [x] **Sprint 5:** metas + presupuestos (API + UI + alertas)
- [x] **Sprint 6:** limpieza, README honesto, 404, búsqueda transacciones
- [x] **v1.2 A–E:** categorías end-to-end, recordatorios, moneda, sesiones, CI integración
- [ ] **v1.3:** asesor IA (contrato arriba)

---



## Mapa rápido frontend → Prisma


| Módulo             | UI (incorrecto / actual) | Prisma (correcto)         |
| ------------------ | ------------------------ | ------------------------- |
| Cuenta tipo        | `AHORRO`                 | `BANCO_AHORROS`           |
| Cuenta tipo        | `CORRIENTE`              | `BANCO_CORRIENTE`         |
| Cuenta tipo        | `CREDITO`                | `TARJETA_CREDITO`         |
| Cuenta campo       | `tipoCuenta`             | `tipo`                    |
| Saldo update       | `saldoActual`            | `nuevoSaldo`              |
| Inversión          | `montoInicial`           | `montoInvertido`          |
| Inversión          | `montoActual`            | `valorActual`             |
| Deuda              | `montoTotal`             | `montoInicial`            |
| Deuda              | `montoPagado`            | calcular o exponer en DTO |
| Notificación fecha | `createdAt`              | `fechaEnvio`              |
| Método pago        | `DIGITAL`                | `OTRO` o ampliar enum     |


