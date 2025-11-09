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
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#714B67] border-t-transparent"></div>
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
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Off Details</h1>
            <p className="text-gray-600 mt-1">View and manage time off request</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canApprove && leave.status === 'PENDING' && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:bg-green-400 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:bg-red-400 flex items-center gap-2 shadow-sm hover:shadow-md"
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
              className="px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 disabled:bg-gray-400 shadow-sm hover:shadow-md"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Leave Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(leave.status)}`}>
                {leave.status}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                {leave.leaveType.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{leave.subject}</h2>
          </div>
        </div>

        {/* Employee Info (for approvers) */}
        {canApprove && leave.employee && (
          <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-3 font-medium">Requested by</p>
            <div className="flex items-center gap-3">
              {leave.employee.profilePicture ? (
                <img
                  src={leave.employee.profilePicture}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center text-white font-medium text-lg shadow-lg shadow-[#714B67]/20">
                  {leave.employee.firstName?.charAt(0)}{leave.employee.lastName?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
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
            <p className="text-sm text-gray-600 mb-2 font-medium">Start Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(leave.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">End Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(leave.endDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">Total Days</p>
            <p className="font-semibold text-gray-900">{leave.totalDays} day(s)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">Applied On</p>
            <p className="font-semibold text-gray-900">
              {new Date(leave.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {leave.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">Description</p>
            <p className="text-gray-900">{leave.description}</p>
          </div>
        )}

        {/* Note */}
        {leave.note && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">Additional Note</p>
            <p className="text-gray-900">{leave.note}</p>
          </div>
        )}

        {/* Certificate */}
        {leave.certificate && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">Medical Certificate</p>
            <a
              href={leave.certificate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <FileText className="w-4 h-4" />
              View Certificate
            </a>
          </div>
        )}

        {/* Rejection Reason */}
        {leave.status === 'REJECTED' && leave.rejectionReason && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium mb-2">Rejection Reason</p>
            <p className="text-red-900">{leave.rejectionReason}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Time Off Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all mb-4 text-gray-900"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:bg-red-400 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
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


