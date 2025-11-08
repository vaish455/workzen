import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Play, Search, AlertCircle, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

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
          <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-600">Manage employee payslips and payroll</p>
        </div>
        <button
          onClick={handleGeneratePayrun}
          disabled={generating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          {generating ? 'Generating...' : 'Run Payroll'}
        </button>
      </div>

      {/* Warnings */}
      {payrollData?.statistics?.draftCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-800">Draft Payslips</h4>
            <p className="text-sm text-orange-700">
              You have {payrollData.statistics.draftCount} draft payslip{payrollData.statistics.draftCount > 1 ? 's' : ''} pending validation
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Total Payslips</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {payrollData?.statistics?.totalPayslips || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Employee Cost</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{(payrollData?.statistics?.totalEmployeeCost || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Gross Wage</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{(payrollData?.statistics?.totalGrossWage || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Net Wage</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{(payrollData?.statistics?.totalNetWage || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
              {payrollData?.payslips?.map((payslip) => (
                <tr
                  key={payslip.id}
                  onClick={() => navigate(`/payroll/${payslip.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
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
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payslip.status === 'DONE' ? 'bg-green-100 text-green-800' :
                      payslip.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payslip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payrollData?.payslips?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payslips found for this period</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payroll
