/**
 * Función simple para combinar nombres de clases CSS
 * Reemplaza a clsx y tailwind-merge para evitar dependencias externas
 */
export function cn(...inputs: (string | undefined | null | false | 0)[]) {
  // Filtrar valores falsy y convertir a string
  return inputs
    .filter(Boolean)
    .join(' ')
    .trim();
}