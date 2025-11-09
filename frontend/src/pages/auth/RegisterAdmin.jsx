import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Building2, Loader } from 'lucide-react'
import Button from '../../components/ui/button'
import { motion } from 'framer-motion'

const RegisterAdmin = () => {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await register({
        companyName: formData.companyName,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      if (result.success) {
        toast.success('Registration successful!')
        navigate('/')
      } else {
        toast.error(result.message || 'Registration failed')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFE5EC] via-[#F3E5F5] to-[#E1F5FE]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl p-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#714B67]/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Company</h1>
          <p className="mt-2 text-gray-600">Create your WorkZen admin account</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium mb-2 text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                placeholder="admin@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                placeholder="Create password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#714B67] text-white font-medium rounded-lg hover:bg-[#5A3C52] focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                Create Admin Account
              </>
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#714B67] hover:text-[#5A3C52] hover:underline">
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default RegisterAdmin



