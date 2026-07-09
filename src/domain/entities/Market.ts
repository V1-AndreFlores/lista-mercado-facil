import { MarketSection } from './MarketSection';

export interface Market {
  id: string;
  name: string;
  address?: string;
  isDefault: boolean;
  sections: MarketSection[];
}
