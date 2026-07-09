# Frontend — Gestor de Finanzas

React 18 + Vite + Tailwind CSS. Consume la API en `http://localhost:5000/api`.

## Setup

```bash
cd frontend
npm install
npm run dev
```

URL: `http://localhost:5173`

Opcional `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Estructura

```
src/
├── components/     # layout, common, modales por dominio
├── pages/          # Dashboard, Transacciones, Cuentas, …
├── services/       # Axios por recurso
├── context/        # AuthContext, ToastContext
├── utils/          # format.js, constants.js
├── App.jsx
└── main.jsx
```

## Módulos UI

| Ruta | Página |
|------|--------|
| `/login`, `/register` | Auth |
| `/dashboard` | Resumen |
| `/transacciones` | CRUD + filtros + búsqueda |
| `/recurrentes` | CRUD + forzar ahora |
| `/cuentas`, `/inversiones`, `/deudas` | CRUD |
| `/metas` | Metas de ahorro + aportes |
| `/presupuestos` | Límites mensuales + sync |
| `/notificaciones` | Listado / leídas |
| `/reportes` | Gráficos vía agregados |
| `/gamificacion` | Logros / puntos |
| `/configuracion` | Perfil, password, preferencias, export CSV |
| `*` | 404 |

## Notas

- Toasts globales vía `ToastContext` (errores visibles, no solo `console`)
- Categorías en modales: lista default en `utils/constants.js`; API `/categorias` disponible vía `categoria.service.js`
- `ConfirmDialog` acepta `type` o `variant`
