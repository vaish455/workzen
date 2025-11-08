import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Menu, X, User, LogOut, Circle } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, company, employee, logout } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState('ABSENT') // This should come from attendance check

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

  const getStatusIcon = () => {
    switch (attendanceStatus) {
      case 'PRESENT':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />
      case 'ON_LEAVE':
        return <span className="text-blue-500">✈️</span>
      case 'ABSENT':
        return <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
      default:
        return <Circle className="w-3 h-3 fill-gray-500 text-gray-500" />
    }
  }

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
          {/* Attendance Status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            {getStatusIcon()}
            <span className="text-sm text-gray-600 capitalize">
              {attendanceStatus.toLowerCase().replace('_', ' ')}
            </span>
          </div>

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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
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
