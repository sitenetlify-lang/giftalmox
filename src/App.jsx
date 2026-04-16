import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Entries from '@/pages/Entries';
import Exits from '@/pages/Exits';
import Movements from '@/pages/Movements';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import Alerts from '@/pages/Alerts';
import AdminPage from '@/pages/admin/AdminPage';
import { SettingsProvider } from '@/contexts/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/entries" element={<Entries />} />
              <Route path="/exits" element={<Exits />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/alerts" element={<Alerts />} />
            </Route>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </SettingsProvider>
  );
}

export default App;
