import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminVehicles from './pages/AdminVehicles';
import AdminCompanies from './pages/AdminCompanies';
import AdminUsers from './pages/AdminUsers';
import AdminTours from './pages/AdminTours';
import AdminTourDetail from './pages/AdminTourDetail';
import VehicleCalendarPage from './pages/VehicleCalendarPage';
import DriverHome from './pages/DriverHome';
import DriverTourDetail from './pages/DriverTourDetail';
import { useAuth } from './auth';

function RequireAuth({ adminOnly = false, children }) {
  const { user, ready, isAdmin } = useAuth();

  if (!ready) {
    return (
      <div className="home-gate">
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/driver" replace />;
  return children;
}

function AdminRoute({ children }) {
  return <RequireAuth adminOnly>{children}</RequireAuth>;
}

export default function App() {
  const { user, ready } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={ready && user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/vehicles"
        element={
          <AdminRoute>
            <AdminVehicles />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/vehicles/:id/calendar"
        element={
          <AdminRoute>
            <VehicleCalendarPage role="admin" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <AdminRoute>
            <AdminCompanies />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tours"
        element={
          <AdminRoute>
            <AdminTours />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tours/new"
        element={
          <AdminRoute>
            <AdminTourDetail mode="new" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tours/:id"
        element={
          <AdminRoute>
            <AdminTourDetail mode="edit" />
          </AdminRoute>
        }
      />
      <Route
        path="/driver"
        element={
          <RequireAuth>
            <DriverHome />
          </RequireAuth>
        }
      />
      <Route
        path="/driver/vehicles/:id/calendar"
        element={
          <RequireAuth>
            <VehicleCalendarPage role="driver" />
          </RequireAuth>
        }
      />
      <Route
        path="/driver/tours/:id"
        element={
          <RequireAuth>
            <DriverTourDetail />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
