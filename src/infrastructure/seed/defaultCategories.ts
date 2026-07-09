import { ProductCategory } from '../../domain/entities/ProductCategory';

export const defaultCategories: ProductCategory[] = [
  {
    id: 'produce',
    name: 'Hortifruti',
    defaultSectionName: 'Hortifruti',
    keywords: ['banana', 'maçã', 'maca', 'laranja', 'limão', 'limao', 'alface', 'tomate', 'cebola', 'batata', 'cenoura'],
  },
  {
    id: 'bakery',
    name: 'Padaria',
    defaultSectionName: 'Padaria',
    keywords: ['pão', 'pao', 'cacete', 'baguete', 'bolo', 'torta'],
  },
  {
    id: 'meat',
    name: 'Açougue',
    defaultSectionName: 'Açougue',
    keywords: ['carne', 'frango', 'costela', 'bife', 'linguiça', 'linguica', 'porco'],
  },
  {
    id: 'dairy',
    name: 'Frios e laticínios',
    defaultSectionName: 'Frios e laticínios',
    keywords: ['leite', 'queijo', 'iogurte', 'manteiga', 'requeijão', 'requeijao', 'presunto'],
  },
  {
    id: 'grocery',
    name: 'Mercearia',
    defaultSectionName: 'Mercearia',
    keywords: ['arroz', 'feijão', 'feijao', 'café', 'cafe', 'açúcar', 'acucar', 'farinha', 'massa', 'macarrão', 'macarrao'],
  },
  {
    id: 'beverages',
    name: 'Bebidas',
    defaultSectionName: 'Bebidas',
    keywords: ['água', 'agua', 'suco', 'refrigerante', 'cerveja', 'vinho', 'isotônico', 'isotonico'],
  },
  {
    id: 'cleaning',
    name: 'Limpeza',
    defaultSectionName: 'Limpeza',
    keywords: ['detergente', 'sabão em pó', 'sabao em po', 'amaciante', 'desinfetante', 'alvejante', 'esponja'],
  },
  {
    id: 'personal-care',
    name: 'Higiene pessoal',
    defaultSectionName: 'Higiene pessoal',
    keywords: ['papel higiênico', 'papel higienico', 'sabonete', 'shampoo', 'condicionador', 'creme dental', 'desodorante'],
  },
  {
    id: 'pet',
    name: 'Pet',
    defaultSectionName: 'Pet',
    keywords: ['ração', 'racao', 'areia gato', 'petisco pet'],
  },
  {
    id: 'utilities',
    name: 'Utilidades',
    defaultSectionName: 'Utilidades',
    keywords: ['pilha', 'lâmpada', 'lampada', 'guardanapo', 'fósforo', 'fosforo'],
  },
];
