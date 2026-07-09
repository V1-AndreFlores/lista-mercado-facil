import { Market } from '../entities/Market';

export type MarketSectionMoveDirection = 'up' | 'down';

export function reorderMarketSection(
  market: Market,
  sectionId: string,
  direction: MarketSectionMoveDirection,
): Market {
  const orderedSections = [...market.sections].sort((left, right) => left.routeOrder - right.routeOrder);
  const currentIndex = orderedSections.findIndex((section) => section.id === sectionId);

  if (currentIndex < 0) {
    return market;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= orderedSections.length) {
    return market;
  }

  const nextSections = [...orderedSections];
  const currentSection = nextSections[currentIndex];
  const targetSection = nextSections[targetIndex];

  nextSections[currentIndex] = targetSection;
  nextSections[targetIndex] = currentSection;

  return {
    ...market,
    sections: nextSections.map((section, index) => ({
      ...section,
      routeOrder: index + 1,
    })),
  };
}
