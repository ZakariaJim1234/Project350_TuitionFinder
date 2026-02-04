import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'tutor', 'guardian', 'admin'], required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  children: [{ name: String, age: Number, grade: String }],
  permissions: [{ type: String, enum: ['manage_users', 'manage_posts', 'manage_applications', 'view_analytics'] }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Virtual field for tutor profile
userSchema.virtual('tutorProfile', {
  ref: 'Tutor',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
