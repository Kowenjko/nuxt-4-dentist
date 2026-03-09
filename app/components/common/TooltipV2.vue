<template>
  <span
    class="tt-wrap"
    ref="wrapRef"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <!-- Trigger slot -->
    <slot />

    <!-- Tooltip bubble (teleported to body to escape overflow:hidden) -->
    <Teleport to="body">
      <Transition name="tt-t">
        <div
          v-if="visible"
          ref="bubbleRef"
          class="tt-bubble"
          :class="[`tt-${placement}`, `tt-variant-${variant}`]"
          :style="bubbleStyle"
          role="tooltip"
        >
          <!-- Arrow -->
          <span class="tt-arrow" :class="`tt-arrow-${placement}`" />

          <!-- Icon (optional) -->
          <span v-if="icon" class="tt-icon">{{ icon }}</span>

          <!-- Content -->
          <span class="tt-content">
            <slot name="content">{{ text }}</slot>
          </span>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  variant?: 'default' | 'accent' | 'danger' | 'warning' | 'info' | 'success'
  icon?: string
  delay?: number // ms затримки перед появою
  maxWidth?: number // px
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  variant: 'default',
  delay: 120,
  maxWidth: 240,
})

const wrapRef = ref<HTMLElement | null>(null)
const bubbleRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const bubbleStyle = ref<Record<string, string>>({})

let showTimer: ReturnType<typeof setTimeout> | null = null

const OFFSET = 10 // px між тригером і тултіпом

const calcPosition = () => {
  const trigger = wrapRef.value
  if (!trigger) return

  const tr = trigger.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY

  // Спочатку ставимо невидимо щоб виміряти розмір bubbleRef
  nextTick(() => {
    const bubble = bubbleRef.value
    if (!bubble) return
    const bw = bubble.offsetWidth
    const bh = bubble.offsetHeight

    let top = 0,
      left = 0

    switch (props.placement) {
      case 'top':
        top = tr.top + scrollY - bh - OFFSET
        left = tr.left + scrollX + tr.width / 2 - bw / 2
        break
      case 'bottom':
        top = tr.bottom + scrollY + OFFSET
        left = tr.left + scrollX + tr.width / 2 - bw / 2
        break
      case 'left':
        top = tr.top + scrollY + tr.height / 2 - bh / 2
        left = tr.left + scrollX - bw - OFFSET
        break
      case 'right':
        top = tr.top + scrollY + tr.height / 2 - bh / 2
        left = tr.right + scrollX + OFFSET
        break
    }

    // Не виходимо за межі viewport
    const vw = window.innerWidth
    left = Math.max(8, Math.min(left, vw - bw - 8))

    bubbleStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: `${props.maxWidth}px`,
    }
  })
}

const show = () => {
  showTimer = setTimeout(() => {
    visible.value = true
    calcPosition()
  }, props.delay)
}

const hide = () => {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  visible.value = false
}

onUnmounted(hide)
</script>

<style scoped>
/* ── Wrapper ──────────────────────────────────────────────────── */
.tt-wrap {
  display: inline-flex;
  position: relative;
}
</style>

<style>
/* ── Bubble (global — Teleport виходить з scoped) ─────────────── */
.tt-bubble {
  position: absolute;
  z-index: var(--z-tooltip, 9999);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: var(--radius-sm, 7px);
  font-family: var(--font-admin, 'Syne', sans-serif);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
  border: 1px solid transparent;

  /* Variant: default — адаптується до теми */
  background: var(--tt-bg, var(--surface-3, #252932));
  color: var(--tt-color, var(--text, #e8eaf0));
  border-color: var(--tt-border, var(--border, #252932));
  box-shadow: var(--tt-shadow, 0 4px 16px rgba(0, 0, 0, 0.24));
}

/* ── Variants ─────────────────────────────────────────────────── */
.tt-variant-accent {
  --tt-bg: var(--accent-bg);
  --tt-color: var(--accent);
  --tt-border: var(--accent-light);
  --tt-shadow: var(--shadow-accent);
}
.tt-variant-danger {
  --tt-bg: var(--danger-bg);
  --tt-color: var(--danger);
  --tt-border: var(--danger-border);
  --tt-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.tt-variant-warning {
  --tt-bg: var(--warning-bg);
  --tt-color: var(--warning);
  --tt-border: color-mix(in srgb, var(--warning) 30%, transparent);
  --tt-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.tt-variant-info {
  --tt-bg: var(--info-bg);
  --tt-color: var(--info);
  --tt-border: color-mix(in srgb, var(--info) 30%, transparent);
  --tt-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.tt-variant-success {
  --tt-bg: var(--success-bg);
  --tt-color: var(--success);
  --tt-border: var(--accent-light);
  --tt-shadow: var(--shadow-accent);
}

/* ── Arrow ────────────────────────────────────────────────────── */
.tt-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  border: 1px solid var(--tt-border, var(--border));
  transform: rotate(45deg);
}

/* Arrow position by placement */
.tt-top .tt-arrow-top {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-top: none;
  border-left: none;
}
.tt-bottom .tt-arrow-bottom {
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-bottom: none;
  border-right: none;
}
.tt-left .tt-arrow-left {
  right: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left: none;
  border-bottom: none;
}
.tt-right .tt-arrow-right {
  left: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-right: none;
  border-top: none;
}

/* ── Icon ─────────────────────────────────────────────────────── */
.tt-icon {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1;
}

/* ── Content ──────────────────────────────────────────────────── */
.tt-content {
  flex: 1;
}

/* ── Transition ───────────────────────────────────────────────── */
.tt-t-enter-active {
  transition:
    opacity var(--duration-fast, 0.15s),
    transform var(--duration-fast, 0.15s) var(--ease, cubic-bezier(0.22, 0.68, 0, 1.2));
}
.tt-t-leave-active {
  transition:
    opacity var(--duration-fast, 0.15s),
    transform var(--duration-fast, 0.15s) ease;
}

.tt-top.tt-t-enter-from,
.tt-top.tt-t-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.97);
}
.tt-bottom.tt-t-enter-from,
.tt-bottom.tt-t-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.97);
}
.tt-left.tt-t-enter-from,
.tt-left.tt-t-leave-to {
  opacity: 0;
  transform: translateX(5px) scale(0.97);
}
.tt-right.tt-t-enter-from,
.tt-right.tt-t-leave-to {
  opacity: 0;
  transform: translateX(-5px) scale(0.97);
}
</style>
