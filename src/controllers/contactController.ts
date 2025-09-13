import { Request, Response } from 'express';
import Contact from '../models/Contact';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { emailer } from '../services/emailService';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message, phone, company } = req.body;

  // Create contact record
  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
    phone,
    company,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send notification email to admin
  try {
    await emailer.sendEmail({
      from: process.env.SMTP_USERNAME,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      `
    });
  } catch (emailError) {
    console.error('Failed to send contact notification email:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your message! I will get back to you soon.',
    data: { id: contact._id }
  });
});

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (Admin)
export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  const query: any = {};

  // Apply filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const contacts = await Contact.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate('assignedTo', 'username email');

  const total = await Contact.countDocuments(query);

  res.json({
    success: true,
    data: contacts,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private (Admin)
export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'username email');

  if (!contact) {
    throw new AppError('Contact submission not found', 404);
  }

  res.json({
    success: true,
    data: contact
  });
});

// @desc    Update contact status
// @route   PATCH /api/contact/:id/status
// @access  Private (Admin)
export const updateContactStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new AppError('Contact submission not found', 404);
  }

  contact.status = status;
  if (status === 'replied') {
    contact.repliedAt = new Date();
  }
  await contact.save();

  res.json({
    success: true,
    message: 'Contact status updated successfully',
    data: contact
  });
});

// @desc    Reply to contact
// @route   POST /api/contact/:id/reply
// @access  Private (Admin)
export const replyToContact = asyncHandler(async (req: Request, res: Response) => {
  const { replyMessage } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new AppError('Contact submission not found', 404);
  }

  // Send reply email
  try {
    await emailer.sendEmail({
      from: process.env.SMTP_USERNAME,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <h2>Reply to your message</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for contacting me. Here's my reply:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
          ${replyMessage}
        </div>
        <p>Best regards,<br>Krishnadas N</p>
      `
    });

    // Update contact record
    contact.status = 'replied';
    contact.replyMessage = replyMessage;
    contact.repliedAt = new Date();
    await contact.save();

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (emailError) {
    throw new AppError('Failed to send reply email', 500);
  }
});

// @desc    Mark contact as spam
// @route   PATCH /api/contact/:id/spam
// @access  Private (Admin)
export const markAsSpam = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new AppError('Contact submission not found', 404);
  }

  contact.isSpam = true;
  contact.status = 'closed';
  await contact.save();

  res.json({
    success: true,
    message: 'Contact marked as spam'
  });
});

// @desc    Assign contact
// @route   PATCH /api/contact/:id/assign
// @access  Private (Admin)
export const assignContact = asyncHandler(async (req: Request, res: Response) => {
  const { assignedTo } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new AppError('Contact submission not found', 404);
  }

  contact.assignedTo = assignedTo;
  await contact.save();

  res.json({
    success: true,
    message: 'Contact assigned successfully',
    data: contact
  });
});

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private (Admin)
export const getContactStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        newContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        readContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        repliedContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
        },
        closedContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        },
        spamContacts: {
          $sum: { $cond: ['$isSpam', 1, 0] }
        }
      }
    }
  ]);

  const monthlyStats = await Contact.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      monthlyStats
    }
  });
});

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new AppError('Contact submission not found', 404);
  }

  await Contact.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Contact submission deleted successfully'
  });
});
