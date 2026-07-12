import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { getToken } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpense from './pages/FuelExpense';
import Reports from './pages/Reports';

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="trips" element={<Trips />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="fuel-expense" element={<FuelExpense />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App
