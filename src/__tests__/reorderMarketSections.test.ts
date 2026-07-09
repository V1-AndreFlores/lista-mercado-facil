import { reorderMarketSection } from '../domain/services/reorderMarketSections';
import { Market } from '../domain/entities/Market';

const baseMarket: Market = {
  id: 'market-test',
  name: 'Mercado Teste',
  isDefault: true,
  sections: [
    { id: 'hortifruti', marketId: 'market-test', name: 'Hortifruti', routeOrder: 1, isActive: true },
    { id: 'mercearia', marketId: 'market-test', name: 'Mercearia', routeOrder: 2, isActive: true },
    { id: 'limpeza', marketId: 'market-test', name: 'Limpeza', routeOrder: 3, isActive: true },
  ],
};

describe('reorderMarketSection', () => {
  it('moves a section down and normalizes the route order', () => {
    const result = reorderMarketSection(baseMarket, 'hortifruti', 'down');

    expect(result.sections.map((section) => section.id)).toEqual(['mercearia', 'hortifruti', 'limpeza']);
    expect(result.sections.map((section) => section.routeOrder)).toEqual([1, 2, 3]);
  });

  it('moves a section up and normalizes the route order', () => {
    const result = reorderMarketSection(baseMarket, 'limpeza', 'up');

    expect(result.sections.map((section) => section.id)).toEqual(['hortifruti', 'limpeza', 'mercearia']);
    expect(result.sections.map((section) => section.routeOrder)).toEqual([1, 2, 3]);
  });

  it('keeps the market unchanged when trying to move the first section up', () => {
    const result = reorderMarketSection(baseMarket, 'hortifruti', 'up');

    expect(result).toBe(baseMarket);
  });
});
