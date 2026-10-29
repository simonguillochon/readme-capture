<script setup lang="ts">
// Zone « Description », affichée une fois l'item créé (US-08, design.md, décisions 3, 4, 6 et 7).
// Le panneau ne connaît que la description qu'il a enregistrée : rien n'est lu depuis Notion.
// Son état vit dans l'état partagé du panneau (US-09, design.md, décision 3).
import { computed, toRef, watch } from 'vue';
import DsButton from '@/components/DsButton.vue';
import DsField from '@/components/DsField.vue';
import DsMessage from '@/components/DsMessage.vue';
import DsTextarea from '@/components/DsTextarea.vue';
import { useCaptureStore } from '@/capture/capture-store';
import { formatCharacterCount } from '@/capture/description';
import type { NotionConfig } from '@/config/notion-config';
import { itemErrorMessage } from '@/notion/errors';
import { buildDescriptionBody } from '@/notion/item-payload';
import { updateItem } from '@/notion/items';

const props = defineProps<{ config: NotionConfig; pageId: string }>();

// Limite du champ, qui est aussi celle d'un objet texte de Notion (décisions 4 et 5).
const LIMIT = 2000;

const store = useCaptureStore();

const text = toRef(store.description, 'text');
// Dernière description enregistrée, sans espaces de début et de fin.
const savedText = toRef(store.description, 'savedText');
const saving = toRef(store, 'descriptionSaving');
const error = toRef(store, 'descriptionError');
const confirmed = toRef(store, 'descriptionConfirmed');

const dirty = computed(() => text.value.trim() !== savedText.value);
const count = computed(() => formatCharacterCount(text.value.length, LIMIT));

watch(dirty, (value) => {
  if (value) confirmed.value = false;
});

async function saveDescription() {
  if (saving.value || !dirty.value) return;
  saving.value = true;
  error.value = null;
  const sent = text.value.trim();
  try {
    await updateItem(props.config, props.pageId, buildDescriptionBody(sent));
    savedText.value = sent;
    confirmed.value = true;
  } catch (failure) {
    error.value = itemErrorMessage(failure);
  }
  saving.value = false;
}
</script>

<template>
  <section class="mt-2 flex flex-col gap-6">
    <!-- Atome Divider du DS, horizontal subtle (Figma, page Components, nœud 177:6). -->
    <hr class="h-px border-0 bg-border-subtle" />
    <DsField label="Description" for="description">
      <DsTextarea id="description" v-model="text" :maxlength="LIMIT" aria-describedby="description-count" />
      <!-- Compteur hors DS, écart validé par l'utilisatrice (décision 3). -->
      <p id="description-count" class="text-right text-caption text-text-secondary">{{ count }}</p>
    </DsField>
    <DsMessage v-if="confirmed" variant="success">Description enregistrée dans Readme center</DsMessage>
    <div v-if="dirty || saving" class="flex flex-col gap-2">
      <DsMessage v-if="error" variant="error">{{ error }}</DsMessage>
      <div>
        <DsButton size="sm" :disabled="saving" @click="saveDescription">
          {{ saving ? 'Enregistrement en cours…' : 'Enregistrer la description' }}
        </DsButton>
      </div>
    </div>
  </section>
</template>
