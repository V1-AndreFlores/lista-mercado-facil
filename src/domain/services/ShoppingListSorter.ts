import { MarketSection } from '../entities/MarketSection';
import { ShoppingListItem } from '../entities/ShoppingListItem';

export interface SortedShoppingSection {
  sectionName: string;
  routeOrder: number;
  items: ShoppingListItem[];
}

export class ShoppingListSorter {
  sortByMarketRoute(items: ShoppingListItem[], marketSections: MarketSection[]): SortedShoppingSection[] {
    const orderBySection = new Map(
      marketSections.map((section) => [section.name, section.routeOrder]),
    );

    const grouped = new Map<string, ShoppingListItem[]>();

    for (const item of items) {
      const sectionItems = grouped.get(item.sectionName) ?? [];
      sectionItems.push(item);
      grouped.set(item.sectionName, sectionItems);
    }

    return Array.from(grouped.entries())
      .map(([sectionName, sectionItems]) => ({
        sectionName,
        routeOrder: orderBySection.get(sectionName) ?? Number.MAX_SAFE_INTEGER,
        items: sectionItems.sort((left, right) => left.name.localeCompare(right.name)),
      }))
      .sort((left, right) => left.routeOrder - right.routeOrder);
  }
}
