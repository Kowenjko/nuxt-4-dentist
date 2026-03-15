export const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

export const fmtDateShort = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
  })

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const today = new Date().toLocaleDateString('uk-UA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export const fmtTimeShort = (d: string) =>
  new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
