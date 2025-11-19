/**
 * Main App Component
 * Root component with routing setup
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import './styles/index.css';
import './styles/landing.css';
import './styles/onboarding.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Landing page route */}
          <Route path="/" element={<LandingPage />} />

          {/* Main onboarding route */}
          <Route path="/onboarding" element={<OnboardingFlow />} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

/**
 * 404 Not Found Page
 */
const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/onboarding" className="primary-button">
          Go to Onboarding
        </a>
      </div>
    </div>
  );
};

export default App;
