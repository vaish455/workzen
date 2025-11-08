import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { Users, ClipboardCheck, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data.data)
    } catch (error) {
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.employees?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Present Today',
      value: stats?.attendance?.present || 0,
      icon: ClipboardCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Leaves',
      value: stats?.leaves?.pending || 0,
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Monthly Payroll',
      value: `₹${(stats?.payroll?.totalCost || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.role}!</h1>
        <p className="text-gray-600">Here's what's happening with your company today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Present</span>
              <span className="text-green-600 font-semibold">{stats?.attendance?.present || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">On Leave</span>
              <span className="text-blue-600 font-semibold">{stats?.attendance?.onLeave || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Absent</span>
              <span className="text-yellow-600 font-semibold">{stats?.attendance?.absent || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Payslips</span>
              <span className="font-semibold">{stats?.payroll?.totalPayslips || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Draft</span>
              <span className="text-orange-600 font-semibold">{stats?.payroll?.draftPayslips || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="text-green-600 font-semibold">{stats?.payroll?.donePayslips || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats?.leaves?.pending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-800">Action Required</h4>
            <p className="text-sm text-orange-700">
              You have {stats.leaves.pending} pending leave request{stats.leaves.pending > 1 ? 's' : ''} awaiting approval
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
