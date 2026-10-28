<script setup lang="ts">
// Atome Disclosure du DS v1.8 (Figma, page Components, nœud 660:153) : en-tête toujours visible, corps révélé déplié.
// Bloqué, le déclencheur prend `aria-disabled` et non `disabled`, pour rester atteignable au clavier.
import { nextTick, ref, useId, watch } from 'vue';
import DsIcon from './DsIcon.vue';

const props = withDefaults(defineProps<{ label: string; disabled?: boolean; disabledReason?: string }>(), {
  disabled: false,
  disabledReason: undefined,
});

const expanded = defineModel<boolean>('expanded', { required: true });

const bodyId = useId();
const reasonId = useId();
const trigger = ref<HTMLButtonElement | null>(null);
const body = ref<HTMLDivElement | null>(null);

function toggle() {
  if (!props.disabled) expanded.value = !expanded.value;
}

// Replié par programme alors que le focus est dans le corps : le focus revient sur le déclencheur.
watch(expanded, async (value, previous) => {
  if (value || !previous) return;
  const focusInBody = body.value?.contains(document.activeElement) ?? false;
  await nextTick();
  if (focusInBody) trigger.value?.focus();
});
</script>

<template>
  <div class="w-full border border-border-subtle">
    <div class="flex min-h-[44px] items-center gap-2 px-4 py-3" :class="{ 'hover:bg-surface-secondary': !disabled }">
      <button
        ref="trigger"
        type="button"
        class="flex min-w-[0px] flex-1 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        :class="{ 'opacity-60': disabled }"
        :aria-expanded="expanded"
        :aria-controls="bodyId"
        :aria-disabled="disabled || undefined"
        :aria-describedby="disabled && disabledReason ? reasonId : undefined"
        @click="toggle"
      >
        <DsIcon :name="expanded ? 'caret-up' : 'caret-down'" class="size-[20px]! text-text-secondary" />
        <span class="min-w-[0px] truncate font-sans text-body text-text-primary">{{ label }}</span>
      </button>
      <div v-if="$slots.accessory" class="shrink-0">
        <slot name="accessory" />
      </div>
    </div>
    <span v-if="disabled && disabledReason" :id="reasonId" class="sr-only">{{ disabledReason }}</span>
    <div :id="bodyId" ref="body" :hidden="!expanded" class="px-4 pb-4">
      <slot />
    </div>
  </div>
</template>
