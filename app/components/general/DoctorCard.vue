<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    doctor: BookingDoctor & { _count?: { appointments: number } }
    compact?: boolean
    featured?: boolean
    horizontal?: boolean
    online?: boolean | null
  }>(),
  {
    compact: false,
    featured: false,
    horizontal: false,
    online: null,
  }
)

const { open: openModal } = useBooking()
const expanded = ref(false)

// ── Computed ──────────────────────────────────────────────────────
const showOnline = computed(() => (props.online !== null ? props.online : Math.random() > 0.5))

const workDays = computed(
  () => (props.doctor.doctorSchedule ?? []).filter((s) => s.isWorking).length || '5'
)

const DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const weekSchedule = computed(() =>
  // Show Mon–Sun (1–0 shifted)
  [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const sc = props.doctor.doctorSchedule?.find((s) => s.weekday === dow)
    return {
      dow,
      label: DAY_NAMES[dow],
      working: sc?.isWorking ?? (dow >= 1 && dow <= 5),
      start: sc?.startTime ?? '09:00',
      end: sc?.endTime ?? '18:00',
    }
  })
)

// ── Actions ───────────────────────────────────────────────────────
const openBooking = () => openModal({ doctor: props.doctor })
const openWithService = (svc: BookingService) => openModal({ doctor: props.doctor, service: svc })
</script>

<template>
  <div
    class="dc"
    :class="[
      compact ? 'dc-compact' : '',
      featured ? 'dc-featured' : '',
      horizontal ? 'dc-horizontal' : '',
    ]"
  >
    <!-- Featured ribbon -->
    <div v-if="featured" class="dc-ribbon">Топ лікар</div>

    <!-- Online dot (on avatar) -->
    <div class="dc-av-area">
      <div class="dc-av">{{ iniAvatar(doctor.user?.name) }}</div>
      <div class="dc-av-ring"></div>
      <ClientOnly
        ><div v-if="showOnline" class="dc-online" :title="showOnline ? 'Вільний' : 'Зайнятий'"></div
      ></ClientOnly>
    </div>

    <!-- Info -->
    <div class="dc-info">
      <h3 class="dc-name">{{ doctor.user?.name }}</h3>
      <div class="dc-spec">{{ doctor.specialty }}</div>

      <p v-if="!compact && doctor.bio" class="dc-bio">{{ doctor.bio }}</p>

      <!-- Stats row -->
      <div v-if="!compact" class="dc-stats">
        <div class="dc-stat">
          <span class="dc-sv">{{ workDays }}</span>
          <span class="dc-sl">днів/тиж</span>
        </div>
        <div class="dc-sdiv"></div>
        <div class="dc-stat">
          <span class="dc-sv">{{ doctor.services?.length ?? 0 }}</span>
          <span class="dc-sl">послуг</span>
        </div>
        <div class="dc-sdiv"></div>
        <div class="dc-stat">
          <span class="dc-sv">{{ doctor._count?.appointments ?? '—' }}</span>
          <span class="dc-sl">записів</span>
        </div>
      </div>

      <!-- Service chips -->
      <div v-if="!compact" class="dc-chips">
        <span
          v-for="s in (doctor.services ?? []).slice(0, 3)"
          :key="s.id"
          class="dc-chip"
          @click.stop="openWithService(s)"
        >
          {{ s.name }}
        </span>
        <span v-if="(doctor.services ?? []).length > 3" class="dc-chip dc-chip-more">
          +{{ doctor.services!.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="dc-actions">
      <button class="dc-btn-book" @click="openBooking">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12">
          <rect x="1" y="2" width="12" height="11" rx="1.5" />
          <path d="M4 1v2M10 1v2M1 6h12" />
        </svg>
        Записатись
      </button>
      <button v-if="!compact && !horizontal" class="dc-btn-expand" @click="expanded = !expanded">
        <svg
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          width="12"
          :class="{ rotated: expanded }"
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
        {{ expanded ? 'Приховати' : 'Детально' }}
      </button>
    </div>

    <!-- Expand: schedule + all services -->
    <Transition name="dc-expand">
      <div v-if="expanded && !compact" class="dc-expanded">
        <!-- Schedule -->
        <div class="dc-exp-section">
          <div class="dc-exp-title">Розклад прийому</div>
          <div class="dc-sched">
            <div
              v-for="day in weekSchedule"
              :key="day.dow"
              class="dc-sched-row"
              :class="{ 'dc-off': !day.working }"
            >
              <span class="dc-sday">{{ day.label }}</span>
              <span class="dc-stime">{{
                day.working ? `${day.start}–${day.end}` : 'вихідний'
              }}</span>
            </div>
          </div>
        </div>

        <!-- All services -->
        <div v-if="doctor.services?.length" class="dc-exp-section">
          <div class="dc-exp-title">Послуги</div>
          <div class="dc-svc-table">
            <div
              v-for="s in doctor.services"
              :key="s.id"
              class="dc-svc-row"
              @click="openWithService(s)"
            >
              <div class="dc-svc-inf">
                <span class="dc-svc-name">{{ s.name }}</span>
                <span class="dc-svc-dur">{{ s.duration }} хв</span>
              </div>
              <span class="dc-svc-price">{{ fmtPrice(s.price) }}</span>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="11"
                class="dc-svc-arr"
              >
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Шрифти підключені в main.css */

.dc {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
  font-family: var(--font-sans);
}
.dc:hover {
  border-color: var(--accent-light);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

/* Featured */
.dc-featured {
  border-color: var(--accent-light);
}
.dc-ribbon {
  position: absolute;
  top: 16px;
  right: -26px;
  background: var(--accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 36px;
  transform: rotate(35deg);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(22, 80, 47, 0.35);
}

/* Horizontal layout */
.dc-horizontal {
  flex-direction: row;
  gap: 16px;
  padding: 18px;
}
.dc-horizontal .dc-av-area {
  flex-shrink: 0;
}
.dc-horizontal .dc-info {
  flex: 1;
  text-align: left;
}
.dc-horizontal .dc-chips {
  justify-content: flex-start;
}
.dc-horizontal .dc-stats {
  justify-content: flex-start;
}
.dc-horizontal .dc-actions {
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

/* Avatar */
.dc-av-area {
  position: relative;
  width: 72px;
  margin: 0 auto 16px;
}
.dc-compact .dc-av-area {
  width: 52px;
  margin-bottom: 12px;
}
.dc-horizontal .dc-av-area {
  margin: 0;
}

.dc-av {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: var(--accent-bg);
  color: var(--accent);
  font-family: var(--font-serif);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
}
.dc:hover .dc-av {
  box-shadow: 0 4px 18px rgba(22, 80, 47, 0.18);
}
.dc-compact .dc-av {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
}

.dc-av-ring {
  position: absolute;
  inset: -5px;
  border-radius: 22px;
  border: 1.5px dashed var(--accent-light);
  animation: ring-rot 24s linear infinite;
}
.dc-compact .dc-av-ring {
  display: none;
}
@keyframes ring-rot {
  to {
    transform: rotate(360deg);
  }
}

.dc-online {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  border: 2.5px solid white;
}

/* Info */
.dc-info {
  text-align: center;
}
.dc-compact .dc-info {
  text-align: left;
}
.dc-name {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 400;
  color: var(--black-50);
  margin-bottom: 4px;
}
.dc-compact .dc-name {
  font-size: 15px;
}
.dc-spec {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-2);
  margin-bottom: 10px;
}
.dc-bio {
  font-size: 13.5px;
  color: var(--text-3);
  line-height: 1.65;
  margin-bottom: 14px;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Stats */
.dc-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 14px;
}
.dc-stat {
  text-align: center;
}
.dc-sv {
  display: block;
  font-family: var(--font-serif);
  font-size: 18px;
  color: var(--black-50);
}
.dc-sl {
  font-size: 11px;
  color: var(--text-4);
}
.dc-sdiv {
  width: 1px;
  height: 28px;
  background: var(--border);
}

/* Chips */
.dc-chips {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.dc-chip {
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--bg-2);
  color: var(--text-3);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
}
.dc-chip:hover {
  background: var(--accent-bg);
  color: var(--accent-2);
}
.dc-chip-more {
  background: var(--accent-bg);
  color: var(--accent-2);
  cursor: default;
}

/* Actions */
.dc-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.dc-btn-expand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: none;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.dc-btn-expand:hover {
  border-color: var(--text-4);
  color: var(--text);
}
.dc-btn-expand svg {
  transition: transform 0.2s;
}
.dc-btn-expand svg.rotated {
  transform: rotate(180deg);
}

.dc-btn-book {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  border: none;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 3px 14px rgba(22, 80, 47, 0.22);
}
.dc-btn-book:hover {
  background: var(--accent-2);
  transform: translateY(-1px);
  box-shadow: 0 5px 20px rgba(22, 80, 47, 0.28);
}

.dc-compact .dc-btn-expand {
  display: none;
}
.dc-compact .dc-btn-book {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
}
.dc-horizontal .dc-btn-book {
  flex: none;
  padding: 9px 18px;
}
.dc-horizontal .dc-btn-expand {
  flex: none;
  padding: 9px 14px;
}

/* Expanded section */
.dc-expanded {
  border-top: 1px solid var(--border);
  margin-top: 18px;
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dc-exp-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-4);
  margin-bottom: 10px;
}

/* Schedule */
.dc-sched {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.dc-sched-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 7px;
  background: var(--bg-2);
}
.dc-off {
  opacity: 0.4;
}
.dc-sday {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text);
}
.dc-stime {
  font-size: 9px;
  color: var(--text-3);
  text-align: center;
}
.dc-off .dc-stime {
  font-style: italic;
}

/* Services table */
.dc-svc-table {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.dc-svc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--bg-2);
  cursor: pointer;
  transition: all 0.12s;
}
.dc-svc-row:hover {
  background: var(--accent-bg);
  transform: translateX(3px);
}
.dc-svc-inf {
  flex: 1;
}
.dc-svc-name {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}
.dc-svc-dur {
  font-size: 11.5px;
  color: var(--text-4);
}
.dc-svc-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}
.dc-svc-arr {
  color: var(--text-4);
  flex-shrink: 0;
  transition: transform 0.15s;
}
.dc-svc-row:hover .dc-svc-arr {
  transform: translateX(3px);
}

/* Transitions */
.dc-expand-enter-active {
  transition: all 0.3s ease;
}
.dc-expand-leave-active {
  transition: all 0.2s ease;
}
.dc-expand-enter-from,
.dc-expand-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.dc-expand-enter-to {
  max-height: 600px;
}
</style>
