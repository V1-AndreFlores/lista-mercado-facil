export const defaultShoppingListName = 'Compra do dia';

export function resolveShoppingListName(value?: string | null): string {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : defaultShoppingListName;
}
