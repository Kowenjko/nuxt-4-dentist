<script setup lang="ts">
const {
  isOpen,
  step,
  loading,
  submitting,
  error,
  selDoctor,
  selService,
  selDate,
  selSlot,
  notes,
  allDoctors,
  slots,
  morningSlots,
  afternoonSlots,
  eveningSlots,
  lunchBreak,
  calYear,
  calMonth,
  calDays,
  calTitle,
  prevMonth,
  nextMonth,
  close,
  pickDoctor,
  pickService,
  pickDate,
  pickSlot,
  goBack,
  submitBooking,
  openApptPanel,
  stepIndex,
  STEPS,
  STEP_LABELS,
} = useBooking()

const docSearch = ref('')
const transitDir = ref<'fwd' | 'bwd'>('fwd')

// ── Doctor search ────────────────────────────────────────────────
const filteredDoctors = computed(() => {
  const q = docSearch.value.toLowerCase()
  if (!q) return allDoctors.value
  return allDoctors.value.filter(
    (d) =>
      d.user?.name?.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q) ||
      d.services?.some((s) => s.name.toLowerCase().includes(q))
  )
})

const workDays = (d: BookingDoctor) => d.doctorSchedule?.filter((s) => s.isWorking).length ?? 5

const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const workingDaysList = computed(() => {
  const days = selDoctor.value?.doctorSchedule?.filter((s) => s.isWorking) ?? []
  return days.map((d) => dayNames[d.weekday]).join(', ') || 'Пн–Пт'
})

// ── Slot display ─────────────────────────────────────────────────
const fmtSlotDisplay = (sl: TimeSlot) => {
  if (!selDate.value) return sl.time
  const d = new Date(`${selDate.value}T${sl.time}:00`)
  return (
    d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ', ' +
    sl.time
  )
}

// ── Can proceed guard ────────────────────────────────────────────
const canProceed = computed(() => {
  switch (step.value) {
    case 'doctor':
      return !!selDoctor.value
    case 'service':
      return !!selService.value
    case 'date':
      return !!selDate.value
    case 'time':
      return !!selSlot.value
    default:
      return true
  }
})

// ── Navigation ───────────────────────────────────────────────────
const doPick = async (type: string, val: any) => {
  transitDir.value = 'fwd'
  if (type === 'doctor') {
    pickDoctor(val as BookingDoctor)
    docSearch.value = ''
  }
  if (type === 'service') pickService(val as BookingService)
  if (type === 'date') await pickDate(val as string)
  if (type === 'slot') pickSlot(val as TimeSlot)
}

const doNext = async () => {
  transitDir.value = 'fwd'
  if (step.value === 'date' && selDate.value) await pickDate(selDate.value)
  else if (canProceed.value) {
    const NEXT_MAP: Record<string, string> = {
      doctor: 'service',
      service: 'date',
      date: 'time',
      time: 'confirm',
    }
    if (NEXT_MAP[step.value]) step.value = NEXT_MAP[step.value] as any
  }
}

const doBack = () => {
  transitDir.value = 'bwd'
  goBack()
}

// ── Escape key ───────────────────────────────────────────────────
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) close()
  })
})
</script>

