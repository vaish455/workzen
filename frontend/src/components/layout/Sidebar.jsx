import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  DollarSign,
  FileText,
  Settings,
} from 'lucide-react'

const Sidebar = ({ isCollapsed }) => {
  const { user } = useAuthStore()

  const getNavigationItems = () => {
    const role = user?.role

    const commonItems = [
      {
        name: 'Dashboard',
        path: role === 'EMPLOYEE' ? '/dashboard/employee' : '/dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER', 'EMPLOYEE'],
      },
      {
        name: 'Employees',
        path: '/employees',
        icon: Users,
        roles: ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'],
      },
    ]

    const roleBasedItems = [
      {
        name: 'Attendance',
        path: role === 'EMPLOYEE' ? '/attendance/my' : '/attendance',
        icon: ClipboardCheck,
        roles: ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER', 'EMPLOYEE'],
      },
      {
        name: 'Time Off',
        path: '/timeoff',
        icon: Calendar,
        roles: ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER', 'EMPLOYEE'],
      },
      {
        name: 'Payroll',
        path: role === 'EMPLOYEE' ? '/payroll/my' : '/payroll',
        icon: DollarSign,
        roles: ['ADMIN', 'PAYROLL_OFFICER', 'EMPLOYEE'],
      },
      {
        name: 'Reports',
        path: '/reports',
        icon: FileText,
        roles: ['ADMIN', 'PAYROLL_OFFICER'],
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        roles: ['ADMIN'],
      },
    ]

    return [...commonItems, ...roleBasedItems].filter((item) =>
      item.roles.includes(role)
    )
  }

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200`}
    >
      <nav className={`p-4 space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
        {getNavigationItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#FFE5EC] text-[#714B67] font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? item.name : ''}
          >
            <div className="flex items-center gap-3 w-full">
              <item.icon className={`w-5 h-5 shrink-0 ${window.location.pathname === item.path ? 'stroke-[2.5]' : ''}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar


