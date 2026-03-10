
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Registrations } from './pages/Registrations';

import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="admin" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
