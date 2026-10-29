<script setup lang="ts" generic="T extends string">
// Atome Choice Group du DS v1.13 (Figma, page Components, nœud 646:111) : rangée de Buttons secondary sm de 44 px,
// l'option choisie reçoit une bordure 2 px border/accent, avec le comportement clavier d'un groupe de boutons radio
// (une seule tabulation, flèches pour changer). Comme dans Figma, la bordure de 2 px ne change pas la taille du bouton :
// le padding horizontal perd 1 px de chaque côté.
import { ref } from 'vue';
import DsButton from './DsButton.vue';

const model = defineModel<T | null>({ default: null });

const props = defineProps<{
  label: string;
  options: { value: T; label: string }[];
}>();

const buttons = ref<InstanceType<typeof DsButton>[]>([]);

/** Seule l'option choisie, ou la première si aucune ne l'est, reçoit le focus par tabulation. */
function tabIndex(index: number): 0 | -1 {
  const checked = props.options.findIndex((option) => option.value === model.value);
  return index === (checked === -1 ? 0 : checked) ? 0 : -1;
}

function choose(index: number) {
  const option = props.options[index];
  if (!option) return;
  model.value = option.value;
  (buttons.value[index]?.$el as HTMLElement | undefined)?.focus();
}

function onKeydown(event: KeyboardEvent, index: number) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (step === undefined) return;
  event.preventDefault();
  choose((index + step + props.options.length) % props.options.length);
}
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="flex flex-wrap gap-2">
    <DsButton
      v-for="(option, index) in options"
      :key="option.value"
      ref="buttons"
      size="sm"
      variant="secondary"
      :class="option.value === model ? 'border-2! border-border-accent! px-[15px]!' : ''"
      role="radio"
      :aria-checked="option.value === model"
      :tabindex="tabIndex(index)"
      @click="choose(index)"
      @keydown="onKeydown($event, index)"
    >
      {{ option.label }}
    </DsButton>
  </div>
</template>
