<template>
  <div>
    <div class="page-hd">
      <div>
        <h1 class="page-title">Записи</h1>
        <p class="page-sub">Керування прийомами · {{ pagination.total || 0 }} всього</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Новий запис
      </button>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <select v-model="statusF" @change="load()" class="inp">
            <option value="">Всі статуси</option>
            <option value="PENDING">Очікування</option>
            <option value="CONFIRMED">Підтверджено</option>
            <option value="CANCELLED">Скасовано</option>
          </select>
          <input v-model="fromF" @change="load()" type="date" class="inp" />
          <input v-model="toF" @change="load()" type="date" class="inp" />
          <button v-if="statusF || fromF || toF" class="btn btn-ghost btn-sm" @click="clearF">
            ✕ Скинути
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <div v-if="loading" class="loading">Завантаження...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Пацієнт</th>
              <th>Лікар</th>
              <th>Послуга</th>
              <th>Дата / Час</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!appts.length">
              <td colspan="6">
                <div class="empty">
                  <div class="empty-icon">📅</div>
                  <div class="empty-title">Записів не знайдено</div>
                </div>
              </td>
            </tr>
            <tr v-for="a in appts" :key="a.id">
              <td>
                <div class="user-cell">
                  <div class="av">
                    <img
                      v-if="a.client?.avatar"
                      :src="a.client.avatar"
                      style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px"
                    />
                    <span v-else>{{ ini(a.client?.name) }}</span>
                  </div>
                  <div>
                    <div class="uc-name">{{ a.client?.name }}</div>
                    <div class="uc-sub">{{ a.client?.phone || a.client?.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <div class="av av-green">{{ ini(a.doctor?.user?.name) }}</div>
                  <div>
                    <div class="uc-name">{{ a.doctor?.user?.name }}</div>
                    <div class="uc-sub mono" style="font-size: 11px">{{ a.doctor?.specialty }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-weight: 600; font-size: 13px">{{ a.service?.name }}</div>
                <div class="mono" style="font-size: 11px; margin-top: 2px">
                  {{ a.service?.duration }} хв ·
                  {{ Number(a.service?.price).toLocaleString('uk-UA') }} ₴
                </div>
              </td>
              <td>
                <div class="mono" style="font-size: 12.5px">{{ fdate(a.startTime) }}</div>
                <div class="mono" style="font-size: 11.5px; color: var(--text-3)">
                  {{ ftime(a.startTime) }} — {{ ftime(a.endTime) }}
                </div>
              </td>
              <td>
                <select
                  :value="a.status"
                  @change="changeStatus(a, ($event.target as any).value)"
                  class="status-sel"
                  :class="sclass(a.status)"
                >
                  <option value="PENDING">Очікування</option>
                  <option value="CONFIRMED">Підтверджено</option>
                  <option value="CANCELLED">Скасовано</option>
                </select>
              </td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="openDetail(a)">Деталі</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span>Стор. {{ page }} з {{ pagination.totalPages || 1 }}</span>
        <div class="pg-btns">
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--; load()">←</button>
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page >= (pagination.totalPages || 1)" @click="page++; load()">→</button>
        </div>
      </div>
    </div>

    <!-- Detail / notes modal -->
    <div v-if="detailModal && detailAppt" class="overlay" @click.self="detailModal = false">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">Деталі запису</span>
          <button class="modal-x" @click="detailModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid" style="margin-bottom: 16px">
            <div class="detail-box">
              <div class="detail-lbl">Пацієнт</div>
              <div class="detail-val">{{ detailAppt.client?.name }}</div>
              <div class="detail-sub">{{ detailAppt.client?.email }}</div>
              <div class="detail-sub">{{ detailAppt.client?.phone }}</div>
            </div>
            <div class="detail-box">
              <div class="detail-lbl">Лікар</div>
              <div class="detail-val">{{ detailAppt.doctor?.user?.name }}</div>
              <div class="detail-sub">{{ detailAppt.doctor?.specialty }}</div>
            </div>
            <div class="detail-box">
              <div class="detail-lbl">Послуга</div>
              <div class="detail-val">{{ detailAppt.service?.name }}</div>
              <div class="detail-sub mono">
                {{ detailAppt.service?.duration }} хв ·
                {{ Number(detailAppt.service?.price).toLocaleString('uk-UA') }} ₴
              </div>
            </div>
            <div class="detail-box">
              <div class="detail-lbl">Час</div>
              <div class="detail-val mono">{{ fdate(detailAppt.startTime) }}</div>
              <div class="detail-sub mono">
                {{ ftime(detailAppt.startTime) }} — {{ ftime(detailAppt.endTime) }}
              </div>
            </div>
          </div>
          <div class="fg">
            <label class="fl">Нотатки лікаря</label>
            <textarea
              v-model="detailNotes"
              class="fi fi-ta"
              placeholder="Додайте нотатки..."
            ></textarea>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-danger btn-sm" @click="deleteAppt(detailAppt)">
            Видалити запис
          </button>
          <div style="flex: 1"></div>
          <button class="btn btn-ghost" @click="detailModal = false">Закрити</button>
          <button class="btn btn-primary" @click="saveNotes" :disabled="saving">
            Зберегти нотатки
          </button>
        </div>
      </div>
    </div>

    <!-- Create appointment modal -->
    <div v-if="createModal" class="overlay" @click.self="createModal = false">
      <div class="modal modal-lg">
        <div class="modal-hd">
          <span class="modal-title">Новий запис</span>
          <button class="modal-x" @click="createModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="cferr" class="alert alert-error">{{ cferr }}</div>
          <div class="form-row">
            <div class="fg">
              <label class="fl">Лікар</label>
              <select v-model="cForm.doctorId" @change="onDoctorChange" class="fi">
                <option value="">Оберіть лікаря</option>
                <option v-for="d in allDoctors" :key="d.id" :value="d.id">
                  {{ d.user?.name }}
                </option>
              </select>
            </div>
            <div class="fg">
              <label class="fl">Послуга</label>
              <select v-model="cForm.serviceId" class="fi" :disabled="!cForm.doctorId">
                <option value="">Оберіть послугу</option>
                <option v-for="s in doctorSvcs" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="fg">
              <label class="fl">Email пацієнта</label>
              <input v-model="cForm.clientEmail" class="fi" placeholder="patient@example.com" />
            </div>
            <div class="fg">
              <label class="fl">Дата та час</label>
              <input v-model="cForm.startTime" type="datetime-local" class="fi fi-mono" />
            </div>
          </div>
          <div class="fg">
            <label class="fl">Нотатки</label>
            <textarea
              v-model="cForm.notes"
              class="fi fi-ta"
              placeholder="Необов'язково..."
            ></textarea>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-ghost" @click="createModal = false">Скасувати</button>
          <button class="btn btn-primary" @click="createAppt" :disabled="saving">
            {{ saving ? 'Створення...' : 'Створити запис' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const appts = ref<any[]>([])
const pagination = ref<any>({})
const loading = ref(true)
const page = ref(1)
const statusF = ref('')
const fromF = ref('')
const toF = ref('')
const detailModal = ref(false)
const detailAppt = ref<any>(null)
const detailNotes = ref('')
const createModal = ref(false)
const saving = ref(false)
const cferr = ref('')
const allDoctors = ref<any[]>([])
const doctorSvcs = ref<any[]>([])
const cForm = ref({ doctorId: '', serviceId: '', clientEmail: '', startTime: '', notes: '' })

const ini = (n: string) =>
  n
    ?.split(' ')
    .map((x: string) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
const fdate = (d: string) =>
  new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
const ftime = (d: string) =>
  new Date(d).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
const sclass = (s: string) =>
  ({ PENDING: 's-pending', CONFIRMED: 's-confirmed', CANCELLED: 's-cancelled' })[s] || ''

const load = async () => {
  loading.value = true
  const q = new URLSearchParams({ page: String(page.value), limit: '15' })
  if (statusF.value) q.set('status', statusF.value)
  if (fromF.value) q.set('from', new Date(fromF.value).toISOString())
  if (toF.value) q.set('to', new Date(toF.value + 'T23:59:59').toISOString())
  const res = (await $fetch(`/api/appointments?${q}`)) as any
  appts.value = res.data || []
  pagination.value = res.pagination || {}
  loading.value = false
}

const clearF = () => {
  statusF.value = ''
  fromF.value = ''
  toF.value = ''
  page.value = 1
  load()
}

const changeStatus = async (a: any, s: string) => {
  try {
    await $fetch(`/api/appointments/${a.id}`, { method: 'PUT', body: { status: s } })
    a.status = s
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  }
}

const openDetail = (a: any) => {
  detailAppt.value = a
  detailNotes.value = a.notes || ''
  detailModal.value = true
}

const saveNotes = async () => {
  saving.value = true
  try {
    await $fetch(`/api/appointments/${detailAppt.value.id}`, {
      method: 'PUT',
      body: { notes: detailNotes.value },
    })
    detailAppt.value.notes = detailNotes.value
    detailModal.value = false
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  } finally {
    saving.value = false
  }
}

const deleteAppt = async (a: any) => {
  if (!confirm('Видалити запис?')) return
  try {
    await $fetch(`/api/appointments/${a.id}`, { method: 'DELETE' })
    detailModal.value = false
    load()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  }
}

const openCreate = async () => {
  if (!allDoctors.value.length) allDoctors.value = (await $fetch('/api/doctors')) as any[]
  cForm.value = { doctorId: '', serviceId: '', clientEmail: '', startTime: '', notes: '' }
  doctorSvcs.value = []
  cferr.value = ''
  createModal.value = true
}

const onDoctorChange = () => {
  const d = allDoctors.value.find((d) => d.id === cForm.value.doctorId)
  doctorSvcs.value = d?.services || []
  cForm.value.serviceId = ''
}

const createAppt = async () => {
  saving.value = true
  cferr.value = ''
  try {
    const usersRes = (await $fetch(
      `/api/users?search=${encodeURIComponent(cForm.value.clientEmail)}&limit=1`
    )) as any
    const client = usersRes.data?.[0]
    if (!client) {
      cferr.value = 'Користувача з таким email не знайдено'
      saving.value = false
      return
    }
    await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        clientId: client.id,
        doctorId: cForm.value.doctorId,
        serviceId: cForm.value.serviceId,
        startTime: new Date(cForm.value.startTime).toISOString(),
        notes: cForm.value.notes || undefined,
      },
    })
    createModal.value = false
    load()
  } catch (e: any) {
    cferr.value = e?.data?.statusMessage || 'Помилка створення запису'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
