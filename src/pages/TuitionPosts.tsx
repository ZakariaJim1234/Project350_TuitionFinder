import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Calendar,
  Users,
  Plus,
  Send,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../contexts/AuthContext'; // Import configured axios instance

interface TuitionPost {
  _id: string;
  title: string;
  description: string;
  subjects: Array<{
    name: string;
    level: 'elementary' | 'middle' | 'high' | 'college' | 'professional';
  }>;
  studentInfo: {
    name?: string;
    age?: number;
    grade?: string;
    currentLevel?: string;
    learningGoals?: string;
  };
  requirements: {
    experience: number;
    qualifications: string[];
    teachingMode: 'online' | 'offline' | 'both';
    preferredGender: 'male' | 'female' | 'any';
  };
  schedule: {
    daysPerWeek?: number;
    hoursPerSession?: number;
    preferredTimes: string[];
    startDate?: string;
    duration?: string;
  };
  budget: {
    min?: number;
    max?: number;
    currency: string;
  };
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  guardian: {
    _id: string;
    name?: string;
    email?: string;
    location?: string;
    phone?: string;
  };
  status: 'active' | 'filled' | 'expired' | 'cancelled';
  applications: Array<{
    tutor: string;
    appliedAt: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    coverLetter?: string;
    proposedRate?: number;
    cv?: {
      filename?: string;
      url?: string;
      uploadedAt?: string;
    };
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdAt: string;
  expiresAt: string;
}

const TuitionPosts = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<TuitionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    location: '',
    minBudget: '',
    maxBudget: '',
    teachingMode: '',
    level: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedRate: '',
    cv: {} as { filename?: string; url?: string; uploadedAt?: string }
  });

  useEffect(() => {
    fetchPosts();
  }, [filters, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.location) params.append('location', filters.location);
      if (filters.minBudget) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);
      if (filters.teachingMode) params.append('teachingMode', filters.teachingMode);
      if (filters.level) params.append('level', filters.level);
      params.append('page', currentPage.toString());

      const response = await api.get(`/api/tuition-posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error('Error fetching tuition posts:', error);
      setError(error.response?.data?.message || 'Failed to fetch tuition posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (postId: string) => {
    if (user?.role !== 'tutor') {
      alert('Only tutors can apply for tuition posts');
      return;
    }

    setSelectedPost(postId);
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    if (!selectedPost) return;

    try {
      const cleanedApplicationData = {
        coverLetter: applicationData.coverLetter.trim(),
        proposedRate: Number(applicationData.proposedRate) || undefined,
        cv: applicationData.cv.filename ? applicationData.cv : undefined
      };

      await api.post(`/api/tuition-posts/${selectedPost}/apply`, cleanedApplicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Application submitted successfully!');
      setShowApplicationModal(false);
      setApplicationData({ coverLetter: '', proposedRate: '', cv: {} });
      fetchPosts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const filteredPosts = (posts || []).filter(post =>
    post && (
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.subjects || []).some(subject => 
        subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {user?.role === 'tutor' ? 'Find Tuition Opportunities' : 'Browse Tuition Posts'}
              </h1>
              <p className="text-xl text-gray-600">
                {user?.role === 'tutor' 
                  ? 'Apply for tutoring positions that match your expertise' 
                  : 'Discover tutoring opportunities in your area'
                }
              </p>
            </div>
            {user?.role === 'guardian' && (
              <Link
                to="/create-tuition-post"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Post Tuition Request</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English">English</option>
              <option value="ICT">ICT</option>
              <option value="Biology">Biology</option>
              <option value="Higher Mathematics">Higher Mathematics</option>
              <option value="Bangla">Bangla</option>
              <option value="English">English</option>
              <option value="Economics">Economics</option>
            </select>
            <select
              value={filters.teachingMode}
              onChange={(e) => setFilters({...filters, teachingMode: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Mode</option>
              <option value="online">Online</option>
              <option value="offline">In-Person</option>
              <option value="both">Both</option>
            </select>
            <input
              type="number"
              placeholder="Min Budget"
              value={filters.minBudget}
              onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 group"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(post.priority)}`}>
                          {post.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(post.applications || []).length} applications
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Student: {post.studentInfo?.name || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      Age: {post.studentInfo?.age || 'N/A'} • Grade: {post.studentInfo?.grade || 'N/A'}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Subjects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(post.subjects || []).slice(0, 3).map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {subject.name} ({subject.level})
                        </span>
                      ))}
                      {(post.subjects || []).length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{(post.subjects || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {post.location?.city || 'N/A'}, {post.location?.state || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {post.schedule?.daysPerWeek || 0} days/week • {post.schedule?.hoursPerSession || 0}h sessions
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ৳{post.budget?.min || 0}-৳{post.budget?.max || 0}/hour
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {post.requirements?.teachingMode || 'N/A'} • {post.requirements?.experience || 0}+ years exp.
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {user?.role === 'tutor' && (
                      <button
                        onClick={() => handleApply(post._id)}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        <Send className="h-4 w-4" />
                        <span>Apply</span>
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span>Posted by {post.guardian?.name || 'Anonymous'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                </button>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tuition posts found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for Position</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={4}
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Give your full experience and qualifications.Also Provide your Contact Information."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Rate (per hour) *
                  </label>
                  <input
                    type="number"
                    value={applicationData.proposedRate}
                    onChange={(e) => setApplicationData({...applicationData, proposedRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your hourly rate"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TuitionPosts;
