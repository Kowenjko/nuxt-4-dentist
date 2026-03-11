<script setup lang="ts">
const {
  apptPanelOpen,
  myAppointments,
  apptLoading,
  cancellingId,
  closeApptPanel,
  loadMyAppointments,
  cancelAppointment,
  open,
  statusLabel,
  statusColor,
  canCancel,
} = useBooking()

// ── Tabs ─────────────────────────────────────────────────────────
type TabKey = 'upcoming' | 'past' | 'all'
const activeTab = ref<TabKey>('upcoming')
const tabs = [
  { key: 'upcoming' as TabKey, label: 'Майбутні' },
  { key: 'past' as TabKey, label: 'Минулі' },
  { key: 'all' as TabKey, label: 'Всі' },
]

const isUpcoming = (a: MyAppointment) =>
  ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.startTime) > new Date()

const isPast = (a: MyAppointment) =>
  a.status === 'COMPLETED' || a.status === 'CANCELLED' || new Date(a.startTime) <= new Date()

const filteredAppts = computed<MyAppointment[]>(() => {
  const sorted = [...myAppointments.value].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
  if (activeTab.value === 'upcoming') return sorted.filter(isUpcoming)
  if (activeTab.value === 'past') return sorted.filter(isPast)
  return sorted
})

const tabCount = (key: TabKey) => {
  if (key === 'upcoming') return myAppointments.value.filter(isUpcoming).length || 0
  if (key === 'past') return myAppointments.value.filter(isPast).length || 0
  return myAppointments.value.length || 0
}

// ── Empty state ───────────────────────────────────────────────────
const emptyIcon = computed(() => (activeTab.value === 'upcoming' ? '📅' : '📋'))
const emptyTitle = computed(() =>
  activeTab.value === 'upcoming' ? 'Немає майбутніх записів' : 'Немає записів'
)
const emptyMsg = computed(() =>
  activeTab.value === 'upcoming'
    ? 'Запишіться до лікаря прямо зараз — це займе менше 2 хвилин'
    : "Тут з'явиться ваша історія візитів"
)

// ── Cancel flow ───────────────────────────────────────────────────
const confirmCancelId = ref<string | null>(null)

const doCancel = async (id: string) => {
  await cancelAppointment(id)
  confirmCancelId.value = null
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="ap-fade">
      <div v-if="apptPanelOpen" class="ap-bg" @click.self="closeApptPanel" />
    </Transition>

    <!-- Drawer -->
    <Transition name="ap-slide">
      <div v-if="apptPanelOpen" class="ap-drawer">
        <!-- Header -->
        <div class="ap-hd">
          <div class="ap-hd-left">
            <div class="ap-hd-icon">📋</div>
            <div>
              <h2 class="ap-hd-title">Мої записи</h2>
              <p class="ap-hd-sub">Ваші майбутні та минулі прийоми</p>
            </div>
          </div>
          <button class="ap-close" @click="closeApptPanel">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16">
              <path d="M15 5 5 15M5 5l10 10" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="ap-tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="ap-tab"
            :class="{ 'ap-tab-active': activeTab === t.key }"
            @click="activeTab = t.key"
          >
            {{ t.label }}
            <span v-if="tabCount(t.key)" class="ap-tab-badge">{{ tabCount(t.key) }}</span>
          </button>
        </div>

        <!-- Content -->
        <div class="ap-body">
          <!-- Loading -->
          <div v-if="apptLoading" class="ap-loading">
            <div class="ap-spinner"></div>
            <span>Завантаження...</span>
          </div>

          <!-- Empty -->
          <div v-else-if="!filteredAppts.length" class="ap-empty">
            <div class="ap-empty-icon">{{ emptyIcon }}</div>
            <h3 class="ap-empty-title">{{ emptyTitle }}</h3>
            <p class="ap-empty-sub">{{ emptyMsg }}</p>
            <!-- prettier-ignore -->
            <button v-if="activeTab === 'upcoming'" class="ap-book-btn" @click="closeApptPanel(); open()">
              Записатись зараз
            </button>
          </div>

          <!-- List -->
          <div v-else class="ap-list">
            <TransitionGroup name="ap-item">
              <div
                v-for="a in filteredAppts"
                :key="a.id"
                class="ap-card"
                :class="{
                  'ap-card-cancelled': a.status === 'CANCELLED',
                  'ap-card-done': a.status === 'COMPLETED',
                }"
              >
                <!-- Card header -->
                <div class="apc-top">
                  <div class="apc-av">{{ iniAvatar(a.doctor?.user?.name) }}</div>
                  <div class="apc-info">
                    <div class="apc-name">{{ a.doctor?.user?.name }}</div>
                    <div class="apc-spec">{{ a.doctor?.specialty }}</div>
                  </div>
                  <div class="apc-status" :class="statusColor(a.status)">
                    {{ statusLabel(a.status) }}
                  </div>
                </div>

                <!-- Card details -->
                <div class="apc-details">
                  <div class="apc-detail">
                    <span class="acd-ico">🏥</span>
                    <span class="acd-val">{{ a.service?.name }}</span>
                  </div>
                  <div class="apc-detail">
                    <span class="acd-ico">📅</span>
                    <span class="acd-val mono">{{ fmtDateTime(a.startTime) }}</span>
                  </div>
                  <div class="apc-detail">
                    <span class="acd-ico">⏱</span>
                    <span class="acd-val"
                      >{{ a.service?.duration }} хв · {{ fmtPrice(a.service?.price) }}</span
                    >
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="a.notes" class="apc-notes">
                  <span class="apc-notes-icon">📝</span>
                  <span>{{ a.notes }}</span>
                </div>

                <!-- Actions -->
                <div class="apc-actions" v-if="canCancel(a) || a.status === 'CANCELLED'">
                  <Transition name="ap-fade" mode="out-in">
                    <!-- Cancel confirm state -->
                    <div v-if="confirmCancelId === a.id" key="confirm" class="apc-cancel-confirm">
                      <span class="apc-confirm-text">Скасувати цей запис?</span>
                      <button class="apc-btn-no" @click="confirmCancelId = null">Ні</button>
                      <button
                        class="apc-btn-yes"
                        :disabled="cancellingId === a.id"
                        @click="doCancel(a.id)"
                      >
                        <div v-if="cancellingId === a.id" class="ap-spin-sm"></div>
                        <span v-else>Так, скасувати</span>
                      </button>
                    </div>
                    <!-- Normal buttons -->
                    <div v-else key="normal" class="apc-btn-row">
                      <!-- prettier-ignore -->
                      <button
                        v-if="a.status !== 'CANCELLED'"                   class="apc-btn-rebook"                        @click="closeApptPanel(); open({ doctor: a.doctor as any, service: a.service as any })">
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" width="12"><rect x="1" y="2" width="12" height="11" rx="2"/><path d="M4 1v2M10 1v2M1 6h12"/></svg>
                        Повторний запис
                      </button>
                      <button
                        v-if="canCancel(a)"
                        class="apc-btn-cancel"
                        @click="confirmCancelId = a.id"
                      >
                        Скасувати
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="ap-footer">
          <!-- prettier-ignore -->
          <button class="ap-new-btn" @click="closeApptPanel(); open()">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
            Новий запис
          </button>
          <button class="ap-refresh-btn" @click="loadMyAppointments" :disabled="apptLoading">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="14"
              :class="{ spinning: apptLoading }"
            >
              <path d="M14 8A6 6 0 1 1 8 2" />
              <path d="M14 2v4h-4" />
            </svg>
            Оновити
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────── */
.ap-bg {
  position: fixed;
  inset: 0;
  z-index: 700;
  background: rgba(24, 22, 19, 0.5);
  backdrop-filter: blur(4px);
}

/* ── Drawer ──────────────────────────────────────────────────── */
.ap-drawer {
  position: fixed;
  z-index: 750;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 60px rgba(0, 0, 0, 0.14);
  font-family: 'Outfit', sans-serif;
}

/* ── Header ──────────────────────────────────────────────────── */
.ap-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ap-hd-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ap-hd-icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.ap-hd-title {
  font-family: 'DM Serif Display', serif;
  font-size: 19px;
  color: var(--text);
}
.ap-hd-sub {
  font-size: 12.5px;
  color: var(--text-4);
  margin-top: 1px;
}
.ap-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  transition: all 0.15s;
  flex-shrink: 0;
}
.ap-close:hover {
  background: var(--border);
  color: var(--text);
}

/* ── Tabs ────────────────────────────────────────────────────── */
.ap-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ap-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.ap-tab:hover {
  color: var(--text);
  background: var(--bg-2);
}
.ap-tab-active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
}
.ap-tab-badge {
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  font-size: 10.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.ap-tab-active .ap-tab-badge {
  background: var(--accent);
}

/* ── Body ────────────────────────────────────────────────────── */
.ap-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.ap-body::-webkit-scrollbar {
  width: 4px;
}
.ap-body::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.ap-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 40px;
  color: var(--text-4);
  font-size: 14px;
}
.ap-spinner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  animation: ap-spin 0.7s linear infinite;
}
@keyframes ap-spin {
  to {
    transform: rotate(360deg);
  }
}

