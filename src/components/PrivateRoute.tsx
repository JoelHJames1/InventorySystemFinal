import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from './ui/LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}