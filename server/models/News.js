const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
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
  featuredImage: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['alumni', 'achievements', 'events', 'announcements', 'general', 'sports', 'cultural', 'academic'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
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
  likeCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  seoData: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: String
  },
  relatedNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  source: {
    type: String,
    trim: true
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
newsSchema.index({ slug: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ isFeatured: 1 });
newsSchema.index({ isBreaking: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ viewCount: -1 });

// Pre-save middleware to generate slug if not provided
newsSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to increment view count
newsSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment like count
newsSchema.methods.incrementLikeCount = function() {
  this.likeCount += 1;
  return this.save();
};

// Method to increment share count
newsSchema.methods.incrementShareCount = function() {
  this.shareCount += 1;
  return this.save();
};

// Static method to get published news
newsSchema.statics.getPublished = function(limit = 10, skip = 0) {
  return this.find({ 
    status: 'published',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get featured news
newsSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ 
    status: 'published',
    isFeatured: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Static method to get breaking news
newsSchema.statics.getBreaking = function(limit = 3) {
  return this.find({ 
    status: 'published',
    isBreaking: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Static method to get news by category
newsSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    status: 'published',
    category: category,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Static method to search news
newsSchema.statics.search = function(query, limit = 10) {
  return this.find({
    status: 'published',
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('News', newsSchema);
