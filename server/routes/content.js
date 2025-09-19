const express = require('express');
const passport = require('passport');
const Page = require('../models/Page');
const News = require('../models/News');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const router = express.Router();

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin or moderator role required.' });
};

// Get dashboard overview (admin/moderator only)
router.get('/dashboard', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    // Get counts for different content types
    const [
      totalPages,
      publishedPages,
      draftPages,
      totalNews,
      publishedNews,
      draftNews,
      totalEvents,
      publishedEvents,
      upcomingEvents,
      totalGalleries,
      publishedGalleries,
      featuredGalleries
    ] = await Promise.all([
      Page.countDocuments(),
      Page.countDocuments({ status: 'published' }),
      Page.countDocuments({ status: 'draft' }),
      News.countDocuments(),
      News.countDocuments({ status: 'published' }),
      News.countDocuments({ status: 'draft' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Event.countDocuments({ 
        status: 'published',
        eventDate: { $gte: new Date() }
      }),
      Gallery.countDocuments(),
      Gallery.countDocuments({ status: 'published' }),
      Gallery.countDocuments({ isFeatured: true })
    ]);

    // Get recent content
    const [
      recentPages,
      recentNews,
      recentEvents,
      recentGalleries
    ] = await Promise.all([
      Page.find()
        .populate('author', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),
      News.find()
        .populate('author', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),
      Event.find()
        .populate('organizer', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),
      Gallery.find()
        .populate('author', 'name')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    // Get total views across all content
    const [
      totalPageViews,
      totalNewsViews,
      totalEventViews,
      totalGalleryViews
    ] = await Promise.all([
      Page.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      News.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Event.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Gallery.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
    ]);

    const totalViews = (totalPageViews[0]?.total || 0) + 
                      (totalNewsViews[0]?.total || 0) + 
                      (totalEventViews[0]?.total || 0) + 
                      (totalGalleryViews[0]?.total || 0);

    res.json({
      overview: {
        pages: { total: totalPages, published: publishedPages, draft: draftPages },
        news: { total: totalNews, published: publishedNews, draft: draftNews },
        events: { total: totalEvents, published: publishedEvents, upcoming: upcomingEvents },
        galleries: { total: totalGalleries, published: publishedGalleries, featured: featuredGalleries },
        totalViews
      },
      recentContent: {
        pages: recentPages,
        news: recentNews,
        events: recentEvents,
        galleries: recentGalleries
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Search all content (admin/moderator only)
router.get('/search', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { query, type, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i');
    const results = {};

    // Search pages
    if (!type || type === 'pages') {
      results.pages = await Page.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex }
        ]
      })
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    }

    // Search news
    if (!type || type === 'news') {
      results.news = await News.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex }
        ]
      })
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    }

    // Search events
    if (!type || type === 'events') {
      results.events = await Event.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex }
        ]
      })
      .populate('organizer', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    }

    // Search galleries
    if (!type || type === 'galleries') {
      results.galleries = await Gallery.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching content', error: error.message });
  }
});

// Bulk operations (admin/moderator only)
router.post('/bulk/update', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { type, ids, updateData } = req.body;

    if (!type || !Array.isArray(ids) || ids.length === 0 || !updateData) {
      return res.status(400).json({ message: 'Type, IDs array, and update data are required' });
    }

    let Model;
    switch (type) {
      case 'pages':
        Model = Page;
        break;
      case 'news':
        Model = News;
        break;
      case 'events':
        Model = Event;
        break;
      case 'galleries':
        Model = Gallery;
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }

    const result = await Model.updateMany(
      { _id: { $in: ids } },
      { 
        ...updateData,
        lastModifiedBy: req.user._id
      }
    );

    res.json({
      message: `${result.modifiedCount} ${type} updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk updating content', error: error.message });
  }
});

// Bulk delete (admin only)
router.delete('/bulk/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { type, ids } = req.body;

    if (!type || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Type and IDs array are required' });
    }

    let Model;
    switch (type) {
      case 'pages':
        Model = Page;
        break;
      case 'news':
        Model = News;
        break;
      case 'events':
        Model = Event;
        break;
      case 'galleries':
        Model = Gallery;
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }

    const result = await Model.deleteMany({ _id: { $in: ids } });

    res.json({
      message: `${result.deletedCount} ${type} deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk deleting content', error: error.message });
  }
});

// Get content statistics by date range
router.get('/stats/date-range', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dateFilter = {
      createdAt: { $gte: start, $lte: end }
    };

    const results = {};

    if (!type || type === 'pages') {
      results.pages = await Page.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    }

    if (!type || type === 'news') {
      results.news = await News.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    }

    if (!type || type === 'events') {
      results.events = await Event.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    }

    if (!type || type === 'galleries') {
      results.galleries = await Gallery.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content statistics', error: error.message });
  }
});

module.exports = router;