<template>
  <Teleport to="body">
    <!-- ── OVERLAY ─────────────────────────────────────── -->
    <Transition name="bm-overlay-t">
      <div v-if="isOpen" class="bm-bg" @click.self="close" />
    </Transition>

    <!-- ── PANEL ───────────────────────────────────────── -->
    <Transition name="bm-panel-t">
      <div v-if="isOpen" class="bm-panel" role="dialog" aria-modal="true">
        <!-- SUCCESS ──────────────────────────────────────── -->
        <Transition name="bm-step-t" mode="out-in">
          <div v-if="step === 'success'" key="success" class="bm-success">
            <button class="bm-x bm-x-abs" @click="close">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
              >
                <path d="M15 5 5 15M5 5l10 10" />
              </svg>
            </button>
            <div class="success-anim">
              <svg class="sc-svg" viewBox="0 0 80 80">
                <circle class="sc-ring" cx="40" cy="40" r="36" />
                <polyline class="sc-check" points="24,41 35,52 56,28" />
              </svg>
            </div>
            <h2 class="success-h2">Запис підтверджено!</h2>
            <p class="success-sub">
              Ваш запис до <strong>{{ selDoctor?.user?.name }}</strong> успішно створено
            </p>
            <div class="success-receipt">
              <div class="sr-row">
                <span class="sr-k">🏥 Послуга</span>
                <span class="sr-v">{{ selService?.name }}</span>
              </div>
              <div class="sr-sep"></div>
              <div class="sr-row">
                <span class="sr-k">📅 Дата та час</span>
                <span class="sr-v mono">{{ selSlot ? fmtSlotDisplay(selSlot) : '—' }}</span>
              </div>
              <div class="sr-sep"></div>
              <div class="sr-row">
                <span class="sr-k">⏱ Тривалість</span>
                <span class="sr-v">{{ selService?.duration }} хв</span>
              </div>
              <div class="sr-sep"></div>
              <div class="sr-row">
                <span class="sr-k">💰 Вартість</span>
                <span class="sr-v sr-price">{{
                  selService ? fmtPrice(selService.price) : '—'
                }}</span>
              </div>
            </div>
            <div class="success-actions">
              <button class="btn-success-primary" @click="close">Чудово!</button>
              <!-- prettier-ignore -->
              <button class="btn-success-ghost" @click="close(); openApptPanel()">Переглянути мої записи</button>
            </div>
          </div>
        </Transition>

        <!-- NORMAL FLOW ─────────────────────────────────── -->
        <template v-if="step !== 'success'">
          <!-- Header -->
          <div class="bm-header">
            <!-- Doctor info once selected -->
            <Transition name="bm-hdr-t" mode="out-in">
              <div v-if="selDoctor" key="doc" class="bm-hdr-doc">
                <div class="bm-hdr-av">{{ iniAvatar(selDoctor.user?.name) }}</div>
                <div class="bm-hdr-info">
                  <div class="bm-hdr-name">{{ selDoctor.user?.name }}</div>
                  <div class="bm-hdr-spec">{{ selDoctor.specialty }}</div>
                </div>
              </div>
              <div v-else key="brand" class="bm-hdr-brand">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <rect x="10" y="2" width="4" height="20" rx="2" fill="var(--bm-g)" />
                  <rect x="2" y="10" width="20" height="4" rx="2" fill="var(--bm-g)" />
                </svg>
                <span>Запис до лікаря</span>
              </div>
            </Transition>
            <button class="bm-x" @click="close">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
              >
                <path d="M15 5 5 15M5 5l10 10" />
              </svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="bm-progress">
            <div
              v-for="(label, i) in STEPS"
              :key="label"
              class="bm-prog-seg"
              :class="{
                'prog-done': stepIndex > i,
                'prog-active': stepIndex === i,
              }"
            >
              <div class="bm-prog-dot">
                <svg v-if="stepIndex > i" viewBox="0 0 10 10" fill="none" width="8">
                  <polyline
                    points="1,5 4,8 9,2"
                    stroke="white"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="bm-prog-label">{{ STEP_LABELS[label] }}</span>
              <div
                v-if="i < STEPS.length - 1"
                class="bm-prog-line"
                :class="{ done: stepIndex > i }"
              ></div>
            </div>
          </div>

          <!-- ── Step content ─────────────────────────────── -->
          <div class="bm-body">
            <Transition :name="transitDir === 'fwd' ? 'bm-fwd' : 'bm-bwd'" mode="out-in">
              <!-- STEP: Лікар ─────────────────────────────── -->
              <div v-if="step === 'doctor'" key="doctor" class="bm-step">
                <div class="bm-step-hd">
                  <h3 class="bm-step-title">Оберіть лікаря</h3>
                  <div class="bm-search-wrap">
                    <svg
                      viewBox="0 0 18 18"
                      fill="none"
                      stroke="var(--bm-i4)"
                      stroke-width="1.8"
                      width="15"
                    >
                      <circle cx="7.5" cy="7.5" r="5.5" />
                      <path d="m12 12 3.5 3.5" />
                    </svg>
                    <input
                      v-model="docSearch"
                      class="bm-search"
                      placeholder="Пошук за іменем або спеціальністю..."
                    />
                  </div>
                </div>

                <div v-if="loading" class="bm-loading">
                  <div class="bm-spinner"></div>
                  <span>Завантаження лікарів...</span>
                </div>

                <div v-else class="doc-list">
                  <button
                    v-for="d in filteredDoctors"
                    :key="d.id"
                    class="doc-row"
                    @click="doPick('doctor', d)"
                  >
                    <div class="dr-av">{{ iniAvatar(d.user?.name) }}</div>
                    <div class="dr-info">
                      <div class="dr-name">{{ d.user?.name }}</div>
                      <div class="dr-spec">{{ d.specialty }}</div>
                      <div class="dr-svcs">
                        <span
                          v-for="s in (d.services || []).slice(0, 3)"
                          :key="s.id"
                          class="dr-svc"
                          >{{ s.name }}</span
                        >
                        <span v-if="(d.services || []).length > 3" class="dr-svc dr-svc-more"
                          >+{{ d.services!.length - 3 }}</span
                        >
                      </div>
                    </div>
                    <div class="dr-days">
                      <span class="dr-days-num">{{ workDays(d) }}</span>
                      <span class="dr-days-lbl">днів/тиж</span>
                    </div>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="var(--bm-i4)"
                      stroke-width="1.8"
                      width="14"
                      class="dr-arrow"
                    >
                      <path d="M4 8h8M9 4l4 4-4 4" />
                    </svg>
                  </button>

                  <div v-if="!filteredDoctors.length" class="bm-empty">
                    <span>🔍</span>
                    <p>Лікарів не знайдено</p>
                  </div>
                </div>
              </div>

              <!-- STEP: Послуга ────────────────────────────── -->
              <div v-else-if="step === 'service'" key="service" class="bm-step">
                <div class="bm-step-hd">
                  <h3 class="bm-step-title">Оберіть послугу</h3>
                  <p class="bm-step-sub">{{ selDoctor?.user?.name }}</p>
                </div>

                <div v-if="!selDoctor?.services?.length" class="bm-empty">
                  <span>📋</span>
                  <p>У цього лікаря немає доступних послуг</p>
                </div>

                <div v-else class="svc-list">
                  <button
                    v-for="s in selDoctor.services"
                    :key="s.id"
                    class="svc-row"
                    :class="{ 'svc-row-sel': selService?.id === s.id }"
                    @click="doPick('service', s)"
                  >
                    <div class="sr-left">
                      <div class="sr-name">{{ s.name }}</div>
                      <div class="sr-dur">
                        <svg
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          width="12"
                        >
                          <circle cx="7" cy="7" r="5.5" />
                          <path d="M7 4.5V7l2 1.5" />
                        </svg>
                        {{ s.duration }} хв
                      </div>
                    </div>
                    <div class="sr-right">
                      <div class="sr-price">{{ fmtPrice(s.price) }}</div>
                      <div class="sr-check">
                        <svg viewBox="0 0 10 10" fill="none" width="9">
                          <polyline
                            points="1,5 4,8 9,2"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- STEP: Дата ───────────────────────────────── -->
              <div v-else-if="step === 'date'" key="date" class="bm-step">
                <div class="bm-step-hd">
                  <h3 class="bm-step-title">Оберіть дату</h3>
                  <p class="bm-step-sub">{{ selService?.name }} · {{ selService?.duration }} хв</p>
                </div>

                <div class="cal">
                  <div class="cal-hd">
                    <button
                      class="cal-nav"
                      @click="prevMonth"
                      :disabled="
                        calMonth === new Date().getMonth() && calYear === new Date().getFullYear()
                      "
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        width="14"
                      >
                        <path d="M10 3 5 8l5 5" />
                      </svg>
                    </button>
                    <span class="cal-title">{{ calTitle }}</span>
                    <button class="cal-nav" @click="nextMonth">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        width="14"
                      >
                        <path d="M6 3l5 5-5 5" />
                      </svg>
                    </button>
                  </div>

                  <div class="cal-dow">
                    <span v-for="d in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']" :key="d">{{
                      d
                    }}</span>
                  </div>

                  <div class="cal-grid">
                    <button
                      v-for="(cell, i) in calDays"
                      :key="i"
                      class="cal-cell"
                      :class="{
                        'cc-blank': !cell.date,
                        'cc-disabled': cell.disabled,
                        'cc-today': cell.isToday,
                        'cc-selected': selDate && selDate === cell.date,
                      }"
                      :disabled="cell.disabled || !cell.date"
                      @click="cell.date && !cell.disabled && doPick('date', cell.date)"
                    >
                      {{ cell.day || '' }}
                    </button>
                  </div>
                </div>

                <!-- Doctor working days hint -->
                <div v-if="selDoctor?.doctorSchedule" class="cal-hint">
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    width="13"
                  >
                    <circle cx="7" cy="7" r="5.5" />
                    <path d="M7 4.5v3l1.5 1.5" />
                  </svg>
                  Робочі дні: {{ workingDaysList }}
                </div>
              </div>

              <!-- STEP: Час ────────────────────────────────── -->
              <div v-else-if="step === 'time'" key="time" class="bm-step">
                <div class="bm-step-hd">
                  <h3 class="bm-step-title">
                    Оберіть час
                    <span class="date-chip">{{ fmtDateShort(selDate) }}</span>
                  </h3>
                  <p class="bm-step-sub">Тривалість: {{ selService?.duration }} хв</p>
                </div>

                <div v-if="loading" class="bm-loading">
                  <div class="bm-spinner"></div>
                  <span>Завантаження розкладу...</span>
                </div>

                <div v-else-if="!slots.length" class="bm-empty">
                  <span>📅</span>
                  <p>На цей день немає доступних слотів</p>
                  <button class="btn-back-date" @click="step = 'date'">Обрати іншу дату</button>
                </div>

                <div v-else class="slots-wrap">
                  <!-- Morning -->
                  <div v-if="morningSlots.length" class="slots-group">
                    <div class="slots-group-label"><span class="sg-icon">🌅</span> Ранок</div>
                    <Slots
                      v-if="morningSlots"
                      :slots="morningSlots!"
                      :selSlot
                      @select-slot="doPick('slot', $event)"
                    />
                  </div>

                  <!-- Lunch break divider -->
                  <div v-if="lunchBreak" class="lunch-divider">
                    <div class="lunch-line" />
                    <span class="lunch-label">
                      🍽 Обід {{ lunchBreak.start }}–{{ lunchBreak.end }}
                    </span>
                    <div class="lunch-line" />
                  </div>

                  <!-- Afternoon -->
                  <div v-if="afternoonSlots.length" class="slots-group">
                    <div class="slots-group-label"><span class="sg-icon">☀️</span> День</div>
                    <Slots
                      v-if="afternoonSlots"
                      :slots="afternoonSlots!"
                      :selSlot
                      @select-slot="doPick('slot', $event)"
                    />
                  </div>
                  <!-- Evening -->
                  <div v-if="eveningSlots.length" class="slots-group">
                    <div class="slots-group-label"><span class="sg-icon">🌆</span> Вечір</div>
                    <Slots
                      v-if="eveningSlots"
                      :slots="eveningSlots!"
                      :selSlot
                      @select-slot="doPick('slot', $event)"
                    />
                  </div>
                </div>
              </div>

              <!-- STEP: Підтвердження ──────────────────────── -->
              <div v-else-if="step === 'confirm'" key="confirm" class="bm-step">
                <div class="bm-step-hd">
                  <h3 class="bm-step-title">Підтвердіть запис</h3>
                </div>

                <div class="confirm-card">
                  <div class="cc-row">
                    <div class="cc-ico">👨‍⚕️</div>
                    <div class="cc-body">
                      <div class="cc-label">Лікар</div>
                      <div class="cc-val">{{ selDoctor?.user?.name }}</div>
                      <div class="cc-sub">{{ selDoctor?.specialty }}</div>
                    </div>
                  </div>
                  <div class="cc-sep"></div>
                  <div class="cc-row">
                    <div class="cc-ico">🏥</div>
                    <div class="cc-body">
                      <div class="cc-label">Послуга</div>
                      <div class="cc-val">{{ selService?.name }}</div>
                      <div class="cc-sub">{{ selService?.duration }} хв</div>
                    </div>
                    <div class="cc-price">{{ selService ? fmtPrice(selService.price) : '' }}</div>
                  </div>
                  <div class="cc-sep"></div>
                  <div class="cc-row">
                    <div class="cc-ico">📅</div>
                    <div class="cc-body">
                      <div class="cc-label">Дата та час</div>
                      <div class="cc-val mono">{{ selSlot ? fmtSlotDisplay(selSlot) : '—' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div class="notes-block">
                  <label class="notes-lbl">
                    Нотатки
                    <span class="notes-opt">(необов'язково)</span>
                  </label>
                  <textarea
                    v-model="notes"
                    class="notes-ta"
                    rows="3"
                    placeholder="Опишіть симптоми або додаткову інформацію для лікаря..."
                  >
                  </textarea>
                </div>

                <!-- Error -->
                <div v-if="error" class="bm-err">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="14"
                  >
                    <circle cx="8" cy="8" r="6.5" />
                    <path d="M8 5v3.5M8 10.5v.5" />
                  </svg>
                  {{ error }}
                </div>
              </div>
            </Transition>
          </div>

          <!-- ── Footer ──────────────────────────────────────── -->
          <div class="bm-footer">
            <button v-if="step !== 'doctor'" class="btn-back" @click="doBack">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="13"
              >
                <path d="M10 3 5 8l5 5" />
              </svg>
              Назад
            </button>

            <div class="footer-mid">
              <!-- Price hint on confirm -->
              <span v-if="step === 'confirm' && selService" class="footer-price">
                {{ fmtPrice(selService.price) }}
              </span>
              <!-- Selected time on confirm -->
              <span v-else-if="step === 'confirm' && selSlot" class="footer-time mono">
                {{ selSlot.time }}
              </span>
            </div>

            <!-- Next / Confirm -->
            <button
              v-if="step === 'confirm'"
              class="btn-confirm"
              :disabled="submitting"
              @click="submitBooking"
            >
              <div v-if="submitting" class="btn-spin"></div>
              <svg
                v-else
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="14"
              >
                <polyline points="2,8 6,12 14,4" />
              </svg>
              {{ submitting ? 'Запис...' : 'Підтвердити запис' }}
            </button>

            <button
              v-else-if="['doctor', 'service', 'date', 'time'].includes(step)"
              class="btn-next"
              :disabled="!canProceed"
              @click="doNext"
            >
              Далі
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="13"
              >
                <path d="M4 8h8M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* --bm-* змінні визначені глобально в main.css */

/* ── Overlay ─────────────────────────────────────────────────── */
.bm-bg {
  position: fixed;
  inset: 0;
  z-index: 800;
  background: rgba(24, 22, 19, 0.6);
  backdrop-filter: blur(6px);
}

/* ── Panel ───────────────────────────────────────────────────── */
.bm-panel {
  position: fixed;
  z-index: 900;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 570px;
  max-height: 92svh;
  background: var(--f0);
  border-radius: 22px 22px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -16px 80px rgba(0, 0, 0, 0.25);
  font-family: var(--bm-sans);
}
@media (min-width: 600px) {
  .bm-panel {
    top: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    max-height: 88svh;
  }
}

/* ── Header ──────────────────────────────────────────────────── */
.bm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--bm-f2);
  flex-shrink: 0;
}
.bm-hdr-doc {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bm-hdr-av {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--bm-gx);
  color: var(--bm-g);
  font-family: var(--bm-serif);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bm-hdr-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--bm-ink);
}
.bm-hdr-spec {
  font-size: 12px;
  color: var(--bm-i4);
}
.bm-hdr-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--bm-serif);
  font-size: 16px;
  color: var(--bm-ink);
}
.bm-x {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bm-f1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bm-i3);
  transition: all 0.15s;
  flex-shrink: 0;
}
.bm-x:hover {
  background: var(--bm-f2);
  color: var(--bm-ink);
}

