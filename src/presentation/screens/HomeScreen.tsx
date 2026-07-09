import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation/AppNavigator';
import { useAppDispatch } from '../../app/store/hooks';
import { setSelectedMarketId } from '../../app/store/slices/marketSlice';
import { setActiveList } from '../../app/store/slices/shoppingListSlice';
import { ShoppingList } from '../../domain/entities/ShoppingList';
import { defaultShoppingListName } from '../../domain/constants/shoppingListDefaults';
import { AppSettingsRepository } from '../../infrastructure/repositories/AppSettingsRepository';
import { createMarketRepository } from '../../infrastructure/repositories/MarketRepositoryFactory';
import { createShoppingListRepository } from '../../infrastructure/repositories/ShoppingListRepositoryFactory';
import { AppActionCard } from '../components/AppActionCard';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const appSettingsRepository = new AppSettingsRepository();

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [history, setHistory] = useState<ShoppingList[]>([]);
  const [marketNamesById, setMarketNamesById] = useState<Record<string, string>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [reusingListId, setReusingListId] = useState<string | null>(null);
  const [deletingHistoryListId, setDeletingHistoryListId] = useState<string | null>(null);
  const [historyListPendingDeletion, setHistoryListPendingDeletion] =
    useState<ShoppingList | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const [repository, marketRepository, settings] = await Promise.all([
        createShoppingListRepository(),
        createMarketRepository(),
        appSettingsRepository.getSettings(),
      ]);

      await repository.pruneCompletedLists(settings.historyRetentionDays);

      const [completedLists, markets] = await Promise.all([
        repository.getCompleted(),
        marketRepository.getAll(),
      ]);

      setHistory(completedLists);
      setMarketNamesById(
        markets.reduce<Record<string, string>>((accumulator, market) => {
          accumulator[market.id] = market.name;
          return accumulator;
        }, {}),
      );
    } catch {
      setHistoryError('Não foi possível carregar o histórico.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  async function handleReuseList(list: ShoppingList) {
    if (reusingListId || deletingHistoryListId) {
      return;
    }

    setReusingListId(list.id);
    setHistoryError(null);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const marketRepository = await createMarketRepository();
      const reusedList = await shoppingListRepository.reuseListAsActive(
        list.id,
        defaultShoppingListName,
      );

      await marketRepository.setActiveMarketId(reusedList.marketId);
      dispatch(setSelectedMarketId(reusedList.marketId));
      dispatch(setActiveList(reusedList));
      navigation.navigate('ShoppingList');
    } catch {
      setHistoryError('Não foi possível reutilizar esta lista.');
    } finally {
      setReusingListId(null);
    }
  }

  function handleRequestDeleteHistoryList(list: ShoppingList) {
    if (reusingListId || deletingHistoryListId) {
      return;
    }

    setHistoryListPendingDeletion(list);
  }

  function handleCancelDeleteHistoryList() {
    if (deletingHistoryListId) {
      return;
    }

    setHistoryListPendingDeletion(null);
  }

  async function handleConfirmDeleteHistoryList() {
    if (!historyListPendingDeletion || deletingHistoryListId) {
      return;
    }

    setDeletingHistoryListId(historyListPendingDeletion.id);
    setHistoryError(null);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      await shoppingListRepository.deleteList(historyListPendingDeletion.id);
      setHistory((currentHistory) =>
        currentHistory.filter((list) => list.id !== historyListPendingDeletion.id),
      );
      setHistoryListPendingDeletion(null);
    } catch {
      setHistoryError('Não foi possível apagar esta lista do histórico.');
    } finally {
      setDeletingHistoryListId(null);
    }
  }

  return (
    <>
      <AppScreen scroll>
        <AppGradientHeader
          eyebrow="Compras inteligentes"
          title="Lista de Mercado Fácil"
          description="Monte sua lista, organize por setores e siga uma rota mais eficiente no supermercado."
        />

        <View style={styles.content}>
          <AppCard elevated style={styles.primaryCard}>
            <View style={styles.primaryAccent} />
            <AppText variant="label" accent>Rota de compra</AppText>
            <AppText variant="headline" style={styles.cardTitle}>Sua lista em ordem, setor por setor.</AppText>
            <AppText muted style={styles.cardDescription}>
              Adicione produtos e o aplicativo agrupa tudo conforme os setores do supermercado selecionado.
            </AppText>
            <AppButton onPress={() => navigation.navigate('ShoppingList')} style={styles.primaryButton}>
              Começar lista
            </AppButton>
          </AppCard>

          <View style={styles.actionsRow}>
            <AppActionCard
              label="Mercados"
              title="Supermercados"
              description="Personalize setores e rotas por mercado."
              onPress={() => navigation.navigate('Markets')}
            />
            <AppActionCard
              label="Ajustes"
              title="Configurações"
              description="Tema e histórico de compras."
              onPress={() => navigation.navigate('Settings')}
            />
          </View>

          <View style={styles.historyHeader}>
            <View>
              <AppText variant="label" accent>Histórico</AppText>
              <AppText variant="subtitle" style={styles.historyTitle}>Listas concluídas</AppText>
            </View>
            {isLoadingHistory ? <ActivityIndicator color={theme.colors.primary} /> : null}
          </View>

          {historyError ? (
            <AppCard elevated style={styles.errorCard}>
              <AppText muted>{historyError}</AppText>
            </AppCard>
          ) : null}

          {!isLoadingHistory && history.length === 0 ? (
            <AppCard elevated style={styles.emptyHistoryCard}>
              <AppText variant="subtitle">Nenhuma compra concluída ainda</AppText>
              <AppText muted style={styles.emptyHistoryText}>
                Quando você concluir uma compra, ela aparecerá aqui para consulta e reutilização futura.
              </AppText>
            </AppCard>
          ) : null}

          {history.map((list) => (
            <HistoryListCard
              key={list.id}
              list={list}
              marketName={marketNamesById[list.marketId] ?? 'Mercado não informado'}
              isReusing={reusingListId === list.id}
              isDeleting={deletingHistoryListId === list.id}
              onReuse={() => handleReuseList(list)}
              onDelete={() => handleRequestDeleteHistoryList(list)}
            />
          ))}
        </View>
      </AppScreen>

      <ConfirmDeleteHistoryListModal
        visible={Boolean(historyListPendingDeletion)}
        listName={historyListPendingDeletion?.name ?? ''}
        isDeleting={Boolean(deletingHistoryListId)}
        onCancel={handleCancelDeleteHistoryList}
        onConfirm={handleConfirmDeleteHistoryList}
      />
    </>
  );
}

