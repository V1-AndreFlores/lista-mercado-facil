import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Market } from '../../domain/entities/Market';
import { normalizeText } from '../../domain/services/normalizeText';
import { createMarketWithDefaultSections } from '../../domain/services/createMarketWithDefaultSections';
import { reorderMarketSection, type MarketSectionMoveDirection } from '../../domain/services/reorderMarketSections';
import { createMarketRepository } from '../../infrastructure/repositories/MarketRepositoryFactory';
import { useAppDispatch } from '../../app/store/hooks';
import { setSelectedMarketId } from '../../app/store/slices/marketSlice';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

interface MarketFormState {
  mode: 'create' | 'edit';
  market?: Market;
}

export function MarketsScreen() {
  const dispatch = useAppDispatch();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [activeMarketId, setActiveMarketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [formState, setFormState] = useState<MarketFormState | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const sortedMarkets = useMemo(
    () => [...markets].sort((left, right) => {
      if (left.id === activeMarketId) return -1;
      if (right.id === activeMarketId) return 1;
      if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1;
      return left.name.localeCompare(right.name, 'pt-BR');
    }),
    [markets, activeMarketId],
  );

  const loadMarkets = useCallback(async () => {
    setIsLoading(true);
    setScreenError(null);

    try {
      const repository = await createMarketRepository();
      const [result, activeId] = await Promise.all([
        repository.getAll(),
        repository.getActiveMarketId(),
      ]);

      const fallbackMarket = result.find((market) => market.isDefault) ?? result[0] ?? null;
      const resolvedActiveId = activeId ?? fallbackMarket?.id ?? null;

      if (resolvedActiveId && !activeId) {
        await repository.setActiveMarketId(resolvedActiveId);
      }

      setMarkets(result);
      setActiveMarketId(resolvedActiveId);
      dispatch(setSelectedMarketId(resolvedActiveId));
    } catch {
      setScreenError('Não foi possível carregar os supermercados.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      void loadMarkets();
    }, [loadMarkets]),
  );

  async function handleMoveSection(market: Market, sectionId: string, direction: MarketSectionMoveDirection) {
    if (savingSectionId || isSaving) {
      return;
    }

    const updatedMarket = reorderMarketSection(market, sectionId, direction);

    if (updatedMarket === market) {
      return;
    }

    setSavingSectionId(sectionId);
    setScreenError(null);

    try {
      const repository = await createMarketRepository();
      await repository.update(updatedMarket);
      setMarkets((currentMarkets) => currentMarkets.map((currentMarket) => (
        currentMarket.id === updatedMarket.id ? updatedMarket : currentMarket
      )));
    } catch {
      setScreenError('Não foi possível salvar a nova ordem dos setores.');
    } finally {
      setSavingSectionId(null);
    }
  }

  async function handleSelectMarket(market: Market) {
    if (isSaving || activeMarketId === market.id) {
      return;
    }

    setIsSaving(true);
    setScreenError(null);

    try {
      const repository = await createMarketRepository();
      await repository.setActiveMarketId(market.id);
      setActiveMarketId(market.id);
      dispatch(setSelectedMarketId(market.id));
    } catch {
      setScreenError('Não foi possível selecionar este supermercado.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveMarketName(name: string) {
    if (!formState || isSaving) {
      return;
    }

    const trimmedName = name.trim();
    const normalizedName = normalizeText(trimmedName);
    const isDuplicate = markets.some((market) => (
      normalizeText(market.name) === normalizedName && market.id !== formState.market?.id
    ));

    if (!trimmedName) {
      throw new Error('Informe o nome do supermercado.');
    }

    if (isDuplicate) {
      throw new Error('Já existe um supermercado com esse nome.');
    }

    setIsSaving(true);
    setScreenError(null);

    try {
      const repository = await createMarketRepository();

      if (formState.mode === 'create') {
        const newMarket = createMarketWithDefaultSections(trimmedName);
        await repository.save(newMarket);
        await repository.setActiveMarketId(newMarket.id);
        setMarkets((currentMarkets) => [...currentMarkets, newMarket]);
        setActiveMarketId(newMarket.id);
        dispatch(setSelectedMarketId(newMarket.id));
      } else if (formState.market) {
        const updatedMarket: Market = {
          ...formState.market,
          name: trimmedName,
        };
        await repository.update(updatedMarket);
        setMarkets((currentMarkets) => currentMarkets.map((market) => (
          market.id === updatedMarket.id ? updatedMarket : market
        )));
      }

      setFormState(null);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppScreen bottomNavigation={false} contentStyle={styles.centeredContainer}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText muted style={styles.loadingText}>Carregando supermercados...</AppText>
      </AppScreen>
    );
  }

  return (
    <>
      <AppScreen scroll>
        <AppGradientHeader
          compact
          eyebrow="Mercados"
          title="Supermercados"
          description="Cadastre mercados e ajuste a ordem dos setores para montar a rota de compra ideal."
        />

        <View style={styles.content}>
          {screenError ? (
            <AppCard elevated style={styles.errorCard}>
              <AppText variant="subtitle">Ajuste não salvo</AppText>
              <AppText muted style={styles.errorText}>{screenError}</AppText>
            </AppCard>
          ) : null}

          <AppCard elevated style={styles.createCard}>
            <View style={styles.createContent}>
              <View style={styles.createTextContainer}>
                <AppText variant="subtitle">Novo supermercado</AppText>
                <AppText muted style={styles.createDescription}>
                  Cada mercado pode ter sua própria ordem de setores.
                </AppText>
              </View>
              <AppButton style={styles.createButton} onPress={() => setFormState({ mode: 'create' })}>
                Adicionar
              </AppButton>
            </View>
          </AppCard>

          {sortedMarkets.map((market) => (
            <MarketRouteCard
              key={market.id}
              market={market}
              isActive={market.id === activeMarketId}
              isSaving={isSaving}
              savingSectionId={savingSectionId}
              onSelectMarket={handleSelectMarket}
              onEditMarket={(selectedMarket) => setFormState({ mode: 'edit', market: selectedMarket })}
              onMoveSection={handleMoveSection}
            />
          ))}
        </View>
      </AppScreen>

      <MarketFormModal
        visible={Boolean(formState)}
        mode={formState?.mode ?? 'create'}
        initialName={formState?.market?.name ?? ''}
        isSaving={isSaving}
        onCancel={() => setFormState(null)}
        onSave={handleSaveMarketName}
      />
    </>
  );
}

interface MarketRouteCardProps {
  market: Market;
  isActive: boolean;
  isSaving: boolean;
  savingSectionId: string | null;
  onSelectMarket: (market: Market) => void;
  onEditMarket: (market: Market) => void;
  onMoveSection: (market: Market, sectionId: string, direction: MarketSectionMoveDirection) => void;
}

function MarketRouteCard({
  market,
  isActive,
  isSaving,
  savingSectionId,
  onSelectMarket,
  onEditMarket,
  onMoveSection,
}: MarketRouteCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const orderedSections = useMemo(
    () => [...market.sections].sort((left, right) => left.routeOrder - right.routeOrder),
    [market.sections],
  );

  return (
    <AppCard elevated style={[styles.card, isActive ? styles.cardActive : null]}>
      <View style={styles.marketHeader}>
        <View style={styles.marketTitleRow}>
          <View style={styles.marketTitleContainer}>
            <View style={styles.badgeRow}>
              <View style={[styles.marketBadge, isActive ? styles.activeBadge : null]}>
                <AppText variant="caption" style={[styles.marketBadgeText, isActive ? styles.activeBadgeText : null]}>
                  {isActive ? 'Ativo' : market.isDefault ? 'Inicial' : 'Cadastrado'}
                </AppText>
              </View>
            </View>

            <AppText variant="subtitle" style={styles.marketName}>{market.name}</AppText>
            {!!market.address && <AppText muted style={styles.address}>{market.address}</AppText>}
          </View>
        </View>

        <View style={styles.marketActions}>
          <SecondaryActionButton
            label="Editar"
            disabled={isSaving}
            onPress={() => onEditMarket(market)}
          />
          <SecondaryActionButton
            label={isActive ? 'Selecionado' : 'Selecionar'}
            disabled={isSaving || isActive}
            highlighted={!isActive}
            onPress={() => onSelectMarket(market)}
          />
        </View>
      </View>

      <View style={styles.sectionIntro}>
        <View>
          <AppText variant="label" accent>Rota de setores</AppText>
          <AppText muted style={styles.sectionHint}>Use subir e descer para ajustar o caminho real dentro do mercado.</AppText>
        </View>
      </View>

      <View style={styles.sectionsList}>
        {orderedSections.map((section, index) => {
          const isFirst = index === 0;
          const isLast = index === orderedSections.length - 1;
          const isSectionSaving = savingSectionId === section.id;
          const shouldDisableActions = Boolean(savingSectionId) || isSaving;

          return (
            <View key={section.id} style={styles.sectionRow}>
              <View style={styles.routeIndex}>
                <AppText variant="caption" style={styles.routeIndexText}>{index + 1}</AppText>
              </View>

              <View style={styles.sectionInfo}>
                <AppText style={styles.sectionName}>{section.name}</AppText>
                <AppText subtle variant="caption">Setor ativo</AppText>
              </View>

              <View style={styles.sectionActions}>
                <RouteButton
                  label="Subir"
                  disabled={isFirst || shouldDisableActions}
                  loading={isSectionSaving && !isFirst}
                  onPress={() => onMoveSection(market, section.id, 'up')}
                />
                <RouteButton
                  label="Descer"
                  disabled={isLast || shouldDisableActions}
                  loading={isSectionSaving && !isLast}
                  onPress={() => onMoveSection(market, section.id, 'down')}
                />
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}

interface MarketFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialName: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (name: string) => Promise<void>;
}

function MarketFormModal({ visible, mode, initialName, isSaving, onCancel, onSave }: MarketFormModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useFocusReset(visible, initialName, setName, setError);

  async function handleSave() {
    setError(null);

    try {
      await onSave(name);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar o supermercado.');
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            {mode === 'create' ? 'Adicionar mercado' : 'Editar mercado'}
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Informe um nome fácil de reconhecer. A ordem dos setores poderá ser ajustada em seguida.
          </AppText>

          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (error) setError(null);
            }}
            placeholder="Ex.: Mercado do bairro"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.modalInput}
            autoCorrect={false}
            autoFocus
          />

          {error ? (
            <AppText variant="caption" style={styles.validationMessage}>{error}</AppText>
          ) : null}

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              disabled={isSaving}
              style={({ pressed }) => [styles.modalButton, styles.modalCancelButton, pressed ? styles.pressed : null]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>Cancelar</AppText>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={({ pressed }) => [styles.modalButton, styles.modalPrimaryButton, pressed ? styles.pressed : null]}
            >
              <AppText variant="caption" style={styles.modalPrimaryText}>
                {isSaving ? 'Salvando' : 'Salvar'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function useFocusReset(
  visible: boolean,
  initialName: string,
  setName: (value: string) => void,
  setError: (value: string | null) => void,
) {
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setError(null);
    }
  }, [visible, initialName, setName, setError]);
}

interface SecondaryActionButtonProps {
  label: string;
  disabled: boolean;
  highlighted?: boolean;
  onPress: () => void;
}

function SecondaryActionButton({ label, disabled, highlighted = false, onPress }: SecondaryActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryActionButton,
        highlighted ? styles.secondaryActionButtonHighlighted : null,
        disabled ? styles.secondaryActionButtonDisabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <AppText
        variant="caption"
        style={[
          styles.secondaryActionButtonText,
          highlighted ? styles.secondaryActionButtonTextHighlighted : null,
          disabled ? styles.secondaryActionButtonTextDisabled : null,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

interface RouteButtonProps {
  label: string;
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
}

function RouteButton({ label, disabled, loading, onPress }: RouteButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.routeButton,
        disabled ? styles.routeButtonDisabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <AppText variant="caption" style={[styles.routeButtonText, disabled ? styles.routeButtonTextDisabled : null]}>
        {loading ? 'Salvando' : label}
      </AppText>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    centeredContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
    },
    content: {
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    errorCard: {
      padding: theme.spacing.lg,
    },
    errorText: {
      marginTop: theme.spacing.sm,
    },
    createCard: {
      padding: theme.spacing.lg,
    },
    createContent: {
      gap: theme.spacing.md,
    },
    createTextContainer: {
      gap: theme.spacing.xs,
    },
    createDescription: {
      fontSize: 13,
      lineHeight: 19,
    },
    createButton: {
      width: '100%',
    },
    card: {
      padding: 0,
      overflow: 'hidden',
    },
    cardActive: {
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    marketHeader: {
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.lg,
    },
    marketTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    marketTitleContainer: {
      flex: 1,
    },
    badgeRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    marketBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
    },
    activeBadge: {
      backgroundColor: theme.colors.primarySoft,
    },
    marketBadgeText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    activeBadgeText: {
      color: theme.colors.primaryStrong,
    },
    marketName: {
      fontSize: 18,
      lineHeight: 24,
    },
    address: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
    },
    marketActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    secondaryActionButton: {
      minHeight: 38,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.md,
    },
    secondaryActionButtonHighlighted: {
      backgroundColor: theme.colors.primarySoft,
    },
    secondaryActionButtonDisabled: {
      opacity: 0.62,
    },
    secondaryActionButtonText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    secondaryActionButtonTextHighlighted: {
      color: theme.colors.primaryStrong,
    },
    secondaryActionButtonTextDisabled: {
      color: theme.colors.textSubtle,
    },
    sectionIntro: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    sectionHint: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
      lineHeight: 19,
    },
    sectionsList: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionRow: {
      minHeight: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    routeIndex: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primarySoft,
    },
    routeIndexText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    sectionInfo: {
      flex: 1,
      gap: 2,
    },
    sectionName: {
      fontWeight: '900',
    },
    sectionActions: {
      width: 74,
      gap: 6,
    },
    routeButton: {
      minHeight: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceMuted,
    },
    routeButtonDisabled: {
      opacity: 0.45,
    },
    routeButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    routeButtonTextDisabled: {
      color: theme.colors.textSubtle,
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
    modalInput: {
      minHeight: 54,
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      backgroundColor: theme.colors.inputBackground,
    },
    validationMessage: {
      marginTop: theme.spacing.sm,
      color: theme.mode === 'dark' ? '#FCA5A5' : '#B91C1C',
      fontWeight: '800',
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
    modalPrimaryButton: {
      backgroundColor: theme.colors.primary,
    },
    modalCancelText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    modalPrimaryText: {
      color: theme.colors.primaryText,
      fontWeight: '900',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
