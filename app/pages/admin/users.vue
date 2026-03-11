<template>
  <div>
    <div class="page-hd">
      <div>
        <h1 class="page-title">Користувачі</h1>
        <p class="page-sub">Керування акаунтами · {{ pagination.total || 0 }} всього</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Додати
      </button>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <input
            v-model="search"
            @input="debounce"
            class="inp inp-search"
            placeholder="Пошук за іменем або email..."
          />
          <select v-model="roleFilter" @change="load()" class="inp">
            <option value="">Всі ролі</option>
            <option value="CLIENT">Пацієнт</option>
            <option value="DOCTOR">Лікар</option>
            <option value="ADMIN">Адміністратор</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <div v-if="loading" class="loading">Завантаження...</div>
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
                    <img v-if="u.avatar" :src="u.avatar" class="av-img" />
                    <span v-else>{{ ini(u.name) }}</span>
                  </div>
                  <div>
                    <div class="uc-name">{{ u.name }}</div>
                    <div class="uc-sub">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="mono">{{ u.phone || '—' }}</td>
              <td>
                <span class="badge" :class="rbadge(u.role)">{{ rlabel(u.role) }}</span>
              </td>
              <td>
                <span
                  v-if="u.googleId"
                  class="badge badge-neutral"
                  title="Прив'язано акаунт Google"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 18 18"
                    fill="none"
                    style="margin-right: 3px"
                  >
                    <path
                      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                      fill="#4285F4"
                    />
                    <path
                      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                      fill="#34A853"
                    />
                    <path
                      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </span>
                <span v-else class="mono" style="color: var(--text-3)">—</span>
              </td>
              <td class="mono">{{ fdate(u.createdAt) }}</td>
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

      <div class="pagination">
        <span>{{ pagination.total }} записів</span>
        <div class="pg-btns">
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--; load()">←</button>
          <span style="padding: 5px 10px; color: var(--text-2)"
            >{{ page }} / {{ pagination.totalPages || 1 }}</span
          >
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page >= (pagination.totalPages || 1)" @click="page++; load()">→</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">{{
            editing ? 'Редагувати користувача' : 'Новий користувач'
          }}</span>
          <button class="modal-x" @click="modal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="ferr" class="alert alert-error">{{ ferr }}</div>
          <div class="form-row">
            <div class="fg">
              <label class="fl">Ім'я</label>
              <input v-model="form.name" class="fi" placeholder="Іван Іваненко" />
            </div>
            <div class="fg">
              <label class="fl">Телефон</label>
              <input v-model="form.phone" class="fi" placeholder="+380 99 000 00 00" />
            </div>
          </div>
          <div class="fg">
            <label class="fl">Email</label>
            <input v-model="form.email" type="email" class="fi" placeholder="user@example.com" />
          </div>
          <div v-if="!editing" class="fg">
            <label class="fl">Пароль</label>
            <input
              v-model="form.password"
              type="password"
              class="fi"
              placeholder="Мінімум 8 символів"
            />
          </div>
          <div class="fg">
            <label class="fl">Роль</label>
            <select v-model="form.role" class="fi">
              <option value="CLIENT">Пацієнт</option>
              <option value="DOCTOR">Лікар</option>
              <option value="ADMIN">Адміністратор</option>
            </select>
          </div>
          <div v-if="form.role === 'DOCTOR' && !editing" class="fg">
            <label class="fl">Спеціальність</label>
            <input v-model="form.specialty" class="fi" placeholder="Стоматолог" />
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
          <span class="modal-title">Видалити користувача?</span>
          <button class="modal-x" @click="delTarget = null">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13.5px; color: var(--text-2); line-height: 1.6">
            Видалити <strong style="color: var(--text)">{{ delTarget.name }}</strong
            >?<br />Цю дію не можна скасувати.
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

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const users = ref<any[]>([])
const pagination = ref<any>({})
const loading = ref(true)
const page = ref(1)
const search = ref('')
const roleFilter = ref('')
const modal = ref(false)
const editing = ref<any>(null)
const delTarget = ref<any>(null)
const saving = ref(false)
const ferr = ref('')
const form = ref({ name: '', email: '', phone: '', password: '', role: 'CLIENT', specialty: '' })

const ini = (n: string) =>
  n
    ?.split(' ')
    .map((x: string) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
const fdate = (d: string) =>
  new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
const rlabel = (r: string) => ({ CLIENT: 'Пацієнт', DOCTOR: 'Лікар', ADMIN: 'Адмін' })[r] || r
const rbadge = (r: string) =>
  ({ CLIENT: 'badge-client', DOCTOR: 'badge-doctor', ADMIN: 'badge-admin' })[r] || ''

const load = async () => {
  loading.value = true
  const q = new URLSearchParams({ page: String(page.value), limit: '15' })
  if (search.value) q.set('search', search.value)
  if (roleFilter.value) q.set('role', roleFilter.value)
  const res = (await $fetch(`/api/users?${q}`)) as any
  users.value = res.data || []
  pagination.value = res.pagination || {}
  loading.value = false
}

let dt: any
const debounce = () => {
  clearTimeout(dt)
  dt = setTimeout(() => {
    page.value = 1
    load()
  }, 350)
}

const openCreate = () => {
  editing.value = null
  form.value = { name: '', email: '', phone: '', password: '', role: 'CLIENT', specialty: '' }
  ferr.value = ''
  modal.value = true
}
const openEdit = (u: any) => {
  editing.value = u
  form.value = {
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    password: '',
    role: u.role,
    specialty: '',
  }
  ferr.value = ''
  modal.value = true
}

const save = async () => {
  saving.value = true
  ferr.value = ''
  try {
    if (editing.value) {
      await $fetch(`/api/users/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/auth/register', { method: 'POST', body: form.value })
    }
    modal.value = false
    load()
  } catch (e: any) {
    ferr.value = e?.data?.statusMessage || 'Помилка збереження'
  } finally {
    saving.value = false
  }
}

const doDelete = async () => {
  saving.value = true
  try {
    await $fetch(`/api/users/${delTarget.value.id}`, { method: 'DELETE' })
    delTarget.value = null
    load()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}
</style>
