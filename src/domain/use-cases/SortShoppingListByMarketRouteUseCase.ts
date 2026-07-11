import { Market } from '../entities/Market';
import { ShoppingList } from '../entities/ShoppingList';
import { ShoppingListItem } from '../entities/ShoppingListItem';

export interface ShoppingListRouteSection {
  sectionName: string;
  aisleNumber?: string;
  routeOrder: number;
  items: ShoppingListItem[];
}

export class SortShoppingListByMarketRouteUseCase {
  execute(list: ShoppingList, market: Market): ShoppingListRouteSection[] {
    const routeBySectionName = new Map(
      market.sections
        .filter((section) => section.isActive !== false)
        .map((section) => [
          section.name,
          {
            routeOrder: section.routeOrder,
            aisleNumber: section.aisleNumber,
          },
        ]),
    );

    const groupedItems = list.items.reduce<Map<string, ShoppingListItem[]>>((groups, item) => {
      const currentItems = groups.get(item.sectionName) ?? [];
      groups.set(item.sectionName, [...currentItems, item]);
      return groups;
    }, new Map<string, ShoppingListItem[]>());

    return Array.from(groupedItems.entries())
      .map(([sectionName, items]) => {
        const routeInfo = routeBySectionName.get(sectionName);

        return {
          sectionName,
          aisleNumber: routeInfo?.aisleNumber,
          routeOrder: routeInfo?.routeOrder ?? Number.MAX_SAFE_INTEGER,
          items: this.sortItems(items),
        };
      })
      .sort((left, right) => {
        const leftCompleted = this.isSectionCompleted(left.items);
        const rightCompleted = this.isSectionCompleted(right.items);

        if (leftCompleted !== rightCompleted) {
          return leftCompleted ? 1 : -1;
        }

        if (left.routeOrder !== right.routeOrder) {
          return left.routeOrder - right.routeOrder;
        }

        return left.sectionName.localeCompare(right.sectionName, 'pt-BR');
      });
  }

  private sortItems(items: ShoppingListItem[]): ShoppingListItem[] {
    return [...items].sort((left, right) => {
      if (left.isPurchased !== right.isPurchased) {
        return left.isPurchased ? 1 : -1;
      }

      return left.name.localeCompare(right.name, 'pt-BR');
    });
  }

  private isSectionCompleted(items: ShoppingListItem[]): boolean {
    return items.length > 0 && items.every((item) => item.isPurchased);
  }
}
