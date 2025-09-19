const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  eventDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  startTime: {
    type: String,
    trim: true
  },
  endTime: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['conference', 'workshop', 'seminar', 'networking', 'reunion', 'social', 'sports', 'cultural', 'other'],
    default: 'other'
  },
  category: {
    type: String,
    enum: ['academic', 'professional', 'social', 'sports', 'cultural', 'alumni', 'other'],
    default: 'alumni'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'yearly'
  },
  maxAttendees: {
    type: Number,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speakers: [{
    name: String,
    title: String,
    company: String,
    bio: String,
    image: String
  }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    level: {
      type: String,
      enum: ['platinum', 'gold', 'silver', 'bronze'],
      default: 'bronze'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String
  },
  virtualPlatform: {
    type: String,
    enum: ['zoom', 'teams', 'google_meet', 'webex', 'other'],
    default: 'zoom'
  },
  requirements: [{
    type: String
  }],
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  registrationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
eventSchema.index({ eventDate: -1 });
eventSchema.index({ status: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ tags: 1 });

// Virtual for event status based on date
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  if (this.status === 'cancelled') return 'cancelled';
  if (this.eventDate > now) return 'upcoming';
  if (this.endDate && this.endDate < now) return 'completed';
  if (this.eventDate <= now && (!this.endDate || this.endDate >= now)) return 'ongoing';
  return 'upcoming';
});

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function() {
  if (!this.registrationRequired) return false;
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
  if (this.maxAttendees && this.currentAttendees >= this.maxAttendees) return false;
  return this.status === 'published';
};

// Method to increment view count
eventSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get upcoming events
eventSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({
    status: 'published',
    eventDate: { $gte: new Date() }
  }).sort({ eventDate: 1 }).limit(limit);
};

// Static method to get events by date range
eventSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    status: 'published',
    eventDate: { $gte: startDate, $lte: endDate }
  }).sort({ eventDate: 1 });
};

module.exports = mongoose.model('Event', eventSchema);
