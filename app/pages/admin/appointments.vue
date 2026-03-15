<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'

const delTarget = ref<any>(null)
const page = ref(1)
const statusOrder = ref('')
const fromOrder = ref('')
const toOrder = ref('')
const detailModal = ref(false)
const detailAppointment = ref<AppointmentI | null>(null)
const detailNotes = ref('')
const createModal = ref(false)
const saving = ref(false)
const formError = ref('')
const doctors = ref<any[]>([])
const doctorsServices = ref<any[]>([])
const formData = ref({ doctorId: '', serviceId: '', clientId: '', startTime: '', notes: '' })

const statusBadge = (s: string) =>
  ({ PENDING: 's-pending', CONFIRMED: 's-confirmed', CANCELLED: 's-cancelled' })[s] || ''

const from = computed(() => (fromOrder.value ? new Date(fromOrder.value)?.toISOString() : null))
const to = computed(() =>
  toOrder.value ? new Date(toOrder.value + 'T23:59:59').toISOString() : null
)

const { data, refresh, pending } = useAPI<ApiResponseI<AppointmentI[]>>(APPOINTMENTS, {
  params: {
    page: page,
    limit: '15',
    status: statusOrder,
    from: from,
    to: to,
  },
})

const { data: users } = useAPI<ApiResponseI<UserI[]>>(USERS)

const appointments = computed(() => data.value?.data || [])
const pagination = computed(() => data.value?.pagination)

const clearFilter = () => {
  statusOrder.value = ''
  fromOrder.value = ''
  toOrder.value = ''
  page.value = 1
}

const changeStatus = async (appointment: AppointmentI, status: AppointmentStatus) => {
  try {
    await appointmentAPI.update(appointment.id, { status: status })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  }
}

const openDetail = (appointment: AppointmentI) => {
  detailAppointment.value = appointment
  detailNotes.value = appointment.notes || ''
  detailModal.value = true
}

const saveNotes = async () => {
  saving.value = true
  try {
    await appointmentAPI.update(detailAppointment.value?.id!, { notes: detailNotes.value })
    // @ts-ignore
    detailAppointment.value.notes = detailNotes.value
    detailModal.value = false
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  } finally {
    saving.value = false
  }
}

const openDelete = (appointment: AppointmentI) => {
  delTarget.value = appointment
  detailModal.value = false
}

const deleteAppointment = async () => {
  try {
    await appointmentAPI.delete(delTarget.value.id)
    delTarget.value = null
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Помилка')
  }
}

const openCreate = async () => {
  if (!doctors.value?.length) doctors.value = await doctorAPI.getAll()
  formData.value = { doctorId: '', serviceId: '', clientId: '', startTime: '', notes: '' }
  doctorsServices.value = []
  formError.value = ''
  createModal.value = true
}

const onDoctorChange = () => {
  const doctor = doctors.value.find((doctor) => doctor.id === formData.value.doctorId)
  doctorsServices.value = doctor?.services || []
  formData.value.serviceId = ''
}

watch(() => formData.value.doctorId, onDoctorChange)

const createAppointment = async () => {
  saving.value = true
  formError.value = ''
  try {
    // const usersRes = (await $fetch(
    //   `/api/users?search=${encodeURIComponent(formData.value.clientEmail)}&limit=1`
    // )) as any
    // const client = usersRes.data?.[0]
    // if (!client) {
    //   formError.value = 'Користувача з таким email не знайдено'
    //   saving.value = false
    //   return
    // }
    await appointmentAPI.create({
      clientId: formData.value.clientId,
      doctorId: formData.value.doctorId,
      serviceId: formData.value.serviceId,
      startTime: new Date(formData.value.startTime).toISOString(),
      notes: formData.value.notes || undefined,
    })
    // await $fetch('/api/appointments', {
    //   method: 'POST',
    //   body: {
    //     clientId: formData.value.clientId,
    //     doctorId: formData.value.doctorId,
    //     serviceId: formData.value.serviceId,
    //     startTime: new Date(formData.value.startTime).toISOString(),
    //     notes: formData.value.notes || undefined,
    //   },
    // })
    createModal.value = false
    await refresh()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка створення запису'
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
        title="Записи"
        :subtitle="`Керування прийомами · ${pagination?.total || 0} всього`"
      />

      <AdminButton @click="openCreate"><PlusIcon /> Новий запис </AdminButton>
    </div>

    <div class="card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <select v-model="statusOrder" class="inp">
            <option value="">Всі статуси</option>
            <option value="PENDING">Очікування</option>
            <option value="CONFIRMED">Підтверджено</option>
            <option value="CANCELLED">Скасовано</option>
          </select>
          <input v-model="fromOrder" type="date" class="inp" />
          <input v-model="toOrder" type="date" class="inp" />
          <button
            v-if="statusOrder || fromOrder || toOrder"
            class="btn btn-ghost btn-sm"
            @click="clearFilter"
          >
            ✕ Скинути
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <div v-if="pending" class="loading">Завантаження...</div>
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
            <tr v-if="!appointments.length">
              <td colspan="6">
                <div class="empty">
                  <div class="empty-icon">📅</div>
                  <div class="empty-title">Записів не знайдено</div>
                </div>
              </td>
            </tr>
            <tr v-for="a in appointments" :key="a.id">
              <td>
                <div class="user-cell">
                  <div class="av">
                    <nuxt-img
                      v-if="a.client?.avatar"
                      :src="a.client.avatar"
                      style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px"
                    />
                    <span v-else>{{ iniAvatar(a.client?.name) }}</span>
                  </div>
                  <div>
                    <div class="uc-name">{{ a.client?.name }}</div>
                    <div class="uc-sub">{{ a.client?.phone || a.client?.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <div class="av av-green">{{ iniAvatar(a.doctor?.user?.name) }}</div>
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
                <div class="mono" style="font-size: 12.5px">{{ formatDate(a.startTime) }}</div>
                <div class="mono" style="font-size: 11.5px; color: var(--text-3)">
                  {{ formatTime(a.startTime) }} — {{ formatTime(a.endTime) }}
                </div>
              </td>
              <td>
                <select
                  :value="a.status"
                  @change="changeStatus(a, ($event.target as any).value)"
                  class="status-sel"
                  :class="statusBadge(a.status)"
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

      <div class="pagination" v-if="pagination">
        <span>Стор. {{ page }} з {{ pagination.totalPages || 1 }}</span>
        <div class="pg-btns">
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--">←</button>
          <!-- prettier-ignore -->
          <button class="btn btn-ghost btn-sm" :disabled="page >= (pagination.totalPages || 1)" @click="page++">→</button>
        </div>
      </div>
    </div>

    <!-- Modal Delete -->
    <DeleteAppointmentModal v-model="delTarget" @delete="deleteAppointment" />

    <!-- Detail / notes modal -->
    <DetailAppointmentModal
      v-if="detailAppointment"
      v-model="detailModal"
      :detailAppointment
      v-model:notes="detailNotes"
      @confirm="saveNotes"
      @delete="openDelete(detailAppointment)"
    />

    <!-- Create appointment modal -->
    <CreateAppointmentModal
      v-model="createModal"
      :formData
      :formError
      :saving
      :doctorsServices
      :doctors
      :users="users?.data"
      @confirm="createAppointment"
    />
  </div>
</template>
