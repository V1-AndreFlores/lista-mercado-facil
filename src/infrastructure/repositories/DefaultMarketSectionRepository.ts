import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultMarkets } from '../seed/defaultMarkets';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';

export interface DefaultMarketSection {
  id: string;
  name: string;
  routeOrder: number;
  isActive: boolean;
  aisleNumber?: string;
}

const defaultMarketSectionsStorageKey = '@lista-mercado-facil:default-market-sections';
const defaultMarketSectionsVersionStorageKey = '@lista-mercado-facil:default-market-sections-version';
const currentDefaultMarketSectionsVersion = '2026-07-11-zaffari-fernandes-vieira-corredores-v2';

export class DefaultMarketSectionRepository {
  async getAll(): Promise<DefaultMarketSection[]> {
    const [sections, version] = await Promise.all([
      this.readSections(),
      AsyncStorage.getItem(defaultMarketSectionsVersionStorageKey),
    ]);

    if (version !== currentDefaultMarketSectionsVersion) {
      const initialSections = getInitialDefaultSections();
      await this.saveAll(initialSections);
      await AsyncStorage.setItem(defaultMarketSectionsVersionStorageKey, currentDefaultMarketSectionsVersion);
      return initialSections;
    }

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

    await AsyncStorage.multiSet([
      [defaultMarketSectionsStorageKey, JSON.stringify(normalizedSections)],
      [defaultMarketSectionsVersionStorageKey, currentDefaultMarketSectionsVersion],
    ]);
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
        aisleNumber: sanitizeAisleNumberInput(section.aisleNumber),
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
      aisleNumber: sanitizeAisleNumberInput(section.aisleNumber),
      routeOrder: index + 1,
      isActive: section.isActive !== false,
    }));
}
