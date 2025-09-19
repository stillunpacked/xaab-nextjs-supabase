const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Validation middleware
const contactValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

// Submit contact form (public)
router.post('/submit', contactValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, phone, company } = req.body;

    // Save contact form to database
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      phone,
      company,
      status: 'new'
    });

    await contact.save();

    // Send email notification to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from the XAAB website contact form.</em></p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting XAAB',
      html: `
        <h2>Thank you for contacting XAAB!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p><em>${message}</em></p>
        <hr>
        <p>Best regards,<br>XAAB Team</p>
        <p><em>Xiss Alumni Association Bangalore</em></p>
      `
    };

    try {
      await transporter.sendMail(autoReplyOptions);
    } catch (emailError) {
      console.error('Error sending auto-reply:', emailError);
    }

    res.json({
      message: 'Contact form submitted successfully. We will get back to you soon!',
      contactId: contact._id
    });

  } catch (error) {
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
});

// Get all contact submissions (admin/moderator only)
router.get('/', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { 
      status, 
      limit = 20, 
      skip = 0,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const contacts = await Contact.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact submissions', error: error.message });
  }
});

// Get contact by ID (admin/moderator only)
router.get('/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact submission', error: error.message });
  }
});

// Update contact status (admin/moderator only)
router.put('/:id/status', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    contact.status = status;
    if (adminNotes) contact.adminNotes = adminNotes;
    contact.lastUpdatedBy = req.user._id;

    await contact.save();

    res.json({
      message: 'Contact status updated successfully',
      contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact status', error: error.message });
  }
});

// Reply to contact (admin/moderator only)
router.post('/:id/reply', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage || replyMessage.trim().length === 0) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    // Send reply email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <h2>Reply from XAAB</h2>
        <p>Dear ${contact.name},</p>
        <p>${replyMessage.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>XAAB Team</p>
        <p><em>Xiss Alumni Association Bangalore</em></p>
        <hr>
        <p><strong>Original Message:</strong></p>
        <p><em>${contact.message}</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Update contact record
    contact.status = 'replied';
    contact.adminNotes = replyMessage;
    contact.lastUpdatedBy = req.user._id;
    await contact.save();

    res.json({
      message: 'Reply sent successfully',
      contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reply', error: error.message });
  }
});

// Delete contact submission (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact submission', error: error.message });
  }
});

// Get contact statistics (admin/moderator only)
router.get('/stats/overview', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in_progress' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });
    const closedContacts = await Contact.countDocuments({ status: 'closed' });
    
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get contacts by month for the last 12 months
    const contactsByMonth = await Contact.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      totalContacts,
      newContacts,
      inProgressContacts,
      resolvedContacts,
      closedContacts,
      recentContacts,
      contactsByMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact statistics', error: error.message });
  }
});

module.exports = router;
