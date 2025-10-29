import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/user', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/auth/logout', {
        withCredentials: true
      });
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      // Navigate anyway on error
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {user && (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/120'}
                  alt={user.name}
                  className="w-28 h-28 rounded-full border-2 border-gray-200"
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {user.name}
                </h2>
                <p className="text-gray-600 mb-6">{user.email}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Last Login</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(user.lastLogin).toLocaleString()}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Member Since</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
          >
            View All Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

