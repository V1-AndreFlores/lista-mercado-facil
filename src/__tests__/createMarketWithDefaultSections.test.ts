import { createMarketWithDefaultSections } from '../domain/services/createMarketWithDefaultSections';

describe('createMarketWithDefaultSections', () => {
  it('creates a market with a normalized trimmed name and default sections', () => {
    const market = createMarketWithDefaultSections('  Mercado Teste  ');

    expect(market.name).toBe('Mercado Teste');
    expect(market.isDefault).toBe(false);
    expect(market.sections.length).toBeGreaterThan(0);
    expect(market.sections.every((section) => section.marketId === market.id)).toBe(true);
    expect(market.sections.at(-1)?.name).toBe('Outros');
  });
});
