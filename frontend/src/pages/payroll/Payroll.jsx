import { useState, useEffect, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Play, Search, AlertCircle, TrendingUp, DollarSign, FileText, Users } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

// Memoized payslip row component
const PayslipRow = memo(({ payslip, onClick, index }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {payslip.payPeriod}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {payslip.employee.profilePicture ? (
            <img
              src={payslip.employee.profilePicture}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#714B67] to-[#5A3C52] flex items-center justify-center text-white text-sm font-medium">
              {payslip.employee.firstName?.charAt(0)}{payslip.employee.lastName?.charAt(0)}
            </div>
          )}
          <span className="text-sm text-gray-900">
            {payslip.employee.firstName} {payslip.employee.lastName}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{parseFloat(payslip.employeeCost).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{parseFloat(payslip.basicWage).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{parseFloat(payslip.grossWage).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
        ₹{parseFloat(payslip.netWage).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          payslip.status === 'DONE' ? 'bg-green-100 text-green-800' :
          payslip.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {payslip.status}
        </span>
      </td>
    </motion.tr>
  )
})

PayslipRow.displayName = 'PayslipRow'

const Payroll = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payrollData, setPayrollData] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [statusFilter, setStatusFilter] = useState('all')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchPayrollData()
  }, [selectedMonth, statusFilter])

  const fetchPayrollData = async () => {
    try {
      setLoading(true)
      const [year, month] = selectedMonth.split('-')
      const params = { month, year }
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase()
      }
      
      const response = await api.get('/payroll/payslips', { params })
      setPayrollData(response.data.data)
    } catch (error) {
      toast.error('Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePayrun = async () => {
    if (!confirm('Generate payslips for all employees for this month?')) return
    
    setGenerating(true)
    try {
      const [year, month] = selectedMonth.split('-')
      await api.post('/payroll/payrun', { month: parseInt(month), year: parseInt(year) })
      toast.success('Payrun generated successfully')
      fetchPayrollData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payrun')
    } finally {
      setGenerating(false)
    }
  }

  // Filter payslips based on status
  const filteredPayslips = useMemo(() => {
    if (!payrollData?.payslips) return []
    
    if (statusFilter === 'all') {
      return payrollData.payslips
    }
    
    return payrollData.payslips.filter(
      payslip => payslip.status.toLowerCase() === statusFilter.toLowerCase()
    )
  }, [payrollData, statusFilter])

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
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">Manage employee payslips and payroll</p>
        </div>
        <button
          onClick={handleGeneratePayrun}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#714B67] text-white rounded-xl hover:bg-[#5A3C52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {generating ? 'Generating...' : 'Run Payroll'}
        </button>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-xl p-4 bg-blue-50 border border-blue-200 flex items-start gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Before Running Payroll</h4>
          <p className="text-sm text-gray-600 mt-1">
            Make sure all employees have their salary structures defined. You can add/edit salary structures from the Employee Details page.
            {payrollData?.statistics?.totalPayslips === 0 && (
              <span className="block mt-1 font-medium">
                → Go to <a href="/employees" className="underline text-[#714B67] hover:text-[#5A3C52]">Employees</a>, select an employee, and click "Add Salary" to get started.
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Warnings */}
      {payrollData?.statistics?.draftCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-xl p-4 bg-yellow-50 border border-yellow-200 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-yellow-900">Draft Payslips</h4>
            <p className="text-sm text-yellow-700 mt-1">
              You have {payrollData.statistics.draftCount} draft payslip{payrollData.statistics.draftCount > 1 ? 's' : ''} pending validation
            </p>
          </div>
        </motion.div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Payslips</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {payrollData?.statistics?.totalPayslips || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Employee Cost</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{(payrollData?.statistics?.totalEmployeeCost || 0).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Gross Wage</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{(payrollData?.statistics?.totalGrossWage || 0).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Net Wage</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₹{(payrollData?.statistics?.totalNetWage || 0).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="flex gap-4"
      >
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </motion.div>

      {/* Payslips Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Wage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Wage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Wage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">No payslips found</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedMonth
                            ? 'No payslips for the selected period'
                            : 'Select a month and click "Run Payroll" to generate payslips'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((payslip, index) => (
                  <PayslipRow
                    key={payslip.id}
                    payslip={payslip}
                    index={index}
                    onClick={() => navigate(`/payroll/${payslip.id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Payroll


