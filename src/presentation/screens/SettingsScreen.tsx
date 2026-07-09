import { StyleSheet, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { persistThemeMode } from '../../application/state/theme/themeSlice';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { AppThemeSwitch } from '../components/AppThemeSwitch';
import { useAppTheme } from '../components/useAppTheme';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const isDarkMode = themeMode === 'dark';
  const theme = useAppTheme();
  const styles = createStyles(theme);

  function handleThemeChange(value: boolean) {
    void dispatch(persistThemeMode(value ? 'dark' : 'light'));
  }

  return (
    <AppScreen scroll>
      <AppGradientHeader
        compact
        eyebrow="Ajustes"
        title="Configurações"
        description="Controle a aparência e mantenha o aplicativo confortável para o seu uso diário."
      />

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <AppText variant="label" accent>Aparência</AppText>
          <AppText muted style={styles.sectionDescription}>Preferências visuais salvas neste dispositivo.</AppText>
        </View>

        <AppCard style={styles.settingsPanel}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <AppText variant="subtitle">Tema escuro</AppText>
              <AppText muted style={styles.caption}>
                Ative um visual azul escuro com alto contraste para ambientes com pouca luz.
              </AppText>
            </View>

            <AppThemeSwitch value={isDarkMode} onValueChange={handleThemeChange} />
          </View>
        </AppCard>

        <View style={styles.infoBlock}>
          <View style={styles.infoAccent} />
          <View style={styles.infoText}>
            <AppText variant="label" accent>Aplicativo gratuito</AppText>
            <AppText muted style={styles.caption}>
              A proposta é manter o uso sem anúncios, sem login obrigatório e sem dependência de serviços pagos para a função principal.
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
    sectionHeader: {
      gap: theme.spacing.xs,
    },
    sectionDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    settingsPanel: {
      padding: 0,
      overflow: 'hidden',
    },
    settingRow: {
      minHeight: 104,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    settingText: {
      flex: 1,
    },
    caption: {
      marginTop: theme.spacing.sm,
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
      backgroundColor: theme.colors.accent,
    },
    infoText: {
      flex: 1,
    },
  });
}
