import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import GameScene from './pages/GameScene';
import BoringPage from './pages/BoringPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<GameScene />} />
        <Route path="/boring" element={<BoringPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
