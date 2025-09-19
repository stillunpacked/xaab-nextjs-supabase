const express = require('express');
const passport = require('passport');
const News = require('../models/News');
const router = express.Router();

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin or moderator role required.' });
};

// Get all news (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      breaking, 
      limit = 10, 
      skip = 0,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = { status: 'published' };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (breaking === 'true') query.isBreaking = true;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const news = await News.find(query)
      .populate('author', 'name email profilePicture')
      .populate('lastModifiedBy', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await News.countDocuments(query);

    res.json({
      news,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

// Get featured news (public)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await News.getFeatured(parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured news', error: error.message });
  }
});

// Get breaking news (public)
router.get('/breaking', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const news = await News.getBreaking(parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching breaking news', error: error.message });
  }
});

// Get news by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    const news = await News.getByCategory(category, parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news by category', error: error.message });
  }
});

// Search news (public)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const news = await News.search(query, parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error searching news', error: error.message });
  }
});

// Get news by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name email profilePicture')
      .populate('lastModifiedBy', 'name email')
      .populate('relatedNews', 'title slug featuredImage publishedAt');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    // Increment view count
    await news.incrementViewCount();

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news article', error: error.message });
  }
});

// Get news by ID (admin/moderator only)
router.get('/admin/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name email profilePicture')
      .populate('lastModifiedBy', 'name email');

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news article', error: error.message });
  }
});

// Create new news (admin/moderator only)
router.post('/', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const newsData = {
      ...req.body,
      author: req.user._id,
      lastModifiedBy: req.user._id
    };

    // Set publishedAt if status is published
    if (newsData.status === 'published' && !newsData.publishedAt) {
      newsData.publishedAt = new Date();
    }

    const news = new News(newsData);
    await news.save();

    await news.populate('author', 'name email profilePicture');
    await news.populate('lastModifiedBy', 'name email');

    res.status(201).json({
      message: 'News article created successfully',
      news
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating news article', error: error.message });
  }
});

// Update news (admin/moderator only)
router.put('/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    // Set publishedAt if status is being changed to published
    if (updateData.status === 'published' && news.status !== 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('author', 'name email profilePicture')
    .populate('lastModifiedBy', 'name email');

    res.json({
      message: 'News article updated successfully',
      news: updatedNews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating news article', error: error.message });
  }
});

// Delete news (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news article', error: error.message });
  }
});

// Like news article (authenticated users)
router.post('/:id/like', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await news.incrementLikeCount();

    res.json({
      message: 'News article liked successfully',
      likeCount: news.likeCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error liking news article', error: error.message });
  }
});

// Share news article (public)
router.post('/:id/share', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await news.incrementShareCount();

    res.json({
      message: 'News article share count updated',
      shareCount: news.shareCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating share count', error: error.message });
  }
});

// Get news statistics (admin/moderator only)
router.get('/stats/overview', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: 'published' });
    const draftNews = await News.countDocuments({ status: 'draft' });
    const featuredNews = await News.countDocuments({ isFeatured: true });
    const breakingNews = await News.countDocuments({ isBreaking: true });
    
    const totalViews = await News.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    const totalLikes = await News.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
    ]);

    const totalShares = await News.aggregate([
      { $group: { _id: null, totalShares: { $sum: '$shareCount' } } }
    ]);

    const recentNews = await News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalNews,
      publishedNews,
      draftNews,
      featuredNews,
      breakingNews,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      totalShares: totalShares[0]?.totalShares || 0,
      recentNews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news statistics', error: error.message });
  }
});

module.exports = router;
