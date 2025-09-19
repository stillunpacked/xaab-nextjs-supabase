const express = require('express');
const passport = require('passport');
const Page = require('../models/Page');
const router = express.Router();

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin or moderator role required.' });
};

// Get all pages (public)
router.get('/', async (req, res) => {
  try {
    const { status, pageType, limit = 10, skip = 0 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (pageType) query.pageType = pageType;

    const pages = await Page.find(query)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Page.countDocuments(query);

    res.json({
      pages,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pages', error: error.message });
  }
});

// Get published pages (public)
router.get('/published', async (req, res) => {
  try {
    const pages = await Page.getPublished();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching published pages', error: error.message });
  }
});

// Get navigation pages (public)
router.get('/navigation', async (req, res) => {
  try {
    const pages = await Page.getNavigationPages();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching navigation pages', error: error.message });
  }
});

// Get page by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Increment view count
    await page.incrementViewCount();

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
});

// Get page by ID (admin/moderator only)
router.get('/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
});

// Create new page (admin/moderator only)
router.post('/', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const pageData = {
      ...req.body,
      author: req.user._id,
      lastModifiedBy: req.user._id
    };

    // Set publishedAt if status is published
    if (pageData.status === 'published' && !pageData.publishedAt) {
      pageData.publishedAt = new Date();
    }

    const page = new Page(pageData);
    await page.save();

    await page.populate('author', 'name email');
    await page.populate('lastModifiedBy', 'name email');

    res.status(201).json({
      message: 'Page created successfully',
      page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating page', error: error.message });
  }
});

// Update page (admin/moderator only)
router.put('/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    // Set publishedAt if status is being changed to published
    if (updateData.status === 'published' && page.status !== 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedPage = await Page.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('author', 'name email')
    .populate('lastModifiedBy', 'name email');

    res.json({
      message: 'Page updated successfully',
      page: updatedPage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating page', error: error.message });
  }
});

// Delete page (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    await Page.findByIdAndDelete(req.params.id);

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting page', error: error.message });
  }
});

// Bulk update pages (admin/moderator only)
router.put('/bulk/update', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { pageIds, updateData } = req.body;

    if (!Array.isArray(pageIds) || pageIds.length === 0) {
      return res.status(400).json({ message: 'Page IDs array is required' });
    }

    const result = await Page.updateMany(
      { _id: { $in: pageIds } },
      { 
        ...updateData,
        lastModifiedBy: req.user._id
      }
    );

    res.json({
      message: `${result.modifiedCount} pages updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk updating pages', error: error.message });
  }
});

// Get page statistics (admin/moderator only)
router.get('/stats/overview', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const totalPages = await Page.countDocuments();
    const publishedPages = await Page.countDocuments({ status: 'published' });
    const draftPages = await Page.countDocuments({ status: 'draft' });
    const archivedPages = await Page.countDocuments({ status: 'archived' });
    
    const totalViews = await Page.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    const recentPages = await Page.find()
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      totalPages,
      publishedPages,
      draftPages,
      archivedPages,
      totalViews: totalViews[0]?.totalViews || 0,
      recentPages
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page statistics', error: error.message });
  }
});

module.exports = router;
