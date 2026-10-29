<script setup lang="ts">
// Atome Input du DS v1.13 (Figma, page Components, nœud 157:12) : 44 px de haut, padding 16 px / 8 px.
const model = defineModel<string>({ default: '' });

withDefaults(
  defineProps<{
    id?: string;
    type?: 'text' | 'email' | 'password';
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
  }>(),
  { type: 'text', disabled: false, invalid: false },
);
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    class="h-[44px] w-full rounded-sm border bg-surface-elevated px-4 py-2 font-sans text-[16px] leading-[1.6] text-text-primary outline-none placeholder:text-text-secondary focus:border-border-accent focus:shadow-[inset_0_0_0_1px_var(--color-border-accent)] disabled:border-border-subtle disabled:bg-surface-secondary disabled:opacity-60"
    :class="invalid ? 'border-feedback-error' : 'border-border-default'"
  />
</template>
