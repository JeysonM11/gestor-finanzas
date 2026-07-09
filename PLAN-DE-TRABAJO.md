# Plan de trabajo — Gestor de Finanzas

Plan para cerrar el proyecto a partir de la auditoría completa. Objetivo: dejar el sistema **usable, consistente y seguro** para uso real con múltiples usuarios.

---

## Estado actual (resumen)

| Área | Estado |
|------|--------|
| Auth (login / register / me) | Funcional |
| Transacciones | Parcial (IDOR, sin sync de saldos) |
| Cuentas | Parcial (enums/payload rotos, sin DELETE) |
| Inversiones | Parcial (campos desalineados, sin update/delete) |
| Deudas | Roto (sin POST, parsing incorrecto, campos distintos) |
| Recurrentes | Parcial (sin CRUD completo, ejecución global) |
| Notificaciones | Parcial (filtros/campos/DELETE) |
| Gamificación | Roto (endpoints y contrato distintos) |
| Reportes | Parcial (agregación en cliente, sin rutas backend) |
| Configuración | Simulado (TODOs, sin persistencia) |
| Metas / Presupuestos / Recordatorios | Solo en schema, sin API ni UI |

---

## Principios del plan

1. **Seguridad primero** — no avanzar features nuevas con IDOR o fugas de datos.
2. **Un contrato por módulo** — frontend, backend y Prisma deben usar los mismos nombres y enums.
3. **CRUD completo o UI limitada** — no dejar botones que llamen a endpoints inexistentes.
4. **Sin simulaciones** — si no está implementado, no mostrar éxito falso.
5. **Tests mínimos** en cada sprint crítico/alto.

---

## Sprint 0 — Preparación (0.5–1 día)

- [x] Crear rama `fix/auditoria-cierre` desde `main`.
- [x] Unificar puerto por defecto del backend a **5000** (alineado con `.env.example` y proxy Vite).
- [x] Crear singleton de Prisma (`backend/lib/prisma.js`) y migrar controladores.
- [x] Definir documento de contratos API (nombres de campos y enums por módulo) → [`docs/CONTRATOS-API.md`](docs/CONTRATOS-API.md).
- [x] Rehabilitar `notFoundHandler` en `app.js`.
- [x] Quitar logs de JWT/token en `auth.middleware.js`.

**Criterio de salida:** entorno estable, Prisma centralizado, sin tokens en consola.

---

## Sprint 1 — Críticos de seguridad y roturas (3–5 días)

### 1.1 Autorización (IDOR y alcance)

| ID | Tarea | Archivos clave |
|----|--------|----------------|
| C1 | Filtrar por `userId` en get/update/delete de transacciones | `transaccion.controller.js` |
| C2 | Filtrar ejecución de recurrentes por `req.user.id` | `transacciones-recurrentes.controller.js` |
| C3 | Forzar `userId = req.user.id` al crear notificaciones | mismo controlador |

- [x] Ownership en get/update/delete de transacciones.
- [x] Ejecutar recurrentes solo del usuario autenticado.
- [x] Crear notificaciones solo para `req.user.id`.
- [x] Tests unitarios de mappers (aliases UI ↔ Prisma).
- [ ] Tests de integración ownership (requiere DB) — pendiente Sprint 4 / CI.

### 1.2 Deudas (módulo roto)

| ID | Tarea |
|----|--------|
| C4 | Corregir parsing en `Deudas.jsx` → `response.deudas` |
| C5 | Implementar `POST /api/finanzas/deudas` |
| A4 | Unificar campos: `montoInicial` / `montoActual` (o DTO claro) |
| — | Añadir `PUT` y `DELETE` de deudas, o quitar botones hasta tenerlos |
| — | Alinear enums (`PRESTAMO_PERSONAL`, `OTRO`, etc.) |

- [x] Parsing `response.deudas`.
- [x] `POST` / `PUT` / `DELETE` deudas.
- [x] DTO con `montoTotal` / `montoPagado` + mapeo de enums.

### 1.3 Cuentas (payload y enums)

| ID | Tarea |
|----|--------|
| C6 | Unificar body de saldo: `nuevoSaldo` ↔ `saldoActual` |
| C7 | Mapear enums UI ↔ Prisma (`BANCO_AHORROS`, etc.) y campo `tipo` |
| — | Implementar `DELETE /cuentas/:id` o deshabilitar botón |

- [x] Aceptar `nuevoSaldo` o `saldoActual`; frontend envía `nuevoSaldo`.
- [x] Mapear `tipo` / aliases UI; UI usa enums Prisma.
- [x] `DELETE /cuentas/:id` (soft-delete `activa: false`).

### 1.4 Seguridad básica

| ID | Tarea |
|----|--------|
| C8 | Eliminar `console.log` de Authorization / token / decoded |
| — | Restringir CORS a origen del frontend en producción |
| — | Validar que `JWT_SECRET` sea obligatorio al arrancar |

- [x] C8 hecho en Sprint 0.
- [x] CORS restringido cuando `NODE_ENV=production`.
- [x] Fail-fast si falta `JWT_SECRET`.

