/**
 * Calculate salary component amount
 * @param {Object} component - Salary component
 * @param {number} wage - Base wage
 * @param {number} basicAmount - Basic salary amount
 * @returns {number}
 */
export const calculateComponentAmount = (component, wage, basicAmount = 0) => {
  const { computationType, value } = component;
  
  switch (computationType) {
    case 'PERCENTAGE_OF_WAGE':
      return (parseFloat(wage) * parseFloat(value)) / 100;
    
    case 'PERCENTAGE_OF_BASIC':
      return (parseFloat(basicAmount) * parseFloat(value)) / 100;
    
    case 'FIXED_AMOUNT':
      return parseFloat(value);
    
    default:
      return 0;
  }
};

/**
 * Calculate all salary components
 * @param {Array} components - Array of salary components
 * @param {number} wage - Base wage
 * @returns {Array}
 */
export const calculateAllComponents = (components, wage) => {
  let basicAmount = 0;
  const calculatedComponents = [];
  
  // Sort components by order
  const sortedComponents = components.sort((a, b) => a.order - b.order);
  
  for (const component of sortedComponents) {
    const amount = calculateComponentAmount(component, wage, basicAmount);
    
    // If this is the Basic component, store its amount
    if (component.name === 'Basic') {
      basicAmount = amount;
    }
    
    calculatedComponents.push({
      ...component,
      amount,
    });
  }
  
  return calculatedComponents;
};

/**
 * Calculate Fixed Allowance (Wage - Total of all other components)
 * @param {number} wage 
 * @param {number} totalOtherComponents 
 * @returns {number}
 */
export const calculateFixedAllowance = (wage, totalOtherComponents) => {
  return parseFloat(wage) - parseFloat(totalOtherComponents);
};

/**
 * Calculate Provident Fund deduction
 * @param {number} basicSalary 
 * @param {number} pfRate 
 * @returns {number}
 */
export const calculatePF = (basicSalary, pfRate = 12) => {
  return (parseFloat(basicSalary) * parseFloat(pfRate)) / 100;
};

/**
 * Calculate gross salary
 * @param {Array} components - Salary components (allowances)
 * @returns {number}
 */
export const calculateGrossSalary = (components) => {
  return components.reduce((total, comp) => {
    return total + parseFloat(comp.amount || 0);
  }, 0);
};

/**
 * Calculate net salary
 * @param {number} grossSalary 
 * @param {number} totalDeductions 
 * @returns {number}
 */
export const calculateNetSalary = (grossSalary, totalDeductions) => {
  return parseFloat(grossSalary) - parseFloat(totalDeductions);
};

/**
 * Calculate prorated salary based on worked days
 * @param {number} amount - Full month amount
 * @param {number} workingDays - Total working days in month
 * @param {number} workedDays - Actual worked days
 * @returns {number}
 */
export const calculateProratedAmount = (amount, workingDays, workedDays) => {
  return (parseFloat(amount) / parseFloat(workingDays)) * parseFloat(workedDays);
};

/**
 * Round to 2 decimal places
 * @param {number} value 
 * @returns {number}
 */
export const roundToTwo = (value) => {
  return Math.round(parseFloat(value) * 100) / 100;
};

/**
 * Validate salary components total doesn't exceed wage
 * @param {Array} components 
 * @param {number} wage 
 * @returns {boolean}
 */
export const validateComponentsTotal = (components, wage) => {
  const total = components.reduce((sum, comp) => {
    return sum + parseFloat(comp.amount || 0);
  }, 0);
  
  return roundToTwo(total) <= roundToTwo(parseFloat(wage));
};
