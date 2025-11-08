import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Check, X, FileText, Loader } from 'lucide-react'

const TimeOffDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [leave, setLeave] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const canApprove = ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'].includes(user?.role)
  const canCancel = leave?.status === 'PENDING' && leave?.employee?.id === user?.employee?.id

  useEffect(() => {
    fetchLeaveDetails()
  }, [id])

  const fetchLeaveDetails = async () => {
    try {
      const response = await api.get(`/leaves/${id}`)
      setLeave(response.data.data)
    } catch (error) {
      toast.error('Failed to load time off details')
      navigate('/timeoff')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await api.put(`/leaves/${id}/approve`)
      toast.success('Time off request approved')
      fetchLeaveDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      await api.put(`/leaves/${id}/reject`, { reason: rejectionReason })
      toast.success('Time off request rejected')
      setShowRejectModal(false)
      fetchLeaveDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return
    
    setActionLoading(true)
    try {
      await api.put(`/leaves/${id}/cancel`)
      toast.success('Time off request cancelled')
      fetchLeaveDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!leave) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/timeoff')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Time Off Details</h1>
            <p className="text-gray-600">View and manage time off request</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canApprove && leave.status === 'PENDING' && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Leave Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(leave.status)}`}>
                {leave.status}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {leave.leaveType.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{leave.subject}</h2>
          </div>
        </div>

        {/* Employee Info (for approvers) */}
        {canApprove && leave.employee && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Requested by</p>
            <div className="flex items-center gap-3">
              {leave.employee.profilePicture ? (
                <img
                  src={leave.employee.profilePicture}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {leave.employee.firstName?.charAt(0)}{leave.employee.lastName?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">
                  {leave.employee.firstName} {leave.employee.lastName}
                </p>
                <p className="text-sm text-gray-600">{leave.employee.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="font-medium text-gray-800">
              {new Date(leave.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">End Date</p>
            <p className="font-medium text-gray-800">
              {new Date(leave.endDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Days</p>
            <p className="font-medium text-gray-800">{leave.totalDays} day(s)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Applied On</p>
            <p className="font-medium text-gray-800">
              {new Date(leave.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {leave.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-800">{leave.description}</p>
          </div>
        )}

        {/* Note */}
        {leave.note && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Additional Note</p>
            <p className="text-gray-800">{leave.note}</p>
          </div>
        )}

        {/* Certificate */}
        {leave.certificate && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Medical Certificate</p>
            <a
              href={leave.certificate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Certificate
            </a>
          </div>
        )}

        {/* Rejection Reason */}
        {leave.status === 'REJECTED' && leave.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
            <p className="text-red-800">{leave.rejectionReason}</p>
          </div>
        )}

        {/* Approval Info */}
        {leave.approvedAt && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} on{' '}
              {new Date(leave.approvedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reject Time Off Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeOffDetails
