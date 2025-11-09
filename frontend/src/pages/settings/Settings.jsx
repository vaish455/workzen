import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon, Users, Building, Save } from 'lucide-react'
import Button from '../../components/ui/button'
import { ProfileSkeleton } from '../../components/ui/skeletons'

const Settings = () => {
  const { company } = useAuthStore()
  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  })
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (company) {
      setCompanyData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        website: company.website || '',
      })
    }
    fetchUsers()
  }, [company])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data.data)
    } catch (error) {
      console.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value })
  }

  const handleCompanySubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      await api.put(`/companies/${company.id}`, companyData)
      toast.success('Company settings updated successfully')
    } catch (error) {
      toast.error('Failed to update company settings')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/status`, { isActive: !currentStatus })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole })
      toast.success('User role updated successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your company and user settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            {['company', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium transition-colors capitalize flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-[#714B67] text-[#714B67]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'company' && <Building className="w-4 h-4" />}
                {tab === 'users' && <Users className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {/* Company Settings Tab */}
          {activeTab === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={companyData.name}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={companyData.email}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={companyData.phone}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyData.website}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={companyData.address}
                    onChange={handleCompanyChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white text-gray-900"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={submitLoading}
                icon={Save}
              >
                {submitLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.employee?.profilePicture ? (
                              <img
                                src={user.employee.profilePicture}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-[#714B67] to-[#5A3C52] rounded-xl flex items-center justify-center text-white font-medium shadow-sm">
                                {user.employee?.firstName?.charAt(0)}{user.employee?.lastName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.employee?.firstName} {user.employee?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{user.loginId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            className="text-sm rounded-xl px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="HR_OFFICER">HR Officer</option>
                            <option value="PAYROLL_OFFICER">Payroll Officer</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            className="text-sm font-medium hover:underline"
                            style={{
                              color: user.isActive ? '#dc3545' : '#28a745'
                            }}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings


