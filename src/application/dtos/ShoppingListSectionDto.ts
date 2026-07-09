export interface ShoppingListSectionDto {
  sectionName: string;
  routeOrder: number;
  items: Array<{
    id: string;
    name: string;
    quantity?: string;
    isPurchased: boolean;
  }>;
}
