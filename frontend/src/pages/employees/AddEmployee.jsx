import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader, UserPlus, User, Mail, Phone, Briefcase, Info } from 'lucide-react'

const AddEmployee = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/users', formData)
      toast.success(response.data.message)
      navigate('/employees')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  // No initial loading state needed for a form page
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600 mt-1">Create a new employee account and send credentials</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 transition-all duration-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center shadow-lg shadow-[#714B67]/20">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-600">Enter employee details to create their account</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed border-gray-300 focus:border-[#714B67] focus:ring-[#714B67]/20 pl-10"
                  placeholder="John"
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed border-gray-300 focus:border-[#714B67] focus:ring-[#714B67]/20 pl-10"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed border-gray-300 focus:border-[#714B67] focus:ring-[#714B67]/20 pl-10"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed border-gray-300 focus:border-[#714B67] focus:ring-[#714B67]/20 pl-10"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role / Position
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Briefcase className="w-5 h-5" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full py-2.5 pr-10 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none cursor-pointer pl-11 border-gray-300 focus:border-[#714B67] focus:ring-[#714B67]/20"
                  required
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR_OFFICER">HR Officer</option>
                  <option value="PAYROLL_OFFICER">Payroll Officer</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Automatic Credential Generation</p>
                <p className="text-sm text-blue-700">
                  A unique Login ID will be generated automatically and sent to the employee's email along with a secure temporary password. The employee will be prompted to change their password on first login.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#714B67] text-white hover:bg-[#5A3C52] focus-visible:ring-[#714B67] shadow-sm px-4 py-2.5 text-base gap-2"
            >
              <span className="flex items-center">
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </span>
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300 px-4 py-2.5 text-base gap-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
             
}

export default AddEmployee


