# Manual de Usuario

**Gestor de Finanzas Personales**  
Versión documentada según el código actual del proyecto (frontend React + backend Express).

---

## 1. Introducción

### Objetivo del sistema

Gestor de Finanzas es una aplicación web para registrar, organizar y analizar tus finanzas personales. Permite controlar ingresos y gastos, administrar cuentas bancarias, hacer seguimiento de deudas e inversiones, planificar presupuestos, automatizar movimientos recurrentes y consultar reportes con gráficos.

### Público objetivo

Personas que desean llevar un control ordenado de su dinero: hogares, freelancers, estudiantes o cualquier usuario que necesite registrar movimientos, revisar saldos y tomar decisiones con información clara.

### Principales funcionalidades


| Módulo         | Ruta en la app      | Qué permite                                                 |
| -------------- | ------------------- | ----------------------------------------------------------- |
| Dashboard      | `/dashboard`      | Resumen financiero, KPIs, gráficos y actividad reciente     |
| Transacciones  | `/transacciones`  | Registrar ingresos, gastos, transferencias y pagos de deuda |
| Recurrentes    | `/recurrentes`    | Automatizar ingresos/gastos periódicos                      |
| Cuentas        | `/cuentas`        | Gestionar cuentas y saldos                                  |
| Inversiones    | `/inversiones`    | Registrar y seguir inversiones                              |
| Deudas         | `/deudas`         | Controlar préstamos, pagos y asesor de deudas               |
| Asesor IA      | `/asesor`         | Ver historial de planes para pagar deudas                   |
| Metas          | `/metas`          | Objetivos de ahorro con aportes                             |
| Presupuestos   | `/presupuestos`   | Límites e ingresos esperados por mes                        |
| Reportes       | `/reportes`       | Análisis, gráficos y exportación CSV                        |
| Gamificación   | `/gamificacion`   | Niveles, logros y puntos (solo lectura)                     |
| Recordatorios  | `/recordatorios`  | Avisos programados                                          |
| Notificaciones | `/notificaciones` | Bandeja de mensajes del sistema                             |
| Configuración  | `/configuracion`  | Perfil, seguridad, preferencias y categorías                |


> **Nota:** Las rutas son directas (por ejemplo `https://tudominio.com/dashboard`). En producción, el servidor debe redirigir todas las rutas a `index.html` para que al recargar la página no aparezca un error 404.

---



## 2. Requisitos



### Navegadores compatibles

La aplicación es una web moderna (React 18). Se recomienda usar la **última versión** de:


| Navegador          | Compatibilidad |
| ------------------ | -------------- |
| Google Chrome      | Recomendado    |
| Microsoft Edge     | Compatible     |
| Mozilla Firefox    | Compatible     |
| Safari (macOS/iOS) | Compatible     |


No se documenta soporte para navegadores obsoletos (Internet Explorer u otros sin soporte de JavaScript ES6+).

### Resolución recomendada


| Dispositivo               | Experiencia                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| Escritorio (≥ 1280 px)    | Experiencia completa: menú lateral fijo, tablas y gráficos amplios |
| Tablet (768 px – 1279 px) | Menú lateral en panel deslizable; tablas adaptadas                 |
| Móvil (< 768 px)          | Menú hamburguesa; listas en formato de tarjetas                    |


La interfaz está en **español** y adaptada a pantallas pequeñas.

### Requisitos de conexión

- Conexión a **internet** activa para comunicarse con el servidor de la aplicación.
- El servicio debe estar desplegado y accesible (backend API + frontend).
- Si la sesión expira o el servidor no responde, verás mensajes de error o serás redirigido al inicio de sesión.

---



## 3. Acceso al sistema



### Inicio de sesión

1. Abre la aplicación en tu navegador.
2. Ve a **Iniciar sesión** (`/login`).
3. Ingresa tu **correo electrónico** y **contraseña**.
4. Pulsa **Iniciar sesión**.

Si las credenciales son correctas, entrarás al **Dashboard**. Si ya tenías sesión activa, la app te redirige automáticamente al panel principal.

En la pantalla de login puedes alternar entre **modo claro** y **modo oscuro** con el botón de la esquina superior derecha.

### Registro de usuario

1. Desde el login, pulsa **Regístrate aquí** o ve a `/register`.
2. Completa el formulario:


| Campo                | Obligatorio | Descripción                      |
| -------------------- | ----------- | -------------------------------- |
| Nombre               | Sí          | Tu nombre                        |
| Email                | Sí          | Correo único para la cuenta      |
| Contraseña           | Sí          | Ver requisitos abajo             |
| Confirmar contraseña | Sí          | Debe coincidir con la contraseña |


1. Pulsa **Crear cuenta**.

**Requisitos de contraseña al registrarse:**

- Mínimo 6 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número

Tras un registro exitoso, iniciarás sesión automáticamente y llegarás al Dashboard.

### Recuperación o cambio de contraseña


| Función                                  | ¿Disponible?                          |
| ---------------------------------------- | ------------------------------------- |
| Recuperar contraseña olvidada por correo | **No** — no existe en la aplicación   |
| Cambiar contraseña estando conectado     | **Sí** — en Configuración → Seguridad |


**Para cambiar tu contraseña:**

1. Ve a **Configuración** → pestaña **Seguridad**.
2. Completa: contraseña actual, nueva contraseña y confirmación.
3. Pulsa **Cambiar Contraseña**.

Los requisitos de la nueva contraseña son los mismos que al registrarse. Debes conocer tu contraseña actual; no hay flujo de “olvidé mi contraseña”.

### Cierre de sesión

1. En la barra superior (Header), pulsa el botón **Salir** (icono de puerta).
2. Serás enviado a la pantalla de login y tu sesión local se cerrará.

También puedes cerrar sesiones en otros dispositivos desde **Configuración → Seguridad → Sesiones activas**.

---



## 4. Pantalla principal (Dashboard)

Acceso: menú lateral → **Dashboard** (`/dashboard`).

### Qué información muestra

El Dashboard es tu vista general al entrar. Incluye:

- **Saludo personalizado** con tu nombre.
- **Cuatro indicadores (KPIs)** del mes en curso.
- **Dos gráficos**: tendencia mensual y gastos por categoría.
- **Actividad reciente**: últimas transacciones.
- **Acciones rápidas** hacia Transacciones, Reportes, Cuentas y Metas.
- **Widgets de resumen**: estado del sistema, notificaciones y alertas.

Si tu usuario tiene rol de administrador, verás una insignia **Administrador**.

### Cómo interpretar los indicadores


| Indicador          | Significado                                    |
| ------------------ | ---------------------------------------------- |
| **Total ingresos** | Suma de transacciones tipo Ingreso del periodo |
| **Total gastos**   | Suma de gastos y pagos de deuda                |
| **Balance**        | Ingresos − Gastos                              |
| **Movimientos**    | Cantidad total de transacciones registradas    |


Cada KPI de ingresos y gastos puede mostrar una **variación porcentual** respecto al mes anterior (flecha verde/roja). Para gastos, un aumento se muestra como tendencia negativa.

### Resumen financiero

El balance indica si en el periodo analizado ganaste o perdiste dinero según tus registros. Los montos se muestran en tu **moneda principal** configurada en Preferencias.

### Gráficas

1. **Tendencia mensual (últimos 6 meses):** área con ingresos (verde) vs gastos (rojo).
2. **Gastos por categoría:** gráfico circular (donut) con la distribución de gastos.

> **Advertencia:** Si aún no tienes datos suficientes, los gráficos muestran **datos de ejemplo** claramente etiquetados. En cuanto registres transacciones reales, se reemplazan por tu información.



### Últimos movimientos

Tabla (escritorio) o tarjetas (móvil) con las **5 transacciones más recientes**, mostrando descripción, categoría, fecha y monto con signo (+ ingreso, − gasto/pago).

Pulsa **Ver todas** para ir a la pantalla completa de Transacciones.

---



## 5. Gestión de Transacciones

Acceso: menú → **Transacciones** (`/transacciones`).

### Tipos de transacción


| Tipo              | Uso                                                          |
| ----------------- | ------------------------------------------------------------ |
| **Ingreso**       | Dinero que entra (salario, ventas, etc.)                     |
| **Gasto**         | Dinero que sale (compras, servicios, etc.)                   |
| **Transferencia** | Mover dinero entre dos cuentas propias                       |
| **Pagar deuda**   | Abonar una deuda desde una cuenta; reduce el saldo pendiente |




### Campos dinámicos según el tipo

Al cambiar el tipo en el formulario, aparecen u ocultan campos automáticamente:


| Campo                   | Ingreso          | Gasto           | Transferencia        | Pagar deuda      |
| ----------------------- | ---------------- | --------------- | -------------------- | ---------------- |
| Descripción             | Sí *             | Sí *            | No (automática)      | No (automática)  |
| Cuenta origen / destino | Cuenta destino * | Cuenta origen * | Origen * y Destino * | Cuenta de pago * |
| Método de pago          | No               | Sí              | No                   | No               |
| Categoría               | Opcional         | Opcional        | No                   | No               |
| Deuda                   | No               | No              | No                   | Sí *             |
| Notas                   | Opcional         | Opcional        | Opcional             | Opcional         |
| Fecha                   | Sí *             | Sí *            | Sí *                 | Sí *             |
| Monto                   | Sí *             | Sí *            | Sí *                 | Sí *             |


**Métodos de pago** (solo en Gastos): Efectivo, Tarjeta débito, Tarjeta crédito, Transferencia, Cheque, Crypto, Otro.

**Panel informativo en Pagar deuda:** al seleccionar una deuda, se muestra acreedor, valor total y saldo pendiente.

---



### Registrar un ingreso

1. Pulsa **Nueva Transacción**.
2. Selecciona tipo **Ingreso**.
3. Ingresa **monto** (mínimo 0,01).
4. Escribe **descripción** (obligatoria).
5. Elige **cuenta destino** (donde recibes el dinero).
6. Opcional: categoría, notas.
7. Confirma la **fecha** (no puede ser futura).
8. Pulsa **Crear Transacción**.

El saldo de la cuenta seleccionada **aumentará** automáticamente.

---



### Registrar un gasto

1. Pulsa **Nueva Transacción**.
2. Selecciona tipo **Gasto**.
3. Ingresa monto, descripción y **cuenta de origen**.
4. Opcional: método de pago, categoría, notas.
5. Confirma la fecha.
6. Pulsa **Crear Transacción**.

El saldo de la cuenta **disminuirá**.

---



### Registrar una transferencia

