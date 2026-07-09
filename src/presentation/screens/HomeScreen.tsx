import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation/AppNavigator';
import { AppActionCard } from '../components/AppActionCard';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
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
            description="Defina tema claro ou escuro."
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.infoAccent} />
          <View style={styles.infoText}>
            <AppText variant="label" accent>Inteligência local</AppText>
            <AppText variant="subtitle" style={styles.infoTitle}>Simples, rápido e útil.</AppText>
            <AppText muted style={styles.infoDescription}>
              A primeira versão usa regras locais para categorizar produtos. Nas próximas evoluções, o app poderá aprender com correções feitas por você.
            </AppText>
          </View>
        </View>
      </View>
    </AppScreen>
  );
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
    infoBlock: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.mode === 'dark' ? 0.16 : 0.07,
      shadowRadius: 16,
      elevation: 2,
    },
    infoAccent: {
      width: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    infoText: {
      flex: 1,
    },
    infoTitle: {
      marginTop: theme.spacing.sm,
    },
    infoDescription: {
      marginTop: theme.spacing.sm,
    },
  });
}
