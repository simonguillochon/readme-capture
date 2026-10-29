<script setup lang="ts">
// Atome Icon Button du DS (Figma, page Components, nœud 178:69).
import { computed } from 'vue';
import DsIcon from './DsIcon.vue';

const props = withDefaults(
  defineProps<{
    icon: 'arrow-right' | 'check' | 'eye' | 'eye-slash' | 'pencil-simple' | 'trash';
    label: string;
    variant?: 'default' | 'ghost';
    size?: 'md' | 'lg';
    disabled?: boolean;
    pressed?: boolean;
  }>(),
  { variant: 'default', size: 'md', disabled: false, pressed: undefined },
);

const classes = computed(() => [
  'inline-flex shrink-0 items-center justify-center rounded-md text-text-primary',
  'enabled:hover:bg-surface-secondary enabled:active:bg-accent-subtle disabled:opacity-60',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  props.size === 'md' ? 'size-[40px] p-2' : 'size-[48px] p-3',
  props.variant === 'default' ? 'border border-border-default' : '',
]);
</script>

<template>
  <button type="button" :aria-label="label" :title="label" :aria-pressed="pressed" :disabled="disabled" :class="classes">
    <DsIcon :name="icon" />
  </button>
</template>
