import { useState, useEffect, useMemo, memo } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Calendar as CalendarIcon, Search, Download, Circle, Users, CheckCircle2, XCircle, Plane } from 'lucide-react'
import { format } from 'date-fns'
import Button from '../../components/ui/button'
import { TableSkeleton, StatsCardSkeleton } from '../../components/ui/skeletons'

// Memoized table row component to prevent unnecessary re-renders
const AttendanceRow = memo(({ item, index }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Circle className="w-4 h-4 fill-green-500 text-green-500" />
      case 'ON_LEAVE':
        return <Plane className="w-4 h-4 text-blue-500" />
      case 'ABSENT':
        return <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
      default:
        return <Circle className="w-4 h-4 fill-gray-400 text-gray-400" />
    }
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {item.employee.profilePicture ? (
            <img
              src={item.employee.profilePicture}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#714B67] to-[#5A3C52] flex items-center justify-center text-white font-medium text-sm">
              {item.employee.firstName?.charAt(0)}{item.employee.lastName?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {item.employee.firstName} {item.employee.lastName}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {getStatusIcon(item.status)}
          <span className="text-sm capitalize text-gray-700">
            {item.status.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {item.attendance?.checkIn 
          ? new Date(item.attendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {item.attendance?.checkOut 
          ? new Date(item.attendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {item.attendance?.workingHours 
          ? `${parseFloat(item.attendance.workingHours).toFixed(2)}h`
          : '-'}
      </td>
    </tr>
  )
})

AttendanceRow.displayName = 'AttendanceRow'

const Attendance = () => {
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await api.get('/attendance/all', {
        params: { date: selectedDate },
      })
      setAttendanceData(response.data.data)
    } catch (error) {
      toast.error('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  // Memoized filtered data to prevent recalculation on every render
  const filteredAttendances = useMemo(() => {
    if (!attendanceData?.attendances) return []
    
    const searchLower = searchQuery.toLowerCase()
    return attendanceData.attendances.filter(item => {
      const fullName = `${item.employee.firstName} ${item.employee.lastName}`.toLowerCase()
      return fullName.includes(searchLower)
    })
  }, [attendanceData, searchQuery])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-96 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <StatsCardSkeleton count={4} />
        <TableSkeleton rows={10} columns={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">
            {attendanceData?.summary ? 
              `${attendanceData.summary.present} Present, ${attendanceData.summary.absent} Absent, ${attendanceData.summary.onLeave} On Leave` 
              : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => {}}
          className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#714B67] text-white hover:bg-[#5A3C52] focus-visible:ring-[#714B67] shadow-sm px-4 py-2.5 text-base gap-2"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{attendanceData?.summary?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Present */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-green-600 mb-1">Present</p>
              <p className="text-3xl font-bold text-green-700">{attendanceData?.summary?.present || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-yellow-600 mb-1">Absent</p>
              <p className="text-3xl font-bold text-yellow-700">{attendanceData?.summary?.absent || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-600 mb-1">On Leave</p>
              <p className="text-3xl font-bold text-blue-700">{attendanceData?.summary?.onLeave || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Plane className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl bg-white">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="focus:outline-none text-gray-900 bg-transparent"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Working Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendances.map((item, index) => (
                <AttendanceRow key={item.employee.id} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendances.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance


