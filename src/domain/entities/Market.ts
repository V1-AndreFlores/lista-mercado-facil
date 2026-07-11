export interface MarketSection {
  id: string;
  marketId: string;
  name: string;
  routeOrder: number;
  isActive: boolean;
  aisleNumber?: string;
}

export interface Market {
  id: string;
  name: string;
  address?: string;
  isDefault?: boolean;
  sections: MarketSection[];
}
