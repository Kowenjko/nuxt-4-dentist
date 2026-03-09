export * from './text'
export * from './date'

export const scrollToId = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    nextTick(() => element.scrollIntoView({ behavior: 'smooth' }))
  }
}
