<script setup lang="ts">
const doctors = ref<any[]>([])
const filtered = ref<any[]>([])
const allSvcs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const profileModal = ref(false)
const schedModal = ref(false)
const editDoc = ref<any>(null)
const schedDoc = ref<any>(null)
const saving = ref(false)
const ferr = ref('')
const pForm = ref({ specialty: '', bio: '', serviceIds: [] as string[] })
// Тиждень починається з неділі (0) — як в JS Date
const wdays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const sched = ref(
  Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: null as string | null,
    lunchEnd: null as string | null,
    isWorking: i >= 1 && i <= 5,
  }))
)

const ini = (n: string) =>
  n
    ?.split(' ')
    .map((x: string) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
const filter = () => {
  const q = search.value.toLowerCase()
  filtered.value = doctors.value.filter(
    (d) => d.user?.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)
  )
}

const load = async () => {
  loading.value = true
  const [dr, sr] = await Promise.all([
    $fetch('/api/doctors') as any,
    $fetch('/api/services') as any,
  ])
  doctors.value = dr
  filtered.value = dr
  allSvcs.value = sr
  loading.value = false
}

const openProfile = (d: any) => {
  editDoc.value = d
  pForm.value = {
    specialty: d.specialty,
    bio: d.bio || '',
    serviceIds: (d.services || []).map((s: any) => s.id),
  }
  ferr.value = ''
  profileModal.value = true
}
const saveProfile = async () => {
  saving.value = true
  ferr.value = ''
  try {
    await $fetch(`/api/doctors/${editDoc.value.id}`, { method: 'PUT', body: pForm.value })
    profileModal.value = false
    load()
  } catch (e: any) {
    ferr.value = e?.data?.statusMessage || 'Помилка'
  } finally {
    saving.value = false
  }
}

const openSched = (d: any) => {
  schedDoc.value = d
  const ex = d.doctorSchedule || []
  sched.value = Array.from({ length: 7 }, (_, i) => {
    const f = ex.find((s: any) => s.weekday === i)
    return f
      ? {
          weekday: i,
          startTime: f.startTime,
          endTime: f.endTime,
          isWorking: f.isWorking,
          lunchStart: f.lunchStart || null,
          lunchEnd: f.lunchEnd || null,
        }
      : {
          weekday: i,
          startTime: '09:00',
          endTime: '18:00',
          lunchStart: null,
          lunchEnd: null,
          isWorking: i >= 1 && i <= 5,
        }
  })
  schedModal.value = true
}
// Якщо один з полів обіду очищено — очищаємо обидва (API вимагає пару або нічого)
// очищення неповної пари обіду — в saveSched

const saveSched = async () => {
  saving.value = true
  try {
    const payload = sched.value.map((d) => {
      const lunchStart = d.lunchStart || null
      const lunchEnd = d.lunchEnd || null
      const lunch =
        lunchStart && lunchEnd ? { lunchStart, lunchEnd } : { lunchStart: null, lunchEnd: null }
      return { ...d, ...lunch }
    })
    await $fetch(`/api/doctors/${schedDoc.value.id}/schedule`, {
      method: 'POST',
      body: { schedule: payload },
    })
    schedModal.value = false
    load()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  } finally {
    saving.value = false
  }
}

onMounted(load)

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
        <input
          v-model="search"
          @input="filter"
          class="inp inp-search"
          placeholder="Пошук за іменем або спеціальністю..."
        />
        <span style="font-size: 12.5px; color: var(--text-3)">{{ filtered.length }} лікарів</span>
      </div>

      <div class="table-wrap">
        <div v-if="loading" class="loading">Завантаження...</div>
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
                  <div class="av av-green">{{ ini(d.user?.name) }}</div>
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
                  <button class="btn btn-ghost btn-sm" @click="openSched(d)">Розклад</button>
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
          <span class="modal-title">{{ editDoc?.user?.name }}</span>
          <button class="modal-x" @click="profileModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="ferr" class="alert alert-error">{{ ferr }}</div>
          <div class="fg">
            <label class="fl">Спеціальність</label>
            <input v-model="pForm.specialty" class="fi" placeholder="Стоматолог" />
          </div>
          <div class="fg">
            <label class="fl">Про лікаря</label>
            <textarea
              v-model="pForm.bio"
              class="fi fi-ta"
              placeholder="Короткий опис..."
            ></textarea>
          </div>
          <div class="fg">
            <label class="fl">Послуги</label>
            <div class="svc-list">
              <label v-for="s in allSvcs" :key="s.id" class="svc-item">
                <input type="checkbox" :value="s.id" v-model="pForm.serviceIds" />
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
    <div v-if="schedModal" class="overlay" @click.self="schedModal = false">
      <div class="modal modal-lg">
        <div class="modal-hd">
          <span class="modal-title">Розклад — {{ schedDoc?.user?.name }}</span>
          <button class="modal-x" @click="schedModal = false">×</button>
        </div>
        <div class="modal-body">
          <div
            v-for="day in sched"
            :key="day.weekday"
            class="sched-row"
            :class="{ off: !day.isWorking }"
          >
            <label class="sched-toggle">
              <input type="checkbox" v-model="day.isWorking" />
              <span class="sched-day">{{ wdays[day.weekday] }}</span>
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
                v-model="day.lunchStart"
                class="time-inp time-inp-lunch"
              />
              <span class="sched-sep" v-if="day.isWorking">—</span>
              <input
                v-if="day.isWorking"
                type="time"
                v-model="day.lunchEnd"
                class="time-inp time-inp-lunch"
              />
            </div>
          </div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-ghost" @click="schedModal = false">Скасувати</button>
          <button class="btn btn-primary" @click="saveSched" :disabled="saving">
            {{ saving ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Спільні стилі адмін-сторінок — в assets/styles/admin-pages.css */

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