**Criterio de salida:** no hay IDOR obvio; deudas y cuentas se pueden crear/listar sin 404 ni `NaN`; tokens no aparecen en logs.

---

## Sprint 2 — Contratos API y CRUD faltante (5–7 días)

### 2.1 Inversiones

- [x] Mapear `montoInvertido` / `valorActual` / `cantidad` ↔ UI.
- [x] Alinear enums (`FONDOS_MUTUOS`, `OTRO`).
- [x] Implementar `PUT` y `DELETE` `/finanzas/inversiones/:id`.
- [x] Corregir cálculos de rendimiento en `Inversiones.jsx`.

### 2.2 Recurrentes

- [x] `PUT /sistema/recurrentes/:id`
- [x] `DELETE /sistema/recurrentes/:id`
- [x] `PUT /sistema/recurrentes/:id/toggle` (o incluir `activa` en update)
- [ ] Validación Joi del body de creación/edición (opcional; validación manual activa)

### 2.3 Notificaciones

- [x] Usar `fechaEnvio` (o alias en respuesta) en UI.
- [x] Unificar filtro: `soloNoLeidas=true` vs `leida=false`.
- [x] Alinear tipos (`INFO`, `ALERTA`, …) con el enum Prisma.
- [x] Implementar `DELETE /sistema/notificaciones/:id`.
- [x] Enlace a Notificaciones en el Sidebar.

### 2.4 Gamificación

- [x] Adaptar frontend al contrato real + `GET /logros/resumen` y `/historial`.
- [x] Completar `verificarLogros` (más de “Primera Transacción”).
- [x] Actualizar `puntosAcumulados` y `nivel` en `User`.
- [x] Evitar división por cero si no hay logros.

### 2.5 Configuración (dejar de simular)

- [x] `PUT /api/auth/profile` + `updateProfileSchema`
- [x] `PUT /api/auth/change-password`
- [x] `PUT /api/auth/preferences` (persistir en `User.configuracion` / `monedaPrincipal`)
- [x] Ocultar/deshabilitar exportar y eliminar cuenta hasta Sprint 3

### 2.6 Login UX

- [x] Mostrar `message` del backend en `Login.jsx` (igual que Register).

**Criterio de salida:** cada botón de la UI llama a un endpoint existente; no hay mensajes de éxito falsos en Configuración; gamificación muestra datos reales.

---

## Sprint 3 — Consistencia financiera y reportes (4–6 días)

### 3.1 Sincronización de saldos

- [x] Al crear/editar/eliminar transacción, actualizar `saldoActual` de la cuenta en una `$transaction` de Prisma.
- [x] Validar que la cuenta pertenece al usuario.
- [x] Definir reglas para `TRANSFERENCIA` (origen/destino).
- [x] Tests unitarios de deltas de saldo.

### 3.2 Resumen y agregaciones

- [x] Resumen de listado de transacciones con `aggregate` sobre el `where` completo (no solo la página).
- [x] Endpoint(s) de reportes en backend (`/api/reportes`).
- [x] Corregir enums en reportes/categorías (`INGRESO` / `GASTO`).
- [x] Subir límite de paginación / endpoint de agregación dedicado.
- [x] Conectar “Exportar datos” de Configuración a CSV real.

### 3.3 Categorías

- [x] Montar rutas `/api/categorias` (listado + CRUD personalizadas + estadísticas).
- [ ] Consumo completo en modales (listas hardcodeadas aún válidas; API lista).

### 3.4 Validaciones

- [x] Unificar `metodoPago` (validator + frontend) con enum Prisma.
- [x] Joi en cuentas, inversiones, deudas y recurrentes.

**Criterio de salida:** saldos coherentes con transacciones; reportes correctos desde API; validaciones homogéneas.

---

## Sprint 4 — Automatización, calidad y deuda media (4–5 días)

### 4.1 Recurrentes automáticas

- [ ] Job con `node-cron` (o worker) que ejecute pendientes sin depender del botón del usuario.
- [ ] Endpoint interno protegido o solo cron; el botón UI puede quedar como “forzar ahora”.

### 4.2 Tests y CI

- [ ] Crear `backend/tests/` (auth, ownership, saldos, recurrentes).
- [ ] Asegurar que `npm test` pase.
- [ ] (Opcional) GitHub Action básica: install + test + lint.

### 4.3 Errores y logging

- [ ] Estandarizar controladores con `catchAsync` + `AppError`.
- [ ] Reducir `console.error` a favor de Winston.
- [ ] Toasts o mensajes de error visibles en frontend (no solo `console.error`).

### 4.4 Seguridad adicional

- [ ] Rate limiting en `/auth/login` y `/auth/register`.
- [ ] `helmet` en Express.
- [ ] Evaluar refresh tokens / revocación con `SesionUsuario` (si se prioriza).

### 4.5 Roles

- [ ] Usar `requireRole('ADMIN')` en rutas admin, o documentar que el rol es solo informativo.

