import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  User,
  Download,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Interfaces (improved type definitions)
interface Tutor {
  _id: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  phone: string;
  avatar: string;
  tutorProfile?: {
    subjects: { name: string; level: string; price: number }[];
    experience: number;
    education: { degree: string; institution: string; year: number };
    availability: { day: string; startTime: string; endTime: string }[];
    teachingMode: string[];
    rating: number;
  };
}

interface Application {
  _id: string;
  status: string;
  tutor: Tutor;
  coverLetter?: string;
  proposedRate?: number;
  cv?: { filename: string; url: string; uploadedAt: string };
}

interface Post {
  _id: string;
  title: string;
  description: string;
  status: string;
  applications: Application[];
}

interface MyApplication {
  _id: string;
  title: string;
  description: string;
  budget: { min: number; max: number };
  myApplication?: { status: string; appliedAt: string };
}

interface Stats {
  activePosts: number;
  totalApplications: number;
  acceptedApplications: number;
}

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  link?: string;
  action?: () => void;
}

const Dashboard: React.FC = () => {
  const { user, token, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    activePosts: 0,
    totalApplications: 0,
    acceptedApplications: 0,
  });
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Application | null>(null);

  // Memoized fetch function
  const fetchDashboardData = useCallback(async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);

      if (user.role === 'guardian') {
        const postsResponse = await axios.get<Post[]>('http://localhost:5000/api/tuition-posts/my/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const posts = postsResponse.data ?? [];
        setMyPosts(posts);

        const totalApplications = posts.reduce((sum, post) => sum + (post.applications?.length ?? 0), 0);
        const acceptedApplications = posts.reduce(
          (sum, post) => sum + (post.applications?.filter(app => app.status === 'accepted').length ?? 0),
          0
        );

        setStats({
          activePosts: posts.filter(post => post.status === 'active').length,
          totalApplications,
          acceptedApplications,
        });
      } else if (user.role === 'tutor') {
        const applicationsResponse = await axios.get<MyApplication[]>('http://localhost:5000/api/tuition-posts/my/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const applications = applicationsResponse.data ?? [];
        setMyApplications(applications);

        setStats(prev => ({
          ...prev,
          totalApplications: applications.length,
          acceptedApplications: applications.filter(app => app.myApplication?.status === 'accepted').length,
        }));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, logout, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading, navigate, fetchDashboardData]);

  const handleApplicationAction = async (postId: string, applicationId: string, status: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tuition-posts/${postId}/applications/${applicationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update application');
    }
  };

  const handleViewTutor = (application: Application) => {
    setSelectedTutor(application);
    setShowTutorModal(true);
  };

  const getStatsForRole = (): Array<{ name: string; value: string; icon: React.ElementType; color: string }> => {
    switch (user?.role) {
      case 'tutor':
        return [
          { name: 'My Applications', value: stats.totalApplications.toString(), icon: FileText, color: 'bg-blue-500' },
          { name: 'Accepted', value: stats.acceptedApplications.toString(), icon: CheckCircle, color: 'bg-green-500' },
        ];
      case 'guardian':
        return [
          { name: 'Active Posts', value: stats.activePosts.toString(), icon: FileText, color: 'bg-blue-500' },
          { name: 'Total Applications', value: stats.totalApplications.toString(), icon: Users, color: 'bg-green-500' },
        ];
      case 'admin':
        return [
          { name: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500' },
          { name: 'Active Posts', value: '89', icon: FileText, color: 'bg-green-500' },
        ];
      default:
        return [];
    }
  };

  const getQuickActionsForRole = (): QuickAction[] => {
    switch (user?.role) {
      case 'tutor':
        return [
          { label: 'Browse Jobs', icon: FileText, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', link: '/tuition-posts' },
        ];
      case 'guardian':
        return [
          { label: 'Create Post', icon: Plus, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', link: '/create-tuition-post' },
        ];
      case 'admin':
        return [
          { label: 'Manage Users', icon: Users, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', link: '/users' },
          { label: 'Review Posts', icon: FileText, color: 'bg-green-50 text-green-700 hover:bg-green-100', link: '/tuition-posts' },
        ];
      default:
        return [
          { label: 'Find Tutors', icon: BookOpen, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', link: '/tutors' },
          { label: 'Browse Posts', icon: FileText, color: 'bg-green-50 text-green-700 hover:bg-green-100', link: '/tuition-posts' },
        ];
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  const currentStats = getStatsForRole();
  const quickActions = getQuickActionsForRole();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-xl text-gray-600">
            {user.role === 'tutor'
              ? 'Manage your tutoring applications and profile'
              : user.role === 'guardian'
              ? 'Track your tuition posts and applications'
              : user.role === 'admin'
              ? 'Manage the TuitionHub platform'
              : 'Chat with Chatbot for assistance'}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {user.role === 'guardian' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Tuition Posts</h2>
                  <Link
                    to="/create-tuition-post"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Post</span>
                  </Link>
                </div>

                <div className="space-y-6">
                  {myPosts.length === 0 ? (
                    <p className="text-gray-600">No posts available.</p>
                  ) : (
                    myPosts.map(post => (
                      <div key={post._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : post.status === 'filled'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{post.description.substring(0, 100)}...</p>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Applications ({post.applications?.length ?? 0})</h4>
                          {post.applications?.length === 0 ? (
                            <p className="text-sm text-gray-500 mt-2">No applications yet.</p>
                          ) : (
                            <div className="space-y-3 mt-2">
                              {post.applications.map(app => (
                                <div
                                  key={app._id}
                                  className={`border border-gray-200 rounded-lg p-3 ${
                                    app.status === 'pending'
                                      ? 'bg-yellow-50'
                                      : app.status === 'accepted'
                                      ? 'bg-green-50'
                                      : 'bg-red-50'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium text-gray-900">{app.tutor.name}</p>
                                      <p className="text-sm text-gray-600">{app.tutor.email}</p>
                                      <p className="text-sm text-gray-600">
                                        Proposed Rate: ৳{app.proposedRate ?? 'N/A'}/hour
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Status: {app.status}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewTutor(app)}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        title="View Tutor"
                                      >
                                        <User className="h-4 w-4" />
                                      </button>
                                      {app.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => handleApplicationAction(post._id, app._id, 'accepted')}
                                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                                            title="Accept"
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => handleApplicationAction(post._id, app._id, 'rejected')}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Reject"
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {user.role === 'tutor' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                  <Link
                    to="/tuition-posts"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Browse Jobs
                  </Link>
                </div>

                <div className="space-y-4">
                  {myApplications.length === 0 ? (
                    <p className="text-gray-600">No applications available.</p>
                  ) : (
                    myApplications.map(application => (
                      <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{application.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              application.myApplication?.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : application.myApplication?.status === 'accepted'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {application.myApplication?.status ?? 'Unknown'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{application.description.substring(0, 100)}...</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Applied{' '}
                            {application.myApplication?.appliedAt
                              ? new Date(application.myApplication.appliedAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            ৳{application.budget?.min ?? 0}-৳{application.budget?.max ?? 0}/month
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {user.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Recent Registrations</h3>
                    <p className="text-2xl font-bold text-blue-700">+23</p>
                    <p className="text-sm text-blue-600">This week</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Active Sessions</h3>
                    <p className="text-2xl font-bold text-green-700">156</p>
                    <p className="text-sm text-green-600">Currently ongoing</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action, index) =>
                  action.link ? (
                    <Link
                      key={index}
                      to={action.link}
                      className={`w-full flex items-center p-4 rounded-xl transition-colors ${action.color}`}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{action.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`w-full flex items-center p-4 rounded-xl transition-colors ${action.color}`}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{action.label}</span>
                    </button>
                  )
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-2">AI Learning Assistant</h3>
              <p className="text-blue-100 mb-4">
                Need help with any topic? Our AI assistant can provide personalized learning resources and guidance.
              </p>
              <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all">
                Ask AI Assistant
              </button>
            </motion.div>
          </div>
        </div>

        {/* Tutor Details Modal */}
        {showTutorModal && selectedTutor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTutorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tutor Details</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="flex items-center space-x-4 mb-2">
                    {selectedTutor.tutor.avatar ? (
                      <img
                        src={selectedTutor.tutor.avatar}
                        alt={selectedTutor.tutor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedTutor.tutor.name}</p>
                      <p className="text-sm text-gray-600">{selectedTutor.tutor.email}</p>
                      <p className="text-sm text-gray-600">{selectedTutor.tutor.phone ?? 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{selectedTutor.tutor.bio ?? 'No bio provided.'}</p>
                  <p className="text-sm text-gray-600">Location: {selectedTutor.tutor.location ?? 'N/A'}</p>
                </div>

                {selectedTutor.tutor.tutorProfile && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Experience:</strong> {selectedTutor.tutor.tutorProfile.experience} years
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Education:</strong> {selectedTutor.tutor.tutorProfile.education.degree} from{' '}
                      {selectedTutor.tutor.tutorProfile.education.institution} (
                      {selectedTutor.tutor.tutorProfile.education.year})
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Rating:</strong> {selectedTutor.tutor.tutorProfile.rating.toFixed(1)} / 5
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Teaching Mode:</strong> {selectedTutor.tutor.tutorProfile.teachingMode.join(', ')}
                    </p>
                    <div className="mt-2">
                      <strong className="text-sm text-gray-600">Subjects:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTutor.tutor.tutorProfile.subjects.map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {subject.name} ({subject.level}, ৳{subject.price}/hr)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <strong className="text-sm text-gray-600">Availability:</strong>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {selectedTutor.tutor.tutorProfile.availability.map((slot, idx) => (
                          <li key={idx}>
                            {slot.day}: {slot.startTime} - {slot.endTime}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Cover Letter:</strong> {selectedTutor.coverLetter ?? 'No cover letter provided.'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Proposed Rate:</strong> ৳{selectedTutor.proposedRate ?? 'N/A'}/hour
                  </p>
                  {selectedTutor.cv?.url && (
                    <p className="text-sm text-gray-600">
                      <strong>CV:</strong>{' '}
                      <a
                        href={selectedTutor.cv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {selectedTutor.cv.filename ?? 'Download CV'}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex mt-6">
                <button
                  type="button"
                  onClick={() => setShowTutorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
