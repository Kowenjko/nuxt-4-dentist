<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'

const page = ref(1)
const search = ref('')
const roleFilter = ref('')
const modal = ref(false)
const editing = ref<any>(null)
const delTarget = ref<any>(null)
const saving = ref(false)
const formError = ref('')

const formData = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: Roles.CLIENT as Role,
  specialty: '',
})

const doctorOptions = [
  {
    value: Roles.ADMIN,
    name: 'Адміністратор',
  },
  { value: Roles.CLIENT, name: 'Пацієнт' },
  { value: Roles.DOCTOR, name: 'Лікар' },
]

const roleLabel = (r: string) => ({ CLIENT: 'Пацієнт', DOCTOR: 'Лікар', ADMIN: 'Адмін' })[r] || r
const roleBadge = (r: string) =>
  ({ CLIENT: 'badge-client', DOCTOR: 'badge-doctor', ADMIN: 'badge-admin' })[r] || ''

const { data, refresh, pending } = useAPI<ApiResponseI<UserI[]>>(USERS, {
  params: { search: search, page: page, limit: '15', role: roleFilter },
})

const users = computed(() => data.value?.data ?? [])
const pagination = computed(() => data.value?.pagination)

const openCreate = () => {
  editing.value = null
  formData.value = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: Roles.CLIENT,
    specialty: '',
  }
  formError.value = ''
  modal.value = true
}
const openEdit = (u: any) => {
  editing.value = u
  formData.value = {
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    password: '',
    role: u.role,
    specialty: '',
  }
  formError.value = ''
  modal.value = true
}

const save = async () => {
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await userAPI.update(editing.value.id, formData.value)
    } else {
      await authAPI.register(formData.value)
    }
    modal.value = false
    await refresh()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка збереження'
  } finally {
    saving.value = false
  }
}

const doDelete = async () => {
  saving.value = true
  try {
    await userAPI.delete(delTarget.value.id)
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
      <div>
        <h1 class="page-title">Користувачі</h1>
        <p class="page-sub">Керування акаунтами · {{ pagination?.total || 0 }} всього</p>
      </div>

      <AdminButton @click="openCreate"><PlusIcon /> Додати </AdminButton>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <input
            v-model="search"
            class="inp inp-search"
            placeholder="Пошук за іменем або email..."
          />

          <select v-model="roleFilter" class="inp">
            <option value="">Всі ролі</option>
            <option value="CLIENT">Пацієнт</option>
            <option value="DOCTOR">Лікар</option>
            <option value="ADMIN">Адміністратор</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <div v-if="pending" class="loading">Завантаження...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Користувач</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Google</th>
              <th>Реєстрація</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!users.length">
              <td colspan="6">
                <div class="empty">
                  <div class="empty-icon">👤</div>
                  <div class="empty-title">Користувачів не знайдено</div>
                </div>
              </td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="user-cell">
                  <div class="av" :class="u.role === 'DOCTOR' ? 'av-green' : ''">
                    <nuxt-img v-if="u.avatar" :src="u?.avatar" class="av-img" />
                    <span v-else>{{ iniAvatar(u.name) }}</span>
                  </div>
                  <div>
                    <div class="uc-name">{{ u.name }}</div>
                    <div class="uc-sub">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="mono">{{ u.phone || '—' }}</td>
              <td>
                <span class="badge" :class="roleBadge(u.role)">{{ roleLabel(u.role) }}</span>
              </td>
              <td>
                <span
                  v-if="u.googleId"
                  class="badge badge-neutral"
                  title="Прив'язано акаунт Google"
                >
                  <GoogleIcon />

                  Google
                </span>
                <span v-else class="mono" style="color: var(--text-3)">—</span>
              </td>
              <td class="mono">{{ formatDate(u.createdAt!) }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-ghost btn-sm" @click="openEdit(u)">Змінити</button>
                  <button class="btn btn-danger btn-sm" @click="delTarget = u">Видалити</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="pagination">
        <span>{{ pagination?.total }} записів</span>
        <div class="pg-btns">
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--">←</button>
          <span style="padding: 5px 10px; color: var(--text-2)"
            >{{ page }} / {{ pagination.totalPages || 1 }}</span
          >
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page >= (pagination.totalPages || 1)" @click="page++">→</button>
        </div>
      </div>
    </div>
    <!-- Create/Edit modal -->
    <AdminModal
      :title="editing ? 'Редагувати користувача' : 'Новий користувач'"
      v-model="modal"
      :saving
      :name-button-confirm="saving ? 'Збереження...' : 'Зберегти'"
      @confirm="save"
    >
      <div v-if="formError" class="alert alert-error">{{ formError }}</div>
      <div class="form-row">
        <AdminInput v-model="formData.name" label="Ім'я" placeholder="Іван Іваненко" />
        <AdminInput v-model="formData.phone" label="Телефон" placeholder="+380 99 000 00 00" />
      </div>
      <AdminInput
        v-model="formData.email"
        type="email"
        label="Email"
        placeholder="user@example.com"
      />
      <AdminInput
        v-if="!editing"
        v-model="formData.password"
        type="password"
        label="Пароль"
        placeholder="Мінімум 8 символів"
      />

      <AdminInput label="Роль" select v-model="formData.role" :options="doctorOptions" />

      <AdminInput
        v-if="formData.role === 'DOCTOR' && !editing"
        v-model="formData.specialty"
        label="Спеціальність"
        placeholder="Стоматолог"
      />
    </AdminModal>

    <!-- Delete confirm -->
    <AdminModal
      title="Видалити користувача?"
      v-model="delTarget"
      name-button-delete="Видалити"
      @delete="doDelete"
    >
      <p style="font-size: 13.5px; color: var(--text-2); line-height: 1.6">
        Видалити <strong style="color: var(--text)">{{ delTarget.name }}</strong
        >?<br />Цю дію не можна скасувати.
      </p>
    </AdminModal>
  </div>
</template>

<style scoped>
.av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}
</style>
