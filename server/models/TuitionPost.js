import mongoose from 'mongoose';

const tuitionPostSchema = new mongoose.Schema({
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subjects: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true,
      enum: ['elementary', 'middle', 'high', 'college', 'professional']
    }
  }],
  studentInfo: {
    name: String,
    age: Number,
    grade: String,
    currentLevel: String,
    learningGoals: String
  },
  requirements: {
    experience: {
      type: Number,
      default: 0
    },
    qualifications: [String],
    teachingMode: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both'
    },
    preferredGender: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any'
    }
  },
  schedule: {
    daysPerWeek: Number,
    hoursPerSession: Number,
    preferredTimes: [String],
    startDate: Date,
    duration: String // e.g., "3 months", "1 year"
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'filled', 'expired', 'cancelled'],
    default: 'active'
  },
  applications: [{
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    coverLetter: String,
    proposedRate: Number,
    cv: {
      filename: String,
      url: String,
      uploadedAt: Date
    }
  }],
  selectedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tuitionPostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('TuitionPost', tuitionPostSchema);
