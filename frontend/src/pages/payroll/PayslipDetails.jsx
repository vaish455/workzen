import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Check, X, Printer, FileText } from 'lucide-react'

const PayslipDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [payslip, setPayslip] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const canManage = ['ADMIN', 'PAYROLL_OFFICER'].includes(user?.role)

  useEffect(() => {
    fetchPayslipDetails()
  }, [id])

  const fetchPayslipDetails = async () => {
    try {
      const response = await api.get(`/payroll/payslips/${id}`)
      setPayslip(response.data.data)
    } catch (error) {
      toast.error('Failed to load payslip details')
      navigate('/payroll')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!confirm('Validate this payslip? This action cannot be undone.')) return
    
    setActionLoading(true)
    try {
      await api.put(`/payroll/payslips/${id}/validate`)
      toast.success('Payslip validated successfully')
      fetchPayslipDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate payslip')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this payslip?')) return
    
    setActionLoading(true)
    try {
      await api.put(`/payroll/payslips/${id}/cancel`)
      toast.success('Payslip cancelled')
      fetchPayslipDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel payslip')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!payslip) return null

  const allowances = payslip.components.filter(c => !c.isDeduction)
  const deductions = payslip.components.filter(c => c.isDeduction)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/payroll')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payslip Details</h1>
            <p className="text-gray-600">{payslip.payPeriod}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          {canManage && payslip.status === 'DRAFT' && (
            <>
              <button
                onClick={handleValidate}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Validate
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payslip Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">PAYSLIP</h2>
              <p className="text-gray-600 mt-1">Period: {payslip.payPeriod}</p>
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                payslip.status === 'DONE' ? 'bg-green-100 text-green-800' :
                payslip.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {payslip.status}
              </span>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Employee Details</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium">
                  {payslip.employee.firstName} {payslip.employee.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{payslip.employee.email}</p>
              </div>
              {payslip.employee.employeeCode && (
                <div>
                  <span className="text-sm text-gray-600">Employee Code:</span>
                  <p className="font-medium">{payslip.employee.employeeCode}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Pay Period</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">From:</span>
                <p className="font-medium">{new Date(payslip.periodStart).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">To:</span>
                <p className="font-medium">{new Date(payslip.periodEnd).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Worked Days:</span>
                <p className="font-medium">{payslip.workedDays} / {payslip.workingDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Structure</h3>
          
          {/* Earnings */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3 bg-gray-50 px-4 py-2 rounded">
              EARNINGS
            </h4>
            <div className="space-y-2">
              {allowances.map((component) => (
                <div key={component.id} className="flex justify-between items-center px-4 py-2">
                  <span className="text-gray-700">{component.name}</span>
                  <span className="font-medium">₹{parseFloat(component.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t-2 border-gray-300 pt-2 px-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Gross Earnings</span>
                  <span>₹{parseFloat(payslip.grossWage).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3 bg-gray-50 px-4 py-2 rounded">
              DEDUCTIONS
            </h4>
            <div className="space-y-2">
              {deductions.map((component) => (
                <div key={component.id} className="flex justify-between items-center px-4 py-2">
                  <span className="text-gray-700">{component.name}</span>
                  <span className="font-medium text-red-600">
                    -₹{parseFloat(component.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t-2 border-gray-300 pt-2 px-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Deductions</span>
                  <span className="text-red-600">
                    -₹{parseFloat(payslip.totalDeductions).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">NET PAY</span>
            <span className="text-3xl font-bold text-blue-600">
              ₹{parseFloat(payslip.netWage).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            This is a system-generated payslip and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PayslipDetails
