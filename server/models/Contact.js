const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'replied', 'resolved', 'closed'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['contact_form', 'email', 'phone', 'other'],
    default: 'contact_form'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isSpam: {
    type: Boolean,
    default: false
  },
  responseTime: {
    type: Number, // in hours
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ priority: 1 });

// Pre-save middleware to calculate response time
contactSchema.pre('save', function(next) {
  if (this.status === 'replied' && this.isNew) {
    const now = new Date();
    const created = this.createdAt;
    this.responseTime = Math.round((now - created) / (1000 * 60 * 60)); // hours
  }
  next();
});

// Method to mark as spam
contactSchema.methods.markAsSpam = function() {
  this.isSpam = true;
  this.status = 'closed';
  return this.save();
};

// Method to update status
contactSchema.methods.updateStatus = function(status, adminNotes, userId) {
  this.status = status;
  if (adminNotes) this.adminNotes = adminNotes;
  if (userId) this.lastUpdatedBy = userId;
  return this.save();
};

// Static method to get contacts by status
contactSchema.statics.getByStatus = function(status, limit = 20) {
  return this.find({ status: status })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get recent contacts
contactSchema.statics.getRecent = function(limit = 10) {
  return this.find({ isSpam: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get spam contacts
contactSchema.statics.getSpam = function(limit = 20) {
  return this.find({ isSpam: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search contacts
contactSchema.statics.search = function(query, limit = 20) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { subject: { $regex: query, $options: 'i' } },
      { message: { $regex: query, $options: 'i' } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Contact', contactSchema);
