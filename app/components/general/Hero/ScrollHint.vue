<script lang="ts" setup></script>

<template>
  <div class="scroll-hint">
    <div class="scroll-line"></div>
    <span>гортайте</span>
  </div>
</template>

<style scoped>
.scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.8s ease 1.2s;
  pointer-events: none;
}
.scroll-hint.show {
  opacity: 1;
}

.scroll-line {
  width: 1.5px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, var(--i2, #5a6b5e));
  border-radius: 2px;
  animation: scroll-drop 1.8s ease-in-out infinite;
}
@keyframes scroll-drop {
  0% {
    transform: scaleY(0);
    transform-origin: top;
    opacity: 0;
  }
  30% {
    transform: scaleY(1);
    transform-origin: top;
    opacity: 1;
  }
  70% {
    transform: scaleY(1);
    transform-origin: bottom;
    opacity: 1;
  }
  100% {
    transform: scaleY(0);
    transform-origin: bottom;
    opacity: 0;
  }
}

.scroll-hint span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--i3, #7a8a7e);
}

@media (max-width: 640px) {
  .scroll-hint {
    bottom: 20px;
  }
  .scroll-line {
    height: 28px;
  }
}
</style>
