import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { LogIn, Loader } from 'lucide-react'
import Button from '../../components/ui/button'
import { motion } from 'framer-motion'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(formData.loginId, formData.password)
      
      if (result.success) {
        toast.success('Login successful!')
        navigate('/')
      } else {
        toast.error(result.message || 'Login failed')
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
        className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#714B67]/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WorkZen</h1>
          <p className="mt-2 text-gray-600">Welcome back! Please login to continue</p>
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
            <label htmlFor="loginId" className="block text-sm font-medium mb-2 text-gray-700">
              Login ID
            </label>
            <input
              type="text"
              id="loginId"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
              placeholder="Enter your login ID"
              required
            />
          </div>

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
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#714B67] text-white font-medium rounded-lg hover:bg-[#5A3C52] focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
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
          Don't have an account?{' '}
          <Link to="/register-admin" className="font-medium text-[#714B67] hover:text-[#5A3C52] hover:underline">
            Register as Admin
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login

