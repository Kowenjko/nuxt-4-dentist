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
const inputClasses = computed(() => ['form-input', props.error ? 'is-error' : ''])
</script>

<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
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
.form-group {
  margin-bottom: 14px;
}
.form-label {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.required {
  color: var(--text-error);
  margin-left: 2px;
}
.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-light);
  border-radius: 7px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
}
.form-input:focus {
  border-color: var(--color-primary);
}

.form-input.is-error {
  border-color: var(--text-error);
  background: var(--bg-error);
}

.input-error {
  font-size: 12px;
  color: var(--text-error);
  margin-top: 4px;
}
</style>
