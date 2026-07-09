export type AppStartupTaskName =
  | 'history-retention-cleanup'
  | 'default-corridors-integrity';

export type AppStartupTaskStatus = 'success' | 'failed';

export type AppStartupTaskResult = {
  name: AppStartupTaskName;
  status: AppStartupTaskStatus;
  errorMessage?: string;
};

type StartupTask = {
  name: AppStartupTaskName;
  execute: () => Promise<void>;
};

export async function runAppStartupTasks(): Promise<AppStartupTaskResult[]> {
  const tasks: StartupTask[] = [
    {
      name: 'history-retention-cleanup',
      execute: cleanPurchaseHistoryByRetentionPolicy,
    },
    {
      name: 'default-corridors-integrity',
      execute: ensureDefaultCorridorsIntegrity,
    },
  ];

  const results: AppStartupTaskResult[] = [];

  for (const task of tasks) {
    try {
      await task.execute();

      results.push({
        name: task.name,
        status: 'success',
      });
    } catch (error) {
      results.push({
        name: task.name,
        status: 'failed',
        errorMessage: getErrorMessage(error),
      });
    }
  }

  return results;
}

async function cleanPurchaseHistoryByRetentionPolicy(): Promise<void> {
  /*
    Ponto de integração da limpeza real do histórico.

    Regra funcional já definida:
    - Sempre: não apagar nada.
    - Últimos 30 dias: apagar históricos anteriores a 30 dias.
    - Últimos 60 dias: apagar históricos anteriores a 60 dias.
    - Últimos 90 dias: apagar históricos anteriores a 90 dias.
    - Se falhar: não bloquear o app.
    - Nova tentativa: próxima abertura do app.

    Esta função será conectada ao repositório real do histórico assim que verificarmos:
    - chave usada no AsyncStorage;
    - estrutura da entidade de histórico;
    - onde a retenção está salva.
  */
}

async function ensureDefaultCorridorsIntegrity(): Promise<void> {
  /*
    Ponto de integração dos Corredores padrão.

    Regra funcional já definida:
    - Manter a lista inicial que já existe hoje.
    - Usar essa lista como base para novos supermercados.
    - Alterações em Corredores padrão não alteram mercados existentes.
    - Alterações em Corredores do mercado afetam somente aquele mercado.
  */
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido durante a inicialização do app.';
}