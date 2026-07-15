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
├── utils/          # constants.js
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

## Deploy (Render Static Site)

Si al recargar una ruta ves pantalla blanca o 404, el rewrite de Render a veces
devuelve cuerpo vacío. Este proyecto usa **HashRouter** (`/#/dashboard`), así el
servidor siempre sirve `/` y React maneja la ruta tras el `#`.

Opcional en Dashboard → Redirects/Rewrites (por si vuelves a BrowserRouter):

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

