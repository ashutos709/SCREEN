import React, { useState, useEffect } from 'react';
import AuthCard from '@/components/AuthCard';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const Index = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = 'http://localhost:3010';
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-dark-bg">
      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-white mb-2" />
          <p className="text-white">Loading your session...</p>
        </div>
      ) : (
        <div className="w-full max-w-md p-4">
          <AuthCard>
            {isLoginView ? (
              <LoginForm onSwitchToSignup={() => setIsLoginView(false)} />
            ) : (
              <SignupForm onSwitchToLogin={() => setIsLoginView(true)} />
            )}
          </AuthCard>
        </div>
      )}
    </div>
  );
};

export default Index;
