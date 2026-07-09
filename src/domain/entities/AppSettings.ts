export type HistoryRetentionDays = null | 30 | 60 | 90;

export interface AppSettings {
  historyRetentionDays: HistoryRetentionDays;
}

export const defaultAppSettings: AppSettings = {
  historyRetentionDays: null,
};

export interface HistoryRetentionOption {
  label: string;
  description: string;
  value: HistoryRetentionDays;
}

export const historyRetentionOptions: HistoryRetentionOption[] = [
  {
    label: 'Sempre',
    description: 'Não remover automaticamente compras concluídas.',
    value: null,
  },
  {
    label: 'Últimos 30 dias',
    description: 'Manter apenas compras concluídas nos últimos 30 dias.',
    value: 30,
  },
  {
    label: 'Últimos 60 dias',
    description: 'Manter apenas compras concluídas nos últimos 60 dias.',
    value: 60,
  },
  {
    label: 'Últimos 90 dias',
    description: 'Manter apenas compras concluídas nos últimos 90 dias.',
    value: 90,
  },
];
