/**
 * Calculate number of days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number}
 */
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
};

/**
 * Calculate working hours between check-in and check-out
 * @param {Date} checkIn 
 * @param {Date} checkOut 
 * @returns {number}
 */
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const diffMs = new Date(checkOut) - new Date(checkIn);
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
};

/**
 * Get working days in a month
 * @param {number} year 
 * @param {number} month (0-11)
 * @returns {number}
 */
export const getWorkingDaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // Count all days except Sunday (0)
    if (dayOfWeek !== 0) {
      workingDays++;
    }
  }
  
  return workingDays;
};

/**
 * Get date range for a month
 * @param {number} year 
 * @param {number} month (0-11)
 * @returns {Object}
 */
export const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    start: startDate,
    end: endDate,
  };
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get month name from month number
 * @param {number} month (0-11)
 * @returns {string}
 */
export const getMonthName = (month) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
};

/**
 * Parse pay period string (e.g., "Oct 2025")
 * @param {string} payPeriod 
 * @returns {Object}
 */
export const parsePayPeriod = (payPeriod) => {
  const [monthStr, yearStr] = payPeriod.split(' ');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames.indexOf(monthStr);
  const year = parseInt(yearStr);
  
  return { month, year };
};

/**
 * Check if date is today
 * @param {Date} date 
 * @returns {boolean}
 */
export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return compareDate.getDate() === today.getDate() &&
         compareDate.getMonth() === today.getMonth() &&
         compareDate.getFullYear() === today.getFullYear();
};