.ap-empty {
  text-align: center;
  padding: 48px 20px;
}
.ap-empty-icon {
  font-size: 40px;
  margin-bottom: 14px;
  opacity: 0.5;
}
.ap-empty-title {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
  color: var(--text-2);
  margin-bottom: 8px;
}
.ap-empty-sub {
  font-size: 13.5px;
  color: var(--text-4);
  line-height: 1.6;
  margin-bottom: 20px;
}
.ap-book-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.ap-book-btn:hover {
  background: var(--accent-2);
}

/* ── Appointment cards ───────────────────────────────────────── */
.ap-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ap-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.2s;
}
.ap-card:hover {
  border-color: var(--accent-light);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.ap-card-cancelled {
  opacity: 0.6;
}
.ap-card-done {
  border-left: 3px solid var(--accent);
}

/* Card top */
.apc-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 10px;
}
.apc-av {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--accent-bg);
  color: var(--accent);
  font-family: 'DM Serif Display', serif;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.apc-info {
  flex: 1;
  min-width: 0;
}
.apc-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--black-50);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.apc-spec {
  font-size: 12px;
  color: var(--accent-3);
  font-weight: 600;
  margin-top: 1px;
}

/* Status badge */
.apc-status {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
  flex-shrink: 0;
}
.status-pending {
  background: var(--status-pending-bg);
  color: var(--status-pending-color);
}
.status-confirmed {
  background: var(--accent-bg);
  color: var(--accent);
}
.status-cancelled {
  background: var(--danger-bg);
  color: var(--danger);
}
.status-done {
  background: var(--bg-2);
  color: var(--text-3);
}

/* Card details */
.apc-details {
  padding: 2px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.apc-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-3);
}
.acd-ico {
  font-size: 14px;
  flex-shrink: 0;
}
.acd-val {
  color: var(--black-100);
}
.mono {
  font-family: 'Courier New', monospace !important;
  font-size: 12.5px !important;
}

/* Notes */
.apc-notes {
  margin: 0 14px 10px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  background: var(--bg-2);
  font-size: 12.5px;
  color: var(--text-3);
  line-height: 1.5;
}
.apc-notes-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 0px;
}

/* Actions */
.apc-actions {
  padding: 0 14px 14px;
}
.apc-btn-row {
  display: flex;
  gap: 8px;
}

.apc-cancel-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 9px;
  background: #fff8f8;
  border: 1px solid #fcc;
}
.apc-confirm-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-3);
}
.apc-btn-no,
.apc-btn-yes {
  padding: 6px 12px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
  flex-shrink: 0;
}
.apc-btn-no {
  background: var(--bg-2);
  color: var(--text-3);
}
.apc-btn-no:hover {
  background: var(--border);
}
.apc-btn-yes {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid #fcc;
  display: flex;
  align-items: center;
  gap: 5px;
}
.apc-btn-yes:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}
.apc-btn-yes:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apc-btn-rebook {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.apc-btn-rebook:hover {
  border-color: var(--accent-light);
  color: var(--accent);
  background: var(--accent-bg);
}

.apc-btn-cancel {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid #fcc;
  background: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--danger);
  cursor: pointer;
  transition: all 0.15s;
}
.apc-btn-cancel:hover {
  background: var(--danger-bg);
}

.ap-spin-sm {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(197, 48, 48, 0.3);
  border-top-color: var(--danger);
  animation: ap-spin 0.6s linear infinite;
}

/* ── Footer ──────────────────────────────────────────────────── */
.ap-footer {
  display: flex;
  gap: 8px;
  padding: 12px 20px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg);
}
.ap-new-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 3px 14px rgba(22, 80, 47, 0.24);
}
.ap-new-btn:hover {
  background: var(--accent-2);
}
.ap-refresh-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 16px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.ap-refresh-btn:hover:not(:disabled) {
  border-color: var(--text-4);
  color: var(--text);
}
.ap-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spinning {
  animation: ap-spin 0.7s linear infinite;
}

/* ── Transitions ─────────────────────────────────────────────── */
.ap-fade-enter-active,
.ap-fade-leave-active {
  transition: opacity 0.2s;
}
.ap-fade-enter-from,
.ap-fade-leave-to {
  opacity: 0;
}

.ap-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.22, 0.68, 0, 1.2);
}
.ap-slide-leave-active {
  transition: all 0.22s ease;
}
.ap-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.ap-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.ap-item-enter-active {
  transition: all 0.3s ease;
}
.ap-item-leave-active {
  transition: all 0.2s ease;
}
.ap-item-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.ap-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 500px) {
  .ap-drawer {
    max-width: 100%;
    border-radius: 0;
  }
}
</style>