1. Pulsa **Nueva Transacción**.
2. Selecciona tipo **Transferencia**.
3. Elige **cuenta origen** y **cuenta destino** (deben ser distintas).
4. Ingresa monto y fecha.
5. Opcional: notas.
6. Pulsa **Crear Transacción**.

La descripción se genera como “Transferencia entre cuentas” si no indicas otra. El saldo baja en origen y sube en destino.

---



### Registrar un pago de deuda

**Opción A — Desde Transacciones (afecta cuenta y deuda):**

1. Pulsa **Nueva Transacción**.
2. Selecciona **Pagar deuda**.
3. Elige la **deuda**, la **cuenta** desde la que pagas y el **monto** (no mayor al saldo pendiente).
4. Confirma fecha y pulsa **Crear Transacción**.

**Opción B — Desde Deudas (solo actualiza la deuda):**

1. Ve a **Deudas** y pulsa **Registrar Pago** en la tarjeta de la deuda.
2. Ingresa monto y fecha.
3. Pulsa **Registrar Pago**.

> **Nota:** La opción B **no descuenta** dinero de ninguna cuenta bancaria. Si quieres que el pago también refleje el movimiento en una cuenta, usa la **Opción A** (transacción tipo Pagar deuda).

---



### Editar una transacción

1. En la lista, pulsa el icono de **lápiz** en la fila o tarjeta.
2. Modifica los campos necesarios en el modal.
3. Pulsa **Actualizar Transacción**.

Al editar, los saldos de cuentas se recalculan según los cambios.

---



### Eliminar una transacción

1. Pulsa el icono de **papelera**.
2. Confirma en el diálogo: *“¿Eliminar transacción? Esta acción no se puede deshacer.”*
3. Pulsa **Eliminar**.

Verás el mensaje **“Transacción eliminada”**.

---



### Buscar transacciones

1. En el panel de filtros, escribe en el campo **Buscar** (descripción o notas).
2. Pulsa el botón **Buscar**.

La búsqueda no se aplica automáticamente al escribir; debes pulsar Buscar.

---



### Filtrar por fecha

Usa los campos **Fecha Inicio** y **Fecha Fin**. Los resultados se actualizan al cambiar las fechas.

> La fecha fin debe ser igual o posterior a la fecha inicio (validación del servidor).

---



### Filtrar por categoría

**No disponible** en la pantalla de Transacciones en la versión actual. Puedes ver la categoría en cada fila de la lista, pero no hay un filtro dedicado por categoría. Para análisis por categoría, usa la pantalla **Reportes**.

---



### Filtrar por tipo

En el selector **Tipo**, elige:

- Todos
- Ingresos
- Gastos
- Transferencias
- Pagos de deuda

El listado se actualiza al cambiar la selección.

---



### Requisito previo: cuentas activas

> **Advertencia:** Necesitas al menos **una cuenta activa** para registrar transacciones (excepto pagos directos desde Deudas). Si no tienes cuentas, el formulario mostrará un aviso para que crees una en **Cuentas**.

---



## 6. Categorías

Las categorías organizan ingresos y gastos. Existen **categorías predefinidas** del sistema y **categorías personalizadas** que tú creas.

### Categorías predefinidas

**Gastos:** Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Educación, Servicios, Compras, Viajes, Hogar.

**Ingresos:** Salario, Freelance, Inversiones.

**Ambos tipos:** Otros.

Estas aparecen automáticamente al registrar transacciones, presupuestos y recurrentes.

### Diferencia entre categorías de ingreso y gasto


| Tipo        | Cuándo usarla                                             |
| ----------- | --------------------------------------------------------- |
| **GASTO**   | Solo en transacciones/recurrentes/presupuestos de egreso  |
| **INGRESO** | Solo en transacciones/recurrentes/presupuestos de ingreso |


Al crear o editar una categoría personalizada, debes elegir uno de estos dos tipos. Las categorias predefinidas “Otros” sirven para ambos.

### Crear categoría

1. Ve a **Configuración** → pestaña **Categorías**.
2. Pulsa **Nueva**.
3. Completa:
  - **Nombre** * (máx. 100 caracteres)
  - **Tipo** * (Gasto o Ingreso)
  - **Color** (selector visual)
  - **Descripción** (opcional, máx. 500 caracteres)
4. Pulsa **Crear**.

Mensaje de éxito: **“Categoría creada”**.

### Editar categoría

1. En la lista de categorías personalizadas, pulsa **Editar**.
2. Modifica los campos y guarda.

Mensaje de éxito: **“Categoría actualizada”**.

> Solo puedes editar categorías **personalizadas**. Las predefinidas no se modifican desde la interfaz.



### Eliminar categoría

1. Pulsa **Eliminar** (icono papelera) en la categoría personalizada.
2. Confirma la desactivación.

La categoría se **desactiva**, no se borra del historial. Las transacciones antiguas conservan el nombre registrado. Mensaje: **“Categoría desactivada”**.

---



## 7. Cuentas

Acceso: menú → **Cuentas** (`/cuentas`).

### Qué muestra la pantalla

- **Totales por moneda:** suma de saldos agrupada por cada moneda.
- **Tarjetas de cuenta:** nombre, banco, saldo, tipo y barra de color.



### Crear cuenta

1. Pulsa **Nueva Cuenta**.
2. Completa el formulario:


