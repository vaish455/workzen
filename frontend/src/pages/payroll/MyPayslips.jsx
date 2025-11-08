import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Download } from 'lucide-react'

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Payslips</h1>
          <p className="text-gray-600">View and download your payslips</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payslips.map((payslip) => (
          <div
            key={payslip.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/payroll/${payslip.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                payslip.status === 'DONE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {payslip.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">{payslip.payPeriod}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gross Salary</span>
                <span className="font-medium">₹{parseFloat(payslip.grossWage).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deductions</span>
                <span className="font-medium text-red-600">
                  -₹{parseFloat(payslip.totalDeductions).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Net Salary</span>
                <span className="text-green-600">₹{parseFloat(payslip.netWage).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {payslips.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No payslips found for {selectedYear}</p>
        </div>
      )}
    </div>
  )
}

export default MyPayslips
