import express from 'express';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all tutors with better error handling
router.get('/', async (req, res) => {
  try {
    const { subject, location, minPrice, maxPrice, rating } = req.query;
    
    let query = { isActive: true };
    
    if (subject) {
      query['subjects.name'] = { $regex: subject, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query['subjects.price'] = {};
      if (minPrice) query['subjects.price'].$gte = Number(minPrice);
      if (maxPrice) query['subjects.price'].$lte = Number(maxPrice);
    }
    
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Add timeout and limit to prevent long-running queries
    const tutors = await Tutor.find(query)
      .populate('user', 'name email avatar bio location')
      .sort({ rating: -1, createdAt: -1 })
      .limit(50) // Limit results to prevent overwhelming queries
      .maxTimeMS(10000); // 10 second timeout

    res.json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    
    // Handle specific MongoDB timeout errors
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single tutor
router.get('/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('user', 'name email avatar bio location')
      .populate('reviews.student', 'name avatar')
      .maxTimeMS(10000); // 10 second timeout

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (error) {
    console.error('Error fetching tutor:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create tutor profile
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).maxTimeMS(10000);
    
    if (user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can create tutor profiles' });
    }

    // Check if tutor profile already exists
    const existingTutor = await Tutor.findOne({ user: req.user.userId }).maxTimeMS(10000);
    if (existingTutor) {
      return res.status(400).json({ message: 'Tutor profile already exists' });
    }

    const tutorData = { ...req.body, user: req.user.userId };
    const tutor = new Tutor(tutorData);
    await tutor.save();
    
    const populatedTutor = await Tutor.findById(tutor._id)
      .populate('user', 'name email avatar bio location')
      .maxTimeMS(10000);
    
    res.status(201).json(populatedTutor);
  } catch (error) {
    console.error('Error creating tutor profile:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update tutor profile
router.put('/:id', auth, async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).maxTimeMS(10000);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    
    const user = await User.findById(req.user.userId).maxTimeMS(10000);
    
    if (tutor.user.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'name email avatar bio location')
     .maxTimeMS(10000);
    
    res.json(updatedTutor);
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const tutor = await Tutor.findById(req.params.id).maxTimeMS(10000);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if user already reviewed this tutor
    const existingReview = tutor.reviews.find(
      review => review.student.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this tutor' });
    }
    
    const review = {
      student: req.user.userId,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    };
    
    tutor.reviews.push(review);
    
    // Calculate new average rating
    const totalRating = tutor.reviews.reduce((sum, review) => sum + review.rating, 0);
    tutor.rating = totalRating / tutor.reviews.length;
    
    await tutor.save();
    
    const updatedTutor = await Tutor.findById(req.params.id)
      .populate('user', 'name email avatar bio location')
      .populate('reviews.student', 'name avatar')
      .maxTimeMS(10000);
    
    res.json(updatedTutor);
  } catch (error) {
    console.error('Error adding review:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my tutor profile
router.get('/my/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).maxTimeMS(10000);
    
    if (user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can access this endpoint' });
    }

    const tutor = await Tutor.findOne({ user: req.user.userId })
      .populate('user', 'name email avatar bio location')
      .populate('reviews.student', 'name avatar')
      .maxTimeMS(10000);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    res.json(tutor);
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
