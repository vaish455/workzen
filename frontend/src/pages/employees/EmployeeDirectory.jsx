import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { Search, Plus, Circle, Plane } from 'lucide-react'
import toast from 'react-hot-toast'

const EmployeeDirectory = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchEmployees()
  }, [statusFilter])

  const fetchEmployees = async () => {
    try {
      const params = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      const response = await api.get('/employees', { params })
      setEmployees(response.data.data)
    } catch (error) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
    return fullName.includes(searchLower) || emp.email.toLowerCase().includes(searchLower)
  })

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
          <h1 className="text-2xl font-bold text-gray-800">Employee Directory</h1>
          <p className="text-gray-600">{filteredEmployees.length} employees</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/employees/add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => navigate(`/employees/${emp.id}`)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
          >
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              {getStatusIcon(emp.attendanceStatus)}
            </div>

            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
              {emp.profilePicture ? (
                <img
                  src={emp.profilePicture}
                  alt={`${emp.firstName} ${emp.lastName}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                </div>
              )}
            </div>

            {/* Employee Info */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 text-lg">
                {emp.firstName} {emp.lastName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{emp.user?.role?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500 mt-1">{emp.email}</p>
              
              {/* Status Badge */}
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  emp.user?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {emp.user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
    </div>
  )
}

export default EmployeeDirectory
