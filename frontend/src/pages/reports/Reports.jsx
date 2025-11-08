import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Download, Loader, Printer } from 'lucide-react'

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    year: new Date().getFullYear(),
  })
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees')
      setEmployees(response.data.data)
    } catch (error) {
      console.error('Failed to fetch employees')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGenerateReport = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.get('/dashboard/salary-statement', {
        params: {
          employeeId: formData.employeeId,
          year: formData.year,
        },
      })
      setReportData(response.data.data)
      toast.success('Report generated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Salary Statement Report</h1>
        <p className="text-gray-600">Generate annual salary statements for employees</p>
      </div>

      {/* Report Generation Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:hidden">
        <form onSubmit={handleGenerateReport} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee *
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.user?.role?.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Report Display */}
      {reportData && (
        <>
          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Report Header */}
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ANNUAL SALARY STATEMENT
              </h2>
              <p className="text-gray-600">Financial Year: {reportData.year}</p>
            </div>

            {/* Employee Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {reportData.employee.firstName} {reportData.employee.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Login ID</p>
                  <p className="font-medium">{reportData.employee.loginId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{reportData.employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee Code</p>
                  <p className="font-medium">{reportData.employee.employeeCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Gross Salary</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Deductions</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.payslips.map((payslip) => (
                      <tr key={payslip.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{payslip.payPeriod}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ₹{parseFloat(payslip.grossWage).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          -₹{parseFloat(payslip.totalDeductions).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                          ₹{parseFloat(payslip.netWage).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">YEARLY TOTAL</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                        ₹{reportData.yearlyTotals.grossWage.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                        -₹{reportData.yearlyTotals.totalDeductions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                        ₹{reportData.yearlyTotals.netWage.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Annual Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Gross Earnings</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{reportData.yearlyTotals.grossWage.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-600">
                    -₹{reportData.yearlyTotals.totalDeductions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Net Salary</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{reportData.yearlyTotals.netWage.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                This is a system-generated statement and does not require a signature.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an employee and year to generate report</p>
        </div>
      )}
    </div>
  )
}

export default Reports
