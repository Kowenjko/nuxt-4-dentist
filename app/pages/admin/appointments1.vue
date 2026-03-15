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
            <option value="COMPLETED">Завершено</option>
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
                  <option value="COMPLETED">Завершено</option>
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
          <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--">←</button>
          <button
            class="btn btn-ghost btn-sm"
            :disabled="page >= (pagination.totalPages || 1)"
            @click="page++"
          >
            →
          </button>
        </div>
      </div>
    </div>

    <!-- ── Detail modal ─────────────────────────────────────────── -->
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

    <!-- ── Create appointment modal ─────────────────────────────── -->
    <div v-if="createModal" class="overlay" @click.self="createModal = false">
      <div class="modal modal-xl">
        <div class="modal-hd">
          <span class="modal-title">Новий запис</span>
          <button class="modal-x" @click="createModal = false">×</button>
        </div>

        <div class="modal-body create-body">
          <!-- ── Ліва панель: форма + календар ── -->
          <div class="create-left">
            <!-- Крок 1: Лікар + Послуга + Email -->
            <div class="create-section">
              <div class="create-section-title"><span class="cs-num">1</span> Пацієнт та лікар</div>
              <div class="form-row">
                <div class="fg">
                  <label class="fl">Email пацієнта</label>
                  <input v-model="cForm.clientEmail" class="fi" placeholder="patient@example.com" />
                </div>
              </div>
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
                  <select
                    v-model="cForm.serviceId"
                    @change="onServiceChange"
                    class="fi"
                    :disabled="!cForm.doctorId"
                  >
                    <option value="">Оберіть послугу</option>
                    <option v-for="s in doctorSvcs" :key="s.id" :value="s.id">
                      {{ s.name }} · {{ s.duration }} хв
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Крок 2: Календар -->
            <div class="create-section" :class="{ 'section-disabled': !cForm.serviceId }">
              <div class="create-section-title"><span class="cs-num">2</span> Оберіть дату</div>

              <div class="cal-wrap">
                <!-- Calendar header -->
                <div class="cal-hd">
                  <button class="cal-nav-btn" @click="prevCalMonth" :disabled="!canGoPrev">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="13"
                    >
                      <path d="M10 3 5 8l5 5" />
                    </svg>
                  </button>
                  <span class="cal-title-txt">{{ calTitle }}</span>
                  <button class="cal-nav-btn" @click="nextCalMonth">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="13"
                    >
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>
                </div>
                <!-- Day of week headers Mon-first -->
                <div class="cal-dow">
                  <span v-for="d in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']" :key="d">{{
                    d
                  }}</span>
                </div>
                <!-- Days grid -->
                <div class="cal-grid">
                  <button
                    v-for="(cell, i) in calDays"
                    :key="i"
                    class="cal-cell"
                    :class="{
                      'cc-blank': !cell.date,
                      'cc-disabled': cell.disabled,
                      'cc-today': cell.isToday,
                      'cc-selected': cForm.date === cell.date,
                      'cc-has-slots': cell.hasSlots,
                    }"
                    :disabled="cell.disabled || !cell.date"
                    @click="cell.date && !cell.disabled && pickDate(cell.date)"
                  >
                    {{ cell.day || '' }}
                  </button>
                </div>

                <!-- Legend -->
                <div class="cal-legend">
                  <span class="leg-item"><span class="leg-dot leg-free"></span> Є слоти</span>
                  <span class="leg-item"><span class="leg-dot leg-off"></span> Вихідний</span>
                </div>
              </div>
            </div>

            <!-- Нотатки -->
            <div class="create-section" v-if="cForm.date">
              <div class="create-section-title">
                <span class="cs-num">3</span> Нотатки
                <span style="font-size: 11px; font-weight: 400; color: var(--text-4)"
                  >(необов'язково)</span
                >
              </div>
              <div class="fg" style="margin: 0">
                <textarea
                  v-model="cForm.notes"
                  class="fi fi-ta"
                  rows="2"
                  placeholder="Опишіть симптоми або додаткову інформацію..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ── Права панель: слоти ── -->
          <div class="create-right">
            <div class="slots-panel">
              <!-- Placeholder — нічого не вибрано -->
              <div v-if="!cForm.doctorId || !cForm.serviceId" class="slots-placeholder">
                <div class="sp-icon">🗓</div>
                <div class="sp-title">Оберіть лікаря та послугу</div>
                <div class="sp-sub">
                  Після вибору лікаря і послуги ви зможете обрати дату та переглянути доступні слоти
                </div>
              </div>

              <!-- Дата не вибрана -->
              <div v-else-if="!cForm.date" class="slots-placeholder">
                <div class="sp-icon">📅</div>
                <div class="sp-title">Оберіть дату</div>
                <div class="sp-sub">Натисніть на доступну дату в календарі</div>
              </div>

              <!-- Завантаження слотів -->
              <div v-else-if="slotsLoading" class="slots-placeholder">
                <div class="sp-spinner"></div>
                <div class="sp-title">Завантаження...</div>
              </div>

              <!-- Слоти завантажені -->
              <template v-else>
                <div class="slots-date-hd">
                  <span class="slots-date-txt">{{ fdateShort(cForm.date) }}</span>
                  <span class="slots-meta">
                    {{ slotsMeta?.workStart }}–{{ slotsMeta?.workEnd }}
                    <span v-if="slotsMeta?.lunchBreak" class="slots-lunch">
                      · обід {{ slotsMeta.lunchBreak.start }}–{{ slotsMeta.lunchBreak.end }}
                    </span>
                  </span>
                </div>

                <!-- Лічильник -->
                <div class="slots-counter">
                  <div class="sc-item sc-free">
                    <span class="sc-num">{{ freeSlots.length }}</span>
                    <span class="sc-lbl">вільних</span>
                  </div>
                  <div class="sc-div"></div>
                  <div class="sc-item sc-busy">
                    <span class="sc-num">{{ busySlots.length }}</span>
                    <span class="sc-lbl">зайнятих</span>
                  </div>
                  <div class="sc-div"></div>
                  <div class="sc-item sc-total">
                    <span class="sc-num">{{ slots.length }}</span>
                    <span class="sc-lbl">всього</span>
                  </div>
                </div>

                <!-- Немає слотів -->
                <div v-if="!slots.length" class="slots-empty">
                  <span>😴</span>
                  <p>Лікар не працює цього дня</p>
                </div>

                <!-- Групи слотів -->
                <div v-else class="slots-groups">
                  <template v-for="group in slotGroups" :key="group.label">
                    <div v-if="group.slots.length" class="slot-group">
                      <div class="slot-group-lbl">{{ group.icon }} {{ group.label }}</div>
                      <div class="slots-grid">
                        <button
                          v-for="sl in group.slots"
                          :key="sl.time"
                          class="slot-chip"
                          :class="{
                            'chip-free': sl.available,
                            'chip-busy': !sl.available,
                            'chip-selected': cForm.slotTime === sl.time,
                          }"
                          :disabled="!sl.available"
                          @click="sl.available && pickSlot(sl)"
                        >
                          <span class="chip-time">{{ sl.time }}</span>
                          <span v-if="!sl.available" class="chip-busy-ico">🔒</span>
                          <span v-if="sl.available && cForm.slotTime === sl.time" class="chip-check"
                            >✓</span
                          >
                          <!-- Tooltip: хто зайняв -->
                          <span v-if="!sl.available && sl.bookedBy" class="chip-tooltip">
                            {{ sl.bookedBy.name }}
                          </span>
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="modal-ft">
          <div v-if="cferr" class="cf-err">{{ cferr }}</div>
          <div style="flex: 1"></div>
          <button class="btn btn-ghost" @click="createModal = false">Скасувати</button>
          <button
            class="btn btn-primary"
            @click="createAppt"
            :disabled="saving || !cForm.slotTime || !cForm.clientEmail"
          >
            {{ saving ? 'Створення...' : 'Створити запис' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// ── Таблиця записів ──────────────────────────────────────────────
const appts = ref<any[]>([])
const pagination = ref<any>({})
const loading = ref(true)
const page = ref(1)
const statusF = ref('')
const fromF = ref('')
const toF = ref('')

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
const fdateShort = (d: string) => {
  const [y, m, dy] = d.split('-').map(Number)
  return new Date(y, m - 1, dy).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })
}
const sclass = (s: string) =>
  ({
    PENDING: 's-pending',
    CONFIRMED: 's-confirmed',
    CANCELLED: 's-cancelled',
    COMPLETED: 's-completed',
  })[s] || ''

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

