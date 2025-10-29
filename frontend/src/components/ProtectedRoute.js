import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

