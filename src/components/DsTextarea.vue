<script setup lang="ts">
// Atome Textarea du DS (Figma, page Components, nœud 157:23) : 96px de haut par défaut (3 lignes), redimensionnable.
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
    class="block h-[96px] w-full resize-y rounded-sm border bg-surface-elevated px-[14px] py-[12px] font-sans text-[16px] leading-[1.6] text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-accent focus:shadow-[inset_0_0_0_1px_var(--color-border-accent)] disabled:border-border-subtle disabled:bg-surface-secondary disabled:opacity-60"
    :class="invalid ? 'border-feedback-error' : 'border-border-default'"
  />
</template>
