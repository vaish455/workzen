import { useState, useEffect } from 'react'
import { X, DollarSign, Plus, Trash2 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SalaryStructureModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [wageType, setWageType] = useState('FIXED') // 'FIXED' or 'HOURLY'
  const [wage, setWage] = useState('')
  const [pfRate, setPfRate] = useState('12')
  const [professionalTax, setProfessionalTax] = useState('200')
  
  // Overtime settings (for FIXED wage type)
  const [overtimeEnabled, setOvertimeEnabled] = useState(false)
  const [standardWorkHoursPerDay, setStandardWorkHoursPerDay] = useState('8')
  const [standardWorkDaysPerMonth, setStandardWorkDaysPerMonth] = useState('30')
  const [overtimeRate, setOvertimeRate] = useState('0')
  
  const [components, setComponents] = useState([
    { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: '50', isBasic: true },
    { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: '50' },
    { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: '0' },
    { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: '8.33' },
    { name: 'Leave Travel Allowance', computationType: 'PERCENTAGE_OF_WAGE', value: '8.33' },
  ])

  useEffect(() => {
    if (isOpen && employee?.salaryStructure) {
      const salary = employee.salaryStructure
      setWageType(salary.wageType || 'FIXED')
      setWage(salary.wage.toString())
      setPfRate(salary.pfRate?.toString() || '12')
      setProfessionalTax(salary.professionalTax?.toString() || '200')
      setOvertimeEnabled(salary.overtimeEnabled || false)
      setStandardWorkHoursPerDay(salary.standardWorkHoursPerDay?.toString() || '8')
      setStandardWorkDaysPerMonth(salary.standardWorkDaysPerMonth?.toString() || '30')
      setOvertimeRate(salary.overtimeRate?.toString() || '0')
      
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
      wageType,
      wage: wageNum,
      pfRate: parseFloat(pfRate) || 12,
      professionalTax: parseFloat(professionalTax) || 200,
      components: salaryComponents,
      standardWorkHoursPerDay: parseFloat(standardWorkHoursPerDay) || 8,
      standardWorkDaysPerMonth: parseInt(standardWorkDaysPerMonth) || 30,
      overtimeEnabled: wageType === 'FIXED' ? overtimeEnabled : false,
      overtimeRate: wageType === 'FIXED' && overtimeEnabled ? parseFloat(overtimeRate) || 0 : 0,
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
          {/* Wage Type Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Salary Model <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setWageType('FIXED')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  wageType === 'FIXED'
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      wageType === 'FIXED' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {wageType === 'FIXED' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <h4 className={`font-semibold ${wageType === 'FIXED' ? 'text-blue-900' : 'text-gray-700'}`}>
                      Monthly Fixed Wage
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Pay a fixed monthly salary with optional overtime tracking
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWageType('HOURLY')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  wageType === 'HOURLY'
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      wageType === 'HOURLY' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {wageType === 'HOURLY' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <h4 className={`font-semibold ${wageType === 'HOURLY' ? 'text-blue-900' : 'text-gray-700'}`}>
                      Hourly Wage
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Pay based on actual hours worked by employee
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Wage */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {wageType === 'FIXED' ? 'Monthly Wage (Fixed)' : 'Hourly Rate'} <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              {wageType === 'FIXED' 
                ? 'Enter the fixed monthly salary amount'
                : 'Enter the hourly rate. Total salary will be calculated based on hours worked.'}
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={wage}
                onChange={(e) => setWage(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                placeholder={wageType === 'FIXED' ? '50000' : '500'}
                required
                min="0"
                step="0.01"
              />
              {wageType === 'HOURLY' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  per hour
                </span>
              )}
            </div>
          </div>

          {/* Overtime Settings (Only for FIXED wage type) */}
          {wageType === 'FIXED' && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Overtime Pay Settings</h3>
                  <p className="text-sm text-gray-600">Enable overtime calculation based on actual hours worked</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overtimeEnabled}
                    onChange={(e) => setOvertimeEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {overtimeEnabled && (
                <div className="space-y-4 pt-4 border-t border-green-300">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>How it works:</strong> The system calculates total hours based on your standard work hours. 
                      Any hours worked beyond the standard will be considered overtime and paid at the overtime rate.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standard Work Hours Per Day
                      </label>
                      <input
                        type="number"
                        value={standardWorkHoursPerDay}
                        onChange={(e) => setStandardWorkHoursPerDay(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="8"
                        required={overtimeEnabled}
                        min="1"
                        max="24"
                        step="0.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 8 hours per day</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standard Work Days Per Month
                      </label>
                      <input
                        type="number"
                        value={standardWorkDaysPerMonth}
                        onChange={(e) => setStandardWorkDaysPerMonth(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                        required={overtimeEnabled}
                        min="1"
                        max="31"
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 30 days per month</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Standard Monthly Hours:
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseFloat(standardWorkHoursPerDay || 8) * parseInt(standardWorkDaysPerMonth || 30)} hours
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({standardWorkHoursPerDay || 8} hrs/day × {standardWorkDaysPerMonth || 30} days)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overtime Rate (₹ per hour) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={overtimeRate}
                        onChange={(e) => setOvertimeRate(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                        required={overtimeEnabled}
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        per hour
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Amount paid for each overtime hour worked beyond standard hours
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

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
                <span className="text-gray-600">
                  {wageType === 'FIXED' ? 'Monthly Wage:' : 'Hourly Rate:'}
                </span>
                <span className="font-semibold">
                  ₹{wageNum.toFixed(2)}{wageType === 'HOURLY' && '/hr'}
                </span>
              </div>
              {wageType === 'FIXED' && (
                <>
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
                </>
              )}
              {wageType === 'HOURLY' && (
                <div className="bg-blue-100 border border-blue-200 rounded p-3 mt-2">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> For hourly wages, salary components will be calculated based on actual hours worked by the employee during payroll generation.
                  </p>
                </div>
              )}
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
              disabled={loading || (wageType === 'FIXED' && finalTotal > wageNum)}
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
