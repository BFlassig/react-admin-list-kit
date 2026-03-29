export type UserRole = 'Admin' | 'Manager' | 'Editor' | 'Member'

export type UserStatus = 'Active' | 'Pending' | 'Inactive' | 'Suspended'

export type Team =
  | 'Engineering'
  | 'Product'
  | 'Marketing'
  | 'Sales'
  | 'Support'
  | 'Finance'
  | 'Operations'
  | 'HR'

export interface User {
  id: string
  fullName: string
  email: string
  avatar: string
  role: UserRole
  status: UserStatus
  team: Team
  createdAt: string
  lastActiveAt: string | null
}
