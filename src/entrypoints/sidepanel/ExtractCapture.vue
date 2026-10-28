<script setup lang="ts">
// Zone des extraits, affichée une fois l'item créé (US-06, design.md, décisions 3 et 7).
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import DsButton from '@/components/DsButton.vue';
import DsChoiceGroup from '@/components/DsChoiceGroup.vue';
import DsField from '@/components/DsField.vue';
import DsInput from '@/components/DsInput.vue';
import DsMessage from '@/components/DsMessage.vue';
import DsSelect from '@/components/DsSelect.vue';
import { placeExtract, type Extract, type ExtractTarget, type Section } from '@/capture/extract-placement';
import { watchActiveTabSelection, type SelectionMessage, type SelectionWatch } from '@/capture/selection-watcher';
import type { NotionConfig } from '@/config/notion-config';
import { itemErrorMessage } from '@/notion/errors';
import type { HeadingLevel } from '@/notion/extract-blocks';
import { appendBlocks } from '@/notion/extracts';

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
const unsectioned = computed(() => extracts.value.filter((extract) => extract.sectionId === null));
const groups = computed(() =>
  sections.value.map((section) => ({
    section,
    extracts: extracts.value.filter((extract) => extract.sectionId === section.id),
  })),
);

const canAdd = computed(
  () =>
    selectionState.value === 'selected' &&
    !adding.value &&
    (chosen.value !== 'new' || (newSection.value.title.trim() !== '' && newSection.value.level !== null)),
);

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
    sections.value = state.sections;
    extracts.value = state.extracts;
    lastUsed.value = state.extracts.find((extract) => extract.blockId === blockIds.at(-1))?.sectionId ?? 'none';
    chosen.value = lastUsed.value;
    addedText = text;
    selectionState.value = 'added';
    selectionWatch?.highlight(text);
  } catch (caught) {
    error.value = itemErrorMessage(caught);
  }
  adding.value = false;
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
        <DsButton :disabled="!canAdd" @click="addExtract">{{ adding ? 'Ajout en cours…' : "Ajouter l'extrait" }}</DsButton>
      </div>
    </div>
    <div v-if="extracts.length > 0" class="flex flex-col gap-4">
      <ul v-if="unsectioned.length > 0" class="flex flex-col gap-2">
        <li v-for="extract in unsectioned" :key="extract.blockId" class="line-clamp-2 text-body-s text-text-primary">
          {{ extract.text }}
        </li>
      </ul>
      <div v-for="group in groups" :key="group.section.id" class="flex flex-col gap-2">
        <p class="text-caption text-text-secondary">{{ group.section.title }}</p>
        <ul class="flex flex-col gap-2">
          <li v-for="extract in group.extracts" :key="extract.blockId" class="line-clamp-2 text-body-s text-text-primary">
            {{ extract.text }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
