import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Market } from '../../domain/entities/Market';
import { createMarketRepository } from '../../infrastructure/repositories/MarketRepositoryFactory';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

export function MarketsScreen() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      const repository = await createMarketRepository();
      const result = await repository.getAll();

      if (isMounted) {
        setMarkets(result);
        setIsLoading(false);
      }
    }

    void loadMarkets();

    return () => {
      isMounted = false;
    };
  }, []);

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
        description="Cada mercado pode ter sua própria ordem de setores para deixar a compra mais eficiente."
      />

      <View style={styles.content}>
        {markets.map((market) => (
          <AppCard key={market.id} elevated style={styles.card}>
            <View style={styles.marketHeader}>
              <View style={styles.marketBadge}>
                <AppText variant="caption" style={styles.marketBadgeText}>{market.isDefault ? 'Padrão' : 'Mercado'}</AppText>
              </View>
              <AppText variant="subtitle" style={styles.marketName}>{market.name}</AppText>
              {!!market.address && <AppText muted style={styles.address}>{market.address}</AppText>}
            </View>

            <View style={styles.sectionHeader}>
              <AppText variant="label" accent>Rota de setores</AppText>
            </View>

            {market.sections.map((section) => (
              <View key={section.id} style={styles.sectionRow}>
                <View style={styles.routeOrderCircle}>
                  <AppText variant="caption" style={styles.routeOrder}>{section.routeOrder}</AppText>
                </View>
                <AppText muted style={styles.sectionName}>{section.name}</AppText>
              </View>
            ))}
          </AppCard>
        ))}
      </View>
    </AppScreen>
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
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      
    },
    card: {
      padding: theme.spacing.xl,
    },
    marketHeader: {
      marginBottom: theme.spacing.lg,
    },
    marketBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      marginBottom: theme.spacing.md,
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
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.md,
    },
    routeOrderCircle: {
      width: 34,
      height: 28,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
    },
    routeOrder: {
      color: theme.colors.primary,
      fontWeight: '900',
    },
    sectionName: {
      flex: 1,
    },
  });
}
