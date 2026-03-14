<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'

const search = ref('')
const modal = ref(false)
const editing = ref<any>(null)
const delTarget = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const formData = ref<ServiceI>({ name: '', duration: 60, price: 0 })

const { data: services, pending, refresh } = useAPI<ServiceI[]>(SERVICES)

const filtered = computed(
  () =>
    services.value?.filter((s) => s.name.toLowerCase().includes(search.value.toLowerCase())) || []
)

const openCreate = () => {
  editing.value = null
  formData.value = { name: '', duration: 60, price: 0 }
  formError.value = ''
  modal.value = true
}
const openEdit = (service: ServiceI) => {
  editing.value = service
  formData.value = { name: service.name, duration: service.duration, price: Number(service.price) }
  formError.value = ''
  modal.value = true
}

const save = async () => {
  if (!formData.value.name.trim()) {
    formError.value = 'Вкажіть назву'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) await serviceAPI.update(editing.value.id, formData.value)
    else await serviceAPI.create(formData.value)
    modal.value = false
    await refresh()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка'
  } finally {
    saving.value = false
  }
}

const doDelete = async () => {
  saving.value = true
  try {
    await serviceAPI.delete(delTarget.value.id)
    delTarget.value = null
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  } finally {
    saving.value = false
  }
}

definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <div class="page-hd">
      <AdminTitle title="Послуги" subtitle="Каталог медичних послуг" />
      <AdminButton @click="openCreate"><PlusIcon /> Додати послугу</AdminButton>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <AdminInput v-model="search" placeholder="Пошук за назвою..." id="service-search" />
        <span style="font-size: 12.5px; color: var(--text-3)">{{ filtered.length }} послуг</span>
      </div>

      <div class="table-wrap">
        <div v-if="pending" class="loading">Завантаження...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Назва</th>
              <th>Тривалість</th>
              <th>Ціна</th>
              <th>Лікарів</th>
              <th>Записів</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="6">
                <div class="empty">
                  <div class="empty-icon">⭐</div>
                  <div class="empty-title">Послуги не знайдено</div>
                  <div class="empty-sub">Додайте першу послугу</div>
                </div>
              </td>
            </tr>
            <tr v-for="s in filtered" :key="s.id">
              <td style="font-weight: 600">{{ s.name }}</td>
              <td>
                <span class="badge badge-neutral mono">{{ s.duration }} хв</span>
              </td>
              <td class="mono" style="color: var(--accent)">
                {{ Number(s.price).toLocaleString('uk-UA') }} ₴
              </td>
              <td>
                <div style="display: flex; gap: 4px; flex-wrap: wrap">
                  <span
                    v-for="d in (s.doctors || []).slice(0, 3)"
                    :key="d.id"
                    class="badge badge-doctor"
                    style="font-size: 10.5px"
                  >
                    {{ d.user?.name?.split(' ')[1] || d.user?.name }}
                  </span>
                  <span v-if="s.doctors && s.doctors?.length > 3" class="badge badge-neutral"
                    >+{{ s.doctors.length - 3 }}</span
                  >
                  <span
                    v-if="!(s.doctors || []).length"
                    style="color: var(--text-3); font-size: 12px"
                    >—</span
                  >
                </div>
              </td>
              <td>
                <span class="badge badge-neutral">{{ s._count?.appointments || 0 }}</span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn btn-ghost btn-sm" @click="openEdit(s)">Змінити</button>
                  <button class="btn btn-danger btn-sm" @click="delTarget = s">Видалити</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal modal-sm">
        <div class="modal-hd">
          <span class="modal-title">{{ editing ? 'Редагувати послугу' : 'Нова послуга' }}</span>
          <button class="modal-x" @click="modal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="alert alert-error">{{ formError }}</div>
          <div class="fg">
            <label class="fl">Назва</label>
            <input v-model="formData.name" class="fi" placeholder="Лікування карієсу" autofocus />
          </div>
          <div class="form-row">
            <div class="fg">
              <label class="fl">Тривалість (хв)</label>
              <input
                v-model.number="formData.duration"
                type="number"
                min="15"
                step="15"
                class="fi fi-mono"
                placeholder="60"
              />
            </div>
            <div class="fg">
              <label class="fl">Ціна (₴)</label>
              <input
                v-model.number="formData.price"
                type="number"
                min="0"
                step="100"
                class="fi fi-mono"
                placeholder="1200"
              />
            </div>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-ghost" @click="modal = false">Скасувати</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            {{ saving ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="delTarget" class="overlay" @click.self="delTarget = null">
      <div class="modal modal-sm">
        <div class="modal-hd">
          <span class="modal-title">Видалити послугу?</span>
          <button class="modal-x" @click="delTarget = null">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13.5px; color: var(--text-2); line-height: 1.6">
            Видалити <strong style="color: var(--text)">{{ delTarget.name }}</strong
            >?<br />
            <span style="color: var(--danger)">Неможливо, якщо є активні записи.</span>
          </p>
        </div>
        <div class="modal-ft">
          <button class="btn btn-ghost" @click="delTarget = null">Скасувати</button>
          <button class="btn btn-danger" @click="doDelete" :disabled="saving">Видалити</button>
        </div>
      </div>
    </div>
  </div>
</template>
