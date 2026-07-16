# Plan v1.3 — Asesor IA de deudas

> **Estado: ACTIVO.**  
> Tema: ayudar al usuario a **salir de deudas** con diagnóstico, tips y plan de pagos.  
> Base: [`PLAN-1.2.md`](PLAN-1.2.md) (cerrada) · [`docs/CONTRATOS-API.md`](docs/CONTRATOS-API.md) · `backend/prisma/schema.prisma`

---

## Principio de diseño (crítico)

**El backend calcula los números; Gemini solo explica y prioriza.**

- El motor de deudas (avalanche / snowball) genera el plan numérico de forma determinista.
- Gemini recibe el snapshot agregado + el plan calculado y devuelve diagnóstico y tips en JSON estructurado (`responseJsonSchema`).
- La respuesta del modelo se valida con Joi antes de persistir. Gemini nunca escribe en Prisma directamente.
- Si no hay `GEMINI_API_KEY` o el proveedor falla → fallback con plan numérico + tips de plantilla. **Sin éxito simulado.**

## Privacidad y minimización de datos

Nunca se envía a Gemini:

- PII: nombre, email, teléfono, fecha de nacimiento, ocupación
- Credenciales: tokens, sesiones, IP, user-agent
- Identificadores: `userId`, IDs internos, números de cuenta, banco, acreedor
- Texto libre: descripciones, notas, ubicaciones, etiquetas (riesgo de PII y prompt injection)
- Transacciones individuales

Solo se envían agregados: moneda principal, flujo mensual (ingresos/gastos), deudas anonimizadas (`D1`, `D2`… con saldo, tasa, pago mínimo, meses a vencimiento), liquidez por tipo de cuenta, % de presupuestos/metas y el plan numérico calculado. Montos redondeados.

## En scope v1.3

- [ ] Modelo `AsesorPlan` (historial de planes por usuario) + migración
- [ ] Snapshot financiero agregado y anonimizado (`asesor-snapshot.service.js`)
- [ ] Motor de plan de pagos avalanche/snowball (`asesor-deudas.service.js`)
- [ ] Cliente Gemini (`@google/genai`) con salida JSON estructurada y timeout
- [ ] API `/api/finanzas/asesor/*` (generar, historial, detalle, último) con ownership
- [ ] Rate limit por usuario para generación (además del límite global por IP)
- [ ] UI: campo `pagoMinimo` en ModalDeuda, panel asesor en Deudas, página `/asesor` con historial
- [ ] Tests: motor, validación de respuesta, ownership de planes (integración)
- [ ] Contratos en `docs/CONTRATOS-API.md` + env en `.env.example`

## Fuera de scope v1.3

- Chat conversacional libre
- Ejecución automática de pagos o cualquier acción financiera autónoma
- Predicción bursátil / análisis de inversiones con IA
- Email verify / SMTP (sigue en backlog)
- Open Banking / sincronización bancaria
- Multi-FX con tasas en tiempo real

## Reglas de producto

1. La capacidad de pago extra es una **estimación editable** (`max(0, ingresos - gastos - pagoMinimoTotal)` sobre los últimos 30/90 días), nunca un dato inventado.
2. La proyección usa el modelo de interés simple ya existente (`calcularTotalConInteres`); se presenta como estimación educativa, no como amortización bancaria exacta.
3. Todo plan muestra el disclaimer: orientación educativa, no asesoría financiera profesional.
4. Generación limitada por usuario (5–10/hora) para controlar costos del proveedor.

## Criterio de salida

Un usuario con al menos una deuda activa puede generar un plan, verlo en la UI (diagnóstico + orden de pagos + tips), consultarlo después en el historial, y solo ve sus propios planes. CI en verde (unit + integración + lint/build frontend).

## Backlog heredado (no-IA)

| Ítem | Origen |
|------|--------|
| Email verify (D1) | v1.2 Sprint D |
| Refresh tokens | v1.2 backlog |
| `AuditoriaAcceso` mínima | v1.2 backlog |
| Tasa de cambio simple | v1.2 backlog |
| UI avanzada de reportes | v1.2 backlog |
| Categorías con icono/color | v1.2 backlog |
