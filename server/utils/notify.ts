// server/utils/notify.ts
// ─────────────────────────────────────────────────────────────────────────
// Сервіс сповіщень після запису:
//   • Viber  — якщо у клієнта є phone (через Viber Bot API)
//   • Email  — якщо у клієнта є email (через nodemailer / SMTP)
//
// ENV змінні (.env):
//   VIBER_BOT_TOKEN      — токен бота з https://partners.viber.com
//   SMS_PROVIDER         — 'twilio' | 'turbosms' | 'smshub'  (default: twilio)
//
//   Twilio:   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
//   TurboSMS: TURBOSMS_TOKEN, TURBOSMS_SENDER
//   SMShub:   SMSHUB_API_KEY, SMSHUB_SENDER
//
//   SMTP_HOST            — напр. smtp.gmail.com
//   SMTP_PORT            — 587
//   SMTP_USER            — відправник
//   SMTP_PASS            — пароль / app-password
//   SMTP_FROM            — "КлінікаПлюс <noreply@clinic.ua>"
//   APP_URL              — https://clinic.ua  (для посилань у листі)
//
// Логіка для телефону:
//   1. Пробуємо Viber
//   2. Якщо Viber недоступний (немає токена) або клієнт не підписаний
//      (status 6 = notSubscribed) → fallback на SMS
//
// Email відправляється паралельно незалежно від Viber/SMS.
// ─────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer'

// ── Типи ────────────────────────────────────────────────────────────────
export interface NotifyPayload {
  client: {
    name: string
    phone?: string | null
    email?: string | null
  }
  doctor: {
    name: string
    specialty: string
  }
  service: {
    name: string
    duration: number
    price: number | string
  }
  appointment: {
    id: string
    startTime: Date | string
    endTime: Date | string
  }
}

// ── Хелпери ─────────────────────────────────────────────────────────────

