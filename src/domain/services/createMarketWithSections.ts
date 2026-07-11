import { Market } from '../entities/Market';
import { createId } from '../../shared/utils/createId';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';

export type MarketSectionTemplate = {
  name: string;
  routeOrder: number;
  isActive?: boolean;
  aisleNumber?: string;
};

export function createMarketWithSections(name: string, sections: MarketSectionTemplate[]): Market {
  const marketId = createId();
  const normalizedSections = [...sections]
    .filter((section) => Boolean(section.name.trim()))
    .sort((left, right) => left.routeOrder - right.routeOrder);

  return {
    id: marketId,
    name: name.trim(),
    isDefault: false,
    sections: normalizedSections.map((section, index) => ({
      id: createId(),
      marketId,
      name: section.name.trim().replace(/\s+/g, ' '),
      aisleNumber: sanitizeAisleNumberInput(section.aisleNumber),
      routeOrder: index + 1,
      isActive: section.isActive !== false,
    })),
  };
}
