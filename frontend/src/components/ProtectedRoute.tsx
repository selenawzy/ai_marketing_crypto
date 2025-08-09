import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // TODO: Implement actual authentication logic
  // For now, just render the children
  return <>{children}</>;
};

export default ProtectedRoute;