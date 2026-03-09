export const iniAvatar = (name?: string | null) =>
  (name || '??')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const fmtPrice = (p: number | string) => Number(p).toLocaleString('uk-UA') + ' ₴'
