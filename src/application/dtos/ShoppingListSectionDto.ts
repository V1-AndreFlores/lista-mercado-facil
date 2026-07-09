import { ShoppingListItemUnit } from '../../domain/entities/ShoppingListItem';

export interface ShoppingListSectionDto {
  sectionName: string;
  routeOrder: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: ShoppingListItemUnit;
    isPurchased: boolean;
  }>;
}
