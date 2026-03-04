<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props {
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  textarea?: boolean
  minlength?: string
}

const model = defineModel<string | number>()

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const attrs = useAttrs()
const inputClasses = computed(() => ['auth-fi', props.error ? 'is-error' : ''])
</script>

<template>
  <div class="auth-fg">
    <label v-if="label" class="auth-fl">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <!-- Input -->
    <textarea
      v-if="textarea"
      v-model="model"
      v-bind="attrs"
      :placeholder="placeholder"
      :disabled="disabled"
      :minlength="minlength"
      :class="inputClasses"
    />

    <input
      v-else
      v-model="model"
      v-bind="attrs"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :minlength="minlength"
      :class="inputClasses"
    />

    <p v-if="error" class="input-error">
      {{ error }}
    </p>
  </div>
</template>
<style scoped>
.auth-fg {
  margin-bottom: 14px;
}
.auth-fl {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  margin-bottom: 6px;
  /* text-transform: uppercase; */
  letter-spacing: 0.06em;
}

.required {
  color: var(--danger);
  margin-left: 2px;
}
.auth-fg {
  margin-bottom: 14px;
}
.auth-fl {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.auth-fi {
  width: 100%;
  height: 40px;
  padding: 0 13px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--bg-2);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition:
    border-color var(--duration-fast),
    background var(--duration-fast);
}
.auth-fi:focus {
  border-color: var(--border-focus);
  background: var(--surface);
}
.auth-fi::placeholder {
  color: var(--text-4);
}

.auth-fi.is-error {
  border-color: var(--danger);
  background: var(--bg-danger);
}

.input-error {
  font-size: 12px;
  color: var(--danger);
  margin-top: 4px;
}
</style>
