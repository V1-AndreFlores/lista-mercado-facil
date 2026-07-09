import { Market } from '../../domain/entities/Market';

export const defaultMarkets: Market[] = [
  {
    id: 'market-zaffari-fernandes-vieira',
    name: 'Zaffari Fernandes Vieira',
    address: 'Rua Fernandes Vieira, Porto Alegre - RS',
    isDefault: true,
    sections: [
      { id: 'section-001', marketId: 'market-zaffari-fernandes-vieira', name: 'Hortifruti', routeOrder: 1, isActive: true },
      { id: 'section-002', marketId: 'market-zaffari-fernandes-vieira', name: 'Padaria', routeOrder: 2, isActive: true },
      { id: 'section-003', marketId: 'market-zaffari-fernandes-vieira', name: 'Açougue', routeOrder: 3, isActive: true },
      { id: 'section-004', marketId: 'market-zaffari-fernandes-vieira', name: 'Peixaria', routeOrder: 4, isActive: true },
      { id: 'section-005', marketId: 'market-zaffari-fernandes-vieira', name: 'Frios e laticínios', routeOrder: 5, isActive: true },
      { id: 'section-006', marketId: 'market-zaffari-fernandes-vieira', name: 'Congelados', routeOrder: 6, isActive: true },
      { id: 'section-007', marketId: 'market-zaffari-fernandes-vieira', name: 'Mercearia', routeOrder: 7, isActive: true },
      { id: 'section-008', marketId: 'market-zaffari-fernandes-vieira', name: 'Bebidas', routeOrder: 8, isActive: true },
      { id: 'section-009', marketId: 'market-zaffari-fernandes-vieira', name: 'Higiene pessoal', routeOrder: 9, isActive: true },
      { id: 'section-010', marketId: 'market-zaffari-fernandes-vieira', name: 'Limpeza', routeOrder: 10, isActive: true },
      { id: 'section-011', marketId: 'market-zaffari-fernandes-vieira', name: 'Pet', routeOrder: 11, isActive: true },
      { id: 'section-012', marketId: 'market-zaffari-fernandes-vieira', name: 'Utilidades', routeOrder: 12, isActive: true },
      { id: 'section-013', marketId: 'market-zaffari-fernandes-vieira', name: 'Outros', routeOrder: 99, isActive: true },
    ],
  },
];
