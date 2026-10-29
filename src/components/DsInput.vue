<script setup lang="ts">
// Atome Input du DS (Figma, page Components, nœud 157:12).
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
    class="h-[40px] w-full rounded-sm border bg-surface-elevated px-[14px] py-[10px] font-sans text-[16px] leading-[1.6] text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-accent focus:shadow-[inset_0_0_0_1px_var(--color-border-accent)] disabled:border-border-subtle disabled:bg-surface-secondary disabled:opacity-60"
    :class="invalid ? 'border-feedback-error' : 'border-border-default'"
  />
</template>
