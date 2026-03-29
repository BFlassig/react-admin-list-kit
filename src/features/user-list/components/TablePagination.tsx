import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'

interface TablePaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

type PageToken = number | 'ellipsis'

const buildPages = (page: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1])

  if (page <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }

  if (page >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  const normalized = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right)

  const tokens: PageToken[] = []
  let previous = 0

  normalized.forEach((value) => {
    if (previous > 0 && value - previous > 1) {
      tokens.push('ellipsis')
    }

    tokens.push(value)
    previous = value
  })

  return tokens
}

export const TablePagination = ({
  page,
  totalPages,
  total,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) => {
  const pageButtons = buildPages(page, totalPages)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(180px,1fr)] lg:items-center">
        <p className="text-sm text-slate-600 lg:justify-self-start">
          Showing {from}-{to} of {total}
        </p>

        <div className="flex flex-col items-start gap-1.5 sm:items-center lg:justify-self-center">
          <span className="text-xs font-medium text-slate-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" onClick={() => onPageChange(1)} disabled={page <= 1}>
              <ChevronsLeft className="size-4" />
            </Button>

            <Button size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="size-4" />
            </Button>

            {pageButtons.map((token, index) =>
              token === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-slate-400">
                  ...
                </span>
              ) : (
                <Button
                  key={token}
                  size="sm"
                  variant={token === page ? 'primary' : 'secondary'}
                  onClick={() => onPageChange(token)}
                  className="min-w-9 px-0"
                >
                  {token}
                </Button>
              ),
            )}

            <Button size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="size-4" />
            </Button>

            <Button size="sm" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:justify-self-end">
          <span className="whitespace-nowrap text-sm text-slate-500">Rows per page</span>
          <div className="w-[86px] shrink-0">
            <Select value={String(pageSize)} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
