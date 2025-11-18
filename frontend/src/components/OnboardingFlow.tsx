/**
 * Main Onboarding Flow Component
 * Orchestrates the AI-powered merchant onboarding journey
 */

import React, { useState, useEffect } from 'react';
import { AIAssistant } from './AIAssistant';
import { DocumentUpload } from './DocumentUpload';
import { SmartForm } from './SmartForm';
import { ProgressTracker } from './ProgressTracker';
import { ReviewSubmit } from './ReviewSubmit';
import {
  OnboardingStep,
  MerchantData,
} from '../types/onboarding';
import { useOnboardingAgent } from '../hooks/useOnboardingAgent';

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.WELCOME
  );
  const [merchantData, setMerchantData] = useState<Partial<MerchantData>>({});
  const [chatMinimized, setChatMinimized] = useState(false);

  const {
    sendMessage,
    uploadDocument,
    conversationHistory,
    suggestedActions,
    isProcessing,
  } = useOnboardingAgent();


  const handleStepChange = (step: OnboardingStep) => {
    setCurrentStep(step);
    sendMessage(`Moving to ${step} step`);
  };

  const handleDataUpdate = (updates: Partial<MerchantData>) => {
    setMerchantData(prev => ({ ...prev, ...updates }));
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    const result = await uploadDocument(file, documentType as any);

    if (result.extractedData) {
      // Auto-fill form with extracted data
      handleDataUpdate(result.extractedData);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Progress Tracker */}
      <ProgressTracker currentStep={currentStep} merchantData={merchantData} />

      {/* Main Content Area */}
      <div className="onboarding-content">
        {currentStep === OnboardingStep.WELCOME && (
          <WelcomeStep
            onStart={() => handleStepChange(OnboardingStep.BUSINESS_INFO)}
          />
        )}

        {currentStep === OnboardingStep.BUSINESS_INFO && (
          <BusinessInfoStep
            merchantData={merchantData}
            onUpdate={handleDataUpdate}
            onNext={() => handleStepChange(OnboardingStep.DOCUMENT_UPLOAD)}
          />
        )}

        {currentStep === OnboardingStep.DOCUMENT_UPLOAD && (
          <DocumentUpload
            onUpload={handleDocumentUpload}
            onNext={() => handleStepChange(OnboardingStep.FORM_COMPLETION)}
          />
        )}

        {currentStep === OnboardingStep.FORM_COMPLETION && (
          <SmartForm
            merchantData={merchantData}
            onUpdate={handleDataUpdate}
            onNext={() => handleStepChange(OnboardingStep.VERIFICATION)}
          />
        )}

        {currentStep === OnboardingStep.VERIFICATION && (
          <VerificationStep
            merchantData={merchantData}
            onNext={() => handleStepChange(OnboardingStep.REVIEW)}
          />
        )}

        {currentStep === OnboardingStep.REVIEW && (
          <ReviewSubmit
            merchantData={merchantData}
            onSubmit={() => handleStepChange(OnboardingStep.SUBMITTED)}
          />
        )}

        {currentStep === OnboardingStep.SUBMITTED && (
          <SuccessStep merchantData={merchantData} />
        )}
      </div>

      {/* AI Assistant Chat - Always Visible */}
      <AIAssistant
        conversationHistory={conversationHistory}
        suggestedActions={suggestedActions}
        onSendMessage={sendMessage}
        isProcessing={isProcessing}
        minimized={chatMinimized}
        onToggleMinimize={() => setChatMinimized(!chatMinimized)}
        currentStep={currentStep}
      />

      {/* Floating Action Hints */}
      {suggestedActions && suggestedActions.length > 0 && (
        <SuggestedActions
          actions={suggestedActions}
          onActionClick={(action) => sendMessage(action)}
        />
      )}
    </div>
  );
};

/**
 * Welcome Step - AI introduces itself
 */
const WelcomeStep: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="welcome-step">
      <div className="welcome-hero">
        <h1>Welcome to Payment Gateway Onboarding</h1>
        <p className="subtitle">
          I'm your AI assistant, and I'll help you get set up in under 12 minutes!
        </p>

        <div className="benefits">
          <div className="benefit">
            <span className="icon">🚀</span>
            <div>
              <h3>Fast Setup</h3>
              <p>Most merchants complete in 10-12 minutes</p>
            </div>
          </div>

          <div className="benefit">
            <span className="icon">🤖</span>
            <div>
              <h3>AI-Powered</h3>
              <p>Auto-fills 80% of information from your documents</p>
            </div>
          </div>

          <div className="benefit">
            <span className="icon">💬</span>
            <div>
              <h3>24/7 Help</h3>
              <p>I'm here to answer any questions you have</p>
            </div>
          </div>
        </div>

        <div className="what-you-need">
          <h3>What you'll need:</h3>
          <ul>
            <li>✓ Business registration document (GST/Trade License)</li>
            <li>✓ Owner's PAN card</li>
            <li>✓ Bank account details (Cancelled cheque)</li>
            <li>✓ 10 minutes of your time</li>
          </ul>
        </div>

        <button className="cta-button" onClick={onStart}>
          Let's Get Started! →
        </button>

        <p className="reassurance">
          Don't worry if you don't have everything now - you can save and continue
          later.
        </p>
      </div>
    </div>
  );
};

/**
 * Business Info Step - Conversational data collection
 */
