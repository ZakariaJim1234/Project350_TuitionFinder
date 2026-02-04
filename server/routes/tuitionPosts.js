import express from 'express';
import TuitionPost from '../models/TuitionPost.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all tuition posts (with filters)
router.get('/', async (req, res) => {
  try {
    const { 
      subject, 
      location, 
      minBudget, 
      maxBudget, 
      teachingMode, 
      level,
      status = 'active',
      page = 1,
      limit = 10 
    } = req.query;
    
    let query = { status };
    
    if (subject) {
      query['subjects.name'] = { $regex: subject, $options: 'i' };
    }
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = Number(minBudget);
      if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };
    }
    
    if (teachingMode) {
      query['requirements.teachingMode'] = teachingMode;
    }
    
    if (level) {
      query['subjects.level'] = level;
    }

    const posts = await TuitionPost.find(query)
      .populate('guardian', 'name email location phone')
      .populate('applications.tutor', 'name email avatar')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TuitionPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching tuition posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single tuition post
router.get('/:id', async (req, res) => {
  try {
    const post = await TuitionPost.findById(req.params.id)
      .populate('guardian', 'name email location phone avatar bio')
      .populate('applications.tutor', 'name email avatar bio location')
      .populate('selectedTutor', 'name email avatar');

    if (!post) {
      return res.status(404).json({ message: 'Tuition post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching tuition post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create tuition post (Guardian only)
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'guardian' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only guardians can create tuition posts' });
    }

    const postData = { ...req.body, guardian: req.user.userId };
    const post = new TuitionPost(postData);
    await post.save();
    
    const populatedPost = await TuitionPost.findById(post._id)
      .populate('guardian', 'name email location phone');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating tuition post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update tuition post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await TuitionPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Tuition post not found' });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (post.guardian.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedPost = await TuitionPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('guardian', 'name email location phone');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating tuition post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for tuition post (Tutor only)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can apply for tuition posts' });
    }

    const post = await TuitionPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Tuition post not found' });
    }

    if (post.status !== 'active') {
      return res.status(400).json({ message: 'This tuition post is no longer active' });
    }

    // Check if tutor already applied
    const existingApplication = post.applications.find(
      app => app.tutor.toString() === req.user.userId
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this position' });
    }

    const { coverLetter, proposedRate, cv } = req.body;

    post.applications.push({
      tutor: req.user.userId,
      coverLetter: coverLetter || '',
      proposedRate: proposedRate || 0,
      cv: cv || {},
      appliedAt: new Date()
    });

    await post.save();

    const updatedPost = await TuitionPost.findById(req.params.id)
      .populate('applications.tutor', 'name email avatar bio location');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error applying to tuition post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (Guardian/Admin only)
router.put('/:postId/applications/:applicationId', auth, async (req, res) => {
  try {
    const post = await TuitionPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Tuition post not found' });
    }

    const user = await User.findById(req.user.userId);
    
    if (post.guardian.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = post.applications.id(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { status } = req.body;
    application.status = status;

    // If accepting an application, set as selected tutor and mark post as filled
    if (status === 'accepted') {
      post.selectedTutor = application.tutor;
      post.status = 'filled';
      
      // Reject all other applications
      post.applications.forEach(app => {
        if (app._id.toString() !== req.params.applicationId && app.status === 'pending') {
          app.status = 'rejected';
        }
      });
    }

    await post.save();

    const updatedPost = await TuitionPost.findById(req.params.postId)
      .populate('applications.tutor', 'name email avatar bio location')
      .populate('selectedTutor', 'name email avatar');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my posts (Guardian)
router.get('/my/posts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'guardian' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = {};
    if (user.role === 'guardian') {
      query.guardian = req.user.userId;
    }

    const posts = await TuitionPost.find(query)
      .populate('applications.tutor', 'name email avatar bio')
      .populate('selectedTutor', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching my posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my applications (Tutor)
router.get('/my/applications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'tutor') {
      return res.status(403).json({ message: 'Only tutors can view applications' });
    }

    const posts = await TuitionPost.find({
      'applications.tutor': req.user.userId
    })
    .populate('guardian', 'name email location')
    .sort({ 'applications.appliedAt': -1 });

    const applications = posts.map(post => {
      const application = post.applications.find(
        app => app.tutor.toString() === req.user.userId
      );
      return {
        ...post.toObject(),
        myApplication: application
      };
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
