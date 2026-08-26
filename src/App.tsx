import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ApplyPage } from './pages/ApplyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PixelBackground } from './components/PixelBackground';
import { FloatingBats } from './components/FloatingBats';
import { IntroAnimation, shouldShowIntro } from './components/IntroAnimation';

function App() {
  const [showIntro, setShowIntro] = useState(() => shouldShowIntro());

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-[#0B0610]">
        <PixelBackground />
        <FloatingBats />

        {showIntro && (
          <IntroAnimation onDone={() => setShowIntro(false)} />
        )}

        {!showIntro && (
          <main className="relative z-10 max-w-[900px] mx-auto animate-fade-in-up">
            <Routes>
              <Route path="/" element={<HomePage onReplayIntro={() => setShowIntro(true)} />} />
              <Route path="/apply" element={<ApplyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
