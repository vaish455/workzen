import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Calendar as CalendarIcon, Clock, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const MyAttendance = () => {
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState(null)
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => {
    fetchMyAttendance()
    fetchTodayAttendance()
  }, [selectedMonth])

  const fetchMyAttendance = async () => {
    try {
      setLoading(true)
      const [year, month] = selectedMonth.split('-')
      const response = await api.get('/attendance/my-attendance', {
        params: { month, year },
      })
      setAttendanceData(response.data.data)
    } catch (error) {
      toast.error('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today')
      setTodayAttendance(response.data.data)
    } catch (error) {
      console.error('Failed to fetch today attendance')
    }
  }

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/check-in')
      toast.success('Checked in successfully!')
      fetchTodayAttendance()
      fetchMyAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/check-out')
      toast.success('Checked out successfully!')
      fetchTodayAttendance()
      fetchMyAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800'
      case 'ON_LEAVE':
        return 'bg-blue-100 text-blue-800'
      case 'ABSENT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-600">Track your attendance and working hours</p>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Today's Attendance</h3>
            {todayAttendance?.attendance?.checkIn && (
              <p className="text-sm opacity-90">
                Checked in at {new Date(todayAttendance.attendance.checkIn).toLocaleTimeString()}
              </p>
            )}
            {todayAttendance?.attendance?.checkOut && (
              <p className="text-sm opacity-90">
                Checked out at {new Date(todayAttendance.attendance.checkOut).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {todayAttendance?.canCheckIn && (
              <button
                onClick={handleCheckIn}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Check In
              </button>
            )}
            {todayAttendance?.canCheckOut && (
              <button
                onClick={handleCheckOut}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Present Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {attendanceData?.statistics?.presentDays || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Absent Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {attendanceData?.statistics?.absentDays || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Leave Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {attendanceData?.statistics?.leaveDays || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Total Hours</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {attendanceData?.statistics?.totalWorkingHours?.toFixed(1) || 0}h
          </p>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Attendance History</h3>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData?.attendances?.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(attendance.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {attendance.checkIn 
                      ? new Date(attendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {attendance.checkOut 
                      ? new Date(attendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {attendance.workingHours 
                      ? `${parseFloat(attendance.workingHours).toFixed(2)}h`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendanceData?.attendances?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendance records for this month</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyAttendance
