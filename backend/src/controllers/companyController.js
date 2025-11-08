import prisma from '../config/database.js';

/**
 * Get company details
 */
export const getCompany = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }
    
    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company details
 */
export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, website } = req.body;
    
    // Check if user is authorized to update this company
    if (req.user.companyId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company',
      });
    }
    
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(website && { website }),
      },
    });
    
    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};
