import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import Health from '@/pages/Health';
import MapPage from '@/pages/Map';
import Feeding from '@/pages/Feeding';
import HubControl from '@/pages/HubControl';
import Chat from '@/pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<Health />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/feeding" element={<Feeding />} />
          <Route path="/hub" element={<HubControl />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