| Campo          | Obligatorio | Detalle                                |
| -------------- | ----------- | -------------------------------------- |
| Nombre         | Sí          | Ej.: “Cuenta principal”                |
| Tipo de cuenta | Sí          | Ver tabla abajo                        |
| Banco          | No          | Nombre de la entidad                   |
| Moneda         | Sí          | USD, EUR, MXN, COP, ARS, PEN, CLP, BOB |
| Saldo actual   | Sí          | Saldo inicial al crear                 |
| Color          | No          | Solo al crear; paleta de 6 colores     |


1. Pulsa **Crear Cuenta**.

**Tipos de cuenta disponibles:**


| Valor en pantalla  | Descripción         |
| ------------------ | ------------------- |
| Ahorro             | Cuenta de ahorros   |
| Corriente          | Cuenta corriente    |
| Tarjeta de crédito | Tarjeta de crédito  |
| Tarjeta de débito  | Tarjeta de débito   |
| Inversión          | Cuenta de inversión |
| Efectivo           | Dinero en efectivo  |
| Crypto             | Criptomonedas       |
| Otro               | Otro tipo           |




### Editar cuenta

1. Pulsa **Editar** en la tarjeta de la cuenta.
2. Solo puedes modificar **Saldo actual** y **Moneda**.
3. Nombre, tipo y banco aparecen **bloqueados** (no editables desde la interfaz).
4. Pulsa **Guardar**.

> **Nota:** Al cambiar el saldo manualmente, el sistema puede registrar una transacción de ajuste en el historial (categoría “Ajustes”) para documentar la diferencia.



### Eliminar cuenta

1. Pulsa **Eliminar** en la tarjeta.
2. Confirma: *“¿Eliminar cuenta? Esta acción no se puede deshacer.”*

La cuenta se **desactiva** (no aparece en listados activos). El sistema **no impide** eliminar cuentas con saldo distinto de cero.

### Saldo

- Cada cuenta muestra su saldo en **su propia moneda**.
- Las transacciones actualizan el saldo automáticamente (ingresos suman, gastos y pagos de deuda restan, transferencias mueven entre cuentas).
- En selectores de transacciones, si la moneda de la cuenta difiere de tu moneda principal, se indica junto al nombre.

---



## 8. Deudas

Acceso: menú → **Deudas** (`/deudas`).

### Resumen de la pantalla

Cuatro indicadores globales:


| Indicador      | Significado                 |
| -------------- | --------------------------- |
| Total adeudado | Suma de saldos pendientes   |
| Total pagado   | Lo ya abonado               |
| Total restante | Lo que falta por pagar      |
| Progreso total | Porcentaje pagado del total |


Cada deuda se muestra en una tarjeta con barra de progreso, tasa, plazo y badge **Vencida** si pasó la fecha de vencimiento y aún tiene saldo.

### Crear deuda

1. Pulsa **Nueva Deuda**.
2. Completa:


| Campo               | Obligatorio | Detalle                                                                                     |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Nombre              | Sí          | Identificador de la deuda                                                                   |
| Tipo                | Sí          | Préstamo personal, Hipoteca, Tarjeta de crédito, Estudiantil, Auto, Línea de crédito, Otros |
| Acreedor            | No          | Banco o persona                                                                             |
| Monto total         | Sí          | Capital inicial (≥ 0)                                                                       |
| Monto pagado        | No          | Lo ya pagado al registrar                                                                   |
| Pago mínimo mensual | No          | Referencia                                                                                  |
| Tasa (%)            | No          | 0–100                                                                                       |
| Tipo tasa           | No          | Mensual o Anual                                                                             |
| Plazo (meses)       | No          | Mínimo 1                                                                                    |
| Fecha inicio        | Sí          | Fecha de inicio                                                                             |
| Fecha vencimiento   | No          | Fecha límite                                                                                |
| Notas               | No          | Texto libre                                                                                 |


1. Si indicas monto, tasa y plazo, verás una **calculadora en vivo** con el total estimado incluyendo interés simple.
2. Pulsa **Crear Deuda**.



### Registrar pagos

**Desde la tarjeta de deuda → Registrar Pago:**

1. Ingresa **monto** (mín. 0,01; máximo = saldo restante).
2. Confirma **fecha**.
3. Pulsa **Registrar Pago**.

**Desde Transacciones → Pagar deuda:** además descuenta el monto de la cuenta elegida (ver sección 5).

### Estado de la deuda


| Estado      | Condición                                   |
| ----------- | ------------------------------------------- |
| **Activa**  | Saldo pendiente > 0                         |
| **Pagada**  | Saldo pendiente = 0                         |
| **Vencida** | Fecha de vencimiento pasada y aún con saldo |




### Saldo pendiente

Se muestra como **Restante** o **Saldo pendiente** en tarjetas y formularios. Disminuye con cada pago registrado.

### Asesor de deudas (panel en la misma pantalla)

- Elige estrategia **Avalancha** (prioriza mayor tasa) o **Bola de nieve** (prioriza menor saldo).
- Opcional: presupuesto extra mensual.
- Pulsa **Generar mi plan** o **Regenerar plan**.
- El historial completo está en **Asesor IA** (`/asesor`).

> Si el servicio de IA no está disponible, el plan puede generarse con reglas internas (se indica “sin IA” en el historial).



### Recordatorios de deuda

