import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Edit, User, CreditCard, Building2 } from 'lucide-react'
import SalaryStructureModal from '../../components/employees/SalaryStructureModal'
import { motion } from 'framer-motion'
import { DetailsSkeleton } from '../../components/ui/skeletons'

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
    return <DetailsSkeleton />
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-gray-600 mt-1">View employee information</p>
        </div>
      </div>

      {/* Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex items-start gap-6">
          {employee.profilePicture ? (
            <img
              src={employee.profilePicture}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-24 h-24 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#714B67]/20">
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{employee.user?.role?.replace('_', ' ')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-[#714B67]" />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-[#714B67]" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.dateOfJoining && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-[#714B67]" />
                  <span>Joined: {new Date(employee.dateOfJoining).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                employee.user?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Login ID</p>
            <p className="font-medium text-gray-900">{employee.user?.loginId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Employee Code</p>
            <p className="font-medium text-gray-900">{employee.employeeCode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
            <p className="font-medium text-gray-900">
              {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Gender</p>
            <p className="font-medium text-gray-900">{employee.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Marital Status</p>
            <p className="font-medium text-gray-900">{employee.maritalStatus || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Nationality</p>
            <p className="font-medium text-gray-900">{employee.nationality || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">Address</p>
            <p className="font-medium text-gray-900">{employee.address || 'N/A'}</p>
          </div>
        </div>
      </motion.div>

      {/* Bank & Tax Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Bank & Tax Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Bank Name</p>
            <p className="font-medium text-gray-900">{employee.bankName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Account Number</p>
            <p className="font-medium text-gray-900">{employee.accountNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">IFSC Code</p>
            <p className="font-medium text-gray-900">{employee.ifscCode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">PAN Number</p>
            <p className="font-medium text-gray-900">{employee.panNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">UAN Number</p>
            <p className="font-medium text-gray-900">{employee.uanNumber || 'N/A'}</p>
          </div>
        </div>
      </motion.div>

      {/* Salary Information - Only visible to Admin/Payroll/Self */}
      {canViewSalary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Salary Information</h3>
            </div>
            {canEditSalary && (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#714B67] text-white font-medium rounded-lg hover:bg-[#5A3C52] transition-all shadow-sm"
              >
                <Edit className="w-4 h-4" />
                {employee.salaryStructure ? 'Edit Salary' : 'Add Salary'}
              </button>
            )}
          </div>

          {employee.salaryStructure ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-1">Monthly Wage</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{parseFloat(employee.salaryStructure.wage).toLocaleString()}
                </p>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Salary Components</h4>
                <div className="space-y-3">
                  {employee.salaryStructure.components?.map((component) => (
                    <div key={component.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-700 font-medium">{component.name}</span>
                      <span className="font-semibold text-gray-900">₹{parseFloat(component.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">PF Rate</span>
                  <p className="text-xl font-bold text-gray-900 mt-1">{employee.salaryStructure.pfRate}%</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">Professional Tax</span>
                  <p className="text-xl font-bold text-gray-900 mt-1">₹{employee.salaryStructure.professionalTax}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No salary structure defined yet</p>
              {canEditSalary && (
                <button
                  onClick={() => setShowSalaryModal(true)}
                  className="px-6 py-2.5 bg-[#714B67] text-white font-medium rounded-lg hover:bg-[#5A3C52] transition-all shadow-sm"
                >
                  Add Salary Structure
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Leave Balance */}
      {employee.leaveBalances && employee.leaveBalances.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Leave Balance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employee.leaveBalances.map((balance) => (
              <div key={balance.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#714B67]/30 transition-all hover:shadow-md">
                <p className="text-sm text-gray-600 mb-2">
                  {balance.leaveType.replace('_', ' ')}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{balance.remainingDays}</p>
                <p className="text-sm text-gray-500">
                  of {balance.totalDays} days
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Salary Structure Modal */}
      <SalaryStructureModal
        isOpen={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        employee={employee}
        onSuccess={handleSalaryUpdate}
      />
    </motion.div>
  )
}

export default EmployeeDetails


