import { useState, useEffect } from 'react'
import { X, DollarSign, Plus, Trash2 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SalaryStructureModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [wage, setWage] = useState('')
  const [pfRate, setPfRate] = useState('12')
  const [professionalTax, setProfessionalTax] = useState('200')
  const [components, setComponents] = useState([
    { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: '50', isBasic: true },
    { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: '50' },
    { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: '4167' },
    { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: '8.33' },
    { name: 'Leave Travel Allowance', computationType: 'PERCENTAGE_OF_WAGE', value: '8.33' },
  ])

  useEffect(() => {
    if (isOpen && employee?.salaryStructure) {
      const salary = employee.salaryStructure
      setWage(salary.wage.toString())
      setPfRate(salary.pfRate?.toString() || '12')
      setProfessionalTax(salary.professionalTax?.toString() || '200')
      
      if (salary.components && salary.components.length > 0) {
        setComponents(salary.components.map(comp => ({
          name: comp.name,
          computationType: comp.computationType,
          value: comp.computationType === 'FIXED' ? comp.amount.toString() : comp.value.toString(),
          isBasic: comp.name === 'Basic'
        })))
      }
    }
  }, [isOpen, employee])

  const calculateAmount = (component, wageAmount, basicAmount) => {
    const value = parseFloat(component.value) || 0
    const wageNum = parseFloat(wageAmount) || 0

    switch (component.computationType) {
      case 'PERCENTAGE_OF_WAGE':
        return (wageNum * value) / 100
      case 'PERCENTAGE_OF_BASIC':
        return (basicAmount * value) / 100
      case 'FIXED_AMOUNT':
        return value
      default:
        return 0
    }
  }

  const getBasicAmount = () => {
    const wageNum = parseFloat(wage) || 0
    const basicComp = components.find(c => c.isBasic || c.name === 'Basic')
    if (!basicComp) return 0
    return calculateAmount(basicComp, wageNum, 0)
  }

  const getTotalComponents = () => {
    const wageNum = parseFloat(wage) || 0
    const basicAmount = getBasicAmount()
    
    let total = 0
    components.forEach(comp => {
      total += calculateAmount(comp, wageNum, basicAmount)
    })
    
    return total
  }

  const getFixedAllowance = () => {
    const wageNum = parseFloat(wage) || 0
    const total = getTotalComponents()
    const remaining = wageNum - total
    return remaining > 0 ? remaining : 0
  }

  const addComponent = () => {
    setComponents([...components, {
      name: '',
      computationType: 'FIXED_AMOUNT',
      value: '0'
    }])
  }

  const removeComponent = (index) => {
    if (components[index].isBasic) {
      toast.error('Cannot remove Basic component')
      return
    }
    setComponents(components.filter((_, i) => i !== index))
  }

  const updateComponent = (index, field, value) => {
    const updated = [...components]
    updated[index] = { ...updated[index], [field]: value }
    setComponents(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const wageNum = parseFloat(wage)
    if (!wageNum || wageNum <= 0) {
      toast.error('Please enter a valid wage amount')
      return
    }

    const basicAmount = getBasicAmount()
    const totalComponentsAmount = getTotalComponents()
    const fixedAllowance = getFixedAllowance()

    // Prepare components with calculated amounts
    const salaryComponents = components.map(comp => ({
      name: comp.name,
      computationType: comp.computationType,
      value: comp.computationType === 'FIXED_AMOUNT' ? '0' : comp.value,
      amount: calculateAmount(comp, wageNum, basicAmount).toFixed(2)
    }))

    // Add Fixed Allowance
    if (fixedAllowance > 0) {
      salaryComponents.push({
        name: 'Fixed Allowance',
        computationType: 'FIXED_AMOUNT',
        value: '0',
        amount: fixedAllowance.toFixed(2)
      })
    }

    const salaryData = {
      wage: wageNum,
      pfRate: parseFloat(pfRate) || 12,
      professionalTax: parseFloat(professionalTax) || 200,
      components: salaryComponents
    }

    setLoading(true)
    try {
      await api.put(`/employees/${employee.id}/salary`, salaryData)
      toast.success('Salary structure updated successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update salary structure')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const wageNum = parseFloat(wage) || 0
  const basicAmount = getBasicAmount()
  const totalComponents = getTotalComponents()
  const fixedAllowance = getFixedAllowance()
  const finalTotal = totalComponents + fixedAllowance

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Salary Structure - {employee?.firstName} {employee?.lastName}
              </h2>
              <p className="text-sm text-gray-600">{employee?.employeeCode || employee?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Wage */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Wage (Fixed) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={wage}
                onChange={(e) => setWage(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                placeholder="50000"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Salary Components */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Salary Components</h3>
              <button
                type="button"
                onClick={addComponent}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Component
              </button>
            </div>

            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4 items-end">
                    {/* Component Name */}
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Component Name
                      </label>
                      <input
                        type="text"
                        value={component.name}
                        onChange={(e) => updateComponent(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Allowance name"
                        required
                        disabled={component.isBasic}
                      />
                    </div>

                    {/* Computation Type */}
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Computation Type
                      </label>
                      <select
                        value={component.computationType}
                        onChange={(e) => updateComponent(index, 'computationType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={component.isBasic}
                      >
                        <option value="PERCENTAGE_OF_WAGE">% of Wage</option>
                        <option value="PERCENTAGE_OF_BASIC">% of Basic</option>
                        <option value="FIXED_AMOUNT">Fixed Amount</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {component.computationType === 'FIXED_AMOUNT' ? 'Amount' : 'Percentage'}
                      </label>
                      <input
                        type="number"
                        value={component.value}
                        onChange={(e) => updateComponent(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Calculated Amount */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calculated
                      </label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-green-700">
                        ₹{calculateAmount(component, wageNum, basicAmount).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1">
                      {!component.isBasic && (
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Fixed Allowance (Auto-calculated) */}
              {fixedAllowance > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Fixed Allowance (Auto-calculated)</p>
                      <p className="text-sm text-gray-600">Balance amount to match wage</p>
                    </div>
                    <div className="text-xl font-bold text-green-700">
                      ₹{fixedAllowance.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Salary Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Wage:</span>
                <span className="font-semibold">₹{wageNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Components:</span>
                <span className="font-semibold">₹{finalTotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Difference:</span>
                  <span className={`font-bold ${finalTotal > wageNum ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{Math.abs(wageNum - finalTotal).toFixed(2)}
                  </span>
                </div>
                {finalTotal > wageNum && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Total exceeds wage! Adjust components.</p>
                )}
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PF Rate (%)
              </label>
              <input
                type="number"
                value={pfRate}
                onChange={(e) => setPfRate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="12"
                required
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Tax (₹)
              </label>
              <input
                type="number"
                value={professionalTax}
                onChange={(e) => setProfessionalTax(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="200"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || finalTotal > wageNum}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Salary Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SalaryStructureModal
