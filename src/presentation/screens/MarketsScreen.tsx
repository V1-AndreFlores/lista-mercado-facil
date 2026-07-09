import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Market } from '../../domain/entities/Market';
import { reorderMarketSection, type MarketSectionMoveDirection } from '../../domain/services/reorderMarketSections';
import { createMarketRepository } from '../../infrastructure/repositories/MarketRepositoryFactory';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

export function MarketsScreen() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      setIsLoading(true);
      setScreenError(null);

      try {
        const repository = await createMarketRepository();
        const result = await repository.getAll();

        if (isMounted) {
          setMarkets(result);
        }
      } catch {
        if (isMounted) {
          setScreenError('Não foi possível carregar os supermercados.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMarkets();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleMoveSection(market: Market, sectionId: string, direction: MarketSectionMoveDirection) {
    if (savingSectionId) {
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

  if (isLoading) {
    return (
      <AppScreen bottomNavigation={false} contentStyle={styles.centeredContainer}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText muted style={styles.loadingText}>Carregando supermercados...</AppText>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <AppGradientHeader
        compact
        eyebrow="Mercados"
        title="Supermercados"
        description="Organize os setores na mesma ordem em que você costuma percorrer cada mercado."
      />

      <View style={styles.content}>
        {screenError ? (
          <AppCard elevated style={styles.errorCard}>
            <AppText variant="subtitle">Ajuste não salvo</AppText>
            <AppText muted style={styles.errorText}>{screenError}</AppText>
          </AppCard>
        ) : null}

        {markets.map((market) => (
          <MarketRouteCard
            key={market.id}
            market={market}
            savingSectionId={savingSectionId}
            onMoveSection={handleMoveSection}
          />
        ))}
      </View>
    </AppScreen>
  );
}

interface MarketRouteCardProps {
  market: Market;
  savingSectionId: string | null;
  onMoveSection: (market: Market, sectionId: string, direction: MarketSectionMoveDirection) => void;
}

function MarketRouteCard({ market, savingSectionId, onMoveSection }: MarketRouteCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const orderedSections = useMemo(
    () => [...market.sections].sort((left, right) => left.routeOrder - right.routeOrder),
    [market.sections],
  );

  return (
    <AppCard elevated style={styles.card}>
      <View style={styles.marketHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.marketBadge}>
            <AppText variant="caption" style={styles.marketBadgeText}>{market.isDefault ? 'Padrão' : 'Mercado'}</AppText>
          </View>
        </View>

        <AppText variant="subtitle" style={styles.marketName}>{market.name}</AppText>
        {!!market.address && <AppText muted style={styles.address}>{market.address}</AppText>}
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
          const isSaving = savingSectionId === section.id;
          const shouldDisableActions = Boolean(savingSectionId);

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
                  loading={isSaving && !isFirst}
                  onPress={() => onMoveSection(market, section.id, 'up')}
                />
                <RouteButton
                  label="Descer"
                  disabled={isLast || shouldDisableActions}
                  loading={isSaving && !isLast}
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
    card: {
      padding: 0,
      overflow: 'hidden',
    },
    marketHeader: {
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    badgeRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    marketBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
    },
    marketBadgeText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    marketName: {
      marginBottom: theme.spacing.xs,
    },
    address: {
      marginTop: theme.spacing.xs,
      lineHeight: 20,
    },
    sectionIntro: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    sectionHint: {
      marginTop: theme.spacing.xs,
      lineHeight: 19,
      fontSize: 13,
    },
    sectionsList: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionRow: {
      minHeight: 74,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.md,
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
      minWidth: 0,
    },
    sectionName: {
      fontWeight: '900',
    },
    sectionActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    routeButton: {
      minHeight: 34,
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.backgroundAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    routeButtonDisabled: {
      opacity: 0.42,
    },
    routeButtonText: {
      color: theme.colors.primary,
      fontWeight: '900',
    },
    routeButtonTextDisabled: {
      color: theme.colors.textSubtle,
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