// ── Detail modal ─────────────────────────────────────────────────
const detailModal = ref(false)
const detailAppt = ref<any>(null)
const detailNotes = ref('')
const saving = ref(false)

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

// ── Create modal ─────────────────────────────────────────────────
const createModal = ref(false)
const cferr = ref('')
const allDoctors = ref<any[]>([])
const doctorSvcs = ref<any[]>([])

const cForm = ref({
  doctorId: '',
  serviceId: '',
  clientEmail: '',
  date: '',
  slotTime: '', // "09:00"
  notes: '',
})

// ── Календар ─────────────────────────────────────────────────────
const calYear = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth())

const calTitle = computed(() =>
  new Date(calYear.value, calMonth.value, 1).toLocaleDateString('uk-UA', {
    month: 'long',
    year: 'numeric',
  })
)

const todayStr = (() => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
})()

const canGoPrev = computed(() => {
  const now = new Date()
  return !(calYear.value === now.getFullYear() && calMonth.value === now.getMonth())
})

const prevCalMonth = () => {
  if (!canGoPrev.value) return
  if (calMonth.value === 0) {
    calMonth.value = 11
    calYear.value--
  } else calMonth.value--
}
const nextCalMonth = () => {
  if (calMonth.value === 11) {
    calMonth.value = 0
    calYear.value++
  } else calMonth.value++
}

// Робочі дні лікаря
const workingDows = computed<number[] | null>(() => {
  if (!cForm.value.doctorId) return null
  const doc = allDoctors.value.find((d) => d.id === cForm.value.doctorId)
  return doc?.doctorSchedule?.filter((s: any) => s.isWorking).map((s: any) => s.weekday) ?? null
})

const calDays = computed(() => {
  const first = new Date(calYear.value, calMonth.value, 1)
  const last = new Date(calYear.value, calMonth.value + 1, 0)
  const cells: {
    date: string
    day: number
    disabled: boolean
    isToday: boolean
    hasSlots: boolean
  }[] = []

  // Понеділок першим: (getDay()+6)%7
  const lead = (first.getDay() + 6) % 7
  for (let i = 0; i < lead; i++)
    cells.push({ date: '', day: 0, disabled: true, isToday: false, hasSlots: false })

  for (let d = 1; d <= last.getDate(); d++) {
    const dt = new Date(calYear.value, calMonth.value, d)
    const iso = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = dt.getDay()
    const isPast = iso < todayStr
    const isNonWork = workingDows.value ? !workingDows.value.includes(dow) : dow === 0
    cells.push({
      date: iso,
      day: d,
      disabled: isPast || isNonWork,
      isToday: iso === todayStr,
      hasSlots: !isPast && !isNonWork,
    })
  }
  return cells
})

// ── Слоти ────────────────────────────────────────────────────────
interface SlotItem {
  time: string
  available: boolean
  period: string
  bookedBy: { name: string; email: string | null } | null
}
const slots = ref<SlotItem[]>([])
const slotsMeta = ref<{
  workStart: string
  workEnd: string
  lunchBreak: { start: string; end: string } | null
} | null>(null)
const slotsLoading = ref(false)

const freeSlots = computed(() => slots.value.filter((s) => s.available))
const busySlots = computed(() => slots.value.filter((s) => !s.available))

const slotGroups = computed(() => [
  { label: 'Ранок', icon: '🌅', slots: slots.value.filter((s) => s.period === 'morning') },
  { label: 'День', icon: '☀️', slots: slots.value.filter((s) => s.period === 'afternoon') },
  { label: 'Вечір', icon: '🌆', slots: slots.value.filter((s) => s.period === 'evening') },
])

const loadSlots = async () => {
  if (!cForm.value.doctorId || !cForm.value.serviceId || !cForm.value.date) return
  slotsLoading.value = true
  slots.value = []
  try {
    const res = (await $fetch(`/api/doctors/${cForm.value.doctorId}/slots`, {
      params: { date: cForm.value.date, serviceId: cForm.value.serviceId },
    })) as any
    slots.value = res.slots ?? []
    slotsMeta.value = res.meta ?? null
  } catch {
    slots.value = []
    slotsMeta.value = null
  } finally {
    slotsLoading.value = false
  }
}

const pickDate = async (date: string) => {
  cForm.value.date = date
  cForm.value.slotTime = ''
  await loadSlots()
}

const pickSlot = (sl: SlotItem) => {
  cForm.value.slotTime = sl.time
}

// ── Handlers ─────────────────────────────────────────────────────
const onDoctorChange = () => {
  const d = allDoctors.value.find((d) => d.id === cForm.value.doctorId)
  doctorSvcs.value = d?.services || []
  cForm.value.serviceId = ''
  cForm.value.date = ''
  cForm.value.slotTime = ''
  slots.value = []
}

const onServiceChange = () => {
  cForm.value.date = ''
  cForm.value.slotTime = ''
  slots.value = []
}

const openCreate = async () => {
  if (!allDoctors.value.length) allDoctors.value = (await $fetch('/api/doctors')) as any[]
  cForm.value = { doctorId: '', serviceId: '', clientEmail: '', date: '', slotTime: '', notes: '' }
  doctorSvcs.value = []
  cferr.value = ''
  calYear.value = new Date().getFullYear()
  calMonth.value = new Date().getMonth()
  slots.value = []
  slotsMeta.value = null
  createModal.value = true
}

const createAppt = async () => {
  if (!cForm.value.slotTime) {
    cferr.value = 'Оберіть час запису'
    return
  }
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

    // datetime = київський час без TZ (сервер сам конвертує в UTC)
    const startTime = `${cForm.value.date}T${cForm.value.slotTime}:00`

    await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        clientId: client.id,
        doctorId: cForm.value.doctorId,
        serviceId: cForm.value.serviceId,
        startTime,
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

<style scoped>
/* ── Create modal layout ────────────────────────────────────────── */
.modal-xl {
  max-width: 860px !important;
}

.create-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  min-height: 480px;
  overflow: hidden;
}