Desde cada tarjeta puedes **Recordarme** o **Ver recordatorio** para vincular un aviso programado.

### Eliminar deuda

Confirma en el diálogo *“Eliminar Deuda”*. La acción es **permanente** y elimina también el historial de pagos asociado.

---



## 9. Recurrentes

Acceso: menú → **Recurrentes** (`/recurrentes`).

Las transacciones recurrentes crean movimientos automáticos de **Ingreso** o **Gasto** según la frecuencia configurada.

### Estadísticas

Muestra total de recurrentes, activas e inactivas.

### Crear movimiento recurrente

1. Pulsa **Nueva Recurrente**.
2. Completa:


| Campo            | Obligatorio | Detalle                                                 |
| ---------------- | ----------- | ------------------------------------------------------- |
| Nombre           | Sí          | Ej.: “Alquiler mensual”                                 |
| Descripción      | No          | Detalle adicional                                       |
| Tipo             | Sí          | Ingreso o Gasto (**no** transferencia ni pago de deuda) |
| Monto            | Sí          | Valor del movimiento (≥ 0)                              |
| Categoría        | No          | Filtrada según el tipo                                  |
| Frecuencia       | Sí          | Diaria, Semanal, Quincenal, Mensual, Anual              |
| Día de ejecución | Sí*         | 1–31; solo si frecuencia es Mensual o Anual             |
| Fecha de inicio  | Sí          | Cuándo empieza                                          |
| Fecha de fin     | No          | Cuándo deja de repetirse                                |
| Activa           | No          | Casilla; desmarcada = pausada                           |


1. Pulsa **Crear Transacción**.



### Editar movimiento recurrente

Pulsa **Editar** en la tarjeta, modifica campos y guarda con **Actualizar**.

### Eliminar movimiento recurrente

Pulsa **Eliminar** y confirma. Mensaje: **“Recurrente eliminada”**.

### Activar / desactivar

Usa el interruptor en cada tarjeta para pausar o reanudar sin eliminar.

### Cómo funciona la frecuencia


| Frecuencia    | Comportamiento                      |
| ------------- | ----------------------------------- |
| **Diaria**    | Se ejecuta cada día                 |
| **Semanal**   | Cada 7 días                         |
| **Quincenal** | Cada 15 días                        |
| **Mensual**   | Cada mes, en el día indicado (1–31) |
| **Anual**     | Cada año, en el día indicado        |


El sistema calcula automáticamente la **próxima ejecución** y muestra las **últimas 3 ejecuciones** en cada tarjeta.

**Ejecución automática:** un proceso del servidor revisa recurrentes pendientes **cada hora**. También puedes pulsar **Forzar ahora** para ejecutar manualmente las pendientes.

> **Advertencia importante:** Las transacciones generadas por recurrentes **no están vinculadas a ninguna cuenta**. Se registran en el historial pero **no modifican saldos** de cuentas bancarias. Si necesitas actualizar saldos, registra la transacción manualmente o ajusta el saldo de la cuenta.

---



## 10. Reportes

Acceso: menú → **Reportes** (`/reportes`).

### Cómo consultar reportes

Al entrar, la pantalla carga automáticamente gráficos y totales basados en tus transacciones.

### Filtros

**Selector de periodo** (afecta gráficos de categoría y evolución mensual):


| Opción  | Alcance          |
| ------- | ---------------- |
| **3M**  | Últimos 3 meses  |
| **6M**  | Últimos 6 meses  |
| **12M** | Últimos 12 meses |


Los KPIs anuales (ingresos, gastos, balance, tasa de ahorro) corresponden al **año en curso**.

### Interpretación de gráficas

1. **Gastos por categoría (donut):** proporción de cada categoría sobre el total de gastos del periodo. Leyenda con las 6 principales.
2. **Top categorías (barras):** las 5 categorías con mayor gasto.
3. **Evolución mensual (área):** ingresos vs gastos mes a mes.

Pasa el cursor sobre los gráficos para ver montos detallados.

### Totales (KPIs anuales)


| Indicador      | Significado                                      |
| -------------- | ------------------------------------------------ |
| Ingresos (año) | Total de ingresos del año actual                 |
| Gastos (año)   | Total de gastos y pagos de deuda                 |
| Balance anual  | Ingresos − Gastos                                |
| Tasa de ahorro | (Balance ÷ Ingresos) × 100; solo si hay ingresos |




### Tabla resumen por categoría

Lista cada categoría con total gastado, barra de participación y porcentaje.

### Exportar datos

Pulsa **Exportar CSV**. Se descarga un archivo con nombre `transacciones-AAAA-MM-DD.csv` con columnas: Fecha, Tipo, Descripción, Categoría, Monto, Moneda.

También puedes exportar desde **Configuración → Datos → Exportar Datos** (mismo contenido, nombre `transacciones.csv`).

---



## 11. Configuración

Acceso: menú → **Configuración** (`/configuracion`).

Cinco pestañas: **Perfil**, **Seguridad**, **Preferencias**, **Categorías** y **Datos**.

### Perfil


| Campo           | Editable | Detalle      |
| --------------- | -------- | ------------ |
| Nombre completo | Sí *     | Obligatorio  |
| Email           | **No**   | Solo lectura |
| Teléfono        | Sí       | Opcional     |
| Ocupación       | Sí       | Opcional     |


