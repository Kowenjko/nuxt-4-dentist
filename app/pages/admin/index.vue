<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// get Data
const { data: users } = useAPI<ApiResponseI<UserI[]>>(USERS, {
  query: { limit: 1, page: 1 },
})

const { data: services } = useAPI<ServiceI[]>(SERVICES, { key: 'service-list' })
const { data: appointments, pending: loadingAppointments } = useAPI<ApiResponseI<AppointmentI[]>>(
  APPOINTMENTS,
  {
    query: { limit: 6 },
  }
)
const { data: doctors, pending: loadingDoctor } = useAPI<DoctorProfileI[]>(DOCTORS, {
  key: 'doctor-list',
})

// computed
const statsUsers = computed(() => users.value?.pagination?.total ?? 0)
const statsServices = computed(() => (services.value && services.value.length) ?? 0)
const statsDoctors = computed(() => (doctors.value && doctors.value.length) ?? 0)
const statsClients = computed(() => statsUsers.value - statsDoctors.value)

const statsTotal = computed(() => appointments.value?.pagination?.total ?? 0)
const statsToday = computed(() => {
  const tod = new Date().toDateString()
  return appointments.value?.data.filter((a) => new Date(a.startTime).toDateString() === tod).length
})

const statsPending = computed(
  () => appointments.value?.data.filter((a) => a.status === Status.PENDING).length
)
const statsConfirmed = computed(
  () => appointments.value?.data.filter((a) => a.status === Status.CONFIRMED).length
)

// functions
const slabel = (s: string) =>
  ({ PENDING: 'Очікування', CONFIRMED: 'Підтверджено', CANCELLED: 'Скасовано' })[s] || s
const sbadge = (s: string) =>
  ({ PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled' })[s] ||
  'badge-neutral'
</script>

<template>
  <div>
    <div class="page-hd">
      <div>
        <h1 class="page-title">Дашборд</h1>
        <p class="page-sub">{{ today }}</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat stat-accent">
        <div class="stat-label">Користувачів</div>
        <div class="stat-val">{{ statsUsers }}</div>
        <div class="stat-sub">{{ statsDoctors }} лікарів · {{ statsClients }} пацієнтів</div>
      </div>
      <div class="stat">
        <div class="stat-label">Записів сьогодні</div>
        <div class="stat-val">{{ statsToday }}</div>
        <div class="stat-sub">з {{ statsTotal }} всього</div>
      </div>
      <div class="stat">
        <div class="stat-label">Очікують</div>
        <div class="stat-val">{{ statsPending }}</div>
        <div class="stat-sub">{{ statsConfirmed }} підтверджено</div>
      </div>
      <div class="stat">
        <div class="stat-label">Послуг</div>
        <div class="stat-val">{{ statsServices }}</div>
        <div class="stat-sub">активних</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="card">
        <div class="card-toolbar">
          <span class="card-title">Останні записи</span>
          <NuxtLink :to="ADMIN_APPOINTMENTS_LINK" class="btn btn-ghost btn-sm">Всі →</NuxtLink>
        </div>
        <div class="table-wrap">
          <div v-if="loadingAppointments" class="loading">Завантаження...</div>
          <table v-else>
            <thead>
              <tr>
                <th>Пацієнт</th>
                <th>Лікар</th>
                <th>Час</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!appointments?.data?.length">
                <td colspan="4">
                  <div class="empty"><div class="empty-sub">Немає записів</div></div>
                </td>
              </tr>
              <tr v-for="a in appointments?.data" :key="a.id">
                <td>
                  <div class="user-cell">
                    <div class="av">{{ iniAvatar(a.client?.name) }}</div>
                    <div>
                      <div class="uc-name">{{ a.client?.name }}</div>
                      <div class="uc-sub">{{ a.service?.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="mono">
                  {{ a.doctor?.user?.name?.split(' ')[1] || a.doctor?.user?.name }}
                </td>
                <td class="mono">{{ fmtTimeShort(a.startTime) }}</td>
                <td>
                  <span class="badge" :class="sbadge(a.status)">{{ slabel(a.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-toolbar">
          <span class="card-title">Лікарі</span>
          <NuxtLink :to="ADMIN_DOCTORS_LINK" class="btn btn-ghost btn-sm">Всі →</NuxtLink>
        </div>
        <div class="table-wrap">
          <div v-if="loadingDoctor" class="loading">Завантаження...</div>
          <table v-else>
            <thead>
              <tr>
                <th>Лікар</th>
                <th>Спеціальність</th>
                <th>Послуг</th>
                <th>Записів</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in doctors" :key="d.id">
                <td>
                  <div class="user-cell">
                    <div class="av av-green">{{ iniAvatar(d.user?.name) }}</div>
                    <span class="uc-name">{{ d.user?.name }}</span>
                  </div>
                </td>
                <td class="mono" style="font-size: 12px">{{ d.specialty }}</td>
                <td>
                  <span class="badge badge-doctor">{{ d.services?.length || 0 }}</span>
                </td>
                <td>
                  <span class="badge badge-neutral">{{ d._count?.appointments || 0 }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
