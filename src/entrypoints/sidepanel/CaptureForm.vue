<script setup lang="ts">
// Formulaire de préparation de l'item (design.md, décisions 8 et 9). Rien n'est écrit dans le stockage local.
import { computed, onMounted, onUnmounted, ref } from 'vue';
import DsButton from '@/components/DsButton.vue';
import DsCheckbox from '@/components/DsCheckbox.vue';
import DsChoiceGroup from '@/components/DsChoiceGroup.vue';
import DsDisclosure from '@/components/DsDisclosure.vue';
import DsField from '@/components/DsField.vue';
import DsInput from '@/components/DsInput.vue';
import DsLink from '@/components/DsLink.vue';
import DsMessage from '@/components/DsMessage.vue';
import DescriptionEditor from './DescriptionEditor.vue';
import ExtractCapture from './ExtractCapture.vue';
import { changedFields, normalizeForm } from '@/capture/form-diff';
import { isFormValid, type CaptureFormState, type Language } from '@/capture/form-validation';
import { readActiveTabPage } from '@/capture/page-snapshot';
import { normalizeLinkedinProfile } from '@/capture/linkedin-profile';
import { buildPrefill } from '@/capture/prefill';
import { normalizeUrl } from '@/capture/url-normalization';
import type { NotionConfig } from '@/config/notion-config';
import { errorMessage, itemErrorMessage } from '@/notion/errors';
import { buildUpdatePageBody } from '@/notion/item-payload';
import { createItem, findItemByUrl, updateItem } from '@/notion/items';
import { fetchThemes } from '@/notion/themes';

const props = defineProps<{ config: NotionConfig }>();

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 Anglais' },
  { value: 'es', label: '🇪🇸 Espagnol' },
];

const title = ref('');
const url = ref('');
const author = ref('');
const authorLinkedin = ref('');
const language = ref<Language | null>(null);
const themes = ref<string[]>([]);

const themeOptions = ref<string[]>([]);
const themesError = ref<string | null>(null);

// Étape de la création de l'item (design.md, décision 7), puis de l'enregistrement des modifications (US-05).
const status = ref<'editing' | 'creating' | 'created' | 'saving'>('editing');
const createdItemUrl = ref<string | null>(null);
const creationError = ref<string | null>(null);

// Item créé et dernières valeurs enregistrées dans Notion, copie normalisée (US-05, design.md, décision 2).
const createdItemId = ref<string | null>(null);
const savedValues = ref<CaptureFormState | null>(null);
const saveError = ref<string | null>(null);

// Libellé du message de confirmation, qui garde le dernier affiché (US-05, design.md, décision 7).
const confirmation = ref('Item créé dans Readme center');

// Formulaire déplié ou replié une fois l'item créé (US-06, design.md, décision 10).
const expanded = ref(true);

// Vrai dès la première saisie dans « Titre », « URL », « Auteur » ou « LinkedIn de l'auteur » :
// le formulaire cesse alors de suivre l'onglet actif.
const edited = ref(false);

// Numéro de la dernière lecture lancée, pour ignorer le résultat d'une lecture dépassée.
let lastRead = 0;

/** Pré-remplit « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » depuis l'onglet actif, tant que l'item n'est pas créé. */
async function prefillFromActiveTab() {
  if (createdItemId.value !== null) return;
  const read = ++lastRead;
  const page = await readActiveTabPage();
  if (read !== lastRead || edited.value || createdItemId.value !== null) return;
  const prefill = buildPrefill(page?.tab.url ?? '', page?.tab.title ?? '', page?.snapshot ?? null);
  title.value = prefill.title;
  url.value = prefill.url;
  author.value = prefill.author;
  authorLinkedin.value = prefill.authorLinkedin;
  urlInvalid.value = false;
  authorLinkedinInvalid.value = false;
  void checkDuplicate(normalizeUrl(prefill.url));
}

const urlInvalid = ref(false);
const authorLinkedinInvalid = ref(false);

// URL de la page de l'item qui a déjà cette URL dans Readme center, ou `null`.
const duplicateUrl = ref<string | null>(null);

// Numéro de la dernière recherche de doublon lancée, pour ignorer le résultat d'une recherche dépassée.
let lastSearch = 0;

