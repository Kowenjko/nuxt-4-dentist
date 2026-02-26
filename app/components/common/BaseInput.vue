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
  color: #7a7872;
  margin-bottom: 6px;
}

.required {
  color: #c0392b;
  margin-left: 2px;
}
.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #e4e2dc;
  border-radius: 7px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1917;
  outline: none;
  transition: border-color 0.15s;
}
.form-input:focus {
  border-color: #1a3a2a;
}

.form-input.is-error {
  border-color: #c0392b;
  background: #fdf0ee;
}

.input-error {
  font-size: 12px;
  color: #c0392b;
  margin-top: 4px;
}
</style>
