/**
 * Progress Tracker Component
 * Shows current progress through the onboarding journey
 */

import React from 'react';
import { OnboardingStep, MerchantData } from '../types/onboarding';

interface ProgressTrackerProps {
  currentStep: OnboardingStep;
  merchantData: Partial<MerchantData>;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
}) => {
  const steps = [
    {
      key: OnboardingStep.WELCOME,
      label: 'Welcome',
      icon: '👋',
      description: 'Get started',
    },
    {
      key: OnboardingStep.BUSINESS_INFO,
      label: 'Business Info',
      icon: '🏢',
      description: 'Basic details',
    },
    {
      key: OnboardingStep.DOCUMENT_UPLOAD,
      label: 'Documents',
      icon: '📄',
      description: 'Upload docs',
    },
    {
      key: OnboardingStep.FORM_COMPLETION,
      label: 'Complete Form',
      icon: '📝',
      description: 'Fill details',
    },
    {
      key: OnboardingStep.VERIFICATION,
      label: 'Verification',
      icon: '✓',
      description: 'Verify info',
    },
    {
      key: OnboardingStep.REVIEW,
      label: 'Review',
      icon: '👁️',
      description: 'Final check',
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="progress-tracker">
      {/* Mobile Progress Bar */}
      <div className="mobile-progress">
        <div className="mobile-progress-bar">
          <div
            className="mobile-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mobile-progress-text">
          <span className="step-info">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className="step-name">{steps[currentStepIndex]?.label}</span>
        </div>
      </div>

      {/* Desktop Step Indicators */}
      <div className="desktop-progress">
        <div className="steps-container">
          {steps.map((step, index) => {
            const status = getStepStatus(index);

            return (
              <React.Fragment key={step.key}>
                <div className={`step-item status-${status}`}>
                  <div className="step-indicator">
                    <div className="step-circle">
                      {status === 'completed' ? (
                        <span className="check-icon">✓</span>
                      ) : (
                        <span className="step-icon">{step.icon}</span>
                      )}
                    </div>
                    {status === 'current' && (
                      <div className="pulse-ring" />
                    )}
                  </div>

                  <div className="step-content">
                    <div className="step-label">{step.label}</div>
                    <div className="step-description">{step.description}</div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`step-connector ${status === 'completed' ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Overall Progress Percentage */}
        <div className="overall-progress">
          <div className="progress-percentage">
            {Math.round(progress)}% Complete
          </div>
          <div className="estimated-time">
            <span className="time-icon">⏱️</span>
            <span>Est. {Math.max(1, 12 - currentStepIndex * 2)} min remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
