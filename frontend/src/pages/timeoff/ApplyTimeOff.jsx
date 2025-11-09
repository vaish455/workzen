import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload, Loader } from 'lucide-react'

const ApplyTimeOff = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState(null)
  const [formData, setFormData] = useState({
    leaveType: 'PAID_TIME_OFF',
    subject: '',
    description: '',
    startDate: '',
    endDate: '',
    note: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCertificate(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })
      
      if (certificate) {
        submitData.append('certificate', certificate)
      }

      await api.post('/leaves', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      toast.success('Time off request submitted successfully')
      navigate('/timeoff')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/timeoff')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Time Off</h1>
          <p className="text-gray-600 mt-1">Submit a new time off request</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Off Type *
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              required
            >
              <option value="PAID_TIME_OFF">Paid Time Off</option>
              <option value="SICK_LEAVE">Sick Leave</option>
              <option value="UNPAID_LEAVE">Unpaid Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              placeholder="Brief reason for time off"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              placeholder="Detailed description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                required
              />
            </div>
          </div>

          {formData.leaveType === 'SICK_LEAVE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Certificate (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#714B67]/50 transition-all duration-200 bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate-upload"
                />
                <label
                  htmlFor="certificate-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {certificate ? certificate.name : 'Click to upload certificate'}
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG or PDF up to 5MB</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Note
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#714B67] text-white rounded-xl hover:bg-[#5A3C52] transition-all duration-200 disabled:bg-[#714B67]/50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/timeoff')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyTimeOff


