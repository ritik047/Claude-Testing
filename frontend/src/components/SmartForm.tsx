/**
 * Smart Form Component
 * Intelligent form with real-time validation and AI assistance
 * Focused on Indian Payment Aggregator requirements for Proprietorship
 */

import React, { useState } from 'react';
import { MerchantData } from '../types/onboarding';
import { ContextualHelp } from './AIAssistant';

interface SmartFormProps {
  merchantData: Partial<MerchantData>;
  onUpdate: (data: Partial<MerchantData>) => void;
  onNext: () => void;
}

export const SmartForm: React.FC<SmartFormProps> = ({
  merchantData,
  onUpdate,
  onNext,
}) => {
  const [formData, setFormData] = useState<Partial<MerchantData>>(merchantData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});

  // Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Business categories for Payment Gateway
  const businessCategories = [
    { value: 'retail', label: 'Retail / E-commerce' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'education', label: 'Education & Training' },
    { value: 'healthcare', label: 'Healthcare & Wellness' },
    { value: 'travel', label: 'Travel & Tourism' },
    { value: 'entertainment', label: 'Entertainment & Events' },
    { value: 'services', label: 'Professional Services' },
    { value: 'logistics', label: 'Logistics & Transportation' },
    { value: 'realestate', label: 'Real Estate' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'technology', label: 'Technology & Software' },
    { value: 'other', label: 'Other' },
  ];

  const handleFieldChange = (field: keyof MerchantData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);

    // Mark as touched
    setTouched({ ...touched, [field]: true });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleBlur = async (field: keyof MerchantData) => {
    setTouched({ ...touched, [field]: true });
    await validateField(field, formData[field]);
  };

  const validateField = async (field: keyof MerchantData, value: any): Promise<boolean> => {
    setValidating({ ...validating, [field]: true });

    let error = '';

    switch (field) {
      case 'ownerName':
        if (!value || value.trim().length < 2) {
          error = 'Owner name is required (minimum 2 characters)';
        } else if (!/^[a-zA-Z\s.]+$/.test(value)) {
          error = 'Owner name should only contain letters';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid 10-digit Indian mobile number';
        }
        break;

      case 'pan':
        if (!value) {
          error = 'PAN is required for proprietorship businesses';
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          error = 'Please enter a valid PAN (e.g., ABCDE1234F)';
        }
        break;

      case 'gstin':
        if (value && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(value)) {
          error = 'Please enter a valid GSTIN (15 characters)';
        }
        break;

      case 'pincode':
        if (!value) {
          error = 'Pincode is required';
        } else if (!/^\d{6}$/.test(value)) {
          error = 'Please enter a valid 6-digit pincode';
        }
        break;

      case 'accountNumber':
        if (!value) {
          error = 'Bank account number is required';
        } else if (!/^\d{9,18}$/.test(value)) {
          error = 'Please enter a valid account number (9-18 digits)';
        }
        break;

      case 'ifscCode':
        if (!value) {
          error = 'IFSC code is required';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
          error = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
        } else {
          // Auto-fetch bank details
          await fetchBankDetails(value);
        }
        break;

      case 'accountHolderName':
        if (!value) {
          error = 'Account holder name is required';
        } else if (value.trim().length < 2) {
          error = 'Please enter a valid account holder name';
        }
        break;

      case 'address':
        if (!value || value.trim().length < 10) {
          error = 'Please enter a complete address (minimum 10 characters)';
        }
        break;

      case 'monthlyVolume':
        if (value && (isNaN(value) || value < 0)) {
          error = 'Please enter a valid monthly volume';
        }
        break;

      case 'averageTicketSize':
        if (value && (isNaN(value) || value < 0)) {
          error = 'Please enter a valid average transaction amount';
        }
        break;
    }

    setErrors({ ...errors, [field]: error });
    setValidating({ ...validating, [field]: false });

    return !error;
  };

  const fetchBankDetails = async (_ifsc: string) => {
    try {
      // Simulate API call to fetch bank details
      // In production: use https://ifsc.razorpay.com/{ifsc}
      setTimeout(() => {
        const mockBankData = {
          bankName: 'State Bank of India',
        };
        handleFieldChange('bankName', mockBankData.bankName);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    }
  };

  const validateAllFields = async (): Promise<boolean> => {
    const requiredFields: (keyof MerchantData)[] = [
      'ownerName',
      'email',
      'phone',
      'pan',
      'address',
      'city',
      'state',
      'pincode',
      'accountNumber',
      'ifscCode',
      'accountHolderName',
      'accountType',
      'category',
    ];

    let isValid = true;

    for (const field of requiredFields) {
      const fieldValid = await validateField(field, formData[field]);
      if (!fieldValid) {
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    const isValid = await validateAllFields();
    if (isValid) {
      onNext();
    } else {
      // Mark all fields as touched to show errors
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
    }
  };

  const calculateProgress = () => {
    const totalFields = 13; // Number of required fields
    const filledFields = Object.values(formData).filter(v => v && String(v).trim()).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="smart-form">
      <div className="form-header">
        <h2>Complete Your Business Details</h2>
        <p>I've pre-filled some information from your documents. Please review and complete the remaining fields.</p>

        <div className="progress-bar">
          <div className="progress-label">
            <span>Form Completion</span>
            <span className="progress-value">{calculateProgress()}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="form-sections">
        {/* Owner Details Section */}
        <div className="form-section">
          <h3 className="section-title">👤 Owner Details</h3>

          <FormField
            label="Owner Name"
            required
            value={formData.ownerName || ''}
            onChange={(v) => handleFieldChange('ownerName', v)}
            onBlur={() => handleBlur('ownerName')}
            error={touched.ownerName ? errors.ownerName : ''}
            placeholder="Enter owner's full name as per PAN"
            helpText="This should match the name on your PAN card"
          />

          <FormField
            label="PAN Number"
            required
            value={formData.pan || ''}
            onChange={(v) => handleFieldChange('pan', v.toUpperCase())}
            onBlur={() => handleBlur('pan')}
            error={touched.pan ? errors.pan : ''}
            placeholder="ABCDE1234F"
            maxLength={10}
            helpText="Permanent Account Number of the proprietor"
            example="ABCDE1234F"
          />

          <div className="form-row">
            <FormField
              label="Email Address"
              required
              type="email"
              value={formData.email || ''}
              onChange={(v) => handleFieldChange('email', v)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? errors.email : ''}
              placeholder="owner@business.com"
              helpText="We'll send important updates here"
            />

            <FormField
              label="Mobile Number"
              required
              type="tel"
              value={formData.phone || ''}
              onChange={(v) => handleFieldChange('phone', v)}
              onBlur={() => handleBlur('phone')}
              error={touched.phone ? errors.phone : ''}
              placeholder="9876543210"
              maxLength={10}
              helpText="10-digit Indian mobile number"
            />
          </div>
        </div>

        {/* Business Address Section */}
        <div className="form-section">
          <h3 className="section-title">🏢 Business Address</h3>

          <FormField
            label="Business Address"
            required
            value={formData.address || ''}
            onChange={(v) => handleFieldChange('address', v)}
            onBlur={() => handleBlur('address')}
            error={touched.address ? errors.address : ''}
            placeholder="Building name, Street, Area"
            helpText="Complete registered business address"
            multiline
          />

          <div className="form-row">
            <FormField
              label="City"
              required
              value={formData.city || ''}
              onChange={(v) => handleFieldChange('city', v)}
              placeholder="Enter city"
            />

            <FormField
              label="State"
              required
              type="select"
              value={formData.state || ''}
              onChange={(v) => handleFieldChange('state', v)}
              options={indianStates.map(s => ({ value: s, label: s }))}
              placeholder="Select state"
            />
          </div>

          <FormField
            label="Pincode"
            required
            value={formData.pincode || ''}
            onChange={(v) => handleFieldChange('pincode', v)}
            onBlur={() => handleBlur('pincode')}
            error={touched.pincode ? errors.pincode : ''}
            placeholder="400001"
            maxLength={6}
            helpText="6-digit postal code"
          />
        </div>

        {/* Bank Account Details Section */}
        <div className="form-section">
          <h3 className="section-title">🏦 Bank Account Details</h3>
          <p className="section-description">
            Settlement of payment gateway transactions will be done to this account
          </p>

          <FormField
            label="Account Holder Name"
            required
            value={formData.accountHolderName || ''}
            onChange={(v) => handleFieldChange('accountHolderName', v)}
            onBlur={() => handleBlur('accountHolderName')}
            error={touched.accountHolderName ? errors.accountHolderName : ''}
            placeholder="As per bank records"
            helpText="Should match your bank account records"
          />

          <div className="form-row">
            <FormField
              label="Bank Account Number"
              required
              value={formData.accountNumber || ''}
              onChange={(v) => handleFieldChange('accountNumber', v)}
              onBlur={() => handleBlur('accountNumber')}
              error={touched.accountNumber ? errors.accountNumber : ''}
              placeholder="1234567890123"
              helpText="9-18 digit account number"
            />

            <FormField
              label="Account Type"
              required
              type="select"
              value={formData.accountType || ''}
              onChange={(v) => handleFieldChange('accountType', v)}
              options={[
                { value: 'current', label: 'Current Account' },
                { value: 'savings', label: 'Savings Account' },
              ]}
              placeholder="Select account type"
            />
          </div>

          <div className="form-row">
            <FormField
              label="IFSC Code"
              required
              value={formData.ifscCode || ''}
              onChange={(v) => handleFieldChange('ifscCode', v.toUpperCase())}
              onBlur={() => handleBlur('ifscCode')}
              error={touched.ifscCode ? errors.ifscCode : ''}
              placeholder="SBIN0001234"
              maxLength={11}
              helpText="11-character IFSC code"
              validating={validating.ifscCode}
            />

            <FormField
              label="Bank Name"
              value={formData.bankName || ''}
              onChange={(v) => handleFieldChange('bankName', v)}
              placeholder="Auto-filled from IFSC"
              disabled
            />
          </div>
        </div>

        {/* Business Details Section */}
        <div className="form-section">
          <h3 className="section-title">💼 Business Details</h3>

          <FormField
            label="Business Category"
            required
            type="select"
            value={formData.category || ''}
            onChange={(v) => handleFieldChange('category', v)}
            options={businessCategories}
            placeholder="Select your business category"
            helpText="Choose the category that best describes your business"
          />

          <FormField
            label="Business Description"
            value={formData.description || ''}
            onChange={(v) => handleFieldChange('description', v)}
            placeholder="Brief description of your business and products/services"
            helpText="Helps us understand your business better (optional)"
            multiline
          />

          <FormField
            label="Website URL"
            value={formData.website || ''}
            onChange={(v) => handleFieldChange('website', v)}
            placeholder="https://www.yourbusiness.com"
            helpText="Your business website (optional)"
          />

          <div className="form-row">
            <FormField
              label="Expected Monthly Transaction Volume"
              value={formData.monthlyVolume || ''}
              onChange={(v) => handleFieldChange('monthlyVolume', v)}
              onBlur={() => handleBlur('monthlyVolume')}
              error={touched.monthlyVolume ? errors.monthlyVolume : ''}
              placeholder="50000"
              type="number"
              helpText="Estimated monthly volume in ₹"
              prefix="₹"
            />

            <FormField
              label="Average Transaction Size"
              value={formData.averageTicketSize || ''}
              onChange={(v) => handleFieldChange('averageTicketSize', v)}
              onBlur={() => handleBlur('averageTicketSize')}
              error={touched.averageTicketSize ? errors.averageTicketSize : ''}
              placeholder="500"
              type="number"
              helpText="Average transaction amount in ₹"
              prefix="₹"
            />
          </div>

          <FormField
            label="GST Number (Optional)"
            value={formData.gstin || ''}
            onChange={(v) => handleFieldChange('gstin', v.toUpperCase())}
            onBlur={() => handleBlur('gstin')}
            error={touched.gstin ? errors.gstin : ''}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
            helpText="Not mandatory for businesses with turnover < ₹40 lakhs"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <div className="form-actions-content">
          <div className="help-text">
            <span className="icon">💡</span>
            <p>Need help? Ask me anything in the chat!</p>
          </div>

          <div className="action-buttons">
            <button className="secondary-button">
              Save Draft
            </button>
            <button
              className="primary-button"
              onClick={handleSubmit}
            >
              Continue to Verification →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Form Field Component
 */
interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  helpText?: string;
  example?: string;
  maxLength?: number;
  disabled?: boolean;
  multiline?: boolean;
  options?: { value: string; label: string }[];
  validating?: boolean;
  prefix?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  type = 'text',
  placeholder,
  helpText,
  example,
  maxLength,
  disabled,
  multiline,
  options,
  validating,
  prefix,
}) => {
  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="field-header">
        <label className="field-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
        {(helpText || example) && (
          <ContextualHelp
            field={label}
            helpText={helpText || ''}
            example={example}
          />
        )}
      </div>

      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="field-input"
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="field-input field-textarea"
          rows={3}
        />
      ) : (
        <div className="field-input-wrapper">
          {prefix && <span className="field-prefix">{prefix}</span>}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`field-input ${prefix ? 'has-prefix' : ''}`}
          />
          {validating && <span className="field-loading">⏳</span>}
        </div>
      )}

      {error && (
        <div className="field-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {helpText && !error && (
        <div className="field-help">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default SmartForm;
