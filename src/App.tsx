import { Routes, Route } from 'react-router-dom';
import TimerPage from '@/pages/TimerPage';
import AdminPage from '@/pages/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TimerPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
