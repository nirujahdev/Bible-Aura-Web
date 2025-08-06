import { Navigate } from 'react-router-dom';

export default function MobileSmartRedirect() {
  // Mobile users should go to the landing page (no dashboard for mobile)
  return <Navigate to="/" replace />;
} 