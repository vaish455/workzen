import { sendEmail } from '../config/email.js';

/**
 * Email template wrapper with consistent styling
 */
const emailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content { 
          padding: 30px; 
        }
        .content h2 {
          color: #333;
          font-size: 20px;
          margin-top: 0;
        }
        .info-box { 
          background-color: #f8f9fa; 
          padding: 20px; 
          border-left: 4px solid #667eea; 
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-box p {
          margin: 8px 0;
        }
        .info-box strong {
          color: #667eea;
        }
        .warning-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .success-box {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .alert-box {
          background-color: #f8d7da;
          border-left: 4px solid #dc3545;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 15px 0;
          font-weight: 600;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          background-color: #f8f9fa;
          color: #6c757d; 
          font-size: 12px; 
          border-top: 1px solid #dee2e6;
        }
        .footer p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        table th {
          background-color: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
        }
        table td {
          padding: 10px 12px;
          border-bottom: 1px solid #dee2e6;
        }
        table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .total-row {
          background-color: #e9ecef !important;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} WorkZen. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send admin welcome email
 */
export const sendAdminWelcomeEmail = async (email, name, companyName, loginId, password) => {
  const content = `
    <h2>Welcome to WorkZen, ${name}!</h2>
    <p>Congratulations! Your admin account for <strong>${companyName}</strong> has been successfully created.</p>
    
    <p>As an administrator, you now have full access to manage your organization's HR operations, including:</p>
    <ul>
      <li>Employee management and onboarding</li>
      <li>Attendance tracking and monitoring</li>
      <li>Leave management</li>
      <li>Payroll processing</li>
      <li>Reports and analytics</li>
    </ul>

    <div class="info-box">
      <p><strong>Your Login Credentials:</strong></p>
      <p><strong>Login ID:</strong> ${loginId}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
    </div>
    
    <div class="warning-box">
      <p><strong>⚠️ Important Security Notice:</strong></p>
      <p>For security reasons, please change your password immediately after your first login. You can do this from your profile settings.</p>
    </div>
    
    <p>Get started by logging into your account and exploring the features.</p>
    
    <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
    
    <p>Best regards,<br>The WorkZen Team</p>
  `;

  await sendEmail({
    to: email,
    subject: `Welcome to WorkZen - Admin Account Created for ${companyName}`,
    html: emailTemplate('Welcome to WorkZen', content),
    text: `Welcome to WorkZen! Your admin account for ${companyName} has been created. Login ID: ${loginId}, Temporary Password: ${password}`,
  });
};

/**
 * Send employee welcome email
 */
export const sendEmployeeWelcomeEmail = async (email, name, loginId, password) => {
  const content = `
    <h2>Hello ${name},</h2>
    <p>Welcome aboard! Your employee account has been successfully created in the WorkZen HR system.</p>
    
    <div class="info-box">
      <p><strong>Your Details:</strong></p>
      <p><strong>Login ID:</strong> ${loginId}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
    </div>
    
    <p>With your WorkZen account, you can:</p>
    <ul>
      <li>Mark daily attendance</li>
      <li>Apply for leaves and track leave balance</li>
      <li>View your salary slips</li>
      <li>Update your profile information</li>
      <li>View company announcements</li>
    </ul>
    
    <div class="warning-box">
      <p><strong>⚠️ Security First:</strong></p>
      <p>Please change your password after your first login from the profile settings page.</p>
    </div>
    
    <p>We're excited to have you on the team!</p>
    
    <p>Best regards,<br>HR Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to WorkZen - Your Employee Account',
    html: emailTemplate('Welcome to Your Team', content),
    text: `Welcome! Your employee account has been created. Login ID: ${loginId}, Temporary Password: ${password}`,
  });
};

/**
 * Send password change confirmation email
 */
export const sendPasswordChangeEmail = async (email, name, changedBy = 'you', ipAddress, timestamp) => {
  const content = `
    <h2>Password Changed Successfully</h2>
    <p>Dear ${name},</p>
    <p>This email confirms that your WorkZen account password was changed successfully.</p>
    
    <div class="success-box">
      <p><strong>✓ Password Change Details:</strong></p>
      <p><strong>Changed by:</strong> ${changedBy}</p>
      <p><strong>Date & Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
    </div>
    
    <div class="alert-box">
      <p><strong>🔐 Didn't make this change?</strong></p>
      <p>If you did not authorize this password change, please contact your system administrator immediately and secure your account.</p>
    </div>
    
    <p>Security Tips:</p>
    <ul>
      <li>Never share your password with anyone</li>
      <li>Use a strong, unique password</li>
      <li>Change your password regularly</li>
      <li>Be cautious of phishing attempts</li>
    </ul>
    
    <p>Best regards,<br>WorkZen Security Team</p>
  `;

  await sendEmail({
    to: email,
    subject: '🔐 Password Changed - WorkZen Account',
    html: emailTemplate('Password Changed', content),
    text: `Your WorkZen password was changed on ${new Date(timestamp).toLocaleString()}. If you didn't make this change, contact your administrator immediately.`,
  });
};

/**
 * Send security alert email for suspicious activity
 */
export const sendSecurityAlertEmail = async (email, name, alertType, details, timestamp) => {
  const content = `
    <h2>Security Alert</h2>
    <p>Dear ${name},</p>
    <p>We detected unusual activity on your WorkZen account that requires your attention.</p>
    
    <div class="alert-box">
      <p><strong>⚠️ Alert Type:</strong> ${alertType}</p>
      <p><strong>Date & Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <p><strong>Details:</strong> ${details}</p>
    </div>
    
    <div class="warning-box">
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Review your recent account activity</li>
        <li>Change your password if you suspect unauthorized access</li>
        <li>Contact your administrator if you don't recognize this activity</li>
        <li>Enable two-factor authentication if available</li>
      </ul>
    </div>
    
    <p>If you recognize this activity, you can safely ignore this email. Otherwise, please take immediate action to secure your account.</p>
    
    <p>Best regards,<br>WorkZen Security Team</p>
  `;

  await sendEmail({
    to: email,
    subject: '🚨 Security Alert - WorkZen Account',
    html: emailTemplate('Security Alert', content),
    text: `Security Alert: ${alertType} detected on your WorkZen account at ${new Date(timestamp).toLocaleString()}. Details: ${details}`,
  });
};

/**
 * Send profile update notification
 */
export const sendProfileUpdateNotification = async (email, name, updatedFields, updatedBy, timestamp) => {
  const fieldsList = updatedFields.map(field => `<li>${field}</li>`).join('');
  
  const content = `
    <h2>Profile Updated</h2>
    <p>Dear ${name},</p>
    <p>Your profile information has been updated in the WorkZen system.</p>
    
    <div class="info-box">
      <p><strong>Update Details:</strong></p>
      <p><strong>Updated by:</strong> ${updatedBy}</p>
      <p><strong>Date & Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <p><strong>Fields Updated:</strong></p>
      <ul>
        ${fieldsList}
      </ul>
    </div>
    
    <div class="warning-box">
      <p><strong>Note:</strong> If you didn't request these changes, please contact your HR department or system administrator immediately.</p>
    </div>
    
    <p>You can review your updated profile information by logging into your WorkZen account.</p>
    
    <p>Best regards,<br>HR Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Profile Updated - WorkZen',
    html: emailTemplate('Profile Update Notification', content),
    text: `Your WorkZen profile was updated by ${updatedBy} on ${new Date(timestamp).toLocaleString()}. Fields updated: ${updatedFields.join(', ')}`,
  });
};

/**
 * Send salary structure update notification
 */
export const sendSalaryUpdateNotification = async (email, name, effectiveDate, updatedBy, timestamp) => {
  const content = `
    <h2>Salary Structure Updated</h2>
    <p>Dear ${name},</p>
    <p>Your salary structure has been updated in the WorkZen system.</p>
    
    <div class="info-box">
      <p><strong>Update Details:</strong></p>
      <p><strong>Updated by:</strong> ${updatedBy}</p>
      <p><strong>Effective Date:</strong> ${new Date(effectiveDate).toLocaleDateString()}</p>
      <p><strong>Updated on:</strong> ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    <p>You can view your complete salary structure and breakdown by logging into your WorkZen account and navigating to the Payroll section.</p>
    
    <div class="warning-box">
      <p><strong>Note:</strong> This change will be reflected in your next salary slip.</p>
    </div>
    
    <p>If you have any questions regarding this update, please contact the HR department.</p>
    
    <p>Best regards,<br>HR Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Salary Structure Updated - WorkZen',
    html: emailTemplate('Salary Update', content),
    text: `Your salary structure has been updated, effective from ${new Date(effectiveDate).toLocaleDateString()}. Updated by ${updatedBy}.`,
  });
};

