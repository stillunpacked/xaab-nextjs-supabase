const express = require('express');
const passport = require('passport');
const Gallery = require('../models/Gallery');
const router = express.Router();

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin or moderator role required.' });
};

// Get all galleries (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      event, 
      limit = 12, 
      skip = 0,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    let query = { status: 'published' };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (event) query.event = event;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const galleries = await Gallery.find(query)
      .populate('author', 'name email profilePicture')
      .populate('event', 'title eventDate')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Gallery.countDocuments(query);

    res.json({
      galleries,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching galleries', error: error.message });
  }
});

// Get featured galleries (public)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const galleries = await Gallery.getFeatured(parseInt(limit));
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured galleries', error: error.message });
  }
});

// Get galleries by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;
    const galleries = await Gallery.getByCategory(category, parseInt(limit));
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching galleries by category', error: error.message });
  }
});

// Get galleries by event (public)
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 12 } = req.query;
    const galleries = await Gallery.getByEvent(eventId, parseInt(limit));
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching galleries by event', error: error.message });
  }
});

// Search galleries (public)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 12 } = req.query;
    const galleries = await Gallery.search(query, parseInt(limit));
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Error searching galleries', error: error.message });
  }
});

// Get gallery by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('author', 'name email profilePicture')
      .populate('event', 'title eventDate location');

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Increment view count
    await gallery.incrementViewCount();

    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery', error: error.message });
  }
});

// Create new gallery (admin/moderator only)
router.post('/', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const galleryData = {
      ...req.body,
      author: req.user._id
    };

    const gallery = new Gallery(galleryData);
    await gallery.save();

    await gallery.populate('author', 'name email profilePicture');
    await gallery.populate('event', 'title eventDate');

    res.status(201).json({
      message: 'Gallery created successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating gallery', error: error.message });
  }
});

// Update gallery (admin/moderator only)
router.put('/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'name email profilePicture')
    .populate('event', 'title eventDate');

    res.json({
      message: 'Gallery updated successfully',
      gallery: updatedGallery
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating gallery', error: error.message });
  }
});

// Delete gallery (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery', error: error.message });
  }
});

// Add image to gallery (admin/moderator only)
router.post('/:id/images', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    await gallery.addImage(images);

    res.json({
      message: 'Images added to gallery successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding images to gallery', error: error.message });
  }
});

// Remove image from gallery (admin/moderator only)
router.delete('/:id/images/:imageId', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const { imageId } = req.params;
    await gallery.removeImage(imageId);

    res.json({
      message: 'Image removed from gallery successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing image from gallery', error: error.message });
  }
});

// Reorder images in gallery (admin/moderator only)
router.put('/:id/images/reorder', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const { imageIds } = req.body;
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ message: 'Image IDs array is required' });
    }

    await gallery.reorderImages(imageIds);

    res.json({
      message: 'Images reordered successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering images', error: error.message });
  }
});

// Like gallery (authenticated users)
router.post('/:id/like', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    await gallery.incrementLikeCount();

    res.json({
      message: 'Gallery liked successfully',
      likeCount: gallery.likeCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error liking gallery', error: error.message });
  }
});

// Get gallery statistics (admin/moderator only)
router.get('/stats/overview', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const totalGalleries = await Gallery.countDocuments();
    const publishedGalleries = await Gallery.countDocuments({ status: 'published' });
    const featuredGalleries = await Gallery.countDocuments({ isFeatured: true });
    
    const totalImages = await Gallery.aggregate([
      { $project: { imageCount: { $size: '$images' } } },
      { $group: { _id: null, totalImages: { $sum: '$imageCount' } } }
    ]);

    const totalViews = await Gallery.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    const totalLikes = await Gallery.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
    ]);

    const recentGalleries = await Gallery.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalGalleries,
      publishedGalleries,
      featuredGalleries,
      totalImages: totalImages[0]?.totalImages || 0,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      recentGalleries
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery statistics', error: error.message });
  }
});

module.exports = router;
