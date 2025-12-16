import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. Get user info from Local Storage
  const userString = localStorage.getItem("userInfo");
  const user = userString ? JSON.parse(userString) : null;

  // 2. Check if User is Logged In
  if (!user) {
    // If not logged in, force them to Login page
    return <Navigate to="/login" replace />;
  }

  // 3. Check if User has the specific Role allowed for this page
  // allowedRoles will be passed like ["admin"] or ["instructor"]
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are logged in but have the wrong role (e.g. Student trying to access Admin)
    // Redirect them to the Home page
    return <Navigate to="/" replace />;
  }

  // 4. If all checks pass, show the page (Dashboard)
  return children;
};

export default ProtectedRoute;