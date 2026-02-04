import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserCheck, Phone, MapPin, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    location: '',
    bio: '',
    // Guardian specific
    children: [{ name: '', age: '', grade: '' }],
    // Admin specific (hidden from form)
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const additionalData: any = {
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      };

      if (formData.role === 'guardian') {
        additionalData.children = formData.children.filter(child => 
          child.name && child.age && child.grade
        );
      }

      await register(formData.name, formData.email, formData.password, formData.role, additionalData);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedChildren = [...formData.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setFormData({ ...formData, children: updatedChildren });
  };

  const addChild = () => {
    setFormData({
      ...formData,
      children: [...formData.children, { name: '', age: '', grade: '' }]
    });
  };

  const removeChild = (index: number) => {
    const updatedChildren = formData.children.filter((_, i) => i !== index);
    setFormData({ ...formData, children: updatedChildren });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Join TuitionHub
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">
            Create your account to start your educational journey
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-12 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-12 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-12 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-12 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location (City, State)"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-12 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-12 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-white/30 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student" className="text-gray-900">Student - I want to learn</option>
                <option value="tutor" className="text-gray-900">Tutor - I want to teach</option>
                <option value="guardian" className="text-gray-900">Guardian - I'm looking for tutors for my child</option>
              </select>
            </div>

            {/* Bio */}
            <div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="appearance-none relative block w-full px-4 py-3 border border-white/30 placeholder-blue-200 text-white rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Guardian-specific fields */}
            {formData.role === 'guardian' && (
              <div className="space-y-4 border-t border-white/20 pt-4">
                <div className="flex items-center space-x-2 text-blue-200">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Children Information</span>
                </div>
                
                {formData.children.map((child, index) => (
                  <div key={index} className="space-y-2 bg-white/5 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-200">Child {index + 1}</span>
                      {formData.children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="text-red-300 hover:text-red-200 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Child's name"
                      value={child.name}
                      onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-white/30 placeholder-blue-200 text-white rounded bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Age"
                        value={child.age}
                        onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                        className="px-3 py-2 border border-white/30 placeholder-blue-200 text-white rounded bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Grade"
                        value={child.grade}
                        onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                        className="px-3 py-2 border border-white/30 placeholder-blue-200 text-white rounded bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addChild}
                  className="w-full py-2 border border-white/30 text-blue-200 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  + Add Another Child
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserCheck className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
              </span>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-blue-100">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
