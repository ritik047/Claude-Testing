/**
 * Main App Component
 * Root component with routing setup
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingFlow } from './components/OnboardingFlow';
import './styles/index.css';
import './styles/onboarding.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Main onboarding route */}
          <Route path="/onboarding" element={<OnboardingFlow />} />

          {/* Redirect root to onboarding */}
          <Route path="/" element={<Navigate to="/onboarding" replace />} />

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