**Criterio de salida:** tests verdes; recurrentes se ejecutan solas; errores consistentes.

---

## Sprint 5 — Features del schema aún no implementadas (opcional / backlog)

Priorizar solo lo que aporte valor de producto. El resto se puede **eliminar del schema** para reducir deuda.

| Módulo | Esfuerzo estimado | Notas |
|--------|-------------------|--------|
| Metas de ahorro | Medio | Modelo `Meta` ya existe |
| Presupuestos + alertas | Medio-Alto | Modelo `Presupuesto` + notificaciones |
| Recordatorios | Medio | Modelo `Recordatorio` |
| Categorías personalizadas | Bajo-Medio | Modelo `CategoriaPersonalizada` |
| Sesiones / auditoría en BD | Medio | `SesionUsuario`, `AuditoriaAcceso` |
| Verificación de email | Medio | Campo `emailVerificado` |

**Decisión recomendada:** implementar Metas + Presupuestos en una fase 2 de producto; el resto solo si hay demanda.

---

## Sprint 6 — Limpieza y documentación (1–2 días)

### Código muerto a eliminar o conectar

- [ ] `frontend/src/services/categoria.service.js` (si no se montan rutas)
- [ ] `frontend/src/hooks/useFetch.js`
- [ ] `frontend/src/utils/constants.js` / `format.js` (usar o borrar; `format.js` importa `dayjs` sin import)
- [ ] Dependencia `clsx` si no se usa
- [ ] Controladores sin rutas (`categoria`, `reporte`) — montar o borrar
- [ ] Encoding corrupto en comentarios de recurrentes

### Documentación

- [ ] Actualizar `README.md` con estado real por módulo (quitar “análisis predictivo” si no existe).
- [ ] Crear o restaurar `backend/README.md` (endpoints, env, seed).
- [ ] Documentar enums y contratos de campos.
- [ ] Checklist de despliegue (PostgreSQL, migrate, seed, `JWT_SECRET`, CORS).

### UX menor

- [ ] Página 404 en lugar de redirigir `*` a dashboard.
- [ ] Botón “Buscar” en Transacciones: implementar o quitar.
- [ ] Unificar props de `ConfirmDialog` (`type` vs `variant`).

**Criterio de salida:** repo limpio, README honesto, sin archivos huérfanos evidentes.

---

## Orden de ejecución recomendado

```mermaid
flowchart LR
  S0[Sprint 0 Prep] --> S1[Sprint 1 Seguridad]
  S1 --> S2[Sprint 2 CRUD y contratos]
  S2 --> S3[Sprint 3 Saldos y reportes]
  S3 --> S4[Sprint 4 Calidad]
  S4 --> S5[Sprint 5 Features opcionales]
  S4 --> S6[Sprint 6 Limpieza]
```

---

## Definición de “proyecto terminado” (MVP cerrado)

El proyecto se considera **terminado para MVP** cuando:

1. Un usuario solo puede ver y modificar **sus** datos.
2. Funcionan de punta a punta: **Auth, Transacciones, Cuentas, Inversiones, Deudas, Recurrentes, Notificaciones, Reportes básicos, Configuración real**.
3. Saldos de cuentas y transacciones están **sincronizados**.
4. No hay botones que llamen a APIs inexistentes ni éxitos simulados.
5. Enums y nombres de campos coinciden entre UI, API y BD.
6. Hay **tests mínimos** de auth y ownership.
7. README refleja lo que realmente existe.

Gamificación puede quedar en “v1 básica” (listar logros + un par de reglas). Metas/Presupuestos pueden quedar fuera del MVP.

---

## Estimación global

| Sprint | Duración orientativa |
|--------|----------------------|
| 0 Preparación | 0.5–1 día |
| 1 Críticos | 3–5 días |
| 2 Contratos / CRUD | 5–7 días |
| 3 Saldos / reportes | 4–6 días |
| 4 Calidad | 4–5 días |
| 5 Opcional | variable |
| 6 Limpieza | 1–2 días |
| **Total MVP (0–4 + 6)** | **~18–26 días hábiles** |

---

## Cómo usar este plan

1. Trabajar **un sprint a la vez**; no mezclar features opcionales con seguridad.
2. Marcar checkboxes al completar.
3. Cada PR debería referenciar IDs de hallazgo (`C1`, `A5`, etc.) cuando aplique.
4. No marcar un módulo como “listo” hasta que create / read / update / delete (o la UI equivalente) funcionen contra el backend real.

---

## Referencia rápida de hallazgos

| Prioridad | IDs | Enfoque |
|-----------|-----|---------|
| Críticos | C1–C8 | Seguridad + roturas que impiden usar módulos |
| Altos | A1–A14 | Contratos, endpoints faltantes, datos incorrectos |
| Medios | M1–M14 | Deuda técnica, tests, sync, docs |
| Bajos | B1–B10 | Limpieza, dead code, UX menor |

Detalle completo de cada hallazgo: informe de auditoría de la sesión de revisión del proyecto.
