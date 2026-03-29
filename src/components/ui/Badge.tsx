import type { UserStatus } from '../../types/user'
import { cn } from '../../utils/cn'

interface BadgeProps {
  status: UserStatus
}

const tone: Record<UserStatus, string> = {
  Active: 'border border-emerald-200 bg-emerald-100 text-emerald-800',
  Pending: 'border border-amber-200 bg-amber-100 text-amber-800',
  Inactive: 'border border-slate-200 bg-slate-100 text-slate-700',
  Suspended: 'border border-rose-200 bg-rose-100 text-rose-700',
}

export const Badge = ({ status }: BadgeProps) => (
  <span className={cn('inline-flex min-w-[86px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold', tone[status])}>
    {status}
  </span>
)
