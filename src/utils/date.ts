const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
})

export const formatDate = (value: string) => dateFormatter.format(new Date(value))

export const formatLastActive = (value: string | null) => {
  if (!value) {
    return 'Never'
  }

  const now = new Date()
  const active = new Date(value)

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfActive = new Date(active.getFullYear(), active.getMonth(), active.getDate())
  const diff = Math.floor((startOfToday.getTime() - startOfActive.getTime()) / (24 * 60 * 60 * 1000))

  if (diff <= 0) {
    return 'Today'
  }

  if (diff === 1) {
    return 'Yesterday'
  }

  if (diff < 7) {
    return `${diff} days ago`
  }

  return formatDate(value)
}
