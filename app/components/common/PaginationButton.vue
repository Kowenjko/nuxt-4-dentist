<script lang="ts" setup>
import { MoveRightIcon, MoveLeftIcon } from 'lucide-vue-next'

const props = defineProps<{ pagination?: PaginationI; page: number }>()
</script>

<template>
  <div class="pagination" v-if="pagination">
    <span>{{ pagination?.total }} записів</span>
    <div class="pg-btns">
      <AdminButton variant="ghost" size="sm" :disabled="page <= 1" @click="page--">
        <MoveLeftIcon />
      </AdminButton>
      <span class="text-total">{{ page }} / {{ pagination.totalPages || 1 }}</span>

      <AdminButton variant="ghost" size="sm" :disabled="page >= (pagination.totalPages || 1)">
        <MoveRightIcon />
      </AdminButton>
    </div>
  </div>
</template>
<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  font-size: 12.5px;
  color: var(--text-3);
}
.pg-btns {
  display: flex;
  gap: 4px;
}

.text-total {
  padding: 5px 10px;
  color: var(--text-2);
}
</style>
