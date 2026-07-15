# Design System UI (`components/ui`)

Componentes visuales del rediseño Fase 4 (inspiración Linear / Vercel / Stripe).  
`common/Button`, `common/Input` y `common/Card` reexportan desde aquí.

## Tokens

- Tipografía: **Plus Jakarta Sans**
- Colores semánticos: `surface`, `ink`, `line` + `primary` (preparados para `.dark`)
- Utilidades: `.page-shell`, `.page-header`, `.stat-grid`, `.card-grid`, `.data-table`

## Importación

```js
import { Button, Card, Input, Spinner, Badge, Skeleton } from '../components/ui'
```

## Componentes clave

| Componente | Notas |
|---|---|
| `Button` | `primary` `secondary` `outline` `danger` `ghost` `success` + `size` `icon`/`icon-sm` + `loading` |
| `Card` | + `CardHeader` `CardTitle` `CardDescription` `CardContent` `CardFooter` |
| `Input` / `Select` / `Textarea` / `Label` | Formularios unificados (`.input-field`) |
| `Alert` | `error` `success` `info` `warning` + icono |
| `Badge` | Incluye `activo` `pendiente` `pagado` `cancelado` `vencido` |
| `EmptyState` | Icono + título + descripción + acción |
| `Spinner` / `Skeleton` / `PageSkeleton` | Loading |
| `LoadingButton` | Botón con estado de carga |
| `Divider` | Separador opcional con label |

## Dark mode

Configurado `darkMode: 'class'` y variables CSS en `.dark`.  
**No** hay toggle aún; la estructura está lista.
