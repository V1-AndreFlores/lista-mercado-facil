import { Market } from '../entities/Market';
import { ShoppingList } from '../entities/ShoppingList';
import { ShoppingListSorter, SortedShoppingSection } from '../services/ShoppingListSorter';

export class SortShoppingListByMarketRouteUseCase {
  private readonly sorter = new ShoppingListSorter();

  execute(list: ShoppingList, market: Market): SortedShoppingSection[] {
    return this.sorter.sortByMarketRoute(list.items, market.sections);
  }
}
