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

La app usa **BrowserRouter** (rutas limpias, p. ej. `/dashboard`). En hosting
estático hace falta un rewrite para que recargar rutas no devuelva 404.

El archivo `public/_redirects` ya incluye la regla para Render/Netlify:

```
/*    /index.html   200
```

Si despliegas en otro host, configura el equivalente (todas las rutas → `index.html`).