/**
 * Cherche un item de même URL (design.md, décision 6) ; une URL `null` efface l'avertissement sans recherche.
 * Une fois l'item créé, aucune recherche n'est plus faite (US-05).
 */
async function checkDuplicate(validUrl: string | null) {
  if (createdItemId.value !== null) return;
  const search = ++lastSearch;
  duplicateUrl.value = null;
  if (validUrl === null) return;
  let found: string | null;
  try {
    found = await findItemByUrl(props.config, validUrl);
  } catch {
    found = null;
  }
  if (search === lastSearch && createdItemId.value === null) duplicateUrl.value = found;
}

function openPage(pageUrl: string) {
  void browser.tabs.create({ url: pageUrl });
}

/** En quittant « URL » : valeur nettoyée si c'est une URL valide, sinon conservée et signalée invalide. */
function onUrlBlur() {
  const normalized = normalizeUrl(url.value);
  urlInvalid.value = normalized === null;
  if (normalized !== null) url.value = normalized;
  void checkDuplicate(normalized);
}

/** En quittant « LinkedIn de l'auteur » : même règle avec le profil LinkedIn ; un champ vide n'est jamais invalide. */
function onAuthorLinkedinBlur() {
  if (authorLinkedin.value.trim() === '') {
    authorLinkedinInvalid.value = false;
    return;
  }
  const normalized = normalizeLinkedinProfile(authorLinkedin.value);
  authorLinkedinInvalid.value = normalized === null;
  if (normalized !== null) authorLinkedin.value = normalized;
}

async function loadThemes() {
  try {
    themeOptions.value = await fetchThemes(props.config);
  } catch (error) {
    themesError.value = errorMessage(error);
  }
}

let windowId: number | undefined;

function onTabActivated(activeInfo: { windowId: number }) {
  if (!edited.value && activeInfo.windowId === windowId) void prefillFromActiveTab();
}

function onTabUpdated(_tabId: number, changeInfo: { status?: string }, tab: { active: boolean; windowId?: number }) {
  if (!edited.value && tab.active && tab.windowId === windowId && changeInfo.status === 'complete') void prefillFromActiveTab();
}

onMounted(async () => {
  void prefillFromActiveTab();
  void loadThemes();
  windowId = (await browser.windows.getCurrent()).id;
  browser.tabs.onActivated.addListener(onTabActivated);
  browser.tabs.onUpdated.addListener(onTabUpdated);
});

onUnmounted(() => {
  browser.tabs.onActivated.removeListener(onTabActivated);
  browser.tabs.onUpdated.removeListener(onTabUpdated);
});

function toggleTheme(theme: string, checked: boolean) {
  themes.value = checked ? [...themes.value, theme] : themes.value.filter((selected) => selected !== theme);
}

const formState = computed<CaptureFormState>(() => ({
  title: title.value,
  url: url.value,
  author: author.value,
  authorLinkedin: authorLinkedin.value,
  language: language.value,
  themes: themes.value,
}));

const valid = computed(() => isFormValid(formState.value));

// Vrai si un champ diffère des dernières valeurs enregistrées (US-05, design.md, décision 3).
const dirty = computed(() => savedValues.value !== null && changedFields(savedValues.value, formState.value).length > 0);

// Disclosure qui enveloppe le formulaire une fois l'item créé, bloqué tant qu'un champ a changé
// (US-06, design.md, décision 10).
const disclosureProps = computed(() =>
  createdItemUrl.value === null
    ? {}
    : {
        label: savedValues.value?.title ?? '',
        expanded: expanded.value,
        'onUpdate:expanded': (value: boolean) => (expanded.value = value),
        disabled: dirty.value,
        disabledReason: 'Enregistrez vos modifications',
      },
);

/** Crée l'item ; en cas d'échec, le formulaire est conservé et « Ajouter » redevient actif. */
async function addItem() {
  if (!valid.value || status.value !== 'editing') return;
  status.value = 'creating';
  creationError.value = null;
  const sent = normalizeForm(formState.value);
  try {
    const item = await createItem(props.config, formState.value, new Date());
    createdItemId.value = item.id;
    createdItemUrl.value = item.url;
    savedValues.value = sent;
    duplicateUrl.value = null;
    expanded.value = false;
    status.value = 'created';
  } catch (error) {
    creationError.value = errorMessage(error);
    status.value = 'editing';
  }
}