/** Форматує дату у вигляді "понеділок, 12 березня 2026, 14:30" */
function fmtDateTime(dt: Date | string): string {
  const d = typeof dt === 'string' ? new Date(dt) : dt
  return d.toLocaleString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Форматує ціну: "1 200 ₴" */
function fmtPrice(p: number | string): string {
  return `${Number(p).toLocaleString('uk-UA')} ₴`
}

/** Нормалізує телефон до міжнародного формату без пробілів: +380991234567 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('380')) return `+${digits}`
  if (digits.startsWith('80')) return `+3${digits}`
  if (digits.startsWith('0')) return `+38${digits}`
  return `+${digits}`
}

// ════════════════════════════════════════════════════════════════════════
// VIBER
// ════════════════════════════════════════════════════════════════════════

/**
 * Viber Bot API — надсилає повідомлення на номер телефону.
 *
 * Важливо: Viber Bot може надіслати повідомлення лише користувачу,
 * який ВЖЕ підписаний на бота. Для першого контакту потрібен
 * "welcome message" або клієнт сам написав боту першим.
 * Якщо користувач не підписаний → API поверне error 6 (notSubscribed),
 * ми логуємо і продовжуємо.
 *
 * Для відправки за номером телефону (без підписки) — використовуйте
 * Viber Business Messages (окремий акаунт), але логіка та самий.
 */
/**
 * Повертає true якщо повідомлення доставлено успішно.
 * Повертає false якщо токен відсутній або клієнт не підписаний → треба SMS fallback.
 */
async function sendViber(payload: NotifyPayload): Promise<boolean> {
  const token = process.env.VIBER_BOT_TOKEN
  if (!token) {
    console.warn('[notify:viber] VIBER_BOT_TOKEN не задано → fallback на SMS')
    return false
  }

  if (!payload.client.phone) return false

  const phone = normalizePhone(payload.client.phone)
  const dateStr = fmtDateTime(payload.appointment.startTime)
  const price = fmtPrice(payload.service.price)

  const text = [
    `✅ *Запис підтверджено!*`,
    ``,
    `👤 ${payload.client.name}, вітаємо!`,
    `Ваш запис у КлінікаПлюс успішно оформлено.`,
    ``,
    `👨‍⚕️ Лікар:   ${payload.doctor.name}`,
    `🏥 Послуга: ${payload.service.name} (${payload.service.duration} хв)`,
    `📅 Дата:    ${dateStr}`,
    `💰 Ціна:    ${price}`,
    ``,
    `Якщо плани змінились — скасуйте запис в особистому кабінеті.`,
    `До зустрічі! 🌿`,
  ].join('\n')

  // Viber Bot API endpoint
  const VIBER_API = 'https://chatapi.viber.com/pa/send_message'

  const body = {
    receiver: phone, // номер телефону у форматі +380...
    min_api_version: 1,
    sender: {
      name: 'КлінікаПлюс',
      avatar: process.env.APP_URL ? `${process.env.APP_URL}/logo.png` : undefined,
    },
    tracking_data: payload.appointment.id,
    type: 'text',
    text,
  }

  try {
    const res = await fetch(VIBER_API, {
      method: 'POST',
      headers: {
        'X-Viber-Auth-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = (await res.json()) as { status: number; status_message: string }

    if (data.status !== 0) {
      if (data.status === 6) {
        // notSubscribed — клієнт не підписаний на бота → fallback на SMS
        console.warn(`[notify:viber] Клієнт ${phone} не підписаний → fallback на SMS`)
        return false
      }
      console.error(`[notify:viber] Помилка ${data.status}: ${data.status_message}`)
      return false
    }

    console.log(`[notify:viber] ✓ Надіслано на ${phone}`)
    return true
  } catch (err) {
    console.error('[notify:viber] Мережева помилка:', err)
    return false
  }
}

// ════════════════════════════════════════════════════════════════════════
// SMS  (Twilio / TurboSMS / SMShub)
// ════════════════════════════════════════════════════════════════════════

/**
 * Короткий текст для SMS — без емодзі та розмітки (деякі оператори їх ріжуть).
 * Вкладаємось у 160 символів (1 SMS).
 */
function buildSmsText(payload: NotifyPayload): string {
  const date = (() => {
    const d =
      typeof payload.appointment.startTime === 'string'
        ? new Date(payload.appointment.startTime)
        : payload.appointment.startTime
    return d.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  })()

  // ~140 символів
  return (
    `KlinikaPlus: Zapis pidtverdzeno!\n` +
    `Likar: ${payload.doctor.name}\n` +
    `Posluga: ${payload.service.name}\n` +
    `Data: ${date}\n` +
    `Skasuvaty: ${process.env.APP_URL || 'clinic.ua'}/appointments`
  )
}

// ── Twilio ───────────────────────────────────────────────────────────────
async function sendSmsTwilio(phone: string, text: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM

  if (!sid || !token || !from) return false

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
    const body = new URLSearchParams({ To: phone, From: from, Body: text })

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const data = (await res.json()) as { sid?: string; status?: string; message?: string }

    if (!res.ok || !data.sid) {
      console.error('[notify:sms:twilio] Помилка:', data.message || res.status)
      return false
    }

    console.log(`[notify:sms:twilio] ✓ SMS на ${phone}, sid=${data.sid}`)
    return true
  } catch (err) {
    console.error('[notify:sms:twilio] Мережева помилка:', err)
    return false
  }
}

// ── TurboSMS (популярний в Україні) ─────────────────────────────────────
async function sendSmsTurboSms(phone: string, text: string): Promise<boolean> {
  const token = process.env.TURBOSMS_TOKEN
  const sender = process.env.TURBOSMS_SENDER || 'KlinikaPlus'

  if (!token) return false

  try {
    const res = await fetch('https://api.turbosms.ua/message/send.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        recipients: [phone],
        sms: { sender, text },
      }),
    })

    const data = (await res.json()) as { response_code: number; response_result?: any[] }

    if (data.response_code !== 0) {
      console.error('[notify:sms:turbosms] Помилка код:', data.response_code)
      return false
    }

    const result = data.response_result?.[0]
    if (result?.response_code !== 0) {
      console.error('[notify:sms:turbosms] Помилка відправки:', result)
      return false
    }

    console.log(`[notify:sms:turbosms] ✓ SMS на ${phone}`)
    return true
  } catch (err) {
    console.error('[notify:sms:turbosms] Мережева помилка:', err)
    return false
  }
}

