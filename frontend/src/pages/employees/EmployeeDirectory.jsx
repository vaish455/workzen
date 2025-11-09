import { useState, useEffect, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { Search, Plus, Grid3x3, List, Briefcase, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/button'
import Badge from '../../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { CardGridSkeleton } from '../../components/ui/skeletons'

// Memoized employee card component
const EmployeeCard = memo(({ emp, onClick, isReadOnly }) => {
  // Determine status indicator
  const getStatusIndicator = () => {
    if (emp.onLeave || emp.attendanceStatus === 'ON_LEAVE') {
      return { icon: '✈️', color: 'text-blue-600', label: 'On Leave' };
    } else if (emp.isCurrentlyInOffice) {
      return { icon: '🟢', color: 'text-green-600', label: 'In Office' };
    } else if (emp.attendanceStatus === 'PRESENT') {
      return { icon: '🟡', color: 'text-yellow-600', label: 'Checked Out' };
    } else {
      return { icon: '🟡', color: 'text-yellow-600', label: 'Absent' };
    }
  };

  const status = getStatusIndicator();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={isReadOnly ? undefined : onClick}
      className={`bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8 ${
        isReadOnly ? '' : 'cursor-pointer hover:shadow-lg hover:border-[#714B67]/20'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar with Status Badge */}
        <div className="relative">
          {emp.profilePicture ? (
            <img
              src={emp.profilePicture}
              alt={`${emp.firstName} ${emp.lastName}`}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute -top-1 -right-1 text-xl" title={status.label}>
            {status.icon}
          </div>
        </div>
        
        {/* Employee Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {emp.firstName} {emp.lastName}
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{emp.user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{emp.email}</span>
            </div>
            {/* Status Label */}
            {/* <div className={`flex items-center gap-2 text-sm font-medium ${status.color}`}>
              <span>{status.label}</span>
            </div> */}
          </div>
        </div>
      </div>
    </motion.div>
  )
})

EmployeeCard.displayName = 'EmployeeCard'

const EmployeeDirectory = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  
  // Check if user is an employee (read-only mode)
  const isReadOnly = user?.role === 'EMPLOYEE'

  useEffect(() => {
    fetchEmployees()
  }, []) // Only fetch once on mount

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees')
      setEmployees(response.data.data)
    } catch (error) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  // Memoized filtered employees
  const filteredEmployees = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()
    let filtered = employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      return fullName.includes(searchLower) || emp.email.toLowerCase().includes(searchLower)
    })

    // Apply status filter
    if (statusFilter === 'IN_OFFICE') {
      filtered = filtered.filter(emp => emp.isCurrentlyInOffice)
    } else if (statusFilter === 'ON_LEAVE') {
      filtered = filtered.filter(emp => emp.onLeave || emp.attendanceStatus === 'ON_LEAVE')
    } else if (statusFilter === 'ABSENT') {
      filtered = filtered.filter(emp => 
        !emp.isCurrentlyInOffice && 
        !emp.onLeave && 
        emp.attendanceStatus !== 'ON_LEAVE' &&
        emp.attendanceStatus !== 'PRESENT'
      )
    }

    return filtered
  }, [employees, searchQuery, statusFilter])

  if (loading) {
    return <CardGridSkeleton count={9} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-600 mt-1">{filteredEmployees.length} employees found</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/employees/add')}
            className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#714B67] text-white hover:bg-[#5A3C52] focus-visible:ring-[#714B67] shadow-sm px-6 py-3 text-lg gap-2.5"
          >
            <span className="flex items-center">
              <Plus className="w-5 h-5" />
            </span>
            Add Employee
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                className="w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed border-gray-300 focus:border-[#714B67] focus:ring-[#714B67]/20 pl-10"
                placeholder="Search by name, email, or position..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('IN_OFFICE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                statusFilter === 'IN_OFFICE'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🟢</span> In Office
            </button>
            <button
              onClick={() => setStatusFilter('ON_LEAVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                statusFilter === 'ON_LEAVE'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>✈️</span> On Leave
            </button>
            <button
              onClick={() => setStatusFilter('ABSENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                statusFilter === 'ABSENT'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🟡</span> Absent
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border-l border-gray-200 pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEmployees.map((emp, index) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EmployeeCard 
                  emp={emp}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  isReadOnly={isReadOnly}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((emp, index) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      onClick={isReadOnly ? undefined : () => navigate(`/employees/${emp.id}`)}
                      className={isReadOnly ? '' : 'hover:bg-gray-50 transition-colors cursor-pointer'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {emp.profilePicture ? (
                              <img
                                src={emp.profilePicture}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#714B67] to-[#5A3C52] flex items-center justify-center text-white font-medium text-sm">
                                {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                              </div>
                            )}
                            {/* Status Badge */}
                            <div className="absolute -top-1 -right-1 text-sm" title={
                              emp.onLeave || emp.attendanceStatus === 'ON_LEAVE' ? 'On Leave' :
                              emp.isCurrentlyInOffice ? 'In Office' :
                              emp.attendanceStatus === 'PRESENT' ? 'Checked Out' : 'Absent'
                            }>
                              {emp.onLeave || emp.attendanceStatus === 'ON_LEAVE' ? '✈️' :
                               emp.isCurrentlyInOffice ? '🟢' : '🟡'}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {emp.firstName} {emp.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{emp.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{emp.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{emp.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {emp.onLeave || emp.attendanceStatus === 'ON_LEAVE' ? '✈️' :
                             emp.isCurrentlyInOffice ? '🟢' : '🟡'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.onLeave || emp.attendanceStatus === 'ON_LEAVE'
                              ? 'bg-blue-100 text-blue-800'
                              : emp.isCurrentlyInOffice
                              ? 'bg-green-100 text-green-800'
                              : emp.attendanceStatus === 'PRESENT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {emp.onLeave || emp.attendanceStatus === 'ON_LEAVE' ? 'On Leave' :
                             emp.isCurrentlyInOffice ? 'In Office' :
                             emp.attendanceStatus === 'PRESENT' ? 'Checked Out' : 'Absent'}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No employees found</p>
        </div>
      )}
    </div>
  )
}

export default EmployeeDirectory