/** Enregistre les champs modifiés ; en cas d'échec, le formulaire et les valeurs enregistrées sont conservés (US-05, design.md, décision 7). */
async function saveChanges() {
  if (!valid.value || !dirty.value || status.value !== 'created' || createdItemId.value === null || savedValues.value === null) return;
  status.value = 'saving';
  saveError.value = null;
  const sent = normalizeForm(formState.value);
  try {
    await updateItem(props.config, createdItemId.value, buildUpdatePageBody(savedValues.value, sent));
    savedValues.value = sent;
    confirmation.value = 'Modifications enregistrées dans Readme center';
    expanded.value = false;
  } catch (error) {
    saveError.value = itemErrorMessage(error);
  }
  status.value = 'created';
}
</script>

<template>
  <component :is="createdItemUrl ? DsDisclosure : 'div'" v-bind="disclosureProps">
    <template v-if="createdItemUrl" #accessory>
      <DsLink :href="createdItemUrl" @click.prevent="openPage(createdItemUrl)">Ouvrir dans Notion</DsLink>
    </template>
    <form class="flex flex-col gap-6" @submit.prevent>
      <DsField label="Titre" for="title">
        <DsInput id="title" v-model="title" @input="edited = true" />
      </DsField>
      <DsField label="URL" for="url">
        <DsInput id="url" v-model="url" :invalid="urlInvalid" @input="edited = true" @blur="onUrlBlur" />
        <template v-if="duplicateUrl">
          <DsMessage variant="warning">Cette URL existe déjà dans Readme center</DsMessage>
          <DsLink :href="duplicateUrl" @click.prevent="openPage(duplicateUrl)">Ouvrir l'item existant</DsLink>
        </template>
      </DsField>
      <DsField label="Auteur" for="author">
        <DsInput id="author" v-model="author" @input="edited = true" />
      </DsField>
      <DsField label="LinkedIn de l'auteur" for="author-linkedin">
        <DsInput
          id="author-linkedin"
          v-model="authorLinkedin"
          :invalid="authorLinkedinInvalid"
          @input="edited = true"
          @blur="onAuthorLinkedinBlur"
        />
      </DsField>
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-caption text-text-secondary">Langue</legend>
        <DsChoiceGroup v-model="language" label="Langue" :options="LANGUAGES" />
      </fieldset>
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-caption text-text-secondary">Thèmes</legend>
        <DsMessage v-if="themesError" variant="error">{{ themesError }}</DsMessage>
        <DsCheckbox
          v-for="theme in themeOptions"
          v-else
          :key="theme"
          :model-value="themes.includes(theme)"
          :label="theme"
          @update:model-value="toggleTheme(theme, $event)"
        />
      </fieldset>
      <div v-if="!createdItemUrl" class="flex flex-col gap-2">
        <DsMessage v-if="creationError" variant="error">{{ creationError }}</DsMessage>
        <div>
          <DsButton size="sm" :disabled="!valid || status === 'creating'" @click="addItem">
            {{ status === 'creating' ? 'Ajout en cours…' : 'Ajouter' }}
          </DsButton>
        </div>
      </div>
      <div v-else-if="status === 'saving' || dirty" class="flex flex-col gap-2">
        <DsMessage v-if="saveError" variant="error">{{ saveError }}</DsMessage>
        <div>
          <DsButton size="sm" :disabled="!valid || status === 'saving'" @click="saveChanges">
            {{ status === 'saving' ? 'Enregistrement en cours…' : 'Enregistrer les modifications' }}
          </DsButton>
        </div>
      </div>
    </form>
  </component>
  <DsMessage v-if="createdItemUrl && status === 'created' && !dirty" variant="success">{{ confirmation }}</DsMessage>
  <DescriptionEditor v-if="createdItemId" :config="config" :page-id="createdItemId" />
  <ExtractCapture v-if="createdItemId" :config="config" :page-id="createdItemId" />
</template>
