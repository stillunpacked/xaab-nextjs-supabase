const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  pageType: {
    type: String,
    enum: ['home', 'about', 'events', 'news', 'gallery', 'contact', 'alumni', 'custom'],
    default: 'custom'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isHomePage: {
    type: Boolean,
    default: false
  },
  showInNavigation: {
    type: Boolean,
    default: true
  },
  navigationOrder: {
    type: Number,
    default: 0
  },
  parentPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  seoData: {
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: String
  },
  customFields: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for better performance
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1 });
pageSchema.index({ pageType: 1 });
pageSchema.index({ publishedAt: -1 });
pageSchema.index({ showInNavigation: 1, navigationOrder: 1 });

// Pre-save middleware to generate slug if not provided
pageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to increment view count
pageSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get published pages
pageSchema.statics.getPublished = function() {
  return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};

// Static method to get navigation pages
pageSchema.statics.getNavigationPages = function() {
  return this.find({ 
    status: 'published', 
    showInNavigation: true 
  }).sort({ navigationOrder: 1 });
};

module.exports = mongoose.model('Page', pageSchema);
