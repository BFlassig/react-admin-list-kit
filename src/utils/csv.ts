import type { User } from '../types/user'

const escapeCsv = (value: string) => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export const buildUsersCsv = (users: User[]) => {
  const header = ['id', 'name', 'email', 'role', 'status', 'team', 'createdAt', 'lastActiveAt']

  const rows = users.map((user) =>
    [
      user.id,
      user.fullName,
      user.email,
      user.role,
      user.status,
      user.team,
      user.createdAt,
      user.lastActiveAt ?? '',
    ]
      .map(escapeCsv)
      .join(','),
  )

  return [header.join(','), ...rows].join('\n')
}

export const downloadCsv = (filename: string, csvContent: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
