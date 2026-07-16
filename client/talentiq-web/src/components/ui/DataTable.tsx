import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  pageSize?: number
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-panel rounded-2xl border border-line">
        <LoadingSpinner label="Loading data..." />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-panel rounded-2xl border border-line p-8">
        <EmptyState message={emptyMessage} />
      </div>
    )
  }

  const totalPages = Math.ceil(data.length / pageSize)
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="w-full bg-panel border border-line rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-panel-2">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paginatedData.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="hover:bg-panel-2/50 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4.5 text-sm text-text ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-line bg-panel-2/30">
          <div className="text-xs text-muted">
            Showing <span className="font-semibold text-head">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-head">
              {Math.min(currentPage * pageSize, data.length)}
            </span>{' '}
            of <span className="font-semibold text-head">{data.length}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-panel-2 text-xs font-semibold text-head disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-panel-2 text-xs font-semibold text-head disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default DataTable