interface HistoryListCardProps {
  list: ShoppingList;
  marketName: string;
  isReusing: boolean;
  isDeleting: boolean;
  onReuse: () => void;
  onDelete: () => void;
}

function HistoryListCard({
  list,
  marketName,
  isReusing,
  isDeleting,
  onReuse,
  onDelete,
}: HistoryListCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const completedDateTime = formatDateTime(list.completedAt ?? list.updatedAt);
  const isBusy = isReusing || isDeleting;

  return (
    <AppCard elevated style={styles.historyCard}>
      <View style={styles.historyCardContent}>
        <View style={styles.historyTextContainer}>
          <AppText variant="subtitle" style={styles.historyListName}>
            {list.name}
          </AppText>
          <AppText muted style={styles.historyListMeta}>
            Concluída em {completedDateTime} · {list.items.length} item{list.items.length === 1 ? '' : 's'}
          </AppText>
          <AppText muted style={styles.historyListMeta}>
            {marketName}
          </AppText>
        </View>

        <View style={styles.historyActions}>
          <Pressable
            disabled={isBusy}
            onPress={onReuse}
            style={({ pressed }) => [
              styles.reuseButton,
              isBusy ? styles.disabledButton : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppText variant="caption" style={styles.reuseButtonText}>
              {isReusing ? '...' : 'Reutilizar'}
            </AppText>
          </Pressable>

          <Pressable
            disabled={isBusy}
            onPress={onDelete}
            style={({ pressed }) => [
              styles.deleteHistoryButton,
              isBusy ? styles.disabledButton : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppText variant="caption" style={styles.deleteHistoryButtonText}>
              {isDeleting ? '...' : 'Apagar'}
            </AppText>
          </Pressable>
        </View>
      </View>
    </AppCard>
  );
}

interface ConfirmDeleteHistoryListModalProps {
  visible: boolean;
  listName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteHistoryListModal({
  visible,
  listName,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteHistoryListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Apagar histórico?
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Você está prestes a apagar "{listName}" do histórico. Essa ação não poderá ser desfeita.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable
              disabled={isDeleting}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              disabled={isDeleting}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalDangerButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalDangerText}>
                {isDeleting ? 'Apagando...' : 'Apagar'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'data não informada';
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${formattedDate} às ${formattedTime}`;
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    primaryCard: {
      position: 'relative',
      overflow: 'hidden',
    },
    primaryAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: theme.colors.accent,
    },
    cardTitle: {
      marginTop: theme.spacing.sm,
    },
    cardDescription: {
      marginTop: theme.spacing.md,
    },
    primaryButton: {
      marginTop: theme.spacing.xl,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    historyTitle: {
      marginTop: theme.spacing.xs,
    },
    errorCard: {
      padding: theme.spacing.lg,
    },
    emptyHistoryCard: {
      padding: theme.spacing.xl,
    },
    emptyHistoryText: {
      marginTop: theme.spacing.sm,
    },
    historyCard: {
      padding: 0,
      overflow: 'hidden',
    },
    historyCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    historyTextContainer: {
      flex: 1,
    },
    historyListName: {
      fontSize: 16,
      lineHeight: 22,
    },
    historyListMeta: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
    },
    historyActions: {
      gap: theme.spacing.sm,
    },
    reuseButton: {
      minHeight: 38,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: theme.spacing.md,
    },
    reuseButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    deleteHistoryButton: {
      minHeight: 34,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.mode === 'dark' ? '#3F1D1D' : '#FEE2E2',
      paddingHorizontal: theme.spacing.md,
    },
    deleteHistoryButtonText: {
      color: theme.mode === 'dark' ? '#FECACA' : '#B91C1C',
      fontWeight: '900',
    },
    disabledButton: {
      opacity: 0.48,
    },
    modalOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(2, 6, 23, 0.78)'
          : 'rgba(15, 23, 42, 0.34)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: theme.mode === 'dark' ? 0.42 : 0.18,
      shadowRadius: 30,
      elevation: 8,
    },
    modalTitle: {
      color: theme.colors.text,
    },
    modalDescription: {
      marginTop: theme.spacing.sm,
      lineHeight: 22,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    modalButton: {
      minHeight: 42,
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
    },
    modalCancelButton: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    modalDangerButton: {
      backgroundColor: theme.mode === 'dark' ? '#7F1D1D' : '#FEE2E2',
    },
    modalCancelText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    modalDangerText: {
      color: theme.mode === 'dark' ? '#FECACA' : '#B91C1C',
      fontWeight: '900',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
