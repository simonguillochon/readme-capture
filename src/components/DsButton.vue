<script setup lang="ts">
// Atome Button du DS v1.13 (Figma, page Components, nœud 154:98) : hauteurs 44 / 48 / 56 px, link dans une zone de 44 px,
// libellé du primary en text/on-accent, désactivé à 60 % d'opacité, link souligné au survol et à l'appui seulement,
// focus en anneau 2 px accent décalé de 2 px.
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
const sizes = { sm: 'h-[44px] px-4', md: 'h-[48px] px-6', lg: 'h-[56px] px-8' };
const variants = {
  primary:
    'bg-accent text-text-on-accent enabled:hover:bg-accent-hover enabled:active:bg-accent-hover enabled:active:opacity-90',
  secondary:
    'border border-border-default text-text-primary enabled:hover:bg-surface-elevated enabled:active:bg-surface-secondary enabled:active:opacity-90',
  ghost:
    'text-text-primary enabled:hover:bg-accent-subtle enabled:active:bg-accent-subtle enabled:active:opacity-85',
  link: 'text-text-accent enabled:hover:underline enabled:active:underline enabled:active:opacity-85',
};

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-md font-sans font-medium leading-[1.2] whitespace-nowrap disabled:opacity-60',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  fontSizes[props.size],
  props.variant === 'link' ? 'h-[44px]' : sizes[props.size],
  variants[props.variant],
]);
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
