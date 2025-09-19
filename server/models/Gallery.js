const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    metadata: {
      width: Number,
      height: Number,
      size: Number,
      format: String
    }
  }],
  category: {
    type: String,
    enum: ['events', 'alumni', 'campus', 'sports', 'cultural', 'conferences', 'reunions', 'general'],
    default: 'general'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
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
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  seoData: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
gallerySchema.index({ status: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ date: -1 });
gallerySchema.index({ isFeatured: 1 });
gallerySchema.index({ tags: 1 });
gallerySchema.index({ event: 1 });

// Method to increment view count
gallerySchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment like count
gallerySchema.methods.incrementLikeCount = function() {
  this.likeCount += 1;
  return this.save();
};

// Method to add image to gallery
gallerySchema.methods.addImage = function(imageData) {
  this.images.push(imageData);
  return this.save();
};

// Method to remove image from gallery
gallerySchema.methods.removeImage = function(imageId) {
  this.images = this.images.filter(img => img._id.toString() !== imageId);
  return this.save();
};

// Method to reorder images
gallerySchema.methods.reorderImages = function(imageIds) {
  const orderedImages = [];
  imageIds.forEach(id => {
    const image = this.images.find(img => img._id.toString() === id);
    if (image) {
      orderedImages.push(image);
    }
  });
  this.images = orderedImages;
  return this.save();
};

// Static method to get published galleries
gallerySchema.statics.getPublished = function(limit = 12, skip = 0) {
  return this.find({ status: 'published' })
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get featured galleries
gallerySchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    status: 'published',
    isFeatured: true 
  })
  .sort({ date: -1 })
  .limit(limit);
};

// Static method to get galleries by category
gallerySchema.statics.getByCategory = function(category, limit = 12) {
  return this.find({ 
    status: 'published',
    category: category 
  })
  .sort({ date: -1 })
  .limit(limit);
};

// Static method to get galleries by event
gallerySchema.statics.getByEvent = function(eventId, limit = 12) {
  return this.find({ 
    status: 'published',
    event: eventId 
  })
  .sort({ date: -1 })
  .limit(limit);
};

// Static method to search galleries
gallerySchema.statics.search = function(query, limit = 12) {
  return this.find({
    status: 'published',
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
  .sort({ date: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Gallery', gallerySchema);
