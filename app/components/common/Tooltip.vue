<script lang="ts" setup>
interface Props {
  text?: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  theme?: 'auto' | 'light' | 'dark'
  maxWidth?: number
}

const { position = 'top', theme = 'auto', maxWidth = 220 } = defineProps<Props>()

const tooltipClass = computed(() => [
  'tooltip-bubble',
  `tooltip-${position}`,
  theme !== 'auto' ? `tooltip-${theme}` : '',
])
</script>

<template>
  <span class="tooltip-wrap">
    <span class="tooltip-trigger">
      <slot />
    </span>

    <span :class="tooltipClass" :style="{ '--tooltip-max-w': `${maxWidth}px` }">
      <slot name="content">{{ text }}</slot>
    </span>
  </span>
</template>

<style scoped>
.tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-trigger {
  display: inline-flex;
  align-items: center;
}

.tooltip-bubble {
  --tt-bg: var(--surface);
  --tt-text: var(--text);
  --tt-border: var(--border);
  --tt-shadow: var(--shadow-card);
  --tt-arrow-size: 8px;

  position: absolute;
  z-index: var(--z-dropdown);
  max-width: var(--tooltip-max-w);
  width: max-content;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  background: var(--tt-bg);
  color: var(--tt-text);
  border: 1px solid var(--tt-border);
  box-shadow: var(--tt-shadow);
  font-size: 12.5px;
  line-height: 1.4;
  white-space: normal;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px) scale(0.98);
  transition:
    opacity var(--duration-fast),
    transform var(--duration-fast),
    visibility var(--duration-fast);
}

.tooltip-bubble::after {
  content: '';
  position: absolute;
  width: var(--tt-arrow-size);
  height: var(--tt-arrow-size);
  background: var(--tt-bg);
  border-right: 1px solid var(--tt-border);
  border-bottom: 1px solid var(--tt-border);
  transform: rotate(45deg);
}

.tooltip-wrap:hover .tooltip-bubble,
.tooltip-wrap:focus-within .tooltip-bubble {
  opacity: 1;
  visibility: visible;
}

.tooltip-top {
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translate(-50%, 6px) scale(0.98);
}
.tooltip-top::after {
  left: 50%;
  top: 100%;
  transform: translate(-50%, -50%) rotate(45deg);
}
.tooltip-wrap:hover .tooltip-top,
.tooltip-wrap:focus-within .tooltip-top {
  transform: translate(-50%, 0) scale(1);
}

.tooltip-bottom {
  left: 50%;
  top: calc(100% + 10px);
  transform: translate(-50%, -6px) scale(0.98);
}
.tooltip-bottom::after {
  left: 50%;
  bottom: 100%;
  transform: translate(-50%, 50%) rotate(225deg);
}
.tooltip-wrap:hover .tooltip-bottom,
.tooltip-wrap:focus-within .tooltip-bottom {
  transform: translate(-50%, 0) scale(1);
}

.tooltip-left {
  right: calc(100% + 10px);
  top: 50%;
  transform: translate(6px, -50%) scale(0.98);
}
.tooltip-left::after {
  left: 100%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}
.tooltip-wrap:hover .tooltip-left,
.tooltip-wrap:focus-within .tooltip-left {
  transform: translate(0, -50%) scale(1);
}

.tooltip-right {
  left: calc(100% + 10px);
  top: 50%;
  transform: translate(-6px, -50%) scale(0.98);
}
.tooltip-right::after {
  right: 100%;
  top: 50%;
  transform: translate(50%, -50%) rotate(135deg);
}
.tooltip-wrap:hover .tooltip-right,
.tooltip-wrap:focus-within .tooltip-right {
  transform: translate(0, -50%) scale(1);
}

.tooltip-light {
  --tt-bg: #ffffff;
  --tt-text: #181613;
  --tt-border: #e8e3d9;
  --tt-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tooltip-dark {
  --tt-bg: #1e1d1a;
  --tt-text: #f0ede8;
  --tt-border: #3d3b35;
  --tt-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
</style>
