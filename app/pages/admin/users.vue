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
      <AdminTitle
        title="Користувачі"
        :subtitle="`Керування акаунтами · ${pagination?.total || 0} всього`"
      />

      <AdminButton @click="openCreate"><PlusIcon /> Додати </AdminButton>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <AdminInput
            v-model="search"
            placeholder="Пошук за іменем або email..."
            id="user-search"
          />
          <AdminInput
            select
            v-model="roleFilter"
            :options="[{ value: '', name: 'Всі ролі' }, ...doctorOptions]"
          />
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
                  <AdminButton variant="ghost" size="sm" @click="openEdit(u)">
                    Змінити
                  </AdminButton>
                  <AdminButton variant="danger" size="sm" @click="delTarget = u">
                    Видалити
                  </AdminButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationButton :pagination :page />
    </div>
    <!-- Create/Edit modal -->
    <CreateUserModal
      :editing
      :saving
      :formError
      :formData
      :doctorOptions
      v-model="modal"
      @confirm="save"
    />

    <!-- Delete confirm -->
    <DeleteUserModal v-model="delTarget" @delete="doDelete" />
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
