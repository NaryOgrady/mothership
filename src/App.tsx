import { Navigate, Route, Routes } from 'react-router-dom';
import { GMPanel } from './pages/GMPanel';
import { PlayerView } from './pages/PlayerView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/gm" replace />} />
      <Route path="/gm" element={<GMPanel />} />
      <Route path="/player" element={<PlayerView />} />
    </Routes>
  );
}
