<script setup lang="ts">
// Atome Textarea du DS v1.13 (Figma, page Components, nœud 157:23) : padding 16 px / 12 px, hauteur minimale de 3 lignes,
// redimensionnable verticalement seulement.
const model = defineModel<string>({ default: '' });

withDefaults(
  defineProps<{
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
  }>(),
  { disabled: false, invalid: false },
);
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    rows="3"
    class="block min-h-[calc(3lh+2*var(--spacing-3)+2px)] w-full resize-y rounded-sm border bg-surface-elevated px-4 py-3 font-sans text-[16px] leading-[1.6] text-text-primary outline-none placeholder:text-text-secondary focus:border-border-accent focus:shadow-[inset_0_0_0_1px_var(--color-border-accent)] disabled:border-border-subtle disabled:bg-surface-secondary disabled:opacity-60"
    :class="invalid ? 'border-feedback-error' : 'border-border-default'"
  />
</template>
