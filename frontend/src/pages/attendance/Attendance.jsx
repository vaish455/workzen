import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Calendar as CalendarIcon, Search, Download, Circle } from 'lucide-react'
import { format } from 'date-fns'

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Circle className="w-4 h-4 fill-green-500 text-green-500" />
      case 'ON_LEAVE':
        return <span className="text-lg">✈️</span>
      case 'ABSENT':
        return <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
      default:
        return <Circle className="w-4 h-4 fill-gray-400 text-gray-400" />
    }
  }

  const filteredAttendances = attendanceData?.attendances?.filter(item => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${item.employee.firstName} ${item.employee.lastName}`.toLowerCase()
    return fullName.includes(searchLower)
  }) || []

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-600">
            {attendanceData?.summary ? 
              `${attendanceData.summary.present} Present, ${attendanceData.summary.absent} Absent, ${attendanceData.summary.onLeave} On Leave` 
              : 'Loading...'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-gray-800">{attendanceData?.summary?.total || 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
          <p className="text-sm text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-800">{attendanceData?.summary?.present || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600">Absent</p>
          <p className="text-2xl font-bold text-yellow-800">{attendanceData?.summary?.absent || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
          <p className="text-sm text-blue-600">On Leave</p>
          <p className="text-2xl font-bold text-blue-800">{attendanceData?.summary?.onLeave || 0}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
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
              {filteredAttendances.map((item) => (
                <tr key={item.employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {item.employee.profilePicture ? (
                        <img
                          src={item.employee.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {item.employee.firstName?.charAt(0)}{item.employee.lastName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.employee.firstName} {item.employee.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm text-gray-700 capitalize">
                        {item.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.attendance?.checkIn 
                      ? new Date(item.attendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.attendance?.checkOut 
                      ? new Date(item.attendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.attendance?.workingHours 
                      ? `${parseFloat(item.attendance.workingHours).toFixed(2)}h`
                      : '-'}
                  </td>
                </tr>
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