Pulsa **Guardar Cambios**. Mensaje: **“Perfil actualizado exitosamente”**.

### Cambio de contraseña

Pestaña **Seguridad** → formulario con contraseña actual, nueva y confirmación. Ver sección 3.

### Sesiones activas

En la misma pestaña **Seguridad**:

- Lista dispositivos conectados con IP y fechas.
- **Cerrar sesión** individual en otro dispositivo.
- **Cerrar otras sesiones** (mantiene solo la actual).

Si cierras tu sesión actual, la app te desconecta automáticamente.

### Preferencias

Pestaña **Preferencias** (etiquetada “Preferencias” en el menú lateral de configuración):


| Opción                              | Descripción                            |
| ----------------------------------- | -------------------------------------- |
| **Apariencia**                      | Claro, Oscuro o Sistema                |
| **Notificaciones por email**        | Activar/desactivar                     |
| **Notificaciones push**             | Activar/desactivar                     |
| **Notificaciones de transacciones** | Alertas al registrar movimientos       |
| **Recordatorios de recurrentes**    | Avisos antes de ejecutar recurrentes   |
| **Moneda principal**                | USD, EUR, MXN, COP, ARS, PEN, CLP, BOB |


La moneda principal afecta el formato de montos en dashboard, transacciones y reportes. **Las cuentas conservan su moneda propia.**

Pulsa **Guardar Preferencias**.

### Configuración disponible — resumen


| Pestaña      | Acciones                                                         |
| ------------ | ---------------------------------------------------------------- |
| Perfil       | Editar datos personales                                          |
| Seguridad    | Cambiar contraseña, gestionar sesiones                           |
| Preferencias | Tema, notificaciones, moneda                                     |
| Categorías   | CRUD de categorías personalizadas                                |
| Datos        | Exportar CSV; eliminar cuenta (**deshabilitado — próximamente**) |


> **Nota:** El botón **Eliminar mi cuenta** está visible pero **deshabilitado**. La funcionalidad aún no está implementada en el servidor.

---



## 12. Validaciones

Reglas aplicadas en formularios y servidor. Los campos marcados con * son obligatorios en pantalla.

### Autenticación


| Regla                | Detalle                                          |
| -------------------- | ------------------------------------------------ |
| Nombre (registro)    | 2–50 caracteres                                  |
| Email                | Formato válido; único en el sistema              |
| Contraseña           | 6–100 caracteres; mayúscula + minúscula + número |
| Confirmar contraseña | Debe coincidir (validación en pantalla)          |
| Teléfono (perfil)    | 10–15 dígitos; admite +, espacios, guiones       |
| Cuenta desactivada   | No puede iniciar sesión                          |




### Transacciones


| Regla                    | Detalle                                             |
| ------------------------ | --------------------------------------------------- |
| Monto                    | Obligatorio; mayor a 0; hasta 2 decimales           |
| Fecha                    | No puede ser **futura**                             |
| Descripción              | Obligatoria en Ingreso y Gasto; máx. 500 caracteres |
| Cuenta                   | Obligatoria según tipo; al menos una cuenta activa  |
| Transferencia            | Origen y destino distintos; ambos obligatorios      |
| Pago de deuda            | Deuda obligatoria; monto ≤ saldo pendiente          |
| Deuda pagada             | No se permiten pagos adicionales                    |
| Notas                    | Máx. 1000 caracteres                                |
| Búsqueda                 | Máx. 100 caracteres; busca en descripción y notas   |
| Rango de fechas (filtro) | Fecha fin ≥ fecha inicio                            |




### Cuentas


| Regla  | Detalle                    |
| ------ | -------------------------- |
| Nombre | 1–100 caracteres           |
| Saldo  | Numérico; admite decimales |
| Moneda | Código de 3 letras         |




### Deudas


| Regla               | Detalle                     |
| ------------------- | --------------------------- |
| Nombre              | 1–100 caracteres            |
| Monto total         | Obligatorio; ≥ 0            |
| Tasa de interés     | 0–100 %                     |
| Plazo               | 1–600 meses (entero)        |
| Fecha inicio        | Obligatoria                 |
| Pago (desde Deudas) | Monto > 0; ≤ saldo restante |




### Categorías personalizadas


| Regla       | Detalle                             |
| ----------- | ----------------------------------- |
| Nombre      | 1–100 caracteres; único por usuario |
| Tipo        | INGRESO o GASTO                     |
| Descripción | Máx. 500 caracteres                 |




### Recurrentes


| Regla                                         | Detalle                             |
| --------------------------------------------- | ----------------------------------- |
| Nombre, tipo, monto, frecuencia, fecha inicio | Obligatorios                        |
| Tipo                                          | Solo INGRESO o GASTO en la interfaz |
| Día ejecución                                 | 1–31 (Mensual/Anual)                |
| Monto                                         | ≥ 0                                 |




### Presupuestos


| Regla                     | Detalle                                               |
| ------------------------- | ----------------------------------------------------- |
| Categoría                 | Obligatoria                                           |
| Límite / ingreso esperado | ≥ 0                                                   |
| Alerta en (%)             | 1–100; solo en límites de gasto (default 80 %)        |
| Mes                       | 1–12                                                  |
| Año                       | 2000–2100                                             |
| Duplicado                 | No puede repetirse misma categoría + tipo + mes + año |




### Recordatorios