const BusinessInfoStep: React.FC<{
  merchantData: Partial<MerchantData>;
  onUpdate: (data: Partial<MerchantData>) => void;
  onNext: () => void;
}> = ({ merchantData, onUpdate, onNext }) => {
  const [businessName, setBusinessName] = useState(
    merchantData.businessName || ''
  );
  const [gstin, setGstin] = useState(merchantData.gstin || '');
  const [loading, setLoading] = useState(false);

  const handleGSTINChange = async (value: string) => {
    setGstin(value);

    // Auto-fetch business details when valid GSTIN entered
    if (value.length === 15) {
      setLoading(true);
      // Call API to fetch GST details
      // Auto-fill business name, address, etc.
      setTimeout(() => {
        onUpdate({
          gstin: value,
          businessName: 'ABC Enterprises',
          address: '123 Business Park',
          state: 'Maharashtra',
        });
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="business-info-step">
      <h2>Tell me about your business</h2>
      <p>Let's start with the basics. I'll help you fill in the details.</p>

      <div className="form-field">
        <label>Business Name</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value);
            onUpdate({ businessName: e.target.value });
          }}
          placeholder="Enter your registered business name"
        />
      </div>

      <div className="form-field">
        <label>
          GST Number (optional)
          <span className="help-text">
            I can auto-fill your details if you have this
          </span>
        </label>
        <input
          type="text"
          value={gstin}
          onChange={(e) => handleGSTINChange(e.target.value.toUpperCase())}
          placeholder="27AABCU9603R1ZM"
          maxLength={15}
        />
        {loading && <span className="loading">Fetching details...</span>}
      </div>

      <div className="actions">
        <button
          className="primary-button"
          onClick={onNext}
          disabled={!businessName}
        >
          Continue →
        </button>
        <button className="text-button">I don't have GST</button>
      </div>
    </div>
  );
};

/**
 * Verification Step - Real-time checks
 */
const VerificationStep: React.FC<{
  merchantData: Partial<MerchantData>;
  onNext: () => void;
}> = ({ onNext }) => {
  const [checks, setChecks] = useState({
    businessDetails: 'pending',
    documents: 'pending',
    bankAccount: 'pending',
    kyc: 'pending',
  });

  useEffect(() => {
    // Simulate verification checks
    const runChecks = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChecks(prev => ({ ...prev, businessDetails: 'success' }));

      await new Promise(resolve => setTimeout(resolve, 800));
      setChecks(prev => ({ ...prev, documents: 'success' }));

      await new Promise(resolve => setTimeout(resolve, 1200));
      setChecks(prev => ({ ...prev, bankAccount: 'success' }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      setChecks(prev => ({ ...prev, kyc: 'success' }));
    };

    runChecks();
  }, []);

  const allPassed = Object.values(checks).every(c => c === 'success');

  return (
    <div className="verification-step">
      <h2>Verifying your information</h2>
      <p>Hold tight! I'm running some quick checks...</p>

      <div className="verification-checks">
        <CheckItem
          label="Business Details"
          status={checks.businessDetails}
          description="Verifying business registration"
        />
        <CheckItem
          label="Documents"
          status={checks.documents}
          description="Validating uploaded documents"
        />
        <CheckItem
          label="Bank Account"
          status={checks.bankAccount}
          description="Confirming bank account details"
        />
        <CheckItem
          label="KYC Verification"
          status={checks.kyc}
          description="Running compliance checks"
        />
      </div>

      {allPassed && (
        <div className="success-message">
          <span className="icon">✓</span>
          <h3>All checks passed!</h3>
          <p>Your application looks great. Ready to review and submit?</p>
          <button className="primary-button" onClick={onNext}>
            Review & Submit →
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Success Step - Celebration!
 */
const SuccessStep: React.FC<{ merchantData: Partial<MerchantData> }> = ({
  merchantData,
}) => {
  return (
    <div className="success-step">
      <div className="celebration">
        <span className="confetti">🎉</span>
        <h1>Application Submitted Successfully!</h1>
        <p>
          Great job, {merchantData.ownerName}! Your application is now under review.
        </p>
      </div>

      <div className="next-steps">
        <h3>What happens next?</h3>
        <div className="timeline">
          <div className="timeline-item">
            <span className="step">1</span>
            <div>
              <h4>Review (2-4 hours)</h4>
              <p>Our team will review your application</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="step">2</span>
            <div>
              <h4>Approval (Same day)</h4>
              <p>You'll receive approval via email and SMS</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="step">3</span>
            <div>
              <h4>Integration (30 minutes)</h4>
              <p>Set up payment acceptance on your platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="support">
        <p>
          Have questions? I'm still here to help! Just ask me anything in the chat.
        </p>
      </div>
    </div>
  );
};

/**
 * Verification Check Item Component
 */
const CheckItem: React.FC<{
  label: string;
  status: string;
  description: string;
}> = ({ label, status, description }) => {
  const getIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <div className={`check-item status-${status}`}>
      <span className="check-icon">{getIcon()}</span>
      <div className="check-content">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

/**
 * Suggested Actions Component
 */
const SuggestedActions: React.FC<{
  actions: string[];
  onActionClick: (action: string) => void;
}> = ({ actions, onActionClick }) => {
  return (
    <div className="suggested-actions">
      <p>Quick actions:</p>
      {actions.map((action, index) => (
        <button
          key={index}
          className="suggestion-chip"
          onClick={() => onActionClick(action)}
        >
          {action}
        </button>
      ))}
    </div>
  );
};

export default OnboardingFlow;
