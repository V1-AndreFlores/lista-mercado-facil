import { ShoppingListItem } from '../entities/ShoppingListItem';
import { normalizeText } from './normalizeText';

export function isProductAlreadyInList(items: ShoppingListItem[], productName: string): boolean {
  const normalizedProductName = normalizeText(productName);

  if (!normalizedProductName) {
    return false;
  }

  return items.some((item) => {
    const normalizedItemName = item.normalizedName || normalizeText(item.name);
    return normalizedItemName === normalizedProductName;
  });
}