| Regla       | Detalle                                                      |
| ----------- | ------------------------------------------------------------ |
| Título      | 1–150 caracteres                                             |
| Descripción | Máx. 1000 caracteres                                         |
| Fecha       | Obligatoria                                                  |
| Repetir     | Si activo, frecuencia obligatoria (Diaria, Semanal, Mensual) |
| Vínculo     | Máximo 1 recordatorio activo por deuda o meta                |




### Metas


| Regla          | Detalle          |
| -------------- | ---------------- |
| Título         | 1–150 caracteres |
| Monto objetivo | > 0              |
| Fecha límite   | Obligatoria      |
| Aporte         | Monto > 0        |


---



## 13. Mensajes del sistema



### Notificaciones temporales (toasts)

Aparecen en la parte superior de la pantalla durante unos segundos:


| Tipo  | Color | Ejemplos                                                                                |
| ----- | ----- | --------------------------------------------------------------------------------------- |
| Éxito | Verde | “Transacción eliminada”, “Datos exportados correctamente”, “Presupuestos sincronizados” |
| Error | Rojo  | “Error al cargar transacciones”, “Error al exportar datos”                              |
| Info  | Azul  | Mensajes informativos                                                                   |




### Confirmaciones (diálogos)

Antes de acciones destructivas:


| Acción                  | Mensaje                                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| Eliminar transacción    | “¿Eliminar transacción? Esta acción no se puede deshacer.”                     |
| Eliminar cuenta         | “¿Eliminar cuenta? Esta acción no se puede deshacer.”                          |
| Eliminar deuda          | “¿Estás seguro de que deseas eliminar [nombre]?”                               |
| Eliminar recurrente     | “¿Eliminar transacción recurrente?”                                            |
| Eliminar presupuesto    | “¿Eliminar presupuesto? Se eliminará el límite de esta categoría para el mes.” |
| Desactivar categoría    | Confirmación de desactivación                                                  |
| Desactivar recordatorio | “¿Desactivar recordatorio?”                                                    |
| Cerrar sesión remota    | “¿Cerrar esta sesión?” / “¿Cerrar otras sesiones?”                             |




### Mensajes de registro y autenticación


| Situación                    | Mensaje típico                        |
| ---------------------------- | ------------------------------------- |
| Registro exitoso             | “Usuario registrado exitosamente”     |
| Login exitoso                | Redirección al Dashboard              |
| Credenciales incorrectas     | “Email o contraseña incorrectos”      |
| Contraseñas no coinciden     | “Las contraseñas no coinciden”        |
| Contraseña actual incorrecta | “La contraseña actual es incorrecta”  |
| Perfil guardado              | “Perfil actualizado exitosamente”     |
| Contraseña cambiada          | “Contraseña actualizada exitosamente” |
| Sesión expirada              | Redirección automática al login       |




### Advertencias en formularios


| Situación             | Mensaje                                           |
| --------------------- | ------------------------------------------------- |
| Sin cuentas activas   | “No tienes cuentas activas. Crea una en Cuentas…” |
| Sin deudas pendientes | “No hay deudas activas con saldo pendiente.”      |
| Monto excede deuda    | “No puedes pagar más del saldo pendiente ($X.XX)” |
| Origen = destino      | “Origen y destino deben ser cuentas distintas”    |




### Notificaciones del sistema (bandeja)

Tipos visuales en **Notificaciones**:


| Tipo                         | Color    |
| ---------------------------- | -------- |
| Logro / Éxito                | Verde    |
| Alerta / Advertencia / Error | Amarillo |
| Recordatorio                 | Naranja  |
| Otros                        | Azul     |


Incluyen alertas de presupuesto excedido, recordatorios vencidos y logros de gamificación.

---



## 14. Preguntas frecuentes

**¿Qué pasa si recargo una página y veo un error 404?**  
En producción, el hosting debe tener configurado un rewrite de todas las rutas hacia `index.html`. El proyecto incluye `frontend/public/_redirects` para Render y Netlify.

**¿Puedo recuperar mi contraseña si la olvidé?**  
No. Solo puedes cambiarla desde Configuración → Seguridad si recuerdas la contraseña actual.

**¿Puedo cambiar mi correo electrónico?**  
No desde la interfaz. El campo email está bloqueado en Perfil.

**¿Puedo eliminar mi cuenta?**  
El botón existe pero está deshabilitado. Funcionalidad pendiente de implementación.

**¿Necesito crear cuentas antes de registrar transacciones?**  
Sí, para que los saldos se actualicen correctamente.

**¿Las recurrentes actualizan el saldo de mis cuentas?**  
No. Las recurrentes crean registros en el historial sin vincular cuenta. Ajusta saldos manualmente si lo necesitas.

**¿Cuál es la diferencia entre “Registrar Pago” en Deudas y “Pagar deuda” en Transacciones?**  
“Registrar Pago” solo reduce el saldo de la deuda. “Pagar deuda” en Transacciones también descuenta el monto de la cuenta bancaria elegida.

**¿Por qué los gráficos del Dashboard muestran datos que no reconozco?**  
Probablemente son **datos de ejemplo** porque aún no hay suficiente información real. Registra transacciones y desaparecerán.

**¿Puedo filtrar transacciones por categoría?**  
No en la lista de Transacciones. Usa Reportes para análisis por categoría.

