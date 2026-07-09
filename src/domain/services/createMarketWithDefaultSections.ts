import { Market } from '../entities/Market';
import { createId } from '../../shared/utils/createId';

export const defaultMarketSectionNames = [
  'Hortifruti',
  'Padaria',
  'Açougue',
  'Peixaria',
  'Frios e laticínios',
  'Congelados',
  'Mercearia',
  'Bebidas',
  'Higiene pessoal',
  'Limpeza',
  'Pet',
  'Utilidades',
  'Outros',
];

export function createMarketWithDefaultSections(name: string): Market {
  const nowId = createId();
  const marketId = `market-${nowId}`;

  return {
    id: marketId,
    name: name.trim(),
    isDefault: false,
    sections: defaultMarketSectionNames.map((sectionName, index) => ({
      id: `${marketId}-section-${index + 1}-${createId()}`,
      marketId,
      name: sectionName,
      routeOrder: sectionName === 'Outros' ? 99 : index + 1,
      isActive: true,
    })),
  };
}
