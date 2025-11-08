import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Edit } from 'lucide-react'
import SalaryStructureModal from '../../components/employees/SalaryStructureModal'

const EmployeeDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState(null)
  const [showSalaryModal, setShowSalaryModal] = useState(false)

  useEffect(() => {
    fetchEmployeeDetails()
  }, [id])

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get(`/employees/${id}`)
      setEmployee(response.data.data)
    } catch (error) {
      toast.error('Failed to load employee details')
      navigate('/employees')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  const canViewSalary = ['ADMIN', 'PAYROLL_OFFICER'].includes(user?.role) || user?.employee?.id === id
  const canEditSalary = ['ADMIN', 'PAYROLL_OFFICER'].includes(user?.role)

  const handleSalaryUpdate = () => {
    fetchEmployeeDetails()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Details</h1>
          <p className="text-gray-600">View employee information</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {employee.profilePicture ? (
            <img
              src={employee.profilePicture}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{employee.user?.role?.replace('_', ' ')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.dateOfJoining && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {new Date(employee.dateOfJoining).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                employee.user?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Login ID</p>
            <p className="font-medium">{employee.user?.loginId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Employee Code</p>
            <p className="font-medium">{employee.employeeCode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="font-medium">
              {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-medium">{employee.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Marital Status</p>
            <p className="font-medium">{employee.maritalStatus || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nationality</p>
            <p className="font-medium">{employee.nationality || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">{employee.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Bank & Tax Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank & Tax Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Bank Name</p>
            <p className="font-medium">{employee.bankName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Number</p>
            <p className="font-medium">{employee.accountNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">IFSC Code</p>
            <p className="font-medium">{employee.ifscCode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">PAN Number</p>
            <p className="font-medium">{employee.panNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">UAN Number</p>
            <p className="font-medium">{employee.uanNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Salary Information - Only visible to Admin/Payroll/Self */}
      {canViewSalary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Salary Information
            </h3>
            {canEditSalary && (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {employee.salaryStructure ? 'Edit Salary' : 'Add Salary'}
              </button>
            )}
          </div>

          {employee.salaryStructure ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Wage</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{parseFloat(employee.salaryStructure.wage).toLocaleString()}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Salary Components</h4>
                <div className="space-y-2">
                  {employee.salaryStructure.components?.map((component) => (
                    <div key={component.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-gray-700">{component.name}</span>
                      <span className="font-medium">₹{parseFloat(component.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">PF Rate</span>
                  <span className="font-medium">{employee.salaryStructure.pfRate}%</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Professional Tax</span>
                  <span className="font-medium">₹{employee.salaryStructure.professionalTax}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No salary structure defined yet</p>
              {canEditSalary && (
                <button
                  onClick={() => setShowSalaryModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Salary Structure
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leave Balance */}
      {employee.leaveBalances && employee.leaveBalances.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Balance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employee.leaveBalances.map((balance) => (
              <div key={balance.id} className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {balance.leaveType.replace('_', ' ')}
                </p>
                <p className="text-2xl font-bold text-gray-800">{balance.remainingDays}</p>
                <p className="text-sm text-gray-500">
                  of {balance.totalDays} days
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Salary Structure Modal */}
      <SalaryStructureModal
        isOpen={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        employee={employee}
        onSuccess={handleSalaryUpdate}
      />
    </div>
  )
}

export default EmployeeDetails
