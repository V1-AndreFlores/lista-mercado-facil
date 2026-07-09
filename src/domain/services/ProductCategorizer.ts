import { ProductCategory } from '../entities/ProductCategory';
import { normalizeText } from './normalizeText';

export interface CategorizationResult {
  categoryId: string;
  categoryName: string;
  sectionName: string;
  confidence: number;
  matchedKeyword?: string;
}

export class ProductCategorizer {
  constructor(private readonly categories: ProductCategory[]) {}

  categorize(rawProductName: string): CategorizationResult {
    const normalizedProductName = normalizeText(rawProductName);

    let bestMatch: CategorizationResult | null = null;

    for (const category of this.categories) {
      for (const keyword of category.keywords) {
        const normalizedKeyword = normalizeText(keyword);
        const isExactMatch = normalizedProductName === normalizedKeyword;
        const containsKeyword = normalizedProductName.includes(normalizedKeyword);

        if (!isExactMatch && !containsKeyword) {
          continue;
        }

        const confidence = isExactMatch ? 1 : 0.75;

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            categoryId: category.id,
            categoryName: category.name,
            sectionName: category.defaultSectionName,
            confidence,
            matchedKeyword: keyword,
          };
        }
      }
    }

    return (
      bestMatch ?? {
        categoryId: 'uncategorized',
        categoryName: 'Sem categoria',
        sectionName: 'Outros',
        confidence: 0,
      }
    );
  }
}
