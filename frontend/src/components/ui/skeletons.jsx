import { Skeleton } from './skeleton'

// Dashboard Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-96 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-16 h-5" />
            </div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-9 w-16" />
          </div>
        ))}
      </div>

      {/* Chart Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Card Grid Skeleton (for employee directory, payslips, etc.)
export const CardGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Details Page Skeleton
export const DetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Profile Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start gap-6 mb-6">
          <Skeleton className="w-24 h-24 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// List Skeleton
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Form Skeleton
export const FormSkeleton = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Stats Card Skeleton
export const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-9 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Report Skeleton
export const ReportSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-96 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <TableSkeleton rows={8} columns={4} />
          </div>
        </div>
      </div>
    </div>
  )
}
