<script setup lang="ts">
// Atome Button du DS (Figma, page Components, nœud 154:98).
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit';
    disabled?: boolean;
  }>(),
  { variant: 'primary', size: 'md', type: 'button', disabled: false },
);

const fontSizes = { sm: 'text-[14px]', md: 'text-[16px]', lg: 'text-[18px]' };
const paddings = { sm: 'px-[14px] py-2', md: 'px-[20px] py-[10px]', lg: 'px-[28px] py-[14px]' };
const variants = {
  primary:
    'bg-accent text-text-inverse enabled:hover:bg-accent-hover enabled:active:bg-accent-hover enabled:active:opacity-90 disabled:opacity-40',
  secondary:
    'border border-border-default text-text-primary enabled:hover:bg-surface-elevated enabled:active:bg-surface-secondary enabled:active:opacity-90 disabled:border-border-subtle disabled:text-text-tertiary',
  ghost:
    'text-text-primary enabled:hover:bg-accent-subtle enabled:active:bg-accent-subtle enabled:active:opacity-85 disabled:text-text-tertiary',
  link: 'text-text-accent underline enabled:active:opacity-85 disabled:text-text-tertiary',
};

const classes = computed(() => [
  'inline-flex items-center justify-center font-sans font-medium leading-[normal] whitespace-nowrap',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  fontSizes[props.size],
  props.variant === 'link' ? 'py-[2px]' : `rounded-md ${paddings[props.size]}`,
  variants[props.variant],
]);
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
