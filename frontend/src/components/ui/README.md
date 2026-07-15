# Design System UI (`components/ui`)

Componentes reutilizables que **replican el look actual** del proyecto.
Todavía **no** reemplazan a `components/common` ni a las páginas.

## Utilidad `cn`

```js
import { cn } from '../../utils/cn'

cn('px-4', isActive && 'bg-primary-600', className)
```

Combina clases de Tailwind omitiendo valores falsy.

## Importación

```js
import { Button, Card, Input, Spinner } from '../components/ui'
// o
import Button from '../components/ui/Button'
```

## Componentes

### Button
Acciones primarias/secundarias/peligro/outline.  
Misma API visual que `common/Button`.

```jsx
<Button variant="primary" onClick={...}>Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
```

### LoadingButton
Como `Button`, con `loading` (spinner + disabled).

```jsx
<LoadingButton loading={saving} loadingText="Guardando...">
  Guardar
</LoadingButton>
```

### Card
Contenedor blanco con sombra (`bg-white rounded-lg shadow-md p-6`).

```jsx
<Card className="opacity-75">...</Card>
```

### Label
Etiqueta de formulario (`text-sm font-medium text-gray-700`).

```jsx
<Label htmlFor="email" required>Email</Label>
```

### Input / Select / Textarea
Campos alineados a `.input-field` / `common/Input`.  
Aceptan `label`, `error`, `className` (wrapper) y el resto de props nativas.

```jsx
<Input label="Monto" name="monto" type="number" error={err} />
<Select label="Tipo" name="tipo">
  <option value="GASTO">Gasto</option>
</Select>
<Textarea label="Notas" name="notas" rows={3} />
```

### Spinner
Spinner de las páginas (`border-b-2 border-primary-600`).

```jsx
<Spinner fullPage />
<Spinner size="sm" />
```

### Alert
Banner de éxito/error/info/warning.

```jsx
<Alert variant="error">{mensaje}</Alert>
<Alert variant="success">Guardado</Alert>
```

### EmptyState
Bloque vacío centrado (listas sin datos).

```jsx
<EmptyState
  icon={<Wallet className="h-16 w-16" />}
  title="No hay cuentas"
  description="Crea tu primera cuenta"
  action={<Button>Nueva cuenta</Button>}
/>
```

### Badge
Chips de estado/tipo.

```jsx
<Badge variant="green">Completada</Badge>
<Badge variant="red">Excedido</Badge>
```

### Divider
Línea horizontal (`border-gray-200` / `border-gray-100`).

```jsx
<Divider />
<Divider variant="subtle" className="my-4" />
```

## Buenas prácticas

1. **No rediseñar aquí**: cualquier cambio visual debe mirar primero `common/` y las páginas actuales.
2. Siempre aceptar y pasar `className` vía `cn(...)`.
3. Preferir estos componentes en **código nuevo**; migrar lo existente en una fase posterior.
4. No importar desde `ui/` hacia `common/` (evitar ciclos); `ui` es la base nueva.
5. Mantener `children` cuando el componente sea contenedor.

## Relación con `common/`

| Actual (`common/`) | Futuro (`ui/`) |
|--------------------|----------------|
| Button | Button / LoadingButton |
| Card | Card |
| Input | Input + Label |
| (inline select/textarea) | Select / Textarea |
| (spinner inline) | Spinner |
| (banner error) | Alert |
| (empty blocks) | EmptyState |
| (badges inline) | Badge |
| (border-t) | Divider |

La migración se hará página por página en una fase posterior, sin big-bang.
