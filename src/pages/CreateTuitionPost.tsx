import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Minus, Save, MapPin, Clock, DollarSign, BookOpen, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../contexts/AuthContext';

const CreateTuitionPost = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjects: [{ name: '', level: 'elementary' }],
    studentInfo: {
      name: '',
      age: '',
      grade: '',
      currentLevel: '',
      learningGoals: ''
    },
    requirements: {
      experience: 0,
      qualifications: [''],
      teachingMode: 'both',
      preferredGender: 'any'
    },
    schedule: {
      daysPerWeek: 2,
      hoursPerSession: 1,
      preferredTimes: [''],
      startDate: '',
      duration: ''
    },
    budget: {
      min: 2000,
      max: 5000,
      currency: 'Taka'
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    priority: 'medium',
    tags: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.studentInfo.name.trim()) {
        throw new Error('Student name is required');
      }
      if (!formData.studentInfo.age) {
        throw new Error('Student age is required');
      }
      if (!formData.studentInfo.grade.trim()) {
        throw new Error('Student grade is required');
      }
      if (!formData.location.city.trim()) {
        throw new Error('City is required');
      }
      if (!formData.location.state.trim()) {
        throw new Error('State is required');
      }
      if (!formData.subjects.some(s => s.name.trim())) {
        throw new Error('At least one subject is required');
      }

      // Clean up and format data
      const cleanedData = {
        ...formData,
        subjects: formData.subjects.filter(s => s.name.trim()).map(s => ({
          name: s.name,
          level: s.level
        })),
        requirements: {
          ...formData.requirements,
          qualifications: formData.requirements.qualifications.filter(q => q.trim()),
          experience: Number(formData.requirements.experience)
        },
        schedule: {
          ...formData.schedule,
          preferredTimes: formData.schedule.preferredTimes.filter(t => t.trim()),
          startDate: formData.schedule.startDate ? new Date(formData.schedule.startDate) : undefined,
          daysPerWeek: Number(formData.schedule.daysPerWeek),
          hoursPerSession: Number(formData.schedule.hoursPerSession)
        },
        budget: {
          min: Number(formData.budget.min),
          max: Number(formData.budget.max),
          currency: formData.budget.currency
        },
        tags: formData.tags.filter(t => t.trim()),
        studentInfo: {
          ...formData.studentInfo,
          age: Number(formData.studentInfo.age) || undefined,
          name: formData.studentInfo.name.trim(),
          grade: formData.studentInfo.grade.trim(),
          currentLevel: formData.studentInfo.currentLevel.trim(),
          learningGoals: formData.studentInfo.learningGoals.trim()
        },
        location: {
          ...formData.location,
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
          address: formData.location.address.trim(),
          zipCode: formData.location.zipCode.trim()
        }
      };

      await api.post('/api/tuition-posts', cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/tuition-posts');
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to create tuition post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: string, field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: prev[section as keyof typeof prev][field as keyof any].map((item: any, i: number) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addArrayItem = (section: string, field: string, defaultValue: any = '') => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: [...prev[section as keyof typeof prev][field as keyof any], defaultValue]
      }
    }));
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: prev[section as keyof typeof prev][field as keyof any].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  if (user?.role !== 'guardian' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only guardians can create tuition posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Tuition Post</h1>
          <p className="text-xl text-gray-600">Find the perfect tutor for your child's educational needs</p>
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Math Tutor Needed for Grade 10 Student"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your tutoring requirements, learning goals, and any specific needs..."
              />
            </div>
          </motion.div>

          {/* Student Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="h-6 w-6 mr-2 text-green-600" />
              Student Information
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentInfo.name}
                  onChange={(e) => handleChange('studentInfo', 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  value={formData.studentInfo.age}
                  onChange={(e) => handleChange('studentInfo', 'age', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentInfo.grade}
                  onChange={(e) => handleChange('studentInfo', 'grade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grade 10, Year 12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Level
                </label>
                <input
                  type="text"
                  value={formData.studentInfo.currentLevel}
                  onChange={(e) => handleChange('studentInfo', 'currentLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Struggling with algebra, Advanced in calculus"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Goals
                </label>
                <input
                  type="text"
                  value={formData.studentInfo.learningGoals}
                  onChange={(e) => handleChange('studentInfo', 'learningGoals', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Improve grades, Prepare for exams"
                />
              </div>
            </div>
          </motion.div>

          {/* Subjects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subjects</h2>
            
            {formData.subjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => {
                      const newSubjects = [...formData.subjects];
                      newSubjects[index].name = e.target.value;
                      setFormData({...formData, subjects: newSubjects});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Subject name"
                  />
                </div>
                <div className="w-40">
                  <select
                    value={subject.level}
                    onChange={(e) => {
                      const newSubjects = [...formData.subjects];
                      newSubjects[index].level = e.target.value;
                      setFormData({...formData, subjects: newSubjects});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="primary school">Primary School</option>
                    <option value="junior school">Junior School</option>
                    <option value="high">High School</option>
                    <option value="college">College</option>
                    <option value="university">University</option>
                  </select>
                </div>
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSubjects = formData.subjects.filter((_, i) => i !== index);
                      setFormData({...formData, subjects: newSubjects});
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                subjects: [...formData.subjects, { name: '', level: 'elementary' }]
              })}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Subject</span>
            </button>
          </motion.div>

          {/* Schedule & Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-purple-600" />
              Schedule & Budget
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.schedule.daysPerWeek}
                  onChange={(e) => handleChange('schedule', 'daysPerWeek', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours per Session
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.schedule.hoursPerSession}
                  onChange={(e) => handleChange('schedule', 'hoursPerSession', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.schedule.startDate}
                  onChange={(e) => handleChange('schedule', 'startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.schedule.duration}
                  onChange={(e) => handleChange('schedule', 'duration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3 months, 1 year"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (per month)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    Taka
                    <input
                      type="number"
                      min="0"
                      value={formData.budget.min}
                      onChange={(e) => handleChange('budget', 'min', Number(e.target.value))}
                      className="w-20 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex items-center">
                    Taka
                    <input
                      type="number"
                      min="0"
                      value={formData.budget.max}
                      onChange={(e) => handleChange('budget', 'max', Number(e.target.value))}
                      className="w-20 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Mode
                </label>
                <select
                  value={formData.requirements.teachingMode}
                  onChange={(e) => handleChange('requirements', 'teachingMode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="online">Online Only</option>
                  <option value="offline">In-Person Only</option>
                  <option value="both">Both Online & In-Person</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-red-600" />
              Location
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.city}
                  onChange={(e) => handleChange('location', 'city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.state}
                  onChange={(e) => handleChange('location', 'state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleChange('location', 'address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) => handleChange('location', 'zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end space-x-4"
          >
            <button
              type="button"
              onClick={() => navigate('/tuition-posts')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Creating...' : 'Create Post'}</span>
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateTuitionPost;
