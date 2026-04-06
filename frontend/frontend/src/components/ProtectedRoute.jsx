import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    // Redirect to the appropriate home for their actual role
    return <Navigate to={userRole === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}