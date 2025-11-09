import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [todayAttendance, setTodayAttendance] = useState(null)

  useEffect(() => {
    fetchEmployeeDashboard()
    fetchTodayAttendance()
  }, [])

  const fetchEmployeeDashboard = async () => {
    try {
      const response = await api.get('/dashboard/employee')
      setDashboardData(response.data.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today')
      setTodayAttendance(response.data.data)
    } catch (error) {
      console.error('Failed to fetch attendance')
    }
  }

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/check-in')
      toast.success('Checked in successfully!')
      fetchTodayAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/check-out')
      toast.success('Checked out successfully!')
      fetchTodayAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#714B67] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {employee?.firstName} {employee?.lastName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Have a productive day at work</p>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-3">Attendance</h3>
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
                className="bg-white text-[#714B67] px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                Check In
              </button>
            )}
            {todayAttendance?.canCheckOut && (
              <button
                onClick={handleCheckOut}
                className="bg-white text-[#714B67] px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-[#714B67]/20 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">This Month</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Present Days</span>
              <span className="font-medium text-gray-900">{dashboardData?.attendance?.present || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Working Hours</span>
              <span className="font-medium text-gray-900">{dashboardData?.attendance?.totalHours?.toFixed(1) || 0}h</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-[#714B67]/20 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Leave Balance</h3>
          </div>
          <div className="space-y-2">
            {dashboardData?.leaveBalances?.map((balance) => (
              <div key={balance.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {balance.leaveType.replace('_', ' ')}
                </span>
                <span className="font-medium text-gray-900">{balance.remainingDays} days</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-[#714B67]/20 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Recent Payslip</h3>
          </div>
          {dashboardData?.recentPayslips?.[0] ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Period</span>
                <span className="font-medium text-gray-900">{dashboardData.recentPayslips[0].payPeriod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Net Salary</span>
                <span className="font-medium text-gray-900">
                  ₹{parseFloat(dashboardData.recentPayslips[0].netWage).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No payslips yet</p>
          )}
        </div>
      </div>

      {/* Recent Leaves */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h3>
            <button
              onClick={() => navigate('/timeoff/apply')}
              className="text-[#714B67] hover:text-[#5A3C52] text-sm font-medium transition-colors"
            >
              Apply for Leave
            </button>
          </div>
        </div>
        <div className="p-6">
          {dashboardData?.recentLeaves?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentLeaves.slice(0, 3).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{leave.subject}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent leave requests</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard


