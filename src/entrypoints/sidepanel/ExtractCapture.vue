<script setup lang="ts">
// Zone des extraits, affichée une fois l'item créé (US-06, design.md, décisions 3 et 7 ; US-07, décisions 4 et 6).
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import DsButton from '@/components/DsButton.vue';
import DsChoiceGroup from '@/components/DsChoiceGroup.vue';
import DsField from '@/components/DsField.vue';
import DsIconButton from '@/components/DsIconButton.vue';
import DsInput from '@/components/DsInput.vue';
import DsMessage from '@/components/DsMessage.vue';
import DsSelect from '@/components/DsSelect.vue';
import DsTextarea from '@/components/DsTextarea.vue';
import {
  deleteExtract,
  editExtract,
  placeExtract,
  type Extract,
  type ExtractChange,
  type ExtractOperation,
  type ExtractTarget,
  type Section,
} from '@/capture/extract-placement';
import { watchActiveTabSelection, type SelectionMessage, type SelectionWatch } from '@/capture/selection-watcher';
import type { NotionConfig } from '@/config/notion-config';
import { NotionHttpError } from '@/notion/client';
import { errorMessage, itemErrorMessage } from '@/notion/errors';
import type { HeadingLevel } from '@/notion/extract-blocks';
import { appendBlocks, deleteBlock, updateQuote } from '@/notion/extracts';

const props = defineProps<{ config: NotionConfig; pageId: string }>();

const LEVELS: { value: '1' | '2' | '3'; label: string }[] = [
  { value: '1', label: 'H1' },
  { value: '2', label: 'H2' },
  { value: '3', label: 'H3' },
];

const selection = ref<SelectionMessage | null>(null);
const selectionState = ref<'waiting' | 'selected' | 'unreadable' | 'added'>('waiting');

const sections = ref<Section[]>([]);
const extracts = ref<Extract[]>([]);

// Section choisie : identifiant de section, 'new' ou 'none' ; la dernière utilisée est pré-sélectionnée.
const chosen = ref<string | null>('none');
const lastUsed = ref('none');
const newSection = ref<{ title: string; level: '1' | '2' | '3' | null }>({ title: '', level: '1' });

const adding = ref(false);
const error = ref<string | null>(null);

// Texte du dernier extrait ajouté : l'état « Extrait ajouté » dure jusqu'à une sélection différente.
let addedText: string | null = null;

// Extrait en cours de modification : un seul à la fois ; la section vaut 'none' pour « Sans section » (US-07, décision 6).
const editing = ref<{ blockId: string; text: string; sectionId: string } | null>(null);
// Action en cours d'envoi : toutes les actions de la liste et « Ajouter l'extrait » sont inactives (US-07, décision 4).
const busy = ref<{ blockId: string; kind: 'saving' | 'deleting' } | null>(null);
// Erreur affichée sous un extrait, et erreur de suppression d'un titre de section, affichée sous la liste.
const extractError = ref<{ blockId: string; message: string } | null>(null);
const sectionError = ref<string | null>(null);

const sectionOptions = computed(() => [
  ...sections.value.map((section) => ({ value: section.id, label: section.title })),
  { value: 'new', label: '+ Nouvelle section…' },
  { value: 'none', label: 'Sans section' },
]);

// À chaque choix de « + Nouvelle section… », le titre reprend celui le plus proche de la sélection, au niveau H1.
watch(chosen, (value) => {
  if (value === 'new') newSection.value = { title: selection.value?.nearestHeading ?? '', level: '1' };
});

// Extraits groupés dans l'ordre de la page : sans section d'abord, puis section par section (décision 7).
const groups = computed(() => [
  { section: null, extracts: extracts.value.filter((extract) => extract.sectionId === null) },
  ...sections.value.map((section) => ({
    section,
    extracts: extracts.value.filter((extract) => extract.sectionId === section.id),
  })),
]);

// Menu Section du mode modification : les sections dans l'ordre de création, puis « Sans section » (US-07, décision 6).
const editSectionOptions = computed(() => [
  ...sections.value.map((section) => ({ value: section.id, label: section.title })),
  { value: 'none', label: 'Sans section' },
]);

const canAdd = computed(
  () =>
    selectionState.value === 'selected' &&
    !adding.value &&
    busy.value === null &&
    (chosen.value !== 'new' || (newSection.value.title.trim() !== '' && newSection.value.level !== null)),
);

// Actions « Modifier » et « Supprimer » : inactives pendant une modification ou un envoi (US-07, décisions 4 et 6).
const actionsDisabled = computed(() => editing.value !== null || busy.value !== null);

// « Enregistrer » est actif si le texte n'est pas vide et si le texte ou la section a changé.
const canSave = computed(() => {
  const current = editing.value;
  const extract = current && extracts.value.find((candidate) => candidate.blockId === current.blockId);
  if (!current || !extract || busy.value !== null || current.text.trim() === '') return false;
  return current.text !== extract.text || current.sectionId !== (extract.sectionId ?? 'none');
});