/**
 * Send monthly salary slip email
 */
export const sendMonthlySalarySlip = async (email, name, month, year, salaryDetails) => {
  const {
    basicSalary,
    hra,
    otherAllowances,
    grossSalary,
    providentFund,
    tax,
    otherDeductions,
    totalDeductions,
    netSalary,
    workingDays,
    presentDays,
    leaveDays,
    overtimeHours,
    overtimePay
  } = salaryDetails;

  const earningsRows = `
    <tr>
      <td>Basic Salary</td>
      <td>₹${basicSalary.toFixed(2)}</td>
    </tr>
    ${hra ? `<tr><td>HRA</td><td>₹${hra.toFixed(2)}</td></tr>` : ''}
    ${otherAllowances ? `<tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(2)}</td></tr>` : ''}
    ${overtimePay ? `<tr><td>Overtime Pay (${overtimeHours}hrs)</td><td>₹${overtimePay.toFixed(2)}</td></tr>` : ''}
  `;

  const deductionsRows = `
    ${providentFund ? `<tr><td>Provident Fund</td><td>₹${providentFund.toFixed(2)}</td></tr>` : ''}
    ${tax ? `<tr><td>Tax Deduction</td><td>₹${tax.toFixed(2)}</td></tr>` : ''}
    ${otherDeductions ? `<tr><td>Other Deductions</td><td>₹${otherDeductions.toFixed(2)}</td></tr>` : ''}
  `;

  const content = `
    <h2>Salary Slip - ${month} ${year}</h2>
    <p>Dear ${name},</p>
    <p>Please find your salary slip for <strong>${month} ${year}</strong> below.</p>
    
    <div class="info-box">
      <p><strong>Attendance Summary:</strong></p>
      <p><strong>Total Working Days:</strong> ${workingDays}</p>
      <p><strong>Days Present:</strong> ${presentDays}</p>
      <p><strong>Leave Days:</strong> ${leaveDays}</p>
      ${overtimeHours ? `<p><strong>Overtime Hours:</strong> ${overtimeHours}</p>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th colspan="2">EARNINGS</th>
        </tr>
      </thead>
      <tbody>
        ${earningsRows}
        <tr class="total-row">
          <td>Gross Salary</td>
          <td>₹${grossSalary.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <th colspan="2">DEDUCTIONS</th>
        </tr>
      </thead>
      <tbody>
        ${deductionsRows}
        <tr class="total-row">
          <td>Total Deductions</td>
          <td>₹${totalDeductions.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="success-box">
      <p style="font-size: 18px;"><strong>Net Salary: ₹${netSalary.toFixed(2)}</strong></p>
      <p>This amount will be credited to your registered bank account.</p>
    </div>

    <p><em>Please keep this salary slip for your records. You can also download it from your WorkZen account.</em></p>
    
    <p>If you have any questions regarding your salary, please contact the HR department.</p>
    
    <p>Best regards,<br>Payroll Team</p>
  `;

  await sendEmail({
    to: email,
    subject: `💰 Salary Slip - ${month} ${year}`,
    html: emailTemplate(`Salary Slip - ${month} ${year}`, content),
    text: `Your salary slip for ${month} ${year} is ready. Net Salary: ₹${netSalary.toFixed(2)}. Login to WorkZen to view details.`,
  });
};

/**
 * Send leave status update notification
 */
export const sendLeaveStatusNotification = async (email, name, leaveType, startDate, endDate, status, remarks) => {
  const statusColor = status === 'APPROVED' ? 'success-box' : status === 'REJECTED' ? 'alert-box' : 'info-box';
  const statusEmoji = status === 'APPROVED' ? '✅' : status === 'REJECTED' ? '❌' : '⏳';
  
  const content = `
    <h2>Leave Application Update</h2>
    <p>Dear ${name},</p>
    <p>Your leave application has been ${status.toLowerCase()}.</p>
    
    <div class="${statusColor}">
      <p><strong>${statusEmoji} Status:</strong> ${status}</p>
      <p><strong>Leave Type:</strong> ${leaveType}</p>
      <p><strong>Duration:</strong> ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
      ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
    </div>
    
    <p>You can view more details by logging into your WorkZen account.</p>
    
    <p>Best regards,<br>HR Team</p>
  `;

  await sendEmail({
    to: email,
    subject: `Leave Application ${status} - WorkZen`,
    html: emailTemplate('Leave Status Update', content),
    text: `Your leave application for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been ${status}.`,
  });
};

/**
 * Send attendance irregularity notification
 */
export const sendAttendanceAlertEmail = async (email, name, alertType, date, details) => {
  const content = `
    <h2>Attendance Alert</h2>
    <p>Dear ${name},</p>
    <p>We noticed an irregularity in your attendance record that requires attention.</p>
    
    <div class="warning-box">
      <p><strong>⚠️ Alert Type:</strong> ${alertType}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Details:</strong> ${details}</p>
    </div>
    
    <p>Please review your attendance and contact HR if you have any questions or if you believe this is an error.</p>
    
    <p>Best regards,<br>HR Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Attendance Alert - WorkZen',
    html: emailTemplate('Attendance Alert', content),
    text: `Attendance Alert: ${alertType} on ${new Date(date).toLocaleDateString()}. ${details}`,
  });
};

/**
 * Send account locked notification
 */
export const sendAccountLockedEmail = async (email, name, reason, timestamp) => {
  const content = `
    <h2>Account Locked</h2>
    <p>Dear ${name},</p>
    <p>Your WorkZen account has been temporarily locked for security reasons.</p>
    
    <div class="alert-box">
      <p><strong>🔒 Lock Details:</strong></p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    <div class="info-box">
      <p><strong>What to do next:</strong></p>
      <p>Please contact your system administrator or HR department to unlock your account.</p>
      <p>You may need to verify your identity and reset your password.</p>
    </div>
    
    <p>We take security seriously and appreciate your understanding.</p>
    
    <p>Best regards,<br>WorkZen Security Team</p>
  `;

  await sendEmail({
    to: email,
    subject: '🔒 Account Locked - WorkZen',
    html: emailTemplate('Account Locked', content),
    text: `Your WorkZen account has been locked. Reason: ${reason}. Please contact your administrator.`,
  });
};
