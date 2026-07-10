import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultMarkets } from '../seed/defaultMarkets';

export interface DefaultMarketSection {
  id: string;
  name: string;
  routeOrder: number;
  isActive: boolean;
}

const defaultMarketSectionsStorageKey = '@lista-mercado-facil:default-market-sections';

export class DefaultMarketSectionRepository {
  async getAll(): Promise<DefaultMarketSection[]> {
    const sections = await this.readSections();

    if (sections.length > 0) {
      return this.normalizeSections(sections);
    }

    const initialSections = getInitialDefaultSections();
    await this.saveAll(initialSections);

    return initialSections;
  }

  async saveAll(sections: DefaultMarketSection[]): Promise<void> {
    const normalizedSections = this.normalizeSections(sections);

    if (normalizedSections.length === 0) {
      throw new Error('Mantenha pelo menos um corredor padrão.');
    }

    await AsyncStorage.setItem(defaultMarketSectionsStorageKey, JSON.stringify(normalizedSections));
  }

  async ensureInitialized(): Promise<void> {
    await this.getAll();
  }

  async resetToInitial(): Promise<DefaultMarketSection[]> {
    const initialSections = getInitialDefaultSections();
    await this.saveAll(initialSections);
    return initialSections;
  }

  private async readSections(): Promise<DefaultMarketSection[]> {
    const rawValue = await AsyncStorage.getItem(defaultMarketSectionsStorageKey);

    if (!rawValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(rawValue) as DefaultMarketSection[];

      if (!Array.isArray(parsedValue)) {
        await AsyncStorage.removeItem(defaultMarketSectionsStorageKey);
        return [];
      }

      return parsedValue.filter((section) => Boolean(section?.id && section?.name));
    } catch {
      await AsyncStorage.removeItem(defaultMarketSectionsStorageKey);
      return [];
    }
  }

  private normalizeSections(sections: DefaultMarketSection[]): DefaultMarketSection[] {
    return [...sections]
      .filter((section) => Boolean(section.name.trim()))
      .sort((left, right) => left.routeOrder - right.routeOrder)
      .map((section, index) => ({
        ...section,
        name: section.name.trim().replace(/\s+/g, ' '),
        routeOrder: index + 1,
        isActive: section.isActive !== false,
      }));
  }
}

export function getInitialDefaultSections(): DefaultMarketSection[] {
  const defaultMarket = defaultMarkets.find((market) => market.isDefault) ?? defaultMarkets[0];

  return [...defaultMarket.sections]
    .sort((left, right) => left.routeOrder - right.routeOrder)
    .map((section, index) => ({
      id: section.id.replace('section-', 'default-section-'),
      name: section.name,
      routeOrder: index + 1,
      isActive: section.isActive !== false,
    }));
}
