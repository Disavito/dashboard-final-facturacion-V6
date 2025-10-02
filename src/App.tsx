import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingFallback from './components/ui/LoadingFallback';

// --- Lazy Load Pages ---
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const People = lazy(() => import('./pages/People'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Income = lazy(() => import('./pages/Income'));
const Settings = lazy(() => import('./pages/Settings'));
const AuthPage = lazy(() => import('./pages/Auth'));
const AccountDetails = lazy(() => import('./pages/AccountDetails'));
const PartnerDocuments = lazy(() => import('./pages/PartnerDocuments'));
const InvoicingLayout = lazy(() => import('./pages/invoicing/InvoicingLayout'));
const BoletasPage = lazy(() => import('./pages/invoicing/BoletasPage'));
const ResumenDiarioPage = lazy(() => import('./pages/invoicing/ResumenDiarioPage'));

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && window.location.pathname !== '/auth') {
        navigate('/auth');
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user && window.location.pathname !== '/auth') {
        navigate('/auth');
      } else if (session?.user && window.location.pathname === '/auth') {
        navigate('/');
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          
          <Route element={<ProtectedRoute resourcePath="/people" />}>
            <Route path="people" element={<People />} />
          </Route>
          <Route element={<ProtectedRoute resourcePath="/partner-documents" />}>
            <Route path="partner-documents" element={<PartnerDocuments />} />
          </Route>

          <Route element={<ProtectedRoute resourcePath="/invoicing" />}>
            <Route path="invoicing" element={<InvoicingLayout />}>
              <Route index element={<BoletasPage />} />
              <Route path="boletas" element={<BoletasPage />} />
              <Route path="resumen-diario" element={<ResumenDiarioPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute resourcePath="/accounts" />}>
            <Route path="accounts" element={<Accounts />} />
            <Route path="accounts/:id" element={<AccountDetails />} />
          </Route>
          <Route element={<ProtectedRoute resourcePath="/expenses" />}>
            <Route path="expenses" element={<Expenses />} />
          </Route>
          <Route element={<ProtectedRoute resourcePath="/income" />}>
            <Route path="income" element={<Income />} />
          </Route>
          
          <Route element={<ProtectedRoute resourcePath="/settings" />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
