import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { Users, ClipboardCheck, Calendar, DollarSign, TrendingUp, UserCheck, CircleAlert, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardSkeleton } from '../../components/ui/skeletons'

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
    return <DashboardSkeleton />
  }

  // Mock weekly attendance data - replace with real data from API
  const weeklyData = [
    { day: 'Mon', attendance: 0 },
    { day: 'Tue', attendance: 0 },
    { day: 'Wed', attendance: 0 },
    { day: 'Thu', attendance: 0 },
    { day: 'Fri', attendance: 1 },
  ]

  const totalEmployees = stats?.employees?.total || 0
  const presentToday = stats?.attendance?.present || 0
  const pendingLeaves = stats?.leaves?.pending || 0
  const monthlyPayroll = stats?.payroll?.totalCost || 0

  const presentPercentage = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
  const onLeavePercentage = totalEmployees > 0 ? Math.round(((stats?.attendance?.onLeave || 0) / totalEmployees) * 100) : 0
  const absentPercentage = totalEmployees > 0 ? Math.round(((stats?.attendance?.absent || 0) / totalEmployees) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Good Morning, {user?.firstName || user?.role}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your company today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8 h-full border-2 border-transparent hover:border-[#714B67]/20 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">+12%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Employees</h3>
          <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8 h-full border-2 border-transparent hover:border-[#714B67]/20 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">+5%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Present Today</h3>
          <p className="text-3xl font-bold text-gray-900">{presentToday}</p>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8 h-full border-2 border-transparent hover:border-[#714B67]/20 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">-3%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Pending Leaves</h3>
          <p className="text-3xl font-bold text-gray-900">{pendingLeaves}</p>
        </div>

        {/* Monthly Payroll */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8 h-full border-2 border-transparent hover:border-[#714B67]/20 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">+8%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Monthly Payroll</h3>
          <p className="text-3xl font-bold text-gray-900">₹{monthlyPayroll.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts and Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
              <p className="text-sm text-gray-600 mt-1">Last 5 working days</p>
            </div>
            <span className="inline-flex items-center gap-1.5 font-medium rounded-full border bg-green-100 text-green-800 border-green-200 text-sm px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="attendance" fill="#714B67" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Attendance</h3>
          <div className="space-y-4">
            {/* Present */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-gray-900">{presentToday}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 font-medium rounded-full border bg-green-100 text-green-800 border-green-200 text-sm px-2.5 py-1">
                {presentPercentage}%
              </span>
            </div>

            {/* On Leave */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.attendance?.onLeave || 0}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-200 text-sm px-2.5 py-1">
                {onLeavePercentage}%
              </span>
            </div>

            {/* Absent */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <CircleAlert className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.attendance?.absent || 0}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200 text-sm px-2.5 py-1">
                {absentPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Payroll Status */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payroll Status</h3>
              <p className="text-sm text-gray-600 mt-1">Current month overview</p>
            </div>
            <button className="text-[#714B67] hover:text-[#5A3C52] text-sm font-medium flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Total Payslips</span>
              <span className="text-xl font-bold text-gray-900">{stats?.payroll?.totalPayslips || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Draft</span>
                <span className="inline-flex items-center gap-1.5 font-medium rounded-full border bg-amber-100 text-amber-800 border-amber-200 text-xs px-2 py-0.5">
                  {stats?.payroll?.draftPayslips || 0}
                </span>
              </div>
              <span className="text-lg font-semibold text-orange-600">{stats?.payroll?.draftPayslips || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Completed</span>
                <span className="inline-flex items-center gap-1.5 font-medium rounded-full border bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5">
                  {stats?.payroll?.donePayslips || 0}
                </span>
              </div>
              <span className="text-lg font-semibold text-green-600">{stats?.payroll?.donePayslips || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-[#FFE5EC] hover:bg-[#FFD1DC] rounded-xl flex items-center justify-between transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#714B67] rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">Add New Employee</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#714B67] transition-colors" />
            </button>
            
            <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl flex items-center justify-between transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">Mark Attendance</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </button>
            
            <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center justify-between transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">Process Payroll</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


