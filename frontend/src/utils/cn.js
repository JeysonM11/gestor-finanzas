/**
 * Combina clases de Tailwind omitiendo valores falsy.
 * @param {...(string|false|null|undefined|0)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
