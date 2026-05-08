/**
 * Calculate days past due for a payment record dynamically based on current viewing date
 * 
 * Rent is typically due on the 1st of each month with a grace period until the 5th.
 * This function calculates how many days past due a payment is relative to TODAY,
 * not when it was stored in the database.
 * 
 * @param {Date} paymentTime - The time field from the Payment record (first day of that month)
 * @param {string} paymentStatus - 'paid', 'partial', 'delinquent', or 'defaulted'
 * @returns {number} Days past due relative to current date
 */
exports.calculateDaysPastDue = (paymentTime, paymentStatus) => {
  const now = new Date();
  // Normalize to start of day in EDT
  now.setHours(0, 0, 0, 0);
  
  const paymentDate = new Date(paymentTime);
  paymentDate.setHours(0, 0, 0, 0);
  
  // Get the month this payment is for
  const paymentMonth = paymentDate.getMonth();
  const paymentYear = paymentDate.getFullYear();
  
  // Rent due date: 1st of the payment's month
  const rentDueDate = new Date(paymentYear, paymentMonth, 1);
  
  // Grace period ends on the 5th
  const gracePeriodEnd = new Date(paymentYear, paymentMonth, 5);
  
  // If this is a historical payment (more than 2 months ago), use stored value
  // because we don't want to recalculate old payments dynamically
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  if (paymentDate < twoMonthsAgo) {
    // For historical data, return 0 for paid, or a reasonable estimate based on status
    if (paymentStatus === 'paid') return 0;
    if (paymentStatus === 'partial') return 15; // Estimate
    if (['delinquent', 'defaulted'].includes(paymentStatus)) return 45; // Estimate
    return 0;
  }
  
  // For current/recent payments, calculate dynamically
  
  // If payment was made within grace period or earlier in the same month, not past due
  if (paymentDate >= gracePeriodEnd && paymentStatus === 'paid') {
    return 0;
  }
  
  // If status indicates non-payment, calculate days since rent was due
  if (['partial', 'delinquent', 'defaulted'].includes(paymentStatus)) {
    const diffTime = Math.abs(now.getTime() - rentDueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Cap at reasonable maximum for display purposes
    return Math.min(diffDays, 365);
  }
  
  // Paid but after grace period - calculate actual days late
  if (paymentStatus === 'paid' && paymentDate > gracePeriodEnd) {
    const diffTime = Math.abs(paymentDate.getTime() - rentDueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Default: not past due
  return 0;
};

/**
 * Get the current viewing date for dynamic calculations
 * This ensures all time-sensitive data is relative to when the user is viewing the app
 */
exports.getCurrentViewingDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

/**
 * Calculate lease expiration countdown (days until lease ends)
 * @param {DateTime} leaseEndDate - The lease end date from database
 * @returns {{ daysRemaining: number, isExpiringSoon: boolean, isExpired: boolean }}
 */
exports.calculateLeaseExpiration = (leaseEndDate) => {
  const now = exports.getCurrentViewingDate();
  const endDate = new Date(leaseEndDate);
  
  const diffTime = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    daysRemaining,
    isExpiringSoon: daysRemaining > 0 && daysRemaining <= 180, // Within 6 months
    isExpired: daysRemaining < 0
  };
};
