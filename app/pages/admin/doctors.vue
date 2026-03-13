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
      <AdminTitle title="Лікарі" :subtitle="`Профілі, послуги та розклад`" />
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
    <UpdateDoctorModal
      :title="editDoctor?.user?.name"
      :saving
      :formError
      :formData
      :services
      v-model="profileModal"
      @confirm="saveProfile"
    />

    <!-- Schedule modal -->
    <ScheduleModal
      :title="`Розклад — ${scheduleDoctor?.user?.name}`"
      :saving
      :schedule
      :days
      v-model="scheduleModal"
      @confirm="saveSchedule"
    />
  </div>
</template>
