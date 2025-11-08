import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Menu, X, User, LogOut, Circle, Clock } from 'lucide-react'

const Navbar = () => {
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
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Left: Company Logo/Name and Page Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="h-8 w-8 rounded" />
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                {company?.name?.charAt(0) || 'W'}
              </div>
            )}
            <span className="font-semibold text-gray-800">{company?.name || 'WorkZen'}</span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-medium text-gray-700">{getPageTitle()}</h1>
        </div>

        {/* Right: Status and Profile */}
        <div className="flex items-center gap-4">
          {/* Attendance Status - Only for Employees */}
          {user?.role === 'EMPLOYEE' && (
            <div className="relative">
              <button
                onClick={() => setShowAttendanceMenu(!showAttendanceMenu)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                {getStatusIcon(currentStatus)}
                <span className="text-sm text-gray-700">
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-800">Today's Attendance</p>
                      <p className="text-xs text-gray-500 mt-1">
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
                          <span className="font-medium text-gray-800">
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
                          <span className="font-medium text-gray-800">
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
                          <span className="font-medium text-gray-800">
                            {parseFloat(todayAttendance.attendance.workingHours).toFixed(2)}h
                          </span>
                        </div>
                      )}

                      {todayAttendance?.leave && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                          <p className="text-xs text-blue-800">
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
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            {loading ? 'Checking In...' : 'Check In'}
                          </button>
                        )}

                        {canCheckOut && (
                          <button
                            onClick={handleCheckOut}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Role Badge - For Admin/HR/Payroll */}
          {['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'].includes(user?.role) && (
            <div className="px-3 py-1 bg-blue-100 rounded-full">
              <span className="text-sm font-medium text-blue-800">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              {employee?.profilePicture ? (
                <img
                  src={employee.profilePicture}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {employee?.firstName} {employee?.lastName}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
