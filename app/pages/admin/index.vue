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
        <div class="stat-val">{{ stats.users }}</div>
        <div class="stat-sub">{{ stats.doctors }} лікарів · {{ stats.clients }} пацієнтів</div>
      </div>
      <div class="stat">
        <div class="stat-label">Записів сьогодні</div>
        <div class="stat-val">{{ stats.today }}</div>
        <div class="stat-sub">з {{ stats.total }} всього</div>
      </div>
      <div class="stat">
        <div class="stat-label">Очікують</div>
        <div class="stat-val">{{ stats.pending }}</div>
        <div class="stat-sub">{{ stats.confirmed }} підтверджено</div>
      </div>
      <div class="stat">
        <div class="stat-label">Послуг</div>
        <div class="stat-val">{{ stats.services }}</div>
        <div class="stat-sub">активних</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="card">
        <div class="card-toolbar">
          <span class="card-title">Останні записи</span>
          <NuxtLink to="/admin/appointments" class="btn btn-ghost btn-sm">Всі →</NuxtLink>
        </div>
        <div class="table-wrap">
          <div v-if="loadingA" class="loading">Завантаження...</div>
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
              <tr v-if="!recentAppts.length">
                <td colspan="4">
                  <div class="empty"><div class="empty-sub">Немає записів</div></div>
                </td>
              </tr>
              <tr v-for="a in recentAppts" :key="a.id">
                <td>
                  <div class="user-cell">
                    <div class="av">{{ ini(a.client?.name) }}</div>
                    <div>
                      <div class="uc-name">{{ a.client?.name }}</div>
                      <div class="uc-sub">{{ a.service?.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="mono">
                  {{ a.doctor?.user?.name?.split(' ')[1] || a.doctor?.user?.name }}
                </td>
                <td class="mono">{{ fdt(a.startTime) }}</td>
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
          <NuxtLink to="/admin/doctors" class="btn btn-ghost btn-sm">Всі →</NuxtLink>
        </div>
        <div class="table-wrap">
          <div v-if="loadingD" class="loading">Завантаження...</div>
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
                    <div class="av av-green">{{ ini(d.user?.name) }}</div>
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

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const today = new Date().toLocaleDateString('uk-UA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const stats = reactive({
  users: 0,
  doctors: 0,
  clients: 0,
  services: 0,
  total: 0,
  today: 0,
  pending: 0,
  confirmed: 0,
})
const recentAppts = ref<any[]>([])
const doctors = ref<any[]>([])
const loadingA = ref(true)
const loadingD = ref(true)

const ini = (n: string) =>
  n
    ?.split(' ')
    .map((x: string) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
const fdt = (d: string) =>
  new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
const slabel = (s: string) =>
  ({ PENDING: 'Очікування', CONFIRMED: 'Підтверджено', CANCELLED: 'Скасовано' })[s] || s
const sbadge = (s: string) =>
  ({ PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled' })[s] ||
  'badge-neutral'

onMounted(async () => {
  const [uR, sR, aR, dR] = await Promise.allSettled([
    $fetch('/api/users?limit=1&page=1') as any,
    $fetch('/api/services') as any,
    $fetch('/api/appointments?limit=6') as any,
    $fetch('/api/doctors') as any,
  ])

  if (uR.status === 'fulfilled') {
    stats.users = uR.value.pagination?.total || 0
  }
  if (sR.status === 'fulfilled') stats.services = (sR.value as any[]).length
  if (aR.status === 'fulfilled') {
    recentAppts.value = aR.value.data || []
    stats.total = aR.value.pagination?.total || 0
    const tod = new Date().toDateString()
    stats.today = recentAppts.value.filter(
      (a) => new Date(a.startTime).toDateString() === tod
    ).length
    stats.pending = recentAppts.value.filter((a) => a.status === 'PENDING').length
    stats.confirmed = recentAppts.value.filter((a) => a.status === 'CONFIRMED').length
  }
  if (dR.status === 'fulfilled') {
    doctors.value = (dR.value as any[]).slice(0, 6)
    stats.doctors = (dR.value as any[]).length
    stats.clients = stats.users - stats.doctors
  }

  loadingA.value = false
  loadingD.value = false
})
</script>