/* ── Progress ────────────────────────────────────────────────── */
.bm-progress {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--bm-f2);
  flex-shrink: 0;
  overflow-x: auto;
}
.bm-prog-seg {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.bm-prog-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--bm-f3);
  background: var(--bm-f0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--bm-i4);
  flex-shrink: 0;
  transition: all 0.25s;
}
.prog-active .bm-prog-dot {
  border-color: var(--bm-g);
  color: var(--bm-g);
  background: var(--bm-gx);
}
.prog-done .bm-prog-dot {
  background: var(--bm-g);
  border-color: var(--bm-g);
}
.bm-prog-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--bm-i4);
  white-space: nowrap;
  transition: color 0.2s;
}
.prog-active .bm-prog-label {
  color: var(--bm-g);
  font-weight: 600;
}
.prog-done .bm-prog-label {
  color: var(--bm-i3);
}
.bm-prog-line {
  flex: 1;
  min-width: 20px;
  height: 2px;
  background: var(--bm-f2);
  border-radius: 2px;
  margin: 0 8px;
  transition: background 0.3s;
}
.bm-prog-line.done {
  background: var(--bm-g);
}

/* ── Body ────────────────────────────────────────────────────── */
.bm-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.bm-body::-webkit-scrollbar {
  width: 4px;
}
.bm-body::-webkit-scrollbar-thumb {
  background: var(--bm-f2);
  border-radius: 4px;
}

