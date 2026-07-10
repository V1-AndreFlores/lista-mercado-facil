import { defaultCategories } from '../../infrastructure/seed/defaultCategories';
import { defaultMarkets } from '../../infrastructure/seed/defaultMarkets';
import { normalizeText } from './normalizeText';

const canonicalSectionNames = buildCanonicalSectionNames();

export function suggestMarketSectionName(input: string): string | null {
  const trimmedInput = input.trim().replace(/\s+/g, ' ');

  if (!trimmedInput) {
    return null;
  }

  const normalizedInput = normalizeText(trimmedInput);
  const suggestedName = canonicalSectionNames.find((name) => normalizeText(name) === normalizedInput);

  if (!suggestedName || suggestedName === trimmedInput) {
    return null;
  }

  return suggestedName;
}

function buildCanonicalSectionNames(): string[] {
  const names = [
    ...defaultMarkets.flatMap((market) => market.sections.map((section) => section.name)),
    ...defaultCategories.map((category) => category.defaultSectionName),
    ...defaultCategories.map((category) => category.name),
  ];

  const uniqueNames = new Map<string, string>();

  for (const name of names) {
    const trimmedName = name.trim().replace(/\s+/g, ' ');

    if (!trimmedName) {
      continue;
    }

    const normalizedName = normalizeText(trimmedName);

    if (!uniqueNames.has(normalizedName)) {
      uniqueNames.set(normalizedName, trimmedName);
    }
  }

  return Array.from(uniqueNames.values());
}
