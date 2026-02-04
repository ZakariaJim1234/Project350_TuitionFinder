import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: [{
    name: String,
    level: String,
    price: Number
  }],
  experience: {
    type: Number,
    required: true
  },
  education: {
    degree: String,
    institution: String,
    year: Number
  },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  teachingMode: {
    type: [String],
    enum: ['online', 'offline', 'both'],
    default: ['both']
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Tutor', tutorSchema);
