/**
 * Review and Submit Component
 * Final review of all information before submission
 */

import React, { useState } from 'react';
import { MerchantData } from '../types/onboarding';

interface ReviewSubmitProps {
  merchantData: Partial<MerchantData>;
  onSubmit: () => void;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  merchantData,
  onSubmit,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      alert('Please accept the terms and conditions to continue');
      return;
    }

    setSubmitting(true);

    // Simulate API submission
    setTimeout(() => {
      onSubmit();
      setSubmitting(false);
    }, 2000);
  };

  const sections = [
    {
      title: '👤 Owner Information',
      fields: [
        { label: 'Owner Name', value: merchantData.ownerName },
        { label: 'PAN', value: merchantData.pan },
        { label: 'Email', value: merchantData.email },
        { label: 'Mobile', value: merchantData.phone },
      ],
    },
    {
      title: '🏢 Business Details',
      fields: [
        { label: 'Business Name', value: merchantData.businessName },
        { label: 'Business Type', value: merchantData.businessType },
        { label: 'GSTIN', value: merchantData.gstin || 'Not provided' },
        { label: 'Category', value: merchantData.category },
        { label: 'Website', value: merchantData.website || 'Not provided' },
      ],
    },
    {
      title: '📍 Business Address',
      fields: [
        { label: 'Address', value: merchantData.address },
        { label: 'City', value: merchantData.city },
        { label: 'State', value: merchantData.state },
        { label: 'Pincode', value: merchantData.pincode },
      ],
    },
    {
      title: '🏦 Bank Account',
      fields: [
        { label: 'Account Holder', value: merchantData.accountHolderName },
        { label: 'Account Number', value: maskAccountNumber(merchantData.accountNumber) },
        { label: 'IFSC Code', value: merchantData.ifscCode },
        { label: 'Bank Name', value: merchantData.bankName },
        { label: 'Account Type', value: merchantData.accountType },
      ],
    },
    {
      title: '💼 Business Metrics',
      fields: [
        { label: 'Monthly Volume', value: merchantData.monthlyVolume ? `₹${merchantData.monthlyVolume.toLocaleString('en-IN')}` : 'Not provided' },
        { label: 'Avg Transaction', value: merchantData.averageTicketSize ? `₹${merchantData.averageTicketSize.toLocaleString('en-IN')}` : 'Not provided' },
        { label: 'Description', value: merchantData.description || 'Not provided' },
      ],
    },
  ];

  return (
    <div className="review-submit">
      <div className="review-header">
        <h2>Review Your Application</h2>
        <p>Please review all the information carefully before submitting.</p>
      </div>

      <div className="review-content">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="review-section">
            <h3 className="section-title">{section.title}</h3>
            <div className="review-grid">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="review-field">
                  <div className="field-label">{field.label}</div>
                  <div className="field-value">
                    {field.value || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Important Information */}
        <div className="info-box">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4>What happens after submission?</h4>
            <ul>
              <li>✓ Your application will be reviewed by our team within 2-4 hours</li>
              <li>✓ We may contact you for additional verification if needed</li>
              <li>✓ Once approved, you'll receive your payment gateway credentials</li>
              <li>✓ Integration support will be available 24/7</li>
            </ul>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="terms-section">
          <div className="terms-box">
            <h4>Terms and Conditions</h4>
            <div className="terms-content">
              <p><strong>Indian Payment Aggregator Agreement</strong></p>
              <ul>
                <li>I confirm that all information provided is accurate and complete</li>
                <li>I understand that this is for a Proprietorship business applying for Payment Gateway services</li>
                <li>I agree to comply with RBI Payment Aggregator guidelines and regulations</li>
                <li>I authorize verification of the provided documents and information</li>
                <li>I understand that merchant transaction fees will apply as per the pricing plan</li>
                <li>I agree to the Know Your Customer (KYC) requirements</li>
                <li>I consent to background and credit checks as required by regulatory authorities</li>
                <li>I understand that settlement will be done to the provided bank account</li>
                <li>I agree to maintain transaction records as per regulatory requirements</li>
                <li>I accept the terms of service and privacy policy</li>
              </ul>

              <div className="regulatory-info">
                <p><strong>Regulatory Compliance:</strong></p>
                <p>As per RBI guidelines for Payment Aggregators, we are required to:</p>
                <ul>
                  <li>Verify merchant business and identity</li>
                  <li>Perform ongoing transaction monitoring</li>
                  <li>Maintain audit trails</li>
                  <li>Report suspicious transactions</li>
                  <li>Ensure data security and privacy</li>
                </ul>
              </div>

              <div className="documents-info">
                <p><strong>Document Verification:</strong></p>
                <p>Your uploaded documents will be verified for:</p>
                <ul>
                  <li>Authenticity and validity</li>
                  <li>Consistency with provided information</li>
                  <li>Compliance with regulatory requirements</li>
                </ul>
              </div>
            </div>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I have read and agree to the terms and conditions, and confirm that
              all information provided is true and accurate. I understand this is
              for a <strong>Proprietorship business</strong> applying for Payment Gateway
              services under Indian Payment Aggregator regulations.
            </span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="submit-actions">
          <button
            className="primary-button large"
            onClick={handleSubmit}
            disabled={!agreed || submitting}
          >
            {submitting ? (
              <>
                <span className="spinner">⏳</span>
                Submitting Application...
              </>
            ) : (
              <>
                Submit Application →
              </>
            )}
          </button>

          <p className="submit-note">
            By submitting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Security Badge */}
      <div className="security-badge">
        <div className="badge-content">
          <span className="badge-icon">🔒</span>
          <div>
            <strong>Secure & Confidential</strong>
            <p>Your data is encrypted and stored securely</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to mask account number
 */
function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return '-';
  const visibleDigits = 4;
  const maskedLength = accountNumber.length - visibleDigits;
  return '*'.repeat(maskedLength) + accountNumber.slice(-visibleDigits);
}

export default ReviewSubmit;
