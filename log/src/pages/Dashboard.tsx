
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-auth-dark-bg text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
        
        <div className="bg-auth-card-bg rounded-lg border border-gray-800 shadow-xl p-6">
          <h2 className="text-xl mb-4">Welcome, {user?.email}</h2>
          <p>You've successfully logged in!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
