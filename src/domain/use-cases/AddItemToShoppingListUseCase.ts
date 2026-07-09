import { ShoppingList } from "../entities/ShoppingList";
import { ShoppingListItem, ShoppingListItemUnit } from "../entities/ShoppingListItem";
import { ProductCategorizer } from "../services/ProductCategorizer";
import { normalizeText } from "../services/normalizeText";
import { createId } from "../../shared/utils/createId";

interface AddItemInput {
  list: ShoppingList;
  productName: string;
  quantity?: number;
  unit?: ShoppingListItemUnit;
}

export class AddItemToShoppingListUseCase {
  constructor(private readonly categorizer: ProductCategorizer) {}

  execute(input: AddItemInput): ShoppingList {
    const now = new Date().toISOString();
    const categorization = this.categorizer.categorize(input.productName);

    const item: ShoppingListItem = {
      id: createId(),
      listId: input.list.id,
      name: input.productName.trim(),
      normalizedName: normalizeText(input.productName),
      quantity: input.quantity && input.quantity > 0 ? input.quantity : 1,
      unit: input.unit ?? "un",
      sectionName: categorization.sectionName,
      categoryId: categorization.categoryId,
      isPurchased: false,
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...input.list,
      items: [...input.list.items, item],
      updatedAt: now,
    };
  }
}
