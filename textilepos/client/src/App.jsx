import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout    from './components/layout/Layout';
import Login     from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import Billing   from './components/pages/Billing';
import Inventory from './components/pages/Inventory';
import Customers from './components/pages/Customers';
import Reports   from './components/pages/Reports';
import Users     from './components/pages/Users';
import Offers    from './components/pages/Offers';
import Settings  from './components/pages/Settings';
import Loader    from './components/common/Loader';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullscreen/>;
  return user ? children : <Navigate to="/login" replace/>;
};

const SafePage = ({ children }) => <ErrorBoundary>{children}</ErrorBoundary>;

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullscreen/>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace/> : <Login/>}/>
      <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
        <Route index            element={<SafePage><Dashboard/></SafePage>}/>
        <Route path="billing"   element={<SafePage><Billing/></SafePage>}/>
        <Route path="inventory" element={<SafePage><Inventory/></SafePage>}/>
        <Route path="customers" element={<SafePage><Customers/></SafePage>}/>
        <Route path="reports"   element={<SafePage><Reports/></SafePage>}/>
        <Route path="users"     element={<SafePage><Users/></SafePage>}/>
        <Route path="settings"  element={<SafePage><Settings/></SafePage>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ErrorBoundary>
          <AppRoutes/>
        </ErrorBoundary>
      </CartProvider>
    </AuthProvider>
  );
}
