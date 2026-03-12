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
  select?: boolean
  minlength?: string
  options?: { name: string; value: string }[]
}

const model = defineModel<string | number>()

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const attrs = useAttrs()
const inputClasses = computed(() => ['fi', props.error ? 'is-error' : ''])
</script>

<template>
  <div class="fg">
    <label v-if="label" class="fl">
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

    <select v-else-if="select" v-model="model" :class="inputClasses" v-bind="attrs">
      <option v-for="option in options" :value="option.value" :key="option.value">
        {{ option.name }}
      </option>
    </select>

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
.fg {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fl {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.fl-optional {
  font-weight: 400;
  color: var(--text-4);
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
  margin-left: 4px;
}

.fi {
  height: 36px;
  padding: 0 12px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 13.5px;
  outline: none;
  width: 100%;
  transition:
    border-color var(--duration-fast),
    background var(--duration-fast);
}
.fi:focus {
  border-color: var(--border-focus);
  background: var(--surface);
}
.fi::placeholder {
  color: var(--text-4);
}

textarea.fi {
  height: auto;
  padding: 10px 12px;
  resize: vertical;
  min-height: 80px;
}
.fi-mono {
  font-family: var(--mono);
}
.fi-ta {
  min-height: 80px;
  resize: vertical;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fi.is-error {
  border-color: var(--danger);
  background: var(--bg-danger);
}

.input-error {
  font-size: 12px;
  color: var(--danger);
  margin-top: 4px;
}
</style>
