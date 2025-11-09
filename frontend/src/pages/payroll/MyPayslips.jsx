import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Download } from 'lucide-react'
import { motion } from 'framer-motion'

const MyPayslips = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payslips, setPayslips] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchMyPayslips()
  }, [selectedYear])

  const fetchMyPayslips = async () => {
    try {
      setLoading(true)
      const response = await api.get('/payroll/my-payslips', {
        params: { year: selectedYear },
      })
      setPayslips(response.data.data)
    } catch (error) {
      toast.error('Failed to load payslips')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#714B67] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
          <p className="text-gray-600">View and download your payslips</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </motion.div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payslips.map((payslip, index) => (
          <motion.div
            key={payslip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#714B67]/30 transition-all cursor-pointer"
            onClick={() => navigate(`/payroll/${payslip.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                payslip.status === 'DONE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {payslip.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">{payslip.payPeriod}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gross Salary</span>
                <span className="font-medium text-gray-900">₹{parseFloat(payslip.grossWage).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deductions</span>
                <span className="font-medium text-red-600">
                  -₹{parseFloat(payslip.totalDeductions).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Net Salary</span>
                <span className="text-green-600">₹{parseFloat(payslip.netWage).toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-[#714B67] text-white rounded-xl hover:bg-[#5A3C52] transition-colors text-sm font-medium">
              View Details
            </button>
          </motion.div>
        ))}
      </div>

      {payslips.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center py-12 bg-white rounded-xl border border-gray-200"
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No payslips found for {selectedYear}</p>
          <p className="text-sm text-gray-500 mt-1">Check back later or select a different year</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default MyPayslips


