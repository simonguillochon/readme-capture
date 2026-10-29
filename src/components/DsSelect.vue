<script setup lang="ts" generic="T extends string">
// Atome Select du DS v1.13 (Figma, page Components, nœud 657:82) : select natif aligné sur l'Input (44 px, padding 16 px / 8 px),
// caret-down 20 px en text/secondary à 8 px du texte, placeholder en text/secondary, liste ouverte rendue par le système.
import DsIcon from './DsIcon.vue';

const model = defineModel<T | null>({ default: null });

withDefaults(
  defineProps<{
    id?: string;
    options: { value: T; label: string }[];
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
  }>(),
  { disabled: false, invalid: false },
);
</script>

<template>
  <div class="grid w-full">
    <select
      :id="id"
      v-model="model"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      class="col-start-1 row-start-1 h-[44px] w-full appearance-none truncate rounded-sm border bg-surface-elevated py-2 pr-[44px] pl-4 font-sans text-[16px] leading-[1.6] outline-none focus:border-border-accent focus:shadow-[inset_0_0_0_1px_var(--color-border-accent)] disabled:border-border-subtle disabled:bg-surface-secondary disabled:opacity-60"
      :class="[invalid ? 'border-feedback-error' : 'border-border-default', model === null ? 'text-text-secondary' : 'text-text-primary']"
    >
      <option v-if="placeholder" :value="null" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <DsIcon
      name="caret-down"
      class="pointer-events-none col-start-1 row-start-1 mr-4 size-[20px]! self-center justify-self-end text-text-secondary"
    />
  </div>
</template>
