import { useMemo, useState } from 'react'

interface UserAvatarProps {
  fullName: string
  src?: string
}

const getInitials = (fullName: string) => {
  const words = fullName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export const UserAvatar = ({ fullName, src }: UserAvatarProps) => {
  const initials = useMemo(() => getInitials(fullName), [fullName])
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const showImage = Boolean(src) && failedSrc !== src

  return (
    <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
      {showImage ? (
        <img
          src={src}
          alt=""
          width={40}
          height={40}
          sizes="40px"
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{initials}</span>
      )}
    </span>
  )
}
