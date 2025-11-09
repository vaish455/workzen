import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Menu, X, User, LogOut, Circle, Clock, Bell, ChevronDown } from 'lucide-react'
import Badge from '../ui/badge'

const Navbar = ({ isSidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, company, employee, logout } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAttendanceMenu, setShowAttendanceMenu] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only fetch attendance for employees
    if (user?.role !== 'EMPLOYEE') return

    const fetchTodayAttendance = async () => {
      try {
        const response = await api.get('/attendance/today')
        setTodayAttendance(response.data.data)
      } catch (error) {
        console.error('Failed to fetch attendance')
      }
    }

    fetchTodayAttendance()
    
    // Refresh attendance every 30 seconds
    const interval = setInterval(fetchTodayAttendance, 30000)
    return () => clearInterval(interval)
  }, [user?.role]) // Only re-run when user role changes

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-in')
      toast.success('Checked in successfully!')
      // Re-fetch attendance after check-in
      const response = await api.get('/attendance/today')
      setTodayAttendance(response.data.data)
      setShowAttendanceMenu(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-out')
      toast.success('Checked out successfully!')
      // Re-fetch attendance after check-out
      const response = await api.get('/attendance/today')
      setTodayAttendance(response.data.data)
      setShowAttendanceMenu(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out')
    } finally {
      setLoading(false)
    }
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('dashboard')) return 'Dashboard'
    if (path.includes('employees')) return 'Employees'
    if (path.includes('attendance')) return 'Attendance'
    if (path.includes('timeoff')) return 'Time Off'
    if (path.includes('payroll')) return 'Payroll'
    if (path.includes('reports')) return 'Reports'
    if (path.includes('settings')) return 'Settings'
    if (path.includes('profile')) return 'My Profile'
    return 'WorkZen'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />
      case 'ON_LEAVE':
        return <span className="text-blue-500 text-lg">✈️</span>
      case 'ABSENT':
        return <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
      default:
        return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'Present'
      case 'ON_LEAVE':
        return 'On Leave'
      case 'ABSENT':
        return 'Not Checked In'
      default:
        return 'Unknown'
    }
  }

  const currentStatus = todayAttendance?.status || 'ABSENT'
  const canCheckIn = todayAttendance?.canCheckIn
  const canCheckOut = todayAttendance?.canCheckOut

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Left: Company Logo/Name and Page Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {company?.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-9 w-9 rounded-lg object-cover shadow-sm" 
              />
            ) : (
              <div 
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold shadow-sm" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {company?.name?.charAt(0) || 'W'}
              </div>
            )}
            <span className="font-semibold text-gray-900">{company?.name || 'WorkZen'}</span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-medium text-gray-700">{getPageTitle()}</h1>
        </div>

        {/* Right: Notifications, Status and Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              className="relative p-2.5 rounded-xl transition-all duration-200 text-gray-400 bg-gray-100 hover:bg-gray-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* Attendance Status Badge - Only for Employees */}
          {user?.role === 'EMPLOYEE' && (
            <div className="relative">
              <button
                onClick={() => setShowAttendanceMenu(!showAttendanceMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
                style={{ 
                  backgroundColor: currentStatus === 'PRESENT' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                  color: currentStatus === 'PRESENT' ? 'var(--color-success)' : '#D97706'
                }}
              >
                {getStatusIcon(currentStatus)}
                <span className="text-sm font-medium">
                  {getStatusText(currentStatus)}
                </span>
              </button>

              {/* Attendance Dropdown */}
              {showAttendanceMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAttendanceMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">Today's Attendance</p>
                      <p className="text-xs mt-1 text-gray-500">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    <div className="px-4 py-3 space-y-2">
                      {todayAttendance?.attendance?.checkIn && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Check In</span>
                          <span className="font-medium text-gray-900">
                            {new Date(todayAttendance.attendance.checkIn).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}

                      {todayAttendance?.attendance?.checkOut && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Check Out</span>
                          <span className="font-medium text-gray-900">
                            {new Date(todayAttendance.attendance.checkOut).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}

                      {todayAttendance?.attendance?.workingHours && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Working Hours</span>
                          <span className="font-medium text-gray-900">
                            {parseFloat(todayAttendance.attendance.workingHours).toFixed(2)}h
                          </span>
                        </div>
                      )}

                      {todayAttendance?.leave && (
                        <div className="rounded-xl p-3 mt-2 bg-purple-50 border border-[#714B67]/30">
                          <p className="text-xs text-[#714B67] font-medium">
                            You are on {todayAttendance.leave.leaveType.replace('_', ' ').toLowerCase()} today
                          </p>
                        </div>
                      )}
                    </div>

                    {(canCheckIn || canCheckOut) && (
                      <div className="px-4 py-2 border-t border-gray-200">
                        {canCheckIn && (
                          <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="w-full px-4 py-2.5 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm"
                            style={{ backgroundColor: 'var(--color-success)' }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
                            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-success)')}
                          >
                            <Clock className="w-4 h-4" />
                            {loading ? 'Checking In...' : 'Check In'}
                          </button>
                        )}

                        {canCheckOut && (
                          <button
                            onClick={handleCheckOut}
                            disabled={loading}
                            className="w-full px-4 py-2.5 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm"
                            style={{ backgroundColor: 'var(--color-error)' }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#DC2626')}
                            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-error)')}
                          >
                            <Clock className="w-4 h-4" />
                            {loading ? 'Checking Out...' : 'Check Out'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              {employee?.profilePicture ? (
                <img
                  src={employee.profilePicture}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-9 h-9 rounded-lg object-cover border-2 border-gray-200"
                />
              ) : (
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200" 
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {employee?.firstName} {employee?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-200">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200 text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  <hr className="border-gray-200 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 flex items-center gap-3 transition-all duration-200 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