/* ── Step commons ────────────────────────────────────────────── */
.bm-step {
  padding: 20px;
}
.bm-step-hd {
  margin-bottom: 18px;
}
.bm-step-title {
  font-family: var(--bm-serif);
  font-size: 20px;
  font-weight: 400;
  color: var(--bm-ink);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.bm-step-sub {
  font-size: 13px;
  color: var(--bm-i3);
}

.bm-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 32px;
  color: var(--bm-i3);
  font-size: 14px;
}
.bm-spinner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--bm-f2);
  border-top-color: var(--bm-g);
  animation: bm-spin 0.7s linear infinite;
}
@keyframes bm-spin {
  to {
    transform: rotate(360deg);
  }
}

.bm-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--bm-i3);
}
.bm-empty span {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
}
.bm-empty p {
  font-size: 14px;
}

/* ── STEP: Doctor list ───────────────────────────────────────── */
.bm-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1.5px solid var(--bm-f2);
  background: white;
  transition: border-color 0.15s;
}
.bm-search-wrap:focus-within {
  border-color: var(--bm-g);
}
.bm-search {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-family: var(--bm-sans);
  font-size: 13.5px;
  color: var(--bm-ink);
}
.bm-search::placeholder {
  color: var(--bm-i4);
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--bm-f2);
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.doc-row:hover {
  border-color: var(--bm-gl);
  background: var(--bm-gx);
  transform: translateX(3px);
}
.dr-av {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: var(--bm-gx);
  color: var(--bm-g);
  font-family: var(--bm-serif);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dr-info {
  flex: 1;
  min-width: 0;
}
.dr-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--bm-ink);
  margin-bottom: 2px;
}
.dr-spec {
  font-size: 12.5px;
  color: var(--bm-g1);
  font-weight: 600;
  margin-bottom: 5px;
}
.dr-svcs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.dr-svc {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 20px;
  background: var(--bm-f1);
  color: var(--bm-i3);
}
.dr-svc-more {
  background: var(--bm-gx);
  color: var(--bm-g1);
}
.dr-days {
  text-align: center;
  flex-shrink: 0;
}
.dr-days-num {
  display: block;
  font-family: var(--bm-serif);
  font-size: 18px;
  color: var(--bm-ink);
}
.dr-days-lbl {
  font-size: 10px;
  color: var(--bm-i4);
}
.dr-arrow {
  flex-shrink: 0;
  transition: transform 0.15s;
}
.doc-row:hover .dr-arrow {
  transform: translateX(3px);
}

