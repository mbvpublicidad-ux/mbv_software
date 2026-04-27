import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingOverlay } from "../components/ui/LoadingUi";

const ProtectedRoutes = ({ allowedRoles = [] }) => {
	const { isAuthenticated, user, loading } = useAuth();
	const location = useLocation();

	// Show loading while checking auth state
	if (loading) {
		return <LoadingOverlay visible={true} text="Verificando sesión..." />;
	}

	// Redirect to auth if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/auth" state={{ from: location }} replace />;
	}

	// Check roles if specified
	if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoutes;
