
import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return (
    <div className="bg-auth-card-bg rounded-lg border border-gray-800 shadow-xl w-full max-w-md p-8">
      {children}
    </div>
  );
};

export default AuthCard;