/* ── STEP: Service list ──────────────────────────────────────── */
.svc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.svc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--bm-f2);
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.svc-row:hover {
  border-color: var(--bm-gl);
}
.svc-row-sel {
  border-color: var(--bm-g);
  background: var(--bm-gx);
}
.sr-left {
  flex: 1;
}
.sr-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--bm-ink);
  margin-bottom: 4px;
}
.sr-dur {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  color: var(--bm-i4);
}
.sr-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.sr-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--bm-g);
}
.sr-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--bm-f2);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.15s;
  flex-shrink: 0;
}
.svc-row-sel .sr-check {
  border-color: var(--bm-g);
  background: var(--bm-g);
  color: white;
}

/* ── STEP: Calendar ──────────────────────────────────────────── */
.cal {
  background: white;
  border: 1px solid var(--bm-f2);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
}
.cal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}
.cal-nav {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--bm-f2);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bm-i3);
  transition: all 0.12s;
}
.cal-nav:hover:not(:disabled) {
  border-color: var(--bm-g);
  color: var(--bm-g);
  background: var(--bm-gx);
}
.cal-nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.cal-title {
  font-family: var(--bm-serif);
  font-size: 15px;
  color: var(--bm-ink);
}
.cal-dow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 12px 6px;
}
.cal-dow span {
  text-align: center;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--bm-i4);
  text-transform: uppercase;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  padding: 4px 12px 14px;
}
.cal-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  border: none;
  background: none;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--bm-ink);
  cursor: pointer;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal-cell:hover:not(.cc-disabled):not(.cc-blank) {
  background: var(--bm-gx);
  color: var(--bm-g);
}
.cc-blank {
  cursor: default;
}
.cc-disabled {
  color: var(--bm-f3);
  cursor: not-allowed;
}
.cc-today {
  background: var(--bm-f1);
  font-weight: 700;
}
.cc-selected {
  background: var(--bm-g) !important;
  color: white !important;
  font-weight: 700;
  box-shadow: 0 3px 12px rgba(22, 80, 47, 0.3);
}

.cal-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--bm-i4);
  padding: 4px 2px;
}

/* ── STEP: Time slots ────────────────────────────────────────── */
.date-chip {
  font-family: var(--bm-sans);
  font-size: 12.5px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--bm-gx);
  color: var(--bm-g1);
}
.slots-wrap {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.slots-group {
}
.slots-group-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--bm-i4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.sg-icon {
  font-size: 14px;
}

.btn-back-date {
  margin-top: 12px;
  padding: 7px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--bm-f2);
  background: none;
  font-family: var(--bm-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--bm-i3);
  cursor: pointer;
}
.btn-back-date:hover {
  border-color: var(--bm-g);
  color: var(--bm-g);
}

/* ── STEP: Confirm ───────────────────────────────────────────── */
.confirm-card {
  background: white;
  border: 1px solid var(--bm-f2);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 16px;
}
.cc-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
}
.cc-ico {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}
.cc-body {
  flex: 1;
}
.cc-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--bm-i4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 3px;
}
.cc-val {
  font-size: 15px;
  font-weight: 600;
  color: var(--bm-ink);
}
.cc-sub {
  font-size: 12.5px;
  color: var(--bm-i3);
  margin-top: 2px;
}
.cc-price {
  font-size: 17px;
  font-weight: 700;
  color: var(--bm-g);
  align-self: center;
  flex-shrink: 0;
}
.cc-sep {
  height: 1px;
  background: var(--bm-f2);
}
.mono {
  font-family: var(--bm-mono) !important;
}