// ── SMShub ───────────────────────────────────────────────────────────────
async function sendSmsSmsHub(phone: string, text: string): Promise<boolean> {
  const apiKey = process.env.SMSHUB_API_KEY
  const sender = process.env.SMSHUB_SENDER || 'KlinikaPlus'

  if (!apiKey) return false

  try {
    // Прибираємо + для SMShub (очікує 380XXXXXXXXX)
    const to = phone.replace(/^\+/, '')

    const res = await fetch('https://smshub.org/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: apiKey, // SMShub використовує api_key як username
        password: '',
        action: 'sendmessage',
        sender,
        recipient: to,
        message: text,
      }),
    })

    const raw = await res.text()
    const ok = raw.trim().startsWith('OK')

    if (!ok) {
      console.error('[notify:sms:smshub] Відповідь:', raw.slice(0, 100))
      return false
    }

    console.log(`[notify:sms:smshub] ✓ SMS на ${phone}`)
    return true
  } catch (err) {
    console.error('[notify:sms:smshub] Мережева помилка:', err)
    return false
  }
}

/**
 * Відправляє SMS через провайдера з SMS_PROVIDER (default: twilio).
 * Перебирає всі доступні провайдери якщо основний не налаштований.
 */
async function sendSms(payload: NotifyPayload): Promise<void> {
  if (!payload.client.phone) return

  const phone = normalizePhone(payload.client.phone)
  const text = buildSmsText(payload)
  const provider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase()

  // Порядок: спочатку обраний провайдер, потім fallback на решту
  const providers: Array<[string, (p: string, t: string) => Promise<boolean>]> = [
    ['twilio', sendSmsTwilio],
    ['turbosms', sendSmsTurboSms],
    ['smshub', sendSmsSmsHub],
  ]

  // Переставляємо обраний провайдер першим
  providers.sort(([name]) => (name === provider ? -1 : 1))

  for (const [name, fn] of providers) {
    const sent = await fn(phone, text)
    if (sent) return
    console.warn(`[notify:sms] ${name} не спрацював, пробуємо наступний...`)
  }

  console.error(`[notify:sms] Жоден SMS-провайдер не надіслав повідомлення на ${phone}`)
}

// ════════════════════════════════════════════════════════════════════════
// EMAIL
// ════════════════════════════════════════════════════════════════════════

/** Lazy-singleton транспорт nodemailer */
let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('[notify:email] SMTP не налаштовано (SMTP_HOST/USER/PASS) — пропускаємо')
    return null
  }

  _transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  })

  return _transporter
}

