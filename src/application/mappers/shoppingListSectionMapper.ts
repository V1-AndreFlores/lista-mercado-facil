import { SortedShoppingSection } from '../../domain/services/ShoppingListSorter';
import { ShoppingListSectionDto } from '../dtos/ShoppingListSectionDto';

export function toShoppingListSectionDto(section: SortedShoppingSection): ShoppingListSectionDto {
  return {
    sectionName: section.sectionName,
    routeOrder: section.routeOrder,
    items: section.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      isPurchased: item.isPurchased,
    })),
  };
}
