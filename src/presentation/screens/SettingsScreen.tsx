import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { persistThemeMode, setThemeMode } from '../../application/state/theme/themeSlice';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import {
  HistoryRetentionDays,
  historyRetentionOptions,
} from '../../domain/entities/AppSettings';
import { AppSettingsRepository } from '../../infrastructure/repositories/AppSettingsRepository';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { AppThemeSwitch } from '../components/AppThemeSwitch';
import { useAppTheme } from '../components/useAppTheme';

const appSettingsRepository = new AppSettingsRepository();

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const isDarkMode = themeMode === 'dark';
  const [historyRetentionDays, setHistoryRetentionDays] =
    useState<HistoryRetentionDays>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoadingSettings(true);
      setSettingsError(null);

      try {
        const settings = await appSettingsRepository.getSettings();

        if (isMounted) {
          setHistoryRetentionDays(settings.historyRetentionDays);
        }
      } catch {
        if (isMounted) {
          setSettingsError('Não foi possível carregar as configurações.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleThemeChange(value: boolean) {
    const nextThemeMode = value ? 'dark' : 'light';
    dispatch(setThemeMode(nextThemeMode));
    void dispatch(persistThemeMode(nextThemeMode));
  }

  async function handleHistoryRetentionChange(value: HistoryRetentionDays) {
    setHistoryRetentionDays(value);
    setSettingsError(null);

    try {
      await appSettingsRepository.saveHistoryRetentionDays(value);
    } catch {
      setSettingsError('Não foi possível salvar a configuração do histórico.');
    }
  }

  return (
    <AppScreen scroll>
      <AppGradientHeader
        eyebrow="Ajustes"
        title="Configurações"
        description="Defina o tema do aplicativo e por quanto tempo suas compras concluídas ficam no histórico."
      />

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <AppText variant="label" accent>
            Aparência
          </AppText>
          <AppText muted style={styles.sectionDescription}>
            Preferência visual salva neste dispositivo.
          </AppText>
        </View>

        <AppCard elevated style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <AppText variant="subtitle">Tema escuro</AppText>
              <AppText muted style={styles.caption}>
                Use uma interface em azul escuro com contraste mais alto.
              </AppText>
            </View>

            <AppThemeSwitch value={isDarkMode} onValueChange={handleThemeChange} />
          </View>
        </AppCard>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View>
              <AppText variant="label" accent>
                Histórico
              </AppText>
              <AppText variant="subtitle" style={styles.sectionTitle}>
                Compras concluídas
              </AppText>
            </View>
            {isLoadingSettings ? <ActivityIndicator color={theme.colors.primary} /> : null}
          </View>
          <AppText muted style={styles.sectionDescription}>
            Escolha por quanto tempo as compras finalizadas ficam disponíveis para consulta e reutilização.
          </AppText>
        </View>

        {settingsError ? (
          <AppCard elevated style={styles.errorCard}>
            <AppText style={styles.errorText}>{settingsError}</AppText>
          </AppCard>
        ) : null}

        <AppCard elevated style={styles.retentionCard}>
          {historyRetentionOptions.map((option, index) => {
            const isSelected = option.value === historyRetentionDays;
            const isLast = index === historyRetentionOptions.length - 1;

            return (
              <Pressable
                key={option.label}
                disabled={isLoadingSettings}
                onPress={() => handleHistoryRetentionChange(option.value)}
                style={({ pressed }) => [
                  styles.retentionOption,
                  !isLast ? styles.retentionOptionBorder : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.retentionText}>
                  <AppText
                    variant="subtitle"
                    style={isSelected ? styles.retentionTitleSelected : undefined}
                  >
                    {option.label}
                  </AppText>
                  <AppText muted style={styles.retentionDescription}>
                    {option.description}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    isSelected ? styles.radioOuterSelected : null,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}
        </AppCard>
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
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    sectionTitle: {
      marginTop: 2,
    },
    sectionDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    card: {
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
      lineHeight: 20,
    },
    retentionCard: {
      padding: 0,
      overflow: 'hidden',
    },
    retentionOption: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
    retentionOptionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    retentionText: {
      flex: 1,
    },
    retentionTitleSelected: {
      color: theme.colors.primaryStrong,
    },
    retentionDescription: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: theme.colors.primaryStrong,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.primaryStrong,
    },
    errorCard: {
      borderColor: theme.mode === 'dark' ? '#7F1D1D' : '#FCA5A5',
    },
    errorText: {
      color: theme.mode === 'dark' ? '#FECACA' : '#B91C1C',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
