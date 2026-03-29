import type { Team, User, UserRole, UserStatus } from '../../types/user'

const FIRST_NAMES = [
  'Anna',
  'John',
  'Rachel',
  'Michael',
  'Sara',
  'David',
  'Lisa',
  'Daniel',
  'Eva',
  'Noah',
  'Olivia',
  'Liam',
  'Amelia',
  'Benjamin',
  'Sophia',
  'Lucas',
  'Mia',
  'Ethan',
  'Emma',
  'Logan',
  'Nora',
  'Henry',
  'Chloe',
  'Mason',
  'Leah',
  'Caleb',
  'Zoe',
  'Nathan',
  'Harper',
  'Samuel',
  'Grace',
  'Julian',
  'Ivy',
  'Isaac',
  'Lena',
  'Adrian',
  'Ruby',
  'Elias',
  'Hannah',
  'Felix',
]

const LAST_NAMES = [
  'Becker',
  'Smith',
  'Green',
  'Johnson',
  'Lee',
  'Brown',
  'Wong',
  'Turner',
  'Miller',
  'Foster',
  'Reed',
  'Carter',
  'Bennett',
  'Collins',
  'Hughes',
  'Ward',
  'Murphy',
  'Nguyen',
  'Diaz',
  'Morgan',
  'Chambers',
  'Price',
  'Hansen',
  'Bishop',
  'Russell',
]

const TEAM_POOL: Team[] = [
  'Engineering',
  'Product',
  'Marketing',
  'Sales',
  'Support',
  'Finance',
  'Operations',
  'HR',
]

const EMAIL_DOMAINS = ['workspacehq.com', 'northstar.app', 'opsgrid.dev', 'examplecorp.io']
const FEMALE_FIRST_NAMES = new Set([
  'Anna',
  'Rachel',
  'Sara',
  'Lisa',
  'Eva',
  'Olivia',
  'Amelia',
  'Sophia',
  'Mia',
  'Emma',
  'Nora',
  'Chloe',
  'Leah',
  'Zoe',
  'Harper',
  'Grace',
  'Ivy',
  'Lena',
  'Ruby',
  'Hannah',
])

const FEMALE_AVATAR_PATHS = [
  '/avatars/avatar-02.webp',
  '/avatars/avatar-03.webp',
  '/avatars/avatar-06.webp',
  '/avatars/avatar-09.webp',
  '/avatars/avatar-10.webp',
  '/avatars/avatar-12.webp',
  '/avatars/avatar-15.webp',
]

const MALE_AVATAR_PATHS = [
  '/avatars/avatar-01.webp',
  '/avatars/avatar-04.webp',
  '/avatars/avatar-05.webp',
  '/avatars/avatar-07.webp',
  '/avatars/avatar-08.webp',
  '/avatars/avatar-11.webp',
  '/avatars/avatar-13.webp',
  '/avatars/avatar-14.webp',
]

const seeded = (seed: number) => {
  const value = Math.sin(seed * 7919 + 17.3) * 10000
  return value - Math.floor(value)
}

const pick = <T>(list: T[], seed: number): T => list[Math.floor(seeded(seed) * list.length)]
const avatarPoolFor = (firstName: string) =>
  FEMALE_FIRST_NAMES.has(firstName) ? FEMALE_AVATAR_PATHS : MALE_AVATAR_PATHS

const toIso = (timestamp: number) => new Date(timestamp).toISOString()

const assignRole = (seed: number): UserRole => {
  const value = seeded(seed)

  if (value < 0.17) {
    return 'Admin'
  }

  if (value < 0.35) {
    return 'Manager'
  }

  if (value < 0.62) {
    return 'Editor'
  }

  return 'Member'
}

const assignStatus = (seed: number): UserStatus => {
  const value = seeded(seed)

  if (value < 0.64) {
    return 'Active'
  }

  if (value < 0.8) {
    return 'Pending'
  }

  if (value < 0.95) {
    return 'Inactive'
  }

  return 'Suspended'
}

const startDate = new Date('2020-01-01T00:00:00Z').getTime()
const nowDate = Date.now()

const createUser = (index: number): User => {
  const first = pick(FIRST_NAMES, index * 1.9)
  const last = pick(LAST_NAMES, index * 2.7)
  const fullName = `${first} ${last}`

  const role = assignRole(index * 3.2)
  const status = assignStatus(index * 4.6)
  const team = pick(TEAM_POOL, index * 2.3)

  const createdOffset = Math.floor(seeded(index * 8.1) * (nowDate - startDate - 8 * 24 * 60 * 60 * 1000))
  const createdAtMs = startDate + createdOffset

  const domain = pick(EMAIL_DOMAINS, index * 1.4)
  const localPart = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '')
  const email = `${localPart}${index}@${domain}`
  const avatarPool = avatarPoolFor(first)
  const avatarIndex =
    (Math.floor(seeded(index * 2.1) * avatarPool.length) + index * 5) % avatarPool.length
  const avatar = avatarPool[avatarIndex]

  let lastActiveAt: string | null

  if (status === 'Active') {
    const offsetDays = Math.floor(seeded(index * 6.7) * 7)
    lastActiveAt = toIso(nowDate - offsetDays * 24 * 60 * 60 * 1000)
  } else if (status === 'Pending') {
    const offsetDays = 2 + Math.floor(seeded(index * 7.4) * 45)
    lastActiveAt = toIso(nowDate - offsetDays * 24 * 60 * 60 * 1000)
  } else if (status === 'Inactive') {
    const offsetDays = 35 + Math.floor(seeded(index * 5.9) * 420)
    lastActiveAt = toIso(nowDate - offsetDays * 24 * 60 * 60 * 1000)
  } else {
    const shouldKeepDate = seeded(index * 9.5) > 0.48

    if (shouldKeepDate) {
      const offsetDays = 90 + Math.floor(seeded(index * 9.9) * 900)
      lastActiveAt = toIso(nowDate - offsetDays * 24 * 60 * 60 * 1000)
    } else {
      lastActiveAt = null
    }
  }

  if (lastActiveAt && new Date(lastActiveAt).getTime() < createdAtMs) {
    lastActiveAt = toIso(createdAtMs + 24 * 60 * 60 * 1000)
  }

  return {
    id: `usr_${String(index).padStart(4, '0')}`,
    fullName,
    email,
    avatar,
    role,
    status,
    team,
    createdAt: toIso(createdAtMs),
    lastActiveAt,
  }
}

export const seedUsers = Array.from({ length: 96 }, (_, index) => createUser(index + 1))

export const roleOptions: Array<UserRole | 'all'> = ['all', 'Admin', 'Manager', 'Editor', 'Member']
export const statusOptions: Array<UserStatus | 'all'> = ['all', 'Active', 'Pending', 'Inactive', 'Suspended']
export const teamOptions: Array<Team | 'all'> = ['all', ...TEAM_POOL]
