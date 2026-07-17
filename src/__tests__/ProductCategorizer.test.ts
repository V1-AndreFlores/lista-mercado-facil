import { ProductCategorizer } from '../domain/services/ProductCategorizer';
import { defaultCategories } from '../infrastructure/seed/defaultCategories';

describe('ProductCategorizer', () => {
  it('deve categorizar banana como Hortifruti', () => {
    const categorizer = new ProductCategorizer(defaultCategories);

    const result = categorizer.categorize('Banana');

    expect(result.sectionName).toBe('Hortifruti');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('deve categorizar sabao em po como Limpeza mesmo sem acento', () => {
    const categorizer = new ProductCategorizer(defaultCategories);

    const result = categorizer.categorize('sabao em po');

    expect(result.sectionName).toBe('Detergentes, Sabão e Desinfetantes');
  });

  it('deve enviar item desconhecido para Outros', () => {
    const categorizer = new ProductCategorizer(defaultCategories);

    const result = categorizer.categorize('produto inexistente qualquer');

    expect(result.sectionName).toBe('Outros');
    expect(result.confidence).toBe(0);
  });
});
