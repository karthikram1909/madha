// import { Navigate } from "react-router-dom";
// import { isAuthenticated } from "../api/auth";


// export default function ProtectedRoute({ children }) {
//   if (!isAuthenticated()) {
//     return <Navigate to="/Login" replace />;
//   }
//   return children;
// }


import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../api/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/Login" replace />;
  }

  const role = getUserRole();

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/404" replace />;
  }

  return children;
}