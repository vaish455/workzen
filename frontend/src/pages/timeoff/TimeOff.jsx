import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Filter } from 'lucide-react'

const TimeOff = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [leaves, setLeaves] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const canApprove = ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'].includes(user?.role)

  useEffect(() => {
    fetchLeaves()
  }, [statusFilter])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const endpoint = canApprove ? '/leaves' : '/leaves/my-leaves'
      const params = statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {}
      
      const response = await api.get(endpoint, { params })
      setLeaves(canApprove ? response.data.data : response.data.data.leaves)
    } catch (error) {
      toast.error('Failed to load time off requests')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'PAID_TIME_OFF':
        return 'text-blue-600'
      case 'SICK_LEAVE':
        return 'text-purple-600'
      case 'UNPAID_LEAVE':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredLeaves = leaves.filter(leave => {
    const searchLower = searchQuery.toLowerCase()
    const subject = leave.subject?.toLowerCase() || ''
    const employeeName = canApprove 
      ? `${leave.employee?.firstName} ${leave.employee?.lastName}`.toLowerCase()
      : ''
    return subject.includes(searchLower) || employeeName.includes(searchLower)
  })

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
          <h1 className="text-2xl font-bold text-gray-800">Time Off Requests</h1>
          <p className="text-gray-600">{filteredLeaves.length} requests</p>
        </div>
        <button
          onClick={() => navigate('/timeoff/apply')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Apply for Time Off
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search time off requests..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredLeaves.map((leave) => (
          <div
            key={leave.id}
            onClick={() => navigate(`/timeoff/${leave.id}`)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {canApprove && leave.employee && (
                    <div className="flex items-center gap-2">
                      {leave.employee.profilePicture ? (
                        <img
                          src={leave.employee.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {leave.employee.firstName?.charAt(0)}{leave.employee.lastName?.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </span>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                  <span className={`text-sm font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                    {leave.leaveType.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">{leave.subject}</h3>
                {leave.description && (
                  <p className="text-gray-600 text-sm mb-3">{leave.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{leave.totalDays} day(s)</span>
                  <span>•</span>
                  <span>Applied on {new Date(leave.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeaves.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No time off requests found</p>
        </div>
      )}
    </div>
  )
}

export default TimeOff