.notes-lbl {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--bm-i3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 6px;
}
.notes-opt {
  text-transform: none;
  font-weight: 400;
  color: var(--bm-i4);
  letter-spacing: 0;
}
.notes-ta {
  width: 100%;
  padding: 10px 13px;
  border-radius: 10px;
  border: 1.5px solid var(--bm-f2);
  background: white;
  font-family: var(--bm-sans);
  font-size: 14px;
  color: var(--bm-ink);
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
  line-height: 1.6;
}
.notes-ta:focus {
  border-color: var(--bm-g);
}
.notes-ta::placeholder {
  color: var(--bm-i4);
}

.bm-err {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 13px;
  border-radius: 9px;
  background: var(--bm-redbg);
  color: var(--bm-red);
  font-size: 13.5px;
  border: 1px solid #fcc;
}

/* ── Footer ──────────────────────────────────────────────────── */
.bm-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px 20px;
  border-top: 1px solid var(--bm-f2);
  flex-shrink: 0;
  background: var(--bm-f0);
}
.btn-back {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 14px;
  border-radius: 9px;
  border: 1.5px solid var(--bm-f2);
  background: none;
  font-family: var(--bm-sans);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--bm-i3);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-back:hover {
  border-color: var(--bm-i4);
  color: var(--bm-ink);
}
.footer-mid {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}
.footer-price {
  font-size: 17px;
  font-weight: 700;
  color: var(--bm-g);
}
.footer-time {
  font-family: var(--bm-mono);
  font-size: 14px;
  color: var(--bm-i3);
}
.btn-next {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 9px;
  background: var(--bm-g);
  color: white;
  border: none;
  font-family: var(--bm-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-next:hover:not(:disabled) {
  background: var(--bm-g1);
}
.btn-next:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: 9px;
  background: var(--bm-g);
  color: white;
  border: none;
  font-family: var(--bm-sans);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 18px rgba(22, 80, 47, 0.28);
}
.btn-confirm:hover:not(:disabled) {
  background: var(--bm-g1);
  transform: translateY(-1px);
}
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.btn-spin {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: bm-spin 0.6s linear infinite;
  flex-shrink: 0;
}

/* ── Success ─────────────────────────────────────────────────── */
.bm-success {
  position: relative;
  padding: 40px 28px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.bm-x-abs {
  position: absolute;
  top: 16px;
  right: 16px;
}

.success-anim {
  margin-bottom: 24px;
}
.sc-svg {
  width: 80px;
  height: 80px;
}
.sc-ring {
  fill: none;
  stroke: var(--bm-g);
  stroke-width: 2.5;
  stroke-dasharray: 226;
  stroke-dashoffset: 226;
  animation: bm-draw 0.5s ease forwards;
}
.sc-check {
  fill: none;
  stroke: var(--bm-g);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: bm-draw 0.35s ease 0.45s forwards;
}
@keyframes bm-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.success-h2 {
  font-family: var(--bm-serif);
  font-size: 26px;
  color: var(--bm-ink);
  margin-bottom: 8px;
}
.success-sub {
  font-size: 15px;
  color: var(--bm-i3);
  margin-bottom: 24px;
  line-height: 1.6;
}
.success-sub strong {
  color: var(--bm-ink);
}
.success-receipt {
  width: 100%;
  background: white;
  border: 1px solid var(--bm-f2);
  border-radius: 14px;
  margin-bottom: 24px;
  text-align: left;
  overflow: hidden;
}
.sr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 16px;
}
.sr-sep {
  height: 1px;
  background: var(--bm-f2);
}
.sr-k {
  font-size: 13px;
  color: var(--bm-i3);
}
.sr-v {
  font-size: 14px;
  font-weight: 600;
  color: var(--bm-ink);
  text-align: right;
}
.sr-price {
  color: var(--bm-g);
  font-size: 16px;
}
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.btn-success-primary {
  padding: 13px;
  border-radius: 10px;
  background: var(--bm-g);
  color: white;
  border: none;
  font-family: var(--bm-sans);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 18px rgba(22, 80, 47, 0.28);
}
.btn-success-primary:hover {
  background: var(--bm-g1);
  transform: translateY(-1px);
}
.btn-success-ghost {
  padding: 10px;
  border-radius: 10px;
  border: 1.5px solid var(--bm-f2);
  background: none;
  font-family: var(--bm-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--bm-i2);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-success-ghost:hover {
  border-color: var(--bm-g);
  color: var(--bm-g);
}

/* ── Transitions ─────────────────────────────────────────────── */
.bm-overlay-t-enter-active,
.bm-overlay-t-leave-active {
  transition: opacity 0.25s;
}
.bm-overlay-t-enter-from,
.bm-overlay-t-leave-to {
  opacity: 0;
}

.bm-panel-t-enter-active {
  transition: all 0.35s var(--bm-ease);
}
.bm-panel-t-leave-active {
  transition: all 0.2s ease;
}
.bm-panel-t-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(40px) scale(0.96);
}
.bm-panel-t-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.97);
}
@media (min-width: 600px) {
  .bm-panel-t-enter-from {
    transform: translate(-50%, -48%) scale(0.95);
  }
  .bm-panel-t-leave-to {
    transform: translate(-50%, -50%) scale(0.97);
  }
}

