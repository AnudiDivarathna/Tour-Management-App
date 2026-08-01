import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminVehicles from './pages/AdminVehicles';
import AdminTours from './pages/AdminTours';
import AdminTourDetail from './pages/AdminTourDetail';
import VehicleCalendarPage from './pages/VehicleCalendarPage';
import DriverHome from './pages/DriverHome';
import DriverTourDetail from './pages/DriverTourDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/vehicles" element={<AdminVehicles />} />
      <Route
        path="/admin/vehicles/:id/calendar"
        element={<VehicleCalendarPage role="admin" />}
      />
      <Route path="/admin/tours" element={<AdminTours />} />
      <Route path="/admin/tours/new" element={<AdminTourDetail mode="new" />} />
      <Route path="/admin/tours/:id" element={<AdminTourDetail mode="edit" />} />
      <Route path="/driver" element={<DriverHome />} />
      <Route
        path="/driver/vehicles/:id/calendar"
        element={<VehicleCalendarPage role="driver" />}
      />
      <Route path="/driver/tours/:id" element={<DriverTourDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
