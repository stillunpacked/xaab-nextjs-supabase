const express = require('express');
const passport = require('passport');
const Event = require('../models/Event');
const router = express.Router();

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin or moderator role required.' });
};

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      eventType, 
      category, 
      location, 
      upcoming, 
      limit = 10, 
      skip = 0,
      sortBy = 'eventDate',
      sortOrder = 'asc'
    } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');

    // Filter for upcoming events
    if (upcoming === 'true') {
      query.eventDate = { $gte: new Date() };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('organizer', 'name email profilePicture')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get upcoming events (public)
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const events = await Event.getUpcoming(parseInt(limit));
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming events', error: error.message });
  }
});

// Get events by date range (public)
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const events = await Event.getByDateRange(new Date(startDate), new Date(endDate));
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events by date range', error: error.message });
  }
});

// Get event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePicture');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment view count
    await event.incrementViewCount();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create new event (admin/moderator only)
router.post('/', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    const event = new Event(eventData);
    await event.save();

    await event.populate('organizer', 'name email profilePicture');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update event (admin/moderator only)
router.put('/:id', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('organizer', 'name email profilePicture');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete event (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// Register for event (authenticated users)
router.post('/:id/register', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isRegistrationOpen()) {
      return res.status(400).json({ message: 'Registration is not open for this event' });
    }

    // Check if user is already registered (you might want to create a separate registration model)
    // For now, we'll just increment the count
    event.currentAttendees += 1;
    event.registrationCount += 1;
    await event.save();

    res.json({
      message: 'Successfully registered for the event',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

// Get event statistics (admin/moderator only)
router.get('/stats/overview', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const upcomingEvents = await Event.countDocuments({ 
      status: 'published',
      eventDate: { $gte: new Date() }
    });
    const pastEvents = await Event.countDocuments({ 
      status: 'published',
      eventDate: { $lt: new Date() }
    });
    
    const totalRegistrations = await Event.aggregate([
      { $group: { _id: null, totalRegistrations: { $sum: '$registrationCount' } } }
    ]);

    const totalViews = await Event.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    const recentEvents = await Event.find()
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalEvents,
      publishedEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations: totalRegistrations[0]?.totalRegistrations || 0,
      totalViews: totalViews[0]?.totalViews || 0,
      recentEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event statistics', error: error.message });
  }
});

// Search events (public)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const events = await Event.find({
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .populate('organizer', 'name email profilePicture')
    .sort({ eventDate: 1 })
    .limit(parseInt(limit));

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error searching events', error: error.message });
  }
});

module.exports = router;
