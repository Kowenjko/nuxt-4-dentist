<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props {
  id?: string
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  textarea?: boolean
  select?: boolean
  checkbox?: boolean
  minlength?: string
  options?: { name: string; value?: string; id?: string }[] | any[]
}

const model = defineModel<string | number | string[]>()

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  id: '',
})

const attrs = useAttrs()
const inputClasses = computed(() => [
  'fi',
  props.error ? 'is-error' : '',
  props.type === 'number' || props.type === 'datetime-local' ? 'fi-mono' : '',
])
</script>

<template>
  <div class="fg">
    <label v-if="label" class="fl" :for="id">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <textarea
      :id
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

    <div v-else-if="checkbox" class="checkbox-list">
      <label v-for="option in options" :key="option.id" class="checkbox-item">
        <input type="checkbox" :value="option.id" v-model="model" v-bind="attrs" />
        <span>{{ option.name }}</span>

        <slot :option />
      </label>
    </div>

    <input
      v-else
      v-model="model"
      v-bind="attrs"
      :type="type"
      :id
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :minlength="minlength"
      :class="inputClasses"
      autocomplete="off"
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

.checkbox-list {
  border: 1px solid var(--border);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 6px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.checkbox-item:hover {
  background: var(--surface2);
}
.checkbox-item input {
  accent-color: var(--accent);
}

@media (max-width: 640px) {
  .checkbox-list {
    max-height: 160px;
  }
}
</style>