async function sendEmail(payload: NotifyPayload): Promise<void> {
  if (!payload.client.email) return

  const transporter = getTransporter()
  if (!transporter) return

  const dateStr = fmtDateTime(payload.appointment.startTime)
  const price = fmtPrice(payload.service.price)
  const appUrl = process.env.APP_URL || 'https://clinic.ua'
  const from = process.env.SMTP_FROM || `"КлінікаПлюс" <noreply@clinic.ua>`

  const subject = `✅ Запис підтверджено — ${payload.service.name}, ${dateStr}`

  // ── HTML лист ────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${subject}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f3f0ea; font-family: 'Helvetica Neue', Arial, sans-serif; color: #181613; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 560px; margin: 32px auto; }
    .card { background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.07); }
    .header { background: #16502f; padding: 32px 36px; text-align: center; }
    .header-logo { font-size: 28px; }
    .header-title { color: #ffffff; font-size: 22px; font-weight: 700; margin-top: 10px; letter-spacing: -.02em; }
    .header-sub { color: rgba(255,255,255,.75); font-size: 13.5px; margin-top: 6px; }
    .body { padding: 32px 36px; }
    .greeting { font-size: 16px; color: #181613; margin-bottom: 24px; line-height: 1.6; }
    .greeting strong { color: #16502f; }
    .details { background: #f3f0ea; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: flex-start; gap: 12px; padding: 9px 0; border-bottom: 1px solid #e8e3d9; }
    .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-row:first-child { padding-top: 0; }
    .detail-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .detail-label { font-size: 11px; font-weight: 700; color: #9c9589; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 2px; }
    .detail-value { font-size: 14.5px; font-weight: 600; color: #181613; }
    .detail-sub { font-size: 12px; color: #6b6459; margin-top: 2px; }
    .price-badge { display: inline-block; background: #ebf6ef; color: #16502f; font-weight: 700; font-size: 16px; padding: 3px 12px; border-radius: 20px; }
    .note { background: #fff8e6; border-left: 3px solid #c49a3c; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 24px; font-size: 13.5px; color: #5a4a1a; line-height: 1.6; }
    .cta { text-align: center; margin-bottom: 24px; }
    .btn { display: inline-block; background: #16502f; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 13px 32px; border-radius: 9px; letter-spacing: .01em; }
    .footer { padding: 20px 36px; border-top: 1px solid #e8e3d9; text-align: center; font-size: 12px; color: #9c9589; line-height: 1.7; }
    .footer a { color: #16502f; text-decoration: none; }
    @media (max-width: 600px) {
      .wrap { margin: 0; }
      .card { border-radius: 0; }
      .header, .body, .footer { padding-left: 20px; padding-right: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <div class="header-logo">✚</div>
        <div class="header-title">Запис підтверджено!</div>
        <div class="header-sub">КлінікаПлюс — ваш особистий медичний центр</div>
      </div>

      <div class="body">
        <p class="greeting">
          Вітаємо, <strong>${escHtml(payload.client.name)}</strong>!<br/>
          Ваш запис успішно оформлено. Деталі нижче.
        </p>

        <div class="details">
          <div class="detail-row">
            <div class="detail-icon">👨‍⚕️</div>
            <div>
              <div class="detail-label">Лікар</div>
              <div class="detail-value">${escHtml(payload.doctor.name)}</div>
              <div class="detail-sub">${escHtml(payload.doctor.specialty)}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">🏥</div>
            <div>
              <div class="detail-label">Послуга</div>
              <div class="detail-value">${escHtml(payload.service.name)}</div>
              <div class="detail-sub">${payload.service.duration} хв &nbsp;·&nbsp; <span class="price-badge">${price}</span></div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">📅</div>
            <div>
              <div class="detail-label">Дата та час</div>
              <div class="detail-value">${dateStr}</div>
            </div>
          </div>
        </div>

        <div class="note">
          💡 Якщо плани змінились — скасуйте запис не пізніше ніж за 2 години до початку в особистому кабінеті.
        </div>

        <div class="cta">
          <a href="${appUrl}/appointments" class="btn">Переглянути мої записи →</a>
        </div>
      </div>

      <div class="footer">
        Цей лист надіслано автоматично. Не відповідайте на нього.<br/>
        <a href="${appUrl}">${appUrl}</a> &nbsp;·&nbsp;
        <a href="${appUrl}/unsubscribe">Відписатися від сповіщень</a>
      </div>
    </div>
  </div>
</body>
</html>`

  // ── Plain-text fallback ──────────────────────────────────────────────
  const text = [
    `Вітаємо, ${payload.client.name}!`,
    ``,
    `Ваш запис у КлінікаПлюс підтверджено:`,
    ``,
    `  Лікар:   ${payload.doctor.name} (${payload.doctor.specialty})`,
    `  Послуга: ${payload.service.name} — ${payload.service.duration} хв`,
    `  Дата:    ${dateStr}`,
    `  Ціна:    ${price}`,
    ``,
    `Переглянути записи: ${appUrl}/appointments`,
    ``,
    `З повагою, команда КлінікаПлюс`,
  ].join('\n')

  try {
    await transporter.sendMail({
      from,
      to: payload.client.email!,
      subject,
      text,
      html,
    })
    console.log(`[notify:email] ✓ Надіслано на ${payload.client.email}`)
  } catch (err) {
    console.error('[notify:email] Помилка відправки:', err)
  }
}

// ── Escape HTML ──────────────────────────────────────────────────────────
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ════════════════════════════════════════════════════════════════════════
// ГОЛОВНА ФУНКЦІЯ
// ════════════════════════════════════════════════════════════════════════

/**
 * Надсилає сповіщення клієнту після запису.
 *
 * Логіка для телефону:
 *   → Viber (якщо є токен і клієнт підписаний)
 *   → SMS fallback (якщо Viber не доставив)
 *
 * Email відправляється паралельно незалежно від Viber/SMS.
 * НЕ кидає виняток — помилки тільки логуються.
 */
export async function notifyAppointmentCreated(payload: NotifyPayload): Promise<void> {
  const hasPhone = !!payload.client.phone
  const hasEmail = !!payload.client.email

  if (!hasPhone && !hasEmail) {
    console.log('[notify] Клієнт без phone та email — сповіщення не надіслано')
    return
  }

  // Email запускаємо паралельно — не чекаємо Viber/SMS
  const emailTask = hasEmail ? sendEmail(payload) : Promise.resolve()

  // Телефон: Viber → SMS fallback
  const phoneTask = hasPhone
    ? sendViber(payload).then((viberSent) => {
        if (!viberSent) {
          console.log('[notify] Viber не доставив → відправляємо SMS')
          return sendSms(payload)
        }
      })
    : Promise.resolve()

  await Promise.allSettled([emailTask, phoneTask])
}
