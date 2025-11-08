import prisma from '../config/database.js';
import { uploadImage } from '../config/cloudinary.js';
import {
  calculateComponentAmount,
  calculateAllComponents,
  calculateFixedAllowance,
  validateComponentsTotal,
  roundToTwo,
} from '../utils/salaryCalculations.js';
import { sendProfileUpdateNotification, sendSalaryUpdateNotification } from '../utils/emailTemplates.js';

/**
 * Get All Employees (Employee Directory)
 * GET /api/employees
 */
export const getAllEmployees = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { search, status } = req.query;
    
    // Build where clause
    const where = {
      companyId: currentUser.companyId,
    };
    
    // Get all employees
    let employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          emp.email.toLowerCase().includes(searchLower) ||
          emp.employeeCode?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply status filter
    if (status) {
      employees = employees.filter(emp => {
        if (status === 'active') return emp.user.isActive;
        if (status === 'inactive') return !emp.user.isActive;
        return true;
      });
    }
    
    // Get attendance status for each employee (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const employeesWithStatus = await Promise.all(
      employees.map(async (emp) => {
        // Check today's attendance
        const attendance = await prisma.attendance.findFirst({
          where: {
            employeeId: emp.id,
            date: today,
          },
        });
        
        // Check if on leave today
        const leave = await prisma.leave.findFirst({
          where: {
            employeeId: emp.id,
            status: 'APPROVED',
            startDate: { lte: today },
            endDate: { gte: today },
          },
        });
        
        let attendanceStatus = 'ABSENT';
        if (leave) {
          attendanceStatus = 'ON_LEAVE';
        } else if (attendance?.status === 'PRESENT') {
          attendanceStatus = 'PRESENT';
        }
        
        return {
          ...emp,
          attendanceStatus,
          currentAttendance: attendance,
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: employeesWithStatus.length,
      data: employeesWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Employee by ID
 * GET /api/employees/:id
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // Check permissions
    const canViewAllEmployees = ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'].includes(currentUser.role);
    
    const where = {
      id,
      companyId: currentUser.companyId,
    };
    
    // Employees can only view their own profile
    if (currentUser.role === 'EMPLOYEE' && currentUser.employee?.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.',
      });
    }
    
    const employee = await prisma.employee.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        salaryStructure: {
          include: {
            components: {
              orderBy: { order: 'asc' },
            },
          },
        },
        leaveBalances: {
          where: {
            year: new Date().getFullYear(),
          },
        },
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    // Hide salary info for employees
    if (currentUser.role === 'EMPLOYEE') {
      // Employees can see their own salary info
      res.status(200).json({
        success: true,
        data: employee,
      });
    } else if (['ADMIN', 'PAYROLL_OFFICER'].includes(currentUser.role)) {
      // Admin and Payroll can see all info
      res.status(200).json({
        success: true,
        data: employee,
      });
    } else {
      // HR Officers cannot see salary info
      const { salaryStructure, ...employeeWithoutSalary } = employee;
      res.status(200).json({
        success: true,
        data: employeeWithoutSalary,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update Employee Profile
 * PUT /api/employees/:id
 */
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    let updateData = req.body;
    
    // Check if employee exists in same company
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
      include: {
        user: true,
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    // Track which fields are being updated for email notification
    const updatedFields = [];
    const originalData = { ...employee };
    
    // Employees can only update their own profile
    if (currentUser.role === 'EMPLOYEE' && currentUser.employee?.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.',
      });
    }
    
    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.userId;
    delete updateData.companyId;
    delete updateData.yearOfJoining;
    delete updateData.serialNumber;
    delete updateData.user;
    
    // Track updated fields for notification
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== employee[key] && updateData[key] !== '' && updateData[key] !== null) {
        const fieldNames = {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email',
          phone: 'Phone Number',
          dateOfBirth: 'Date of Birth',
          gender: 'Gender',
          address: 'Address',
          city: 'City',
          state: 'State',
          zipCode: 'ZIP Code',
          country: 'Country',
          department: 'Department',
          designation: 'Designation',
          employmentType: 'Employment Type',
        };
        updatedFields.push(fieldNames[key] || key);
      }
    });
    
    // Clean up empty dates and convert to proper format
    if (updateData.dateOfBirth === '' || updateData.dateOfBirth === null) {
      delete updateData.dateOfBirth;
    } else if (updateData.dateOfBirth) {
      // Ensure date is in proper ISO format
      updateData.dateOfBirth = new Date(updateData.dateOfBirth).toISOString();
    }
    
    // Remove empty strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        delete updateData[key];
      }
    });
    
    // If email is being updated, check if it's already in use
    if (updateData.email && updateData.email !== employee.email) {
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          email: updateData.email,
          companyId: currentUser.companyId,
          NOT: { id },
        },
      });
      
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another employee',
        });
      }
      
      // Also update user email if employee email changes
      await prisma.user.update({
        where: { id: employee.userId },
        data: { email: updateData.email },
      });
    }
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        salaryStructure: {
          include: {
            components: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    
    // Send profile update notification if there were changes
    if (updatedFields.length > 0) {
      try {
        const userName = `${updatedEmployee.firstName} ${updatedEmployee.lastName}`;
        const updatedBy = currentUser.employee 
          ? `${currentUser.employee.firstName} ${currentUser.employee.lastName}`
          : currentUser.email;
        
        await sendProfileUpdateNotification(
          updatedEmployee.email,
          userName,
          updatedFields,
          updatedBy,
          new Date()
        );
      } catch (emailError) {
        console.error('Failed to send profile update notification:', emailError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee profile updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    next(error);
  }
};

/**
 * Upload Profile Picture
 * PUT /api/employees/:id/profile-picture
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    // Employees can only update their own picture
    if (currentUser.role === 'EMPLOYEE' && currentUser.employee?.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }
    
    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const imageUrl = await uploadImage(base64Image, 'workzen/profiles');
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { profilePicture: imageUrl },
    });
    
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: updatedEmployee.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create/Update Salary Structure
 * PUT /api/employees/:id/salary
 */
export const updateSalaryStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wage, pfRate, professionalTax, components } = req.body;
    const currentUser = req.user;
    
    // Check permissions - only Admin and Payroll Officer
    if (!['ADMIN', 'PAYROLL_OFFICER'].includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admin or Payroll Officer can manage salary.',
      });
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    // Calculate component amounts
    const calculatedComponents = calculateAllComponents(components, wage);
    
    // Validate total doesn't exceed wage
    if (!validateComponentsTotal(calculatedComponents, wage)) {
      return res.status(400).json({
        success: false,
        message: 'Total of all components exceeds the wage',
      });
    }
    
    // Create or update salary structure in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upsert salary structure
      const salaryStructure = await tx.salaryStructure.upsert({
        where: { employeeId: id },
        create: {
          employeeId: id,
          wage: wage,
          pfRate: pfRate || 12,
          professionalTax: professionalTax || 200,
        },
        update: {
          wage: wage,
          pfRate: pfRate || 12,
          professionalTax: professionalTax || 200,
        },
      });
      
      // Delete existing components
      await tx.salaryComponent.deleteMany({
        where: { salaryStructureId: salaryStructure.id },
      });
      
      // Create new components
      const newComponents = await Promise.all(
        calculatedComponents.map(async (comp, index) => {
          return tx.salaryComponent.create({
            data: {
              salaryStructureId: salaryStructure.id,
              name: comp.name,
              computationType: comp.computationType,
              value: comp.value,
              amount: comp.amount,
              order: index,
            },
          });
        })
      );
      
      return { salaryStructure, components: newComponents };
    });
    
    // Send salary update notification
    try {
      const userName = `${employee.firstName} ${employee.lastName}`;
      const updatedBy = currentUser.employee 
        ? `${currentUser.employee.firstName} ${currentUser.employee.lastName}`
        : currentUser.email;
      
      await sendSalaryUpdateNotification(
        employee.email,
        userName,
        new Date(), // Effective date
        updatedBy,
        new Date()
      );
    } catch (emailError) {
      console.error('Failed to send salary update notification:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Salary structure updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Employee Salary Info
 * GET /api/employees/:id/salary
 */
export const getEmployeeSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // Check permissions
    const isOwnProfile = currentUser.employee?.id === id;
    const canViewSalary = ['ADMIN', 'PAYROLL_OFFICER'].includes(currentUser.role) || isOwnProfile;
    
    if (!canViewSalary) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view this salary information.',
      });
    }
    
    const salaryStructure = await prisma.salaryStructure.findFirst({
      where: {
        employeeId: id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        components: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found for this employee',
      });
    }
    
    res.status(200).json({
      success: true,
      data: salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};
