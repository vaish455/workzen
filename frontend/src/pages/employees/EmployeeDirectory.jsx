import { useState, useEffect, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { Search, Plus, Grid3x3, List, Briefcase, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/button'
import Badge from '../../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

// Memoized employee card component
const EmployeeCard = memo(({ emp, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8 cursor-pointer hover:shadow-lg hover:border-[#714B67]/20"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
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
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.attendanceStatus === statusFilter)
    }

    return filtered
  }, [employees, searchQuery, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12" style={{ borderWidth: '2px', borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    )
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
              onClick={() => setStatusFilter('PRESENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'PRESENT'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              PRESENT
            </button>
            <button
              onClick={() => setStatusFilter('ON_LEAVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'ON_LEAVE'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ON LEAVE
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
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.todayAttendance?.status === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : emp.todayAttendance?.status === 'ON_LEAVE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {emp.todayAttendance?.status || 'NO RECORD'}
                        </span>
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


