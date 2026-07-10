import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Market } from '../../domain/entities/Market';
import { normalizeText } from '../../domain/services/normalizeText';
import { createMarketWithSections } from '../../domain/services/createMarketWithSections';
import { reorderMarketSection, type MarketSectionMoveDirection } from '../../domain/services/reorderMarketSections';
import { suggestMarketSectionName } from '../../domain/services/suggestMarketSectionName';
import { createMarketRepository } from '../../infrastructure/repositories/MarketRepositoryFactory';
import { DefaultMarketSection, DefaultMarketSectionRepository } from '../../infrastructure/repositories/DefaultMarketSectionRepository';
import { useAppDispatch } from '../../app/store/hooks';
import { setSelectedMarketId } from '../../app/store/slices/marketSlice';
import { createId } from '../../shared/utils/createId';
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

type MarketSection = Market['sections'][number];

type EditableSection = {
  id: string;
  marketId?: string;
  name: string;
  routeOrder: number;
  isActive: boolean;
};

interface SectionEditorState {
  mode: 'default' | 'market';
  market?: Market;
}

export function MarketsScreen() {
  const dispatch = useAppDispatch();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [defaultSections, setDefaultSections] = useState<DefaultMarketSection[]>([]);
  const [activeMarketId, setActiveMarketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [formState, setFormState] = useState<MarketFormState | null>(null);
  const [sectionEditorState, setSectionEditorState] = useState<SectionEditorState | null>(null);
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

  const sectionEditorSections = useMemo(() => {
    if (!sectionEditorState) {
      return [];
    }

    if (sectionEditorState.mode === 'default') {
      return defaultSections;
    }

    return sectionEditorState.market?.sections ?? [];
  }, [defaultSections, sectionEditorState]);

  const loadMarkets = useCallback(async () => {
    setIsLoading(true);
    setScreenError(null);

    try {
      const [marketRepository, defaultSectionRepository] = await Promise.all([
        createMarketRepository(),
        Promise.resolve(new DefaultMarketSectionRepository()),
      ]);

      const [result, activeId, storedDefaultSections] = await Promise.all([
        marketRepository.getAll(),
        marketRepository.getActiveMarketId(),
        defaultSectionRepository.getAll(),
      ]);

      const fallbackMarket = result.find((market) => market.isDefault) ?? result[0] ?? null;
      const resolvedActiveId = activeId ?? fallbackMarket?.id ?? null;

      if (resolvedActiveId && !activeId) {
        await marketRepository.setActiveMarketId(resolvedActiveId);
      }

      setMarkets(result);
      setDefaultSections(storedDefaultSections);
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
      updateMarketInState(updatedMarket);
    } catch {
      setScreenError('Não foi possível salvar a nova ordem dos corredores.');
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

    const trimmedName = normalizeInputName(name);
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
        const defaultSectionRepository = new DefaultMarketSectionRepository();
        const sections = defaultSections.length > 0 ? defaultSections : await defaultSectionRepository.getAll();
        const newMarket = createMarketWithSections(trimmedName, sections);

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
        updateMarketInState(updatedMarket);
      }

      setFormState(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveEditedSections(sections: EditableSection[]) {
    if (!sectionEditorState || isSaving) {
      return;
    }

    const normalizedSections = normalizeEditableSections(sections);

    if (normalizedSections.length === 0) {
      throw new Error('Mantenha pelo menos um corredor.');
    }

    setIsSaving(true);
    setScreenError(null);

    try {
      if (sectionEditorState.mode === 'default') {
        const repository = new DefaultMarketSectionRepository();
        const updatedDefaultSections: DefaultMarketSection[] = normalizedSections.map((section) => ({
          id: section.id,
          name: section.name,
          routeOrder: section.routeOrder,
          isActive: section.isActive,
        }));

        await repository.saveAll(updatedDefaultSections);
        setDefaultSections(updatedDefaultSections);
        setSectionEditorState(null);
        return;
      }

      if (!sectionEditorState.market) {
        return;
      }

      const market = sectionEditorState.market;
      const updatedMarket: Market = {
        ...market,
        sections: normalizedSections.map((section) => ({
          id: section.id,
          marketId: market.id,
          name: section.name,
          routeOrder: section.routeOrder,
          isActive: section.isActive,
        })) as MarketSection[],
      };

      const repository = await createMarketRepository();
      await repository.update(updatedMarket);
      updateMarketInState(updatedMarket);
      setSectionEditorState(null);
    } finally {
      setIsSaving(false);
    }
  }

  function updateMarketInState(updatedMarket: Market) {
    setMarkets((currentMarkets) => currentMarkets.map((market) => (
      market.id === updatedMarket.id ? updatedMarket : market
    )));

    setSectionEditorState((currentState) => {
      if (currentState?.market?.id !== updatedMarket.id) {
        return currentState;
      }

      return {
        ...currentState,
        market: updatedMarket,
      };
    });
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
          description="Cadastre mercados e ajuste os corredores para montar a rota de compra ideal."
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
                  Cada novo mercado recebe uma cópia dos corredores padrão.
                </AppText>
              </View>
              <AppButton style={styles.createButton} onPress={() => setFormState({ mode: 'create' })}>
                Adicionar
              </AppButton>
            </View>
          </AppCard>

          <AppCard elevated style={styles.defaultSectionsCard}>
            <View style={styles.defaultSectionsHeader}>
              <View style={styles.defaultSectionsTextContainer}>
                <AppText variant="subtitle">Corredores padrão</AppText>
                <AppText muted style={styles.createDescription}>
                  Define a lista inicial usada ao criar novos supermercados.
                </AppText>
                <AppText subtle variant="caption" style={styles.defaultSectionsCount}>
                  {defaultSections.length} corredor{defaultSections.length === 1 ? '' : 'es'} configurado{defaultSections.length === 1 ? '' : 's'}
                </AppText>
              </View>

              <SecondaryActionButton
                label="Editar"
                disabled={isSaving}
                highlighted
                onPress={() => setSectionEditorState({ mode: 'default' })}
              />
            </View>
          </AppCard>

          <View style={styles.listTitleBlock}>
            <AppText variant="label" accent>Mercados cadastrados</AppText>
            <AppText muted style={styles.sectionHint}>
              Edite os corredores de cada mercado sem alterar os corredores padrão.
            </AppText>
          </View>

          {sortedMarkets.map((market) => (
            <MarketRouteCard
              key={market.id}
              market={market}
              isActive={market.id === activeMarketId}
              isSaving={isSaving}
              savingSectionId={savingSectionId}
              onSelectMarket={handleSelectMarket}
              onEditMarket={(selectedMarket) => setFormState({ mode: 'edit', market: selectedMarket })}
              onEditSections={(selectedMarket) => setSectionEditorState({ mode: 'market', market: selectedMarket })}
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

      <SectionEditorModal
        visible={Boolean(sectionEditorState)}
        title={sectionEditorState?.mode === 'default' ? 'Corredores padrão' : 'Corredores do mercado'}
        description={
          sectionEditorState?.mode === 'default'
            ? 'Esta lista será usada como base para novos supermercados. Mercados existentes não serão alterados.'
            : `Ajuste somente os corredores de ${sectionEditorState?.market?.name ?? 'este mercado'}.`
        }
        sections={sectionEditorSections}
        isSaving={isSaving}
        onCancel={() => setSectionEditorState(null)}
        onSave={handleSaveEditedSections}
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
  onEditSections: (market: Market) => void;
  onMoveSection: (market: Market, sectionId: string, direction: MarketSectionMoveDirection) => void;
}

function MarketRouteCard({
  market,
  isActive,
  isSaving,
  savingSectionId,
  onSelectMarket,
  onEditMarket,
  onEditSections,
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
            label="Editar nome"
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
        <View style={styles.sectionIntroText}>
          <AppText variant="label" accent>Corredores do mercado</AppText>
          <AppText muted style={styles.sectionHint}>Ajuste a ordem real dos corredores deste supermercado.</AppText>
        </View>

        <Pressable
          disabled={isSaving}
          onPress={() => onEditSections(market)}
          style={({ pressed }) => [
            styles.editSectionsButton,
            isSaving ? styles.secondaryActionButtonDisabled : null,
            pressed && !isSaving ? styles.pressed : null,
          ]}
        >
          <AppText variant="caption" style={styles.editSectionsButtonText}>Editar corredores</AppText>
        </Pressable>
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
                <AppText subtle variant="caption">Corredor ativo</AppText>
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
            {mode === 'create'
              ? 'O novo mercado será criado com uma cópia dos corredores padrão.'
              : 'Informe um nome fácil de reconhecer.'}
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

interface SectionEditorModalProps {
  visible: boolean;
  title: string;
  description: string;
  sections: EditableSection[];
  isSaving: boolean;
  onCancel: () => void;
  onSave: (sections: EditableSection[]) => Promise<void>;
}

type SectionFormState = {
  mode: 'create' | 'edit';
  section?: EditableSection;
};

function SectionEditorModal({ visible, title, description, sections, isSaving, onCancel, onSave }: SectionEditorModalProps) {
  const [draftSections, setDraftSections] = useState<EditableSection[]>([]);
  const [sectionFormState, setSectionFormState] = useState<SectionFormState | null>(null);
  const [sectionPendingDeletion, setSectionPendingDeletion] = useState<EditableSection | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    if (visible) {
      setDraftSections(normalizeEditableSections(sections));
      setSectionFormState(null);
      setSectionPendingDeletion(null);
      setModalError(null);
    }
  }, [visible, sections]);

  function handleMoveSection(sectionId: string, direction: MarketSectionMoveDirection) {
    setDraftSections((currentSections) => reorderEditableSections(currentSections, sectionId, direction));
  }

  function handleSaveSectionName(name: string) {
    if (!sectionFormState) {
      return;
    }

    const trimmedName = normalizeInputName(name);
    const normalizedName = normalizeText(trimmedName);

    if (!trimmedName) {
      throw new Error('Informe o nome do corredor.');
    }

    const hasDuplicate = draftSections.some((section) => (
      normalizeText(section.name) === normalizedName && section.id !== sectionFormState.section?.id
    ));

    if (hasDuplicate) {
      throw new Error('Já existe um corredor com esse nome.');
    }

    if (sectionFormState.mode === 'create') {
      setDraftSections((currentSections) => normalizeEditableSections([
        ...currentSections,
        {
          id: createId(),
          name: trimmedName,
          routeOrder: currentSections.length + 1,
          isActive: true,
        },
      ]));
    } else if (sectionFormState.section) {
      setDraftSections((currentSections) => currentSections.map((section) => (
        section.id === sectionFormState.section?.id
          ? { ...section, name: trimmedName }
          : section
      )));
    }

    setSectionFormState(null);
    setModalError(null);
  }

  function handleRequestDeleteSection(section: EditableSection) {
    if (draftSections.length <= 1) {
      setModalError('Mantenha pelo menos um corredor.');
      return;
    }

    setSectionPendingDeletion(section);
  }

  function handleConfirmDeleteSection() {
    if (!sectionPendingDeletion) {
      return;
    }

    setDraftSections((currentSections) => normalizeEditableSections(
      currentSections.filter((section) => section.id !== sectionPendingDeletion.id),
    ));
    setSectionPendingDeletion(null);
    setModalError(null);
  }

  async function handleSaveAll() {
    setModalError(null);

    try {
      await onSave(normalizeEditableSections(draftSections));
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Não foi possível salvar os corredores.');
    }
  }

  return (
    <>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.sectionEditorCard]}>
            <AppText variant="subtitle" style={styles.modalTitle}>{title}</AppText>
            <AppText muted style={styles.modalDescription}>{description}</AppText>

            {modalError ? (
              <AppText variant="caption" style={styles.validationMessage}>{modalError}</AppText>
            ) : null}

            <Pressable
              disabled={isSaving}
              onPress={() => setSectionFormState({ mode: 'create' })}
              style={({ pressed }) => [
                styles.addSectionButton,
                isSaving ? styles.secondaryActionButtonDisabled : null,
                pressed && !isSaving ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.addSectionButtonText}>Adicionar corredor</AppText>
            </Pressable>

            <ScrollView style={styles.sectionEditorList} contentContainerStyle={styles.sectionEditorListContent}>
              {draftSections.map((section, index) => {
                const isFirst = index === 0;
                const isLast = index === draftSections.length - 1;

                return (
                  <View key={section.id} style={styles.editorSectionRow}>
                    <View style={styles.routeIndex}>
                      <AppText variant="caption" style={styles.routeIndexText}>{index + 1}</AppText>
                    </View>

                    <View style={styles.sectionInfo}>
                      <AppText style={styles.sectionName}>{section.name}</AppText>
                      <AppText subtle variant="caption">Corredor ativo</AppText>
                    </View>

                    <View style={styles.editorSectionActions}>
                      <SmallActionButton
                        label="Editar"
                        disabled={isSaving}
                        onPress={() => setSectionFormState({ mode: 'edit', section })}
                      />
                      <SmallActionButton
                        label="Apagar"
                        danger
                        disabled={isSaving}
                        onPress={() => handleRequestDeleteSection(section)}
                      />
                      <View style={styles.editorMoveActions}>
                        <RouteButton
                          label="Subir"
                          disabled={isFirst || isSaving}
                          loading={false}
                          onPress={() => handleMoveSection(section.id, 'up')}
                        />
                        <RouteButton
                          label="Descer"
                          disabled={isLast || isSaving}
                          loading={false}
                          onPress={() => handleMoveSection(section.id, 'down')}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={onCancel}
                disabled={isSaving}
                style={({ pressed }) => [styles.modalButton, styles.modalCancelButton, pressed ? styles.pressed : null]}
              >
                <AppText variant="caption" style={styles.modalCancelText}>Cancelar</AppText>
              </Pressable>

              <Pressable
                onPress={handleSaveAll}
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

      <SectionFormModal
        visible={Boolean(sectionFormState)}
        mode={sectionFormState?.mode ?? 'create'}
        initialName={sectionFormState?.section?.name ?? ''}
        isSaving={isSaving}
        onCancel={() => setSectionFormState(null)}
        onSave={handleSaveSectionName}
      />

      <ConfirmDeleteSectionModal
        visible={Boolean(sectionPendingDeletion)}
        sectionName={sectionPendingDeletion?.name ?? ''}
        isSaving={isSaving}
        onCancel={() => setSectionPendingDeletion(null)}
        onConfirm={handleConfirmDeleteSection}
      />
    </>
  );
}

interface SectionFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialName: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (name: string) => void;
}

function SectionFormModal({ visible, mode, initialName, isSaving, onCancel, onSave }: SectionFormModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const suggestion = suggestMarketSectionName(name);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useFocusReset(visible, initialName, setName, setError);

  function handleSave() {
    setError(null);

    try {
      onSave(name);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar o corredor.');
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            {mode === 'create' ? 'Adicionar corredor' : 'Editar corredor'}
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Informe o nome do corredor como ele aparece no mercado.
          </AppText>

          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (error) setError(null);
            }}
            placeholder="Ex.: Açougue"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.modalInput}
            autoCorrect={false}
            autoFocus
          />

          {suggestion ? (
            <View style={styles.suggestionBox}>
              <View style={styles.suggestionTextContainer}>
                <AppText variant="caption" style={styles.suggestionLabel}>Sugestão</AppText>
                <AppText style={styles.suggestionText}>{suggestion}</AppText>
              </View>
              <Pressable
                onPress={() => {
                  setName(suggestion);
                  setError(null);
                }}
                style={({ pressed }) => [styles.suggestionButton, pressed ? styles.pressed : null]}
              >
                <AppText variant="caption" style={styles.suggestionButtonText}>Usar</AppText>
              </Pressable>
            </View>
          ) : null}

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
              <AppText variant="caption" style={styles.modalPrimaryText}>Salvar</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ConfirmDeleteSectionModalProps {
  visible: boolean;
  sectionName: string;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteSectionModal({ visible, sectionName, isSaving, onCancel, onConfirm }: ConfirmDeleteSectionModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>Apagar corredor?</AppText>
          <AppText muted style={styles.modalDescription}>
            Você está prestes a apagar "{sectionName}" desta configuração. Produtos e históricos existentes não serão apagados.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable
              disabled={isSaving}
              onPress={onCancel}
              style={({ pressed }) => [styles.modalButton, styles.modalCancelButton, pressed ? styles.pressed : null]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>Cancelar</AppText>
            </Pressable>

            <Pressable
              disabled={isSaving}
              onPress={onConfirm}
              style={({ pressed }) => [styles.modalButton, styles.modalDangerButton, pressed ? styles.pressed : null]}
            >
              <AppText variant="caption" style={styles.modalDangerText}>Apagar</AppText>
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

interface SmallActionButtonProps {
  label: string;
  disabled: boolean;
  danger?: boolean;
  onPress: () => void;
}

function SmallActionButton({ label, disabled, danger = false, onPress }: SmallActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallActionButton,
        danger ? styles.smallDangerButton : null,
        disabled ? styles.secondaryActionButtonDisabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <AppText variant="caption" style={[styles.smallActionButtonText, danger ? styles.smallDangerButtonText : null]}>
        {label}
      </AppText>
    </Pressable>
  );
}

function normalizeInputName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeEditableSections<TSection extends EditableSection>(sections: TSection[]): TSection[] {
  return [...sections]
    .filter((section) => Boolean(section.name.trim()))
    .sort((left, right) => left.routeOrder - right.routeOrder)
    .map((section, index) => ({
      ...section,
      name: normalizeInputName(section.name),
      routeOrder: index + 1,
      isActive: section.isActive !== false,
    }));
}

function reorderEditableSections(sections: EditableSection[], sectionId: string, direction: MarketSectionMoveDirection): EditableSection[] {
  const orderedSections = normalizeEditableSections(sections);
  const currentIndex = orderedSections.findIndex((section) => section.id === sectionId);

  if (currentIndex < 0) {
    return orderedSections;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= orderedSections.length) {
    return orderedSections;
  }

  const nextSections = [...orderedSections];
  const [selectedSection] = nextSections.splice(currentIndex, 1);
  nextSections.splice(targetIndex, 0, selectedSection);

  return nextSections.map((section, index) => ({
    ...section,
    routeOrder: index + 1,
  }));
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
    defaultSectionsCard: {
      padding: theme.spacing.lg,
    },
    defaultSectionsHeader: {
      gap: theme.spacing.md,
    },
    defaultSectionsTextContainer: {
      gap: theme.spacing.xs,
    },
    defaultSectionsCount: {
      marginTop: theme.spacing.xs,
      fontWeight: '800',
    },
    listTitleBlock: {
      gap: theme.spacing.xs,
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
      gap: theme.spacing.md,
    },
    sectionIntroText: {
      gap: theme.spacing.xs,
    },
    sectionHint: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
      lineHeight: 19,
    },
    editSectionsButton: {
      minHeight: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: theme.spacing.md,
    },
    editSectionsButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
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
    sectionEditorCard: {
      maxWidth: 430,
      maxHeight: '86%',
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
    addSectionButton: {
      minHeight: 42,
      marginTop: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: theme.spacing.md,
    },
    addSectionButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    sectionEditorList: {
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
    },
    sectionEditorListContent: {
      paddingVertical: theme.spacing.xs,
    },
    editorSectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    editorSectionActions: {
      width: 88,
      gap: 6,
    },
    editorMoveActions: {
      gap: 6,
    },
    smallActionButton: {
      minHeight: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.primarySoft,
    },
    smallActionButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    smallDangerButton: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(248, 113, 113, 0.16)' : '#FEE2E2',
    },
    smallDangerButtonText: {
      color: theme.mode === 'dark' ? '#FCA5A5' : '#B91C1C',
    },
    suggestionBox: {
      marginTop: theme.spacing.md,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.primarySoft,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    suggestionTextContainer: {
      flex: 1,
      gap: 2,
    },
    suggestionLabel: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    suggestionText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    suggestionButton: {
      minHeight: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
    },
    suggestionButtonText: {
      color: theme.colors.primaryText,
      fontWeight: '900',
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
    modalDangerButton: {
      backgroundColor: theme.mode === 'dark' ? '#7F1D1D' : '#DC2626',
    },
    modalCancelText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    modalPrimaryText: {
      color: theme.colors.primaryText,
      fontWeight: '900',
    },
    modalDangerText: {
      color: '#FFFFFF',
      fontWeight: '900',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