function onSelection(message: SelectionMessage) {
  if (selectionState.value === 'added' && message.text === addedText) return;
  selection.value = message;
  selectionState.value = message.text === null ? 'waiting' : 'selected';
}

function onUnreadable() {
  selection.value = null;
  selectionState.value = 'unreadable';
}

let selectionWatch: SelectionWatch | undefined;
let unmounted = false;

onMounted(async () => {
  const started = await watchActiveTabSelection(onSelection, onUnreadable);
  if (unmounted) started.stop();
  else selectionWatch = started;
});

onUnmounted(() => {
  unmounted = true;
  selectionWatch?.stop();
});

function target(): ExtractTarget {
  if (chosen.value === 'new') {
    return { kind: 'new', title: newSection.value.title, level: Number(newSection.value.level) as HeadingLevel };
  }
  if (chosen.value === null || chosen.value === 'none') return { kind: 'none' };
  return { kind: 'section', id: chosen.value };
}

/**
 * Écrit l'extrait dans la page de l'item, puis le surligne dans la page lue (US-06, design.md, décisions 3, 4, 6 et 9).
 * En cas d'échec, la sélection, la section choisie et le titre de la nouvelle section sont conservés.
 */
async function addExtract() {
  const text = selection.value?.text;
  if (!canAdd.value || !text) return;
  const placement = placeExtract({ sections: sections.value, extracts: extracts.value }, target(), text);
  adding.value = true;
  error.value = null;
  try {
    const blockIds = await appendBlocks(props.config, props.pageId, placement.blocks, placement.position);
    const state = placement.apply(blockIds);
    const quoteId = blockIds.at(-1);
    // La clé du surlignage est gardée dans l'extrait, pour le retirer à sa suppression (US-07, design.md, décision 5).
    const highlight = selectionWatch?.highlight(text) ?? null;
    sections.value = state.sections;
    extracts.value = highlight
      ? state.extracts.map((extract) => (extract.blockId === quoteId ? { ...extract, highlight } : extract))
      : state.extracts;
    lastUsed.value = state.extracts.find((extract) => extract.blockId === quoteId)?.sectionId ?? 'none';
    chosen.value = lastUsed.value;
    addedText = text;
    selectionState.value = 'added';
  } catch (caught) {
    error.value = itemErrorMessage(caught);
  }
  adding.value = false;
}

function startEditing(extract: Extract) {
  extractError.value = null;
  editing.value = { blockId: extract.blockId, text: extract.text, sectionId: extract.sectionId ?? 'none' };
}

function cancelEditing() {
  if (extractError.value?.blockId === editing.value?.blockId) extractError.value = null;
  editing.value = null;
}

/** Envoie une opération à Notion ; renvoie l'identifiant de la citation créée par un ajout. */
async function send(operation: ExtractOperation): Promise<string | undefined> {
  if (operation.kind === 'update') await updateQuote(props.config, operation.blockId, operation.text);
  if (operation.kind === 'append') return (await appendBlocks(props.config, props.pageId, operation.blocks, operation.position))[0];
  if (operation.kind === 'delete-quote') await deleteBlock(props.config, operation.blockId);
  if (operation.kind === 'delete-section') await deleteBlock(props.config, operation.sectionId);
  return undefined;
}

/**
 * Envoie les opérations une par une, dans l'ordre, puis applique le nouvel état et renvoie le nombre d'opérations
 * réussies (US-07, design.md, décision 4). Une réponse 400 ou 404 à une suppression compte comme une réussite.
 */
async function run(change: ExtractChange, blockId: string, kind: 'saving' | 'deleting'): Promise<number> {
  busy.value = { blockId, kind };
  extractError.value = null;
  sectionError.value = null;
  let completed = 0;
  let newBlockId: string | undefined;
  for (const operation of change.operations) {
    try {
      newBlockId = (await send(operation)) ?? newBlockId;
    } catch (caught) {
      const gone = caught instanceof NotionHttpError && (caught.status === 400 || caught.status === 404);
      if (operation.kind === 'update' || operation.kind === 'append') {
        extractError.value = { blockId, message: itemErrorMessage(caught) };
        break;
      }
      if (!gone) {
        if (operation.kind === 'delete-quote') extractError.value = { blockId, message: errorMessage(caught) };
        else sectionError.value = errorMessage(caught);
        break;
      }
    }
    completed += 1;
  }

  const state = change.apply(completed, newBlockId);
  const removed = sections.value.filter((section) => !state.sections.includes(section)).map((section) => section.id);
  sections.value = state.sections;
  extracts.value = state.extracts;
  // Une section supprimée pré-sélectionnée dans la zone d'ajout laisse place à « Sans section ».
  if ((chosen.value !== null && removed.includes(chosen.value)) || removed.includes(lastUsed.value)) {
    chosen.value = 'none';
    lastUsed.value = 'none';
  }
  busy.value = null;
  return completed;
}

/** Enregistre le texte ou la section modifiés ; en cas d'échec, la modification en cours est conservée. */
async function saveExtract() {
  const current = editing.value;
  if (!current || !canSave.value) return;
  const sectionId = current.sectionId === 'none' ? null : current.sectionId;
  const change = editExtract({ sections: sections.value, extracts: extracts.value }, current.blockId, current.text, sectionId);
  // Dès que la citation est écrite, la modification se ferme ; un échec ultérieur s'affiche sous l'ancien extrait.
  if ((await run(change, current.blockId, 'saving')) > 0) editing.value = null;
}

/** Supprime l'extrait sans confirmation, puis retire son surlignage de la page lue (US-07, décisions 4 et 5). */
async function removeExtract(extract: Extract) {
  const change = deleteExtract({ sections: sections.value, extracts: extracts.value }, extract.blockId);
  const completed = await run(change, extract.blockId, 'deleting');
  if (completed > 0 && extract.highlight) selectionWatch?.unhighlight(extract.highlight);
}
</script>

<template>
  <section class="mt-2 flex flex-col gap-6">
    <!-- Atome Divider du DS, horizontal subtle (Figma, page Components, nœud 177:6). -->
    <hr class="h-px border-0 bg-border-subtle" />
    <DsMessage v-if="selectionState === 'unreadable'" variant="warning">Sélection impossible sur cette page</DsMessage>
    <p
      v-else
      class="rounded-sm bg-surface-secondary p-3 text-body-s whitespace-pre-line"
      :class="selectionState === 'selected' ? 'line-clamp-5 text-text-primary' : 'text-text-tertiary'"
    >
      <template v-if="selectionState === 'selected'">{{ selection?.text }}</template>
      <template v-else-if="selectionState === 'added'">Extrait ajouté</template>
      <template v-else>Sélectionne un passage dans la page</template>
    </p>
    <DsField label="Section" for="extract-section">
      <DsSelect id="extract-section" v-model="chosen" :options="sectionOptions" />
    </DsField>
    <template v-if="chosen === 'new'">
      <DsField label="Titre de la section" for="extract-section-title">
        <DsInput id="extract-section-title" v-model="newSection.title" />
      </DsField>
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-caption text-text-secondary">Niveau</legend>
        <DsChoiceGroup v-model="newSection.level" label="Niveau" :options="LEVELS" />
      </fieldset>
    </template>
    <div class="flex flex-col gap-2">
      <DsMessage v-if="error" variant="error">{{ error }}</DsMessage>
      <div>
        <DsButton size="sm" :disabled="!canAdd" @click="addExtract">{{ adding ? 'Ajout en cours…' : "Ajouter l'extrait" }}</DsButton>
      </div>
    </div>
    <div v-if="extracts.length > 0" class="flex flex-col gap-4">
      <template v-for="group in groups" :key="group.section?.id ?? 'none'">
        <div v-if="group.section || group.extracts.length > 0" class="flex flex-col gap-2">
          <p v-if="group.section" class="text-caption text-text-secondary">{{ group.section.title }}</p>
          <ul class="flex flex-col gap-2">
            <li v-for="extract in group.extracts" :key="extract.blockId" class="flex flex-col gap-2">
              <template v-if="editing?.blockId === extract.blockId">
                <DsTextarea v-model="editing.text" aria-label="Texte de l'extrait" />
                <DsField label="Section" for="extract-edit-section">
                  <DsSelect id="extract-edit-section" v-model="editing.sectionId" :options="editSectionOptions" />
                </DsField>
                <div class="flex gap-2">
                  <DsButton size="sm" :disabled="!canSave" @click="saveExtract">
                    {{ busy?.kind === 'saving' ? 'Enregistrement en cours…' : 'Enregistrer' }}
                  </DsButton>
                  <DsButton variant="secondary" size="sm" :disabled="busy !== null" @click="cancelEditing">Annuler</DsButton>
                </div>
              </template>
              <div v-else class="flex items-start gap-2">
                <p class="line-clamp-2 flex-1 text-body-s text-text-primary">{{ extract.text }}</p>
                <DsIconButton
                  icon="pencil-simple"
                  label="Modifier"
                  variant="ghost"
                  :disabled="actionsDisabled"
                  @click="startEditing(extract)"
                />
                <DsIconButton
                  icon="trash"
                  :label="busy?.kind === 'deleting' && busy.blockId === extract.blockId ? 'Suppression en cours…' : 'Supprimer'"
                  variant="ghost"
                  :disabled="actionsDisabled"
                  @click="removeExtract(extract)"
                />
              </div>
              <DsMessage v-if="extractError?.blockId === extract.blockId" variant="error">{{ extractError.message }}</DsMessage>
            </li>
          </ul>
        </div>
      </template>
    </div>
    <DsMessage v-if="sectionError" variant="error">{{ sectionError }}</DsMessage>
  </section>
</template>
