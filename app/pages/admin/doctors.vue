<script setup lang="ts">
const search = ref('')
const profileModal = ref(false)
const scheduleModal = ref(false)
const editDoctor = ref<any>(null)
const scheduleDoctor = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const formData = ref<DoctorUpdateI>({ specialty: '', bio: '', serviceIds: [] as string[] })

// Тиждень починається з неділі (0) — як в JS Date
const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const scheduleOrder = [1, 2, 3, 4, 5, 6, 0] // порядок відображення
const schedule = ref(
  scheduleOrder.map((wd) => ({
    weekday: wd,
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: null as string | null,
    lunchEnd: null as string | null,
    isWorking: wd >= 1 && wd <= 5,
  }))
)

const {
  data: doctors,
  pending: loadingDoctor,
  refresh: refreshDoctor,
} = useAPI<DoctorProfileI[]>(DOCTORS, {
  key: 'doctor-list',
})

const {
  data: services,
  pending: loadingService,
  refresh: refreshService,
} = useAPI<ServiceI[]>(SERVICES, {
  key: 'service-list',
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return (
    doctors.value?.filter(
      (d) => d.user?.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)
    ) || []
  )
})

const refresh = async () => {
  await refreshDoctor()
  // await refreshService()
}

const openProfile = (d: any) => {
  editDoctor.value = d
  formData.value = {
    specialty: d.specialty,
    bio: d.bio || '',
    serviceIds: (d.services || []).map((s: any) => s.id),
  }
  formError.value = ''
  profileModal.value = true
}
const saveProfile = async () => {
  saving.value = true
  formError.value = ''
  try {
    await doctorAPI.update(editDoctor.value.id, formData.value)
    profileModal.value = false
    await refresh()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка'
  } finally {
    saving.value = false
  }
}

const openSchedule = (d: any) => {
  scheduleDoctor.value = d
  const ex = d.doctorSchedule || []
  schedule.value = scheduleOrder.map((wd) => {
    const f = ex.find((s: any) => s.weekday === wd)
    return f
      ? {
          weekday: wd,
          startTime: f.startTime,
          endTime: f.endTime,
          isWorking: f.isWorking,
          lunchStart: f.lunchStart || null,
          lunchEnd: f.lunchEnd || null,
        }
      : {
          weekday: wd,
          startTime: '09:00',
          endTime: '18:00',
          lunchStart: null,
          lunchEnd: null,
          isWorking: wd >= 1 && wd <= 5,
        }
  })
  scheduleModal.value = true
}

const saveSchedule = async () => {
  saving.value = true
  try {
    const payload = schedule.value.map((d) => {
      const lunchStart = d.lunchStart || null
      const lunchEnd = d.lunchEnd || null
      const lunch =
        lunchStart && lunchEnd ? { lunchStart, lunchEnd } : { lunchStart: null, lunchEnd: null }
      return { ...d, ...lunch }
    })

    await doctorAPI.createSchedule(scheduleDoctor.value.id, { schedule: payload })
    scheduleModal.value = false
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
        <h1 class="page-title">Лікарі</h1>
        <p class="page-sub">Профілі, послуги та розклад</p>
      </div>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <AdminInput
          v-model="search"
          placeholder="Пошук за іменем або спеціальністю..."
          id="doctor-search"
        />

        <span style="font-size: 12.5px; color: var(--text-3)">{{ filtered.length }} лікарів</span>
      </div>

      <div class="table-wrap">
        <div v-if="loadingDoctor && loadingService" class="loading">Завантаження...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Лікар</th>
              <th>Спеціальність</th>
              <th>Послуги</th>
              <th>Днів / тиж.</th>
              <th>Записів</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="6">
                <div class="empty">
                  <div class="empty-icon">🩺</div>
                  <div class="empty-title">Лікарів не знайдено</div>
                </div>
              </td>
            </tr>
            <tr v-for="d in filtered" :key="d.id">
              <td>
                <div class="user-cell">
                  <div class="av av-green">{{ iniAvatar(d.user?.name) }}</div>
                  <div>
                    <div class="uc-name">{{ d.user?.name }}</div>
                    <div class="uc-sub">{{ d.user?.email }}</div>
                  </div>
                </div>
              </td>
              <td class="mono" style="font-size: 12px">{{ d.specialty }}</td>
              <td>
                <div style="display: flex; gap: 4px; flex-wrap: wrap">
                  <span
                    v-for="s in (d.services || []).slice(0, 3)"
                    :key="s.id"
                    class="badge badge-neutral"
                    style="font-size: 10.5px"
                    >{{ s.name }}</span
                  >
                  <span
                    v-if="(d.services || []).length > 3"
                    class="badge badge-neutral"
                    style="font-size: 10.5px"
                    >+{{ d.services.length - 3 }}</span
                  >
                  <span
                    v-if="!(d.services || []).length"
                    style="color: var(--text-3); font-size: 12px"
                    >—</span
                  >
                </div>
              </td>
              <td>
                <span class="badge badge-doctor"
                  >{{ (d.doctorSchedule || []).filter((s: any) => s.isWorking).length }} / 7</span
                >
              </td>
              <td>
                <span class="badge badge-neutral">{{ d._count?.appointments || 0 }}</span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn btn-ghost btn-sm" @click="openProfile(d)">Профіль</button>
                  <button class="btn btn-ghost btn-sm" @click="openSchedule(d)">Розклад</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Profile modal -->
    <div v-if="profileModal" class="overlay" @click.self="profileModal = false">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">{{ editDoctor?.user?.name }}</span>
          <button class="modal-x" @click="profileModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="alert alert-error">{{ formError }}</div>
          <div class="fg">
            <label class="fl">Спеціальність</label>
            <input v-model="formData.specialty" class="fi" placeholder="Стоматолог" />
          </div>
          <div class="fg">
            <label class="fl">Про лікаря</label>
            <textarea
              v-model="formData.bio"
              class="fi fi-ta"
              placeholder="Короткий опис..."
            ></textarea>
          </div>
          <div class="fg">
            <label class="fl">Послуги</label>
            <div class="svc-list">
              <label v-for="s in services" :key="s.id" class="svc-item">
                <input type="checkbox" :value="s.id" v-model="formData.serviceIds" />
                <span>{{ s.name }}</span>
                <span class="svc-price"
                  >{{ Number(s.price).toLocaleString('uk-UA') }} ₴ · {{ s.duration }} хв</span
                >
              </label>
            </div>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-ghost" @click="profileModal = false">Скасувати</button>
          <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
            {{ saving ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule modal -->
    <div v-if="scheduleModal" class="overlay" @click.self="scheduleModal = false">
      <div class="modal modal-lg">
        <div class="modal-hd">
          <span class="modal-title">Розклад — {{ scheduleDoctor?.user?.name }}</span>
          <button class="modal-x" @click="scheduleModal = false">×</button>
        </div>
        <div class="modal-body">
          <div
            v-for="day in schedule"
            :key="day.weekday"
            class="sched-row"
            :class="{ off: !day.isWorking }"
          >
            <label class="sched-toggle">
              <input type="checkbox" v-model="day.isWorking" />
              <span class="sched-day">{{ days[day.weekday] }}</span>
            </label>
            <div class="sched-times">
              <input
                type="time"
                v-model="day.startTime"
                class="time-inp"
                :disabled="!day.isWorking"
              />
              <span class="sched-sep">—</span>
              <input
                type="time"
                v-model="day.endTime"
                class="time-inp"
                :disabled="!day.isWorking"
              />
              <span class="sched-lunch-label" v-if="day.isWorking">Обід:</span>
              <input
                v-if="day.isWorking"
                type="time"
                :value="day.lunchStart || ''"
                class="time-inp time-inp-lunch"
                @change="day.lunchStart = ($event.target as HTMLInputElement).value"
              />
              <span class="sched-sep" v-if="day.isWorking">—</span>
              <input
                v-if="day.isWorking"
                type="time"
                :value="day.lunchEnd || ''"
                class="time-inp time-inp-lunch"
                @change="day.lunchEnd = ($event.target as HTMLInputElement).value"
              />
            </div>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-ghost" @click="scheduleModal = false">Скасувати</button>
          <button class="btn btn-primary" @click="saveSchedule" :disabled="saving">
            {{ saving ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sched-lunch-label {
  font-size: 11px;
  color: var(--text-3);
  white-space: nowrap;
  padding-left: 6px;
}
.time-inp-lunch {
  width: 88px;
  opacity: 0.85;
}
.sched-sep {
  color: var(--text-3);
  padding: 0 2px;
}
</style>
