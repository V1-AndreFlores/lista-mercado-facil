import { Market } from '../../domain/entities/Market';

const zaffariMarketId = 'market-zaffari-fernandes-vieira';

export const defaultMarkets: Market[] = [
  {
    id: zaffariMarketId,
    name: 'Zaffari Fernandes Vieira',
    isDefault: true,
    sections: [
      { id: 'section-001', marketId: zaffariMarketId, aisleNumber: '1', name: 'Óleos, Conservas e Molhos', routeOrder: 1, isActive: true },
      { id: 'section-002', marketId: zaffariMarketId, aisleNumber: '1', name: 'Dietéticos, Condimentos e Sopas', routeOrder: 2, isActive: true },
      { id: 'section-003', marketId: zaffariMarketId, aisleNumber: '2', name: 'Achocolatados e Leites', routeOrder: 3, isActive: true },
      { id: 'section-004', marketId: zaffariMarketId, aisleNumber: '2', name: 'Café, Chá e Erva-mate', routeOrder: 4, isActive: true },
      { id: 'section-005', marketId: zaffariMarketId, aisleNumber: '3', name: 'Massas, Geléias e Compotas', routeOrder: 5, isActive: true },
      { id: 'section-006', marketId: zaffariMarketId, aisleNumber: '3', name: 'Gelatinas, Margarinas e Massas Frescas', routeOrder: 6, isActive: true },
      { id: 'section-007', marketId: zaffariMarketId, aisleNumber: '4', name: 'Salgadinhos e Bomboniére', routeOrder: 7, isActive: true },
      { id: 'section-008', marketId: zaffariMarketId, aisleNumber: '4', name: 'Laticínios', routeOrder: 8, isActive: true },
      { id: 'section-009', marketId: zaffariMarketId, aisleNumber: '5', name: 'Biscoitos e Cereais Matinais', routeOrder: 9, isActive: true },
      { id: 'section-010', marketId: zaffariMarketId, aisleNumber: '6', name: 'Farinhas, Açúcar e Arroz', routeOrder: 10, isActive: true },
      { id: 'section-011', marketId: zaffariMarketId, aisleNumber: '6', name: 'Congelados', routeOrder: 11, isActive: true },
      { id: 'section-012', marketId: zaffariMarketId, aisleNumber: '7', name: 'Shampoos, Sabonetes e Desodorantes', routeOrder: 12, isActive: true },
      { id: 'section-013', marketId: zaffariMarketId, aisleNumber: '8', name: 'Perfumaria Infantil e Higiene', routeOrder: 13, isActive: true },
      { id: 'section-014', marketId: zaffariMarketId, aisleNumber: '9', name: 'Detergentes, Sabão e Desinfetantes', routeOrder: 14, isActive: true },
      { id: 'section-015', marketId: zaffariMarketId, aisleNumber: '10', name: 'Vassouras, Rações e Inseticidas', routeOrder: 15, isActive: true },
      { id: 'section-016', marketId: zaffariMarketId, aisleNumber: '11', name: 'Utilidades, Material Elétrico e Automotivos', routeOrder: 16, isActive: true },
      { id: 'section-017', marketId: zaffariMarketId, aisleNumber: '12', name: 'Plásticos, Festas e Escolar', routeOrder: 17, isActive: true },
      { id: 'section-018', marketId: zaffariMarketId, aisleNumber: '13', name: 'Refrigerantes e Águas', routeOrder: 18, isActive: true },
      { id: 'section-019', marketId: zaffariMarketId, name: 'Hortifruti', routeOrder: 19, isActive: true },
      { id: 'section-020', marketId: zaffariMarketId, name: 'Açougue', routeOrder: 20, isActive: true },
      { id: 'section-021', marketId: zaffariMarketId, name: 'Peixaria', routeOrder: 21, isActive: true },
      { id: 'section-022', marketId: zaffariMarketId, name: 'Padaria', routeOrder: 22, isActive: true },
      { id: 'section-023', marketId: zaffariMarketId, name: 'Rotisseria', routeOrder: 23, isActive: true },
      { id: 'section-024', marketId: zaffariMarketId, name: 'Fiambreria', routeOrder: 24, isActive: true },
      { id: 'section-025', marketId: zaffariMarketId, name: 'Frios, Queijos e Embutidos', routeOrder: 25, isActive: true },
      { id: 'section-026', marketId: zaffariMarketId, name: 'Outros', routeOrder: 26, isActive: true },
    ],
  },
];