**¿Qué pasa si desactivo una categoría?**  
Dejará de aparecer en selectores, pero las transacciones antiguas conservan su categoría.

**¿Qué moneda se usa para mostrar montos?**  
Tu **moneda principal** en Preferencias. Cada cuenta puede tener moneda distinta.

**¿Qué ocurre si mi sesión expira?**  
La aplicación te redirige al login automáticamente.

**¿El Asesor IA siempre usa inteligencia artificial?**  
Intenta usar IA (Gemini). Si no está disponible, genera un plan basado en reglas internas (se indica en el historial).

**¿Puedo registrar transferencias o pagos de deuda como recurrentes?**  
No. Las recurrentes solo admiten Ingreso y Gasto.

---



## 15. Buenas prácticas

1. **Crea tus cuentas primero.** Antes de registrar transacciones, configura al menos una cuenta con su saldo actual para un control preciso.
2. **Registra con regularidad.** Anota ingresos y gastos en cuanto ocurran para que reportes y dashboard reflejen la realidad.
3. **Usa categorías.** Clasificar movimientos mejora los gráficos de Reportes y el seguimiento de presupuestos.
4. **Revisa el Dashboard semanalmente.** Observa balance, variaciones y alertas de balance negativo.
5. **Para deudas, elige el método de pago adecuado.** Si el pago sale de una cuenta bancaria, usa Transacciones → Pagar deuda. Si solo quieres actualizar el saldo de la deuda sin mover cuentas, usa Registrar Pago en Deudas.
6. **Configura presupuestos mensuales.** Define límites por categoría y pulsa **Sincronizar** para comparar lo planificado vs lo real.
7. **No confíes en recurrentes para saldos.** Recuerda que las recurrentes no vinculan cuentas; verifica saldos periódicamente.
8. **Exporta tus datos periódicamente.** Usa Reportes o Configuración → Datos para respaldar tu historial en CSV.
9. **Protege tu sesión.** Cierra sesión en equipos compartidos y revisa sesiones activas en Configuración → Seguridad.
10. **Usa contraseñas seguras.** Cumple los requisitos (mayúscula, minúscula, número) y cámbiala si sospechas acceso no autorizado.
11. **Programa recordatorios** para pagos de deudas, metas o vencimientos importantes.
12. **Revisa notificaciones.** Alertas de presupuesto y recordatorios aparecen en la campana del header y en la bandeja de Notificaciones.

---



## Anexo A — Otros módulos disponibles

Estos módulos existen en la aplicación y complementan las secciones principales.

### Inversiones (`/inversiones`)

Registra inversiones con nombre, tipo (Acciones, Bonos, Fondos, ETF, Cripto, Bienes raíces, Commodities, Otros), broker, montos, cantidad de unidades y fecha de compra. Muestra portafolio con total invertido, valor actual, ganancia/pérdida y rendimiento %.

### Metas (`/metas`)

Crea objetivos de ahorro con título, monto objetivo, fecha límite, prioridad y tipo (Ahorro, Emergencia, Inversión, Deuda, Gasto). Registra **aportes** inline y consulta progreso porcentual. Puedes vincular recordatorios.

### Presupuestos (`/presupuestos`)

Define **límites de gasto** o **ingresos esperados** por categoría y mes. Selector de mes/año, botón **Sincronizar** para actualizar montos reales, barras de progreso con colores (verde/amarillo/rojo según consumo). Alertas automáticas al superar el umbral configurado (default 80 %).

### Recordatorios (`/recordatorios`)

CRUD de avisos con título, descripción, tipo (General, Pago, Meta, Presupuesto, Inversión, Deuda), fecha y repetición (Diaria, Semanal, Mensual). Filtro “Solo pendientes”. Acciones: completar, reactivar, editar, desactivar.

### Notificaciones (`/notificaciones`)

Bandeja con pestañas Todas / No leídas / Leídas. Marcar como leída, eliminar o marcar todas como leídas.

### Gamificación (`/gamificacion`)

Vista de solo lectura: nivel (1–5), puntos, logros desbloqueados e historial de puntos. No requiere acciones del usuario; se actualiza según tu actividad.

### Asesor IA (`/asesor`)

Historial de planes generados para pagar deudas. Muestra diagnóstico, orden de ataque, consejos y pasos. Botón para generar nuevo plan redirige a Deudas.

---



## Anexo B — Funcionalidades internas no expuestas al usuario

Las siguientes capacidades existen en el servidor pero **no tienen pantalla** o **no están accesibles** desde la interfaz:


| Funcionalidad                                                                        | Estado                                            |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Recuperación de contraseña por email                                                 | No implementada                                   |
| Eliminación de cuenta de usuario                                                     | Botón visible, deshabilitado                      |
| Estadísticas de categorías (`/categorias/estadisticas`)                              | Disponible internamente, no expuesta al usuario   |
| Reporte mensual detallado (`/reportes/mensual`)                                      | Disponible internamente; la UI usa agregados      |
| Crear notificaciones manualmente vía API                                             | Disponible internamente, no expuesta al usuario   |
| Verificación manual de logros                                                        | Disponible internamente, no expuesta al usuario   |
| Campos avanzados de transacción (etiquetas, ubicación, comprobante, moneda original) | Disponibles en API; formulario simplificado en UI |


---

*Documento generado a partir del análisis del código fuente del proyecto Gestor de Finanzas. Última revisión: julio 2026.*