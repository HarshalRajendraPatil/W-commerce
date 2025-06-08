const VendorApplication = require('../models/VendorApplication');
const User = require('../models/User');

// @desc    Submit a vendor application
// @route   POST /api/vendor-applications
// @access  Private (Customer)
exports.submitApplication = async (req, res) => {
  try {
    // Check if user already has an application
    const existingApplication = await VendorApplication.findOne({ user: req.user.id });
    
    if (existingApplication && existingApplication.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application. Our team is currently reviewing it.'
      });
    }
    
    if (existingApplication && existingApplication.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your application has already been approved. You can access your vendor dashboard now.'
      });
    }
    
    // Allow reapplication if previously rejected
    if (existingApplication && existingApplication.status === 'rejected') {
      try {
        // Update existing application
        const updatedApplication = await VendorApplication.findByIdAndUpdate(
          existingApplication._id,
          {
            businessName: req.body.businessName,
            businessAddress: req.body.businessAddress,
            phoneNumber: req.body.phoneNumber,
            description: req.body.description,
            status: 'pending',
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null
          },
          { new: true, runValidators: true }
        ).populate('user', 'name email');
        
        return res.status(200).json({
          success: true,
          data: updatedApplication,
          message: 'Your revised vendor application has been submitted and is now under review. We appreciate your persistence!'
        });
      } catch (updateError) {
        console.error('Error updating rejected application:', updateError);
        return res.status(500).json({
          success: false,
          message: 'There was an error processing your reapplication. Please try again.'
        });
      }
    }
    
    // Create new application
    const application = await VendorApplication.create({
      user: req.user.id,
      businessName: req.body.businessName,
      businessAddress: req.body.businessAddress,
      phoneNumber: req.body.phoneNumber,
      description: req.body.description
    });
    
    // Fetch the application with populated user data
    const populatedApplication = await VendorApplication.findById(application._id)
      .populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      data: populatedApplication,
      message: 'Thank you for your application! Our team will review it within 2-3 business days.'
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get current user's application
// @route   GET /api/vendor-applications/me
// @access  Private
exports.getMyApplicationStatus = async (req, res) => {
  try {
    const application = await VendorApplication.findOne({ user: req.user.id })
      .populate('reviewedBy', 'name');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No application found'
      });
    }
    
    // Add detailed status information
    let responseData = { ...application.toObject() };
    
    // Add application tracking information
    const statusInfo = {
      pending: {
        title: 'Application Under Review',
        description: 'Your application is currently being reviewed by our team.',
        nextSteps: 'We typically review applications within 2-3 business days. You will be notified once a decision has been made.',
        icon: 'clock',
        color: 'yellow'
      },
      approved: {
        title: 'Application Approved',
        description: 'Congratulations! Your application to become a vendor has been approved.',
        nextSteps: 'Logout and login again to access your vendor dashboard.',
        icon: 'check',
        color: 'green'
      },
      rejected: {
        title: 'Application Not Approved',
        description: 'Unfortunately, your application was not approved at this time.',
        nextSteps: 'Please review the feedback provided and consider addressing the concerns before reapplying.',
        icon: 'x',
        color: 'red'
      }
    };
    
    // Add status details to response
    responseData.statusInfo = statusInfo[application.status];
    
    // Calculate time elapsed since submission
    const submissionDate = new Date(application.createdAt);
    const currentDate = new Date();
    const elapsedDays = Math.floor((currentDate - submissionDate) / (1000 * 60 * 60 * 24));
    responseData.elapsedDays = elapsedDays;
    
    if (application.status === 'pending') {
      // Calculate estimated completion date (2-3 business days from submission)
      const estimatedCompletionDate = new Date(submissionDate);
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 3); // 3 business days
      responseData.estimatedCompletionDate = estimatedCompletionDate;
      
      // Calculate estimated wait time remaining
      const daysRemaining = Math.max(0, 3 - elapsedDays);
      responseData.estimatedDaysRemaining = daysRemaining;
    }
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error getting application status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all vendor applications
// @route   GET /api/vendor-applications
// @access  Private (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    // Add pagination and filtering options
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    let query = {};
    
    // Filter by status if provided
    if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
      query.status = req.query.status;
    }
    
    const applications = await VendorApplication.find(query)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await VendorApplication.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: applications
    });
  } catch (error) {
    console.error('Error getting all applications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get a specific application
// @route   GET /api/vendor-applications/:id
// @access  Private (Admin)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await VendorApplication.findById(req.params.id)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error getting application by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Approve a vendor application
// @route   PUT /api/vendor-applications/:id/approve
// @access  Private (Admin)
exports.approveApplication = async (req, res) => {
  try {
    let application = await VendorApplication.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`
      });
    }
    
    // Update application status
    application = await VendorApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('reviewedBy', 'name email');
    
    // Update user role to vendor
    await User.findByIdAndUpdate(
      application.user._id,
      { role: 'vendor' }
    );
    
    // Send a more detailed response
    res.status(200).json({
      success: true,
      data: application,
      message: `Vendor application for ${application.businessName} has been approved successfully. The user has been upgraded to vendor status.`
    });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Reject a vendor application
// @route   PUT /api/vendor-applications/:id/reject
// @access  Private (Admin)
exports.rejectApplication = async (req, res) => {
  try {
    if (!req.body.rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear reason for rejection to help the applicant understand and address the issues'
      });
    }
    
    let application = await VendorApplication.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`
      });
    }
    
    // Update application status with detailed rejection reason
    application = await VendorApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: req.body.rejectionReason,
        reviewedBy: req.user.id,
        reviewedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('reviewedBy', 'name email');
    
    // Provide guidance for the admin and confirmation that the user can reapply
    res.status(200).json({
      success: true,
      data: application,
      message: `Application for ${application.businessName} has been rejected with feedback. The applicant will be able to address the issues and reapply.`
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
}; 