.bm-step-t-enter-active {
  transition: all 0.4s var(--bm-ease);
}
.bm-step-t-leave-active {
  transition: all 0.2s ease;
}
.bm-step-t-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.bm-step-t-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.bm-fwd-enter-active {
  transition: all 0.28s ease;
}
.bm-fwd-leave-active {
  transition: all 0.18s ease;
}
.bm-fwd-enter-from {
  opacity: 0;
  transform: translateX(18px);
}
.bm-fwd-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.bm-bwd-enter-active {
  transition: all 0.28s ease;
}
.bm-bwd-leave-active {
  transition: all 0.18s ease;
}
.bm-bwd-enter-from {
  opacity: 0;
  transform: translateX(-18px);
}
.bm-bwd-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

.bm-hdr-t-enter-active,
.bm-hdr-t-leave-active {
  transition: all 0.2s ease;
}
.bm-hdr-t-enter-from,
.bm-hdr-t-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* ── Lunch break divider ─────────────────────────────────────── */
.lunch-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}
.lunch-line {
  flex: 1;
  height: 1px;
  background: var(--bm-f2);
  border-radius: 1px;
}
.lunch-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--bm-i4);
  white-space: nowrap;
  padding: 4px 10px;
  background: var(--bm-f1);
  border-radius: 20px;
  border: 1px solid var(--bm-f2);
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 400px) {
  .bm-prog-label {
    display: none;
  }
  .bm-prog-line {
    min-width: 14px;
  }
}
</style>
