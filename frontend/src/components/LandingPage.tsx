/**
 * Modern Landing Page for Payment Aggregator Merchant Onboarding
 * Inspired by Razorpay Rize design patterns
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Bot,
  FileText,
  CreditCard,
  TrendingUp,
  Users,
  Phone,
  Menu,
  X,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="header">
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">
              <CreditCard className="logo-icon" />
              <span className="logo-text">PayGateway</span>
            </div>

            <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#contact">Contact</a>
              <button className="btn-secondary">Login</button>
              <button className="btn-primary" onClick={handleGetStarted}>
                Get Started
              </button>
            </nav>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge">
                <Zap size={16} />
                <span>AI-Powered Onboarding</span>
              </div>
              <h1 className="hero-title">
                Start Accepting Payments in{' '}
                <span className="gradient-text">Under 12 Minutes</span>
              </h1>
              <p className="hero-subtitle">
                Join 50,000+ businesses using our Payment Aggregator platform.
                Complete your merchant onboarding with AI assistance - no
                paperwork hassle, no technical expertise needed.
              </p>

              <div className="hero-cta">
                <button className="btn-primary-large" onClick={handleGetStarted}>
                  Start Free Onboarding
                  <ArrowRight size={20} />
                </button>
                <button className="btn-outline">
                  <Phone size={18} />
                  Talk to Sales
                </button>
              </div>

              <div className="social-proof">
                <div className="trust-badges">
                  <div className="trust-item">
                    <CheckCircle size={18} className="check-icon" />
                    <span>RBI Compliant</span>
                  </div>
                  <div className="trust-item">
                    <CheckCircle size={18} className="check-icon" />
                    <span>PCI DSS Certified</span>
                  </div>
                  <div className="trust-item">
                    <CheckCircle size={18} className="check-icon" />
                    <span>ISO 27001</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="mockup-container">
                <div className="stats-card floating-card-1">
                  <div className="stat-icon">
                    <TrendingUp />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">₹1.2Cr</div>
                    <div className="stat-label">Processed Today</div>
                  </div>
                </div>

                <div className="ai-card floating-card-2">
                  <div className="ai-avatar">
                    <Bot />
                  </div>
                  <div className="ai-message">
                    I'll help you complete your onboarding in just 12 minutes!
                  </div>
                </div>

                <div className="progress-card floating-card-3">
                  <div className="progress-header">
                    <span>Application Progress</span>
                    <span className="progress-percent">87%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Our Payment Aggregator?</h2>
            <p>Everything you need to start accepting payments online</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon ai-gradient">
                <Bot size={28} />
              </div>
              <h3>AI-Powered Assistance</h3>
              <p>
                Our AI assistant guides you through every step, auto-fills forms
                from documents, and answers all your questions instantly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon speed-gradient">
                <Clock size={28} />
              </div>
              <h3>12-Minute Setup</h3>
              <p>
                Complete merchant onboarding in under 12 minutes. Most merchants
                finish in 8-10 minutes with our AI assistance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon security-gradient">
                <Shield size={28} />
              </div>
              <h3>Bank-Grade Security</h3>
              <p>
                RBI compliant, PCI DSS certified infrastructure with end-to-end
                encryption for all your sensitive data.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon doc-gradient">
                <FileText size={28} />
              </div>
              <h3>Smart Document Processing</h3>
              <p>
                Just upload your documents - our OCR technology extracts and
                auto-fills 80% of your information automatically.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon payment-gradient">
                <CreditCard size={28} />
              </div>
              <h3>Multiple Payment Modes</h3>
              <p>
                Accept UPI, Cards, Net Banking, Wallets, and more. Single
                integration for all payment methods.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon support-gradient">
                <Users size={28} />
              </div>
              <h3>24/7 Support</h3>
              <p>
                Get instant help from our AI assistant or connect with our
                support team anytime you need assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple 4-step process to start accepting payments</p>
          </div>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Tell Us About Your Business</h3>
                <p>
                  Share basic business information. Our AI will help you fill in
                  details and guide you through the process.
                </p>
              </div>
            </div>

            <div className="step-connector"></div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Upload Documents</h3>
                <p>
                  Upload GST, PAN, and bank documents. Our smart OCR extracts
                  information and auto-fills your application.
                </p>
              </div>
            </div>

            <div className="step-connector"></div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Verify & Submit</h3>
                <p>
                  Review auto-filled information, verify accuracy, and submit
                  your application for instant processing.
                </p>
              </div>
            </div>

            <div className="step-connector"></div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Start Accepting Payments</h3>
                <p>
                  Get approved in 2-4 hours and start accepting payments
                  immediately with easy integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50,000+</div>
              <div className="stat-text">Active Merchants</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">₹500Cr+</div>
              <div className="stat-text">Monthly Processing</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-text">Uptime SLA</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">8 min</div>
              <div className="stat-text">Avg. Onboarding Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Payment Experience?</h2>
            <p>
              Join thousands of businesses already accepting payments seamlessly
            </p>
            <button className="btn-primary-large" onClick={handleGetStarted}>
              Start Your Free Onboarding
              <ArrowRight size={20} />
            </button>
            <div className="cta-note">
              No credit card required • Setup in 12 minutes • Free to start
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-col">
              <div className="footer-logo">
                <CreditCard className="logo-icon" />
                <span className="logo-text">PayGateway</span>
              </div>
              <p className="footer-desc">
                India's most advanced AI-powered payment aggregator platform for
                businesses of all sizes.
              </p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 PayGateway. All rights reserved.</p>
            <div className="footer-badges">
              <span className="badge-item">RBI Compliant</span>
              <span className="badge-item">PCI DSS Certified</span>
              <span className="badge-item">ISO 27001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
