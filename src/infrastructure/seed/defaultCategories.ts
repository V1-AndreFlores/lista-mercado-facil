import { ProductCategory } from '../../domain/entities/ProductCategory';

export const defaultCategories: ProductCategory[] = [
  {
    id: 'produce',
    name: 'Hortifruti',
    defaultSectionName: 'Hortifruti',
    keywords: [
      'abacate', 'abacaxi', 'abóbora', 'abobora', 'alface', 'alho', 'banana', 'batata', 'batata doce',
      'beterraba', 'brócolis', 'brocolis', 'cebola', 'cenoura', 'couve', 'laranja', 'limão', 'limao',
      'maçã', 'maca', 'mamão', 'mamao', 'mandioca', 'manga', 'melancia', 'melão', 'melao', 'morango',
      'pepino', 'pimentão', 'pimentao', 'rúcula', 'rucula', 'tomate', 'uva', 'verdura', 'legume', 'fruta',
    ],
  },
  {
    id: 'bakery',
    name: 'Padaria',
    defaultSectionName: 'Padaria',
    keywords: [
      'baguete', 'biscoito de padaria', 'bolo', 'cacete', 'cuca', 'pão', 'pao', 'pão francês',
      'pao frances', 'pão integral', 'pao integral', 'pão de forma', 'pao de forma', 'sonho', 'torta',
    ],
  },
  {
    id: 'meat',
    name: 'Açougue',
    defaultSectionName: 'Açougue',
    keywords: [
      'alcatra', 'bacon', 'bife', 'carne', 'carne moída', 'carne moida', 'contra filé', 'contra file',
      'costela', 'coxão mole', 'coxao mole', 'frango', 'linguiça', 'linguica', 'maminha', 'patinho',
      'peito de frango', 'pernil', 'porco', 'salsicha',
    ],
  },
  {
    id: 'fish',
    name: 'Peixaria',
    defaultSectionName: 'Peixaria',
    keywords: ['atum fresco', 'bacalhau', 'camarão', 'camarao', 'filé de peixe', 'file de peixe', 'peixe', 'salmão', 'salmao', 'tilápia', 'tilapia'],
  },
  {
    id: 'dairy',
    name: 'Frios e laticínios',
    defaultSectionName: 'Frios e laticínios',
    keywords: [
      'achocolatado pronto', 'bebida láctea', 'bebida lactea', 'coalhada', 'creme de leite', 'iogurte',
      'leite', 'manteiga', 'margarina', 'muçarela', 'mussarela', 'nata', 'presunto', 'queijo',
      'queijo ralado', 'requeijão', 'requeijao', 'ricota', 'salame',
    ],
  },
  {
    id: 'frozen',
    name: 'Congelados',
    defaultSectionName: 'Congelados',
    keywords: [
      'batata congelada', 'congelado', 'hambúrguer congelado', 'hamburguer congelado', 'lasanha congelada',
      'nuggets', 'pizza congelada', 'sorvete', 'vegetais congelados',
    ],
  },
  {
    id: 'grocery',
    name: 'Mercearia',
    defaultSectionName: 'Mercearia',
    keywords: [
      'achocolatado', 'açúcar', 'acucar', 'arroz', 'aveia', 'azeite', 'biscoito', 'bolacha', 'café', 'cafe',
      'canjica', 'chá', 'cha', 'chocolate', 'doce de leite', 'extrato de tomate', 'farinha', 'feijão',
      'feijao', 'fermento', 'granola', 'ketchup', 'maionese', 'massa', 'macarrão', 'macarrao', 'mel',
      'molho de tomate', 'óleo', 'oleo', 'sal', 'sardinha', 'tempero', 'vinagre',
    ],
  },
  {
    id: 'beverages',
    name: 'Bebidas',
    defaultSectionName: 'Bebidas',
    keywords: [
      'água', 'agua', 'água com gás', 'agua com gas', 'chá gelado', 'cha gelado', 'energético', 'energetico',
      'isotônico', 'isotonico', 'refrigerante', 'suco', 'suco integral', 'tônica', 'tonica',
    ],
  },
  {
    id: 'cleaning',
    name: 'Limpeza',
    defaultSectionName: 'Limpeza',
    keywords: [
      'água sanitária', 'agua sanitaria', 'alvejante', 'amaciante', 'desinfetante', 'detergente', 'esponja',
      'lava roupas', 'limpa vidro', 'limpador', 'lustra móveis', 'lustra moveis', 'multiuso', 'pano de chão',
      'pano de chao', 'sabão em pó', 'sabao em po', 'sabão líquido', 'sabao liquido', 'saco de lixo',
    ],
  },
  {
    id: 'personal-care',
    name: 'Higiene pessoal',
    defaultSectionName: 'Higiene pessoal',
    keywords: [
      'absorvente', 'algodão', 'algodao', 'barbeador', 'condicionador', 'creme dental', 'desodorante',
      'enxaguante bucal', 'escova de dente', 'fio dental', 'fralda', 'papel higiênico', 'papel higienico',
      'sabonete', 'shampoo', 'toalha umedecida',
    ],
  },
  {
    id: 'pet',
    name: 'Pet',
    defaultSectionName: 'Pet',
    keywords: ['areia gato', 'areia para gato', 'bifinho pet', 'ração', 'racao', 'ração gato', 'racao gato', 'ração cachorro', 'racao cachorro', 'petisco pet'],
  },
  {
    id: 'utilities',
    name: 'Utilidades',
    defaultSectionName: 'Utilidades',
    keywords: [
      'copo descartável', 'copo descartavel', 'filtro de café', 'filtro de cafe', 'fósforo', 'fosforo',
      'guardanapo', 'lâmpada', 'lampada', 'papel alumínio', 'papel aluminio', 'papel filme', 'pilha',
      'prato descartável', 'prato descartavel', 'vela',
    ],
  },
];