.create-left {
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.create-right {
  background: var(--bg);
  overflow-y: auto;
}

/* ── Sections ───────────────────────────────────────────────────── */
.create-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.create-section.section-disabled {
  opacity: 0.45;
  pointer-events: none;
}
.create-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.cs-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Calendar ───────────────────────────────────────────────────── */
.cal-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
}
.cal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--border);
}
.cal-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.12s;
}
.cal-nav-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}
.cal-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.cal-title-txt {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  text-transform: capitalize;
}
.cal-dow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 10px 4px;
}
.cal-dow span {
  text-align: center;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-4);
  text-transform: uppercase;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 4px 10px 10px;
}
.cal-cell {
  aspect-ratio: 1;
  border-radius: 7px;
  border: none;
  background: none;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.cal-cell:hover:not(.cc-disabled):not(.cc-blank) {
  background: var(--accent-bg);
  color: var(--accent);
}
.cc-blank {
  cursor: default;
}
.cc-disabled {
  color: var(--text-4);
  cursor: not-allowed;
}
.cc-today {
  font-weight: 700;
  background: var(--bg-2);
}
.cc-selected {
  background: var(--accent) !important;
  color: var(--text-inv) !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
/* Зелена крапка — є вільні слоти (тільки якщо сервіс вибрано) */
.cc-has-slots::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.7;
}
.cc-selected::after {
  background: var(--text-inv);
}
.cc-disabled::after {
  display: none;
}

/* Legend */
.cal-legend {
  display: flex;
  gap: 14px;
  padding: 6px 12px 10px;
  border-top: 1px solid var(--border);
}
.leg-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-4);
}
.leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.leg-free {
  background: var(--accent);
  opacity: 0.7;
}
.leg-off {
  background: var(--border);
}

/* ── Slots panel ────────────────────────────────────────────────── */
.slots-panel {
  height: 100%;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slots-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  padding: 24px 16px;
}
.sp-icon {
  font-size: 32px;
  opacity: 0.4;
}
.sp-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-2);
}
.sp-sub {
  font-size: 12px;
  color: var(--text-4);
  line-height: 1.6;
}
.sp-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2.5px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.slots-date-hd {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.slots-date-txt {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
  text-transform: capitalize;
}
.slots-meta {
  font-size: 11px;
  color: var(--text-4);
}
.slots-lunch {
  color: var(--warning);
}

/* Лічильник */
.slots-counter {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.sc-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
}
.sc-div {
  width: 1px;
  background: var(--border);
  align-self: stretch;
}
.sc-num {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}
.sc-lbl {
  font-size: 10px;
  color: var(--text-4);
  margin-top: 2px;
}
.sc-free .sc-num {
  color: var(--accent);
}
.sc-busy .sc-num {
  color: var(--danger);
}
.sc-total .sc-num {
  color: var(--text-2);
}

/* Порожній стан */
.slots-empty {
  text-align: center;
  padding: 24px;
  color: var(--text-4);
  font-size: 13px;
}
.slots-empty span {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
}

/* Групи слотів */
.slots-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}
.slot-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.slot-group-lbl {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

/* Slot chip */
.slot-chip {
  position: relative;
  padding: 7px 4px;
  border-radius: 7px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.12s;
  overflow: visible;
}
.chip-time {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.chip-busy-ico {
  font-size: 10px;
}
.chip-check {
  font-size: 10px;
  color: var(--text-inv);
}

.chip-free:hover {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.chip-free:hover .chip-time {
  color: var(--accent);
}

.chip-busy {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-2);
}
.chip-busy .chip-time {
  color: var(--text-4);
  text-decoration: line-through;
}

.chip-selected {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
}
.chip-selected .chip-time {
  color: var(--text-inv) !important;
}

/* Tooltip на зайнятому слоті */
.chip-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-3, #252932);
  color: var(--text);
  font-size: 11px;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 5px;
  border: 1px solid var(--border);
  pointer-events: none;
  z-index: 10;
}
.slot-chip:hover .chip-tooltip {
  display: block;
}

/* Footer error */
.cf-err {
  font-size: 12.5px;
  color: var(--danger);
  padding: 6px 12px;
  background: var(--danger-bg);
  border-radius: 6px;
  border: 1px solid var(--danger-border);
}

/* Responsive */
@media (max-width: 680px) {
  .create-body {
    grid-template-columns: 1fr;
  }
  .create-right {
    border-right: none;
    border-top: 1px solid var(--border);
  }
  .modal-xl {
    max-width: 100% !important;
  }
  .slots-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
