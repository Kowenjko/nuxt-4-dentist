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
