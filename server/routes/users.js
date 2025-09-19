const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin role required.' });
};

// Get all users (admin only)
router.get('/', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res) => {
  try {
    const { 
      role, 
      batch, 
      graduationYear, 
      isActive, 
      limit = 20, 
      skip = 0,
      search
    } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (batch) query.batch = batch;
    if (graduationYear) query.graduationYear = graduationYear;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { currentPosition: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-googleId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get public alumni directory (authenticated users)
router.get('/alumni', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { 
      batch, 
      graduationYear, 
      company, 
      location, 
      limit = 20, 
      skip = 0,
      search
    } = req.query;
    
    let query = { isActive: true };
    if (batch) query.batch = batch;
    if (graduationYear) query.graduationYear = graduationYear;
    if (company) query.company = new RegExp(company, 'i');
    if (location) query.location = new RegExp(location, 'i');

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { currentPosition: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name firstName lastName batch graduationYear currentPosition company location profilePicture bio linkedin')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alumni', error: error.message });
  }
});

// Get user by ID (public profile)
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name firstName lastName batch graduationYear currentPosition company location profilePicture bio linkedin createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Get current user profile (authenticated)
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    user: req.user.getPublicProfile()
  });
});

// Update user profile (authenticated)
router.put('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      batch, 
      graduationYear, 
      currentPosition, 
      company, 
      location, 
      bio, 
      phone, 
      linkedin 
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (batch !== undefined) user.batch = batch;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (currentPosition !== undefined) user.currentPosition = currentPosition;
    if (company !== undefined) user.company = company;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (linkedin !== undefined) user.linkedin = linkedin;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// Toggle user active status (admin only)
router.put('/:id/toggle-active', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user status', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    const memberUsers = await User.countDocuments({ role: 'member' });
    
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get users by batch
    const usersByBatch = await User.aggregate([
      { $match: { batch: { $exists: true, $ne: null } } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get users by graduation year
    const usersByYear = await User.aggregate([
      { $match: { graduationYear: { $exists: true, $ne: null } } },
      { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      moderatorUsers,
      memberUsers,
      recentUsers,
      usersByBatch,
      usersByYear
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
  }
});

module.exports = router;
