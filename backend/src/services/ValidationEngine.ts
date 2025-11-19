/**
 * Validation Engine
 * Provides real-time validation with intelligent error messages
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  warnings: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

export class ValidationEngine {
  private llm: ChatAnthropic;

  constructor() {
    this.llm = new ChatAnthropic({
      modelName: 'claude-sonnet-4-5-20250929',
      temperature: 0,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Validate entire document data
   */
  async validateDocument(
    data: Record<string, any>,
    documentType: string
  ): Promise<ValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    switch (documentType) {
      case 'business_proof':
        if (!data.business_name) {
          issues.push('Business name is required');
          suggestions.push('Please ensure the business name is clearly visible on the document');
        }
        if (data.gstin && !this.isValidGSTIN(data.gstin)) {
          issues.push('Invalid GSTIN format');
          suggestions.push('GSTIN should be 15 characters (e.g., 27AABCU9603R1ZM)');
        }
        if (!data.address) {
          issues.push('Business address not found');
          suggestions.push('Please upload a document with complete address details');
        }
        break;

      case 'id_proof':
        if (!data.name) {
          issues.push('Name not found on document');
        }
        if (data.pan && !this.isValidPAN(data.pan)) {
          issues.push('Invalid PAN format');
          suggestions.push('PAN should be 10 characters (e.g., ABCDE1234F)');
        }
        break;

      case 'bank_proof':
        if (!data.account_number) {
          issues.push('Account number not found');
          suggestions.push('Please upload a cancelled cheque or bank statement with account details');
        }
        if (data.ifsc && !this.isValidIFSC(data.ifsc)) {
          issues.push('Invalid IFSC code');
          suggestions.push('IFSC should be 11 characters (e.g., SBIN0001234)');
        }
        if (!data.bank_name) {
          warnings.push('Bank name not detected, you may need to enter it manually');
        }
        break;
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      warnings,
    };
  }

  /**
   * Validate individual field with context-aware error messages
   */
  async validateField(
    field: string,
    value: any,
    context?: Record<string, any>
  ): Promise<FieldValidation> {
    const validators: Record<string, (val: any) => FieldValidation> = {
      businessName: this.validateBusinessName.bind(this),
      ownerName: this.validateOwnerName.bind(this),
      email: this.validateEmail.bind(this),
      phone: this.validatePhone.bind(this),
      gstin: this.validateGSTIN.bind(this),
      pan: this.validatePAN.bind(this),
      pincode: this.validatePincode.bind(this),
      ifscCode: this.validateIFSC.bind(this),
      accountNumber: this.validateAccountNumber.bind(this),
    };

    const validator = validators[field];
    if (!validator) {
      return {
        field,
        isValid: true,
        severity: 'info',
      };
    }

    return validator(value);
  }

  /**
   * Validate business name
   */
  private validateBusinessName(value: string): FieldValidation {
    if (!value || value.trim().length < 2) {
      return {
        field: 'businessName',
        isValid: false,
        error: 'Business name is too short',
        suggestion: 'Please enter your complete business name as registered',
        severity: 'error',
      };
    }

    if (value.length > 100) {
      return {
        field: 'businessName',
        isValid: false,
        error: 'Business name is too long',
        suggestion: 'Please use the official registered name (max 100 characters)',
        severity: 'error',
      };
    }

    return {
      field: 'businessName',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate owner name
   */
  private validateOwnerName(value: string): FieldValidation {
    if (!value || value.trim().length < 2) {
      return {
        field: 'ownerName',
        isValid: false,
        error: 'Please enter your full name',
        suggestion: 'Use your name as it appears on official documents',
        severity: 'error',
      };
    }

    // Check for numbers in name
    if (/\d/.test(value)) {
      return {
        field: 'ownerName',
        isValid: false,
        error: 'Name should not contain numbers',
        suggestion: 'Please enter your name using only letters',
        severity: 'error',
      };
    }

    return {
      field: 'ownerName',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate email
   */
  private validateEmail(value: string): FieldValidation {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      return {
        field: 'email',
        isValid: false,
        error: 'Email is required',
        suggestion: 'We\'ll use this to send important updates about your application',
        severity: 'error',
      };
    }

    if (!emailRegex.test(value)) {
      return {
        field: 'email',
        isValid: false,
        error: 'Invalid email format',
        suggestion: 'Please enter a valid email (e.g., yourname@example.com)',
        severity: 'error',
      };
    }

    return {
      field: 'email',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate phone number
   */
  private validatePhone(value: string): FieldValidation {
    // Indian phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');

    if (!value) {
      return {
        field: 'phone',
        isValid: false,
        error: 'Phone number is required',
        suggestion: 'We\'ll use this for important notifications',
        severity: 'error',
      };
    }

    if (!phoneRegex.test(cleanPhone)) {
      return {
        field: 'phone',
        isValid: false,
        error: 'Invalid phone number',
        suggestion: 'Please enter a valid 10-digit Indian mobile number',
        severity: 'error',
      };
    }

    return {
      field: 'phone',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate GSTIN
   */
  private validateGSTIN(value: string): FieldValidation {
    if (!value) {
      return {
        field: 'gstin',
        isValid: true, // GSTIN is optional for some businesses
        severity: 'info',
      };
    }

    if (!this.isValidGSTIN(value)) {
      return {
        field: 'gstin',
        isValid: false,
        error: 'Invalid GSTIN format',
        suggestion: 'GSTIN should be 15 characters (e.g., 27AABCU9603R1ZM)',
        severity: 'error',
      };
    }

    return {
      field: 'gstin',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate PAN
   */
  private validatePAN(value: string): FieldValidation {
    if (!value) {
      return {
        field: 'pan',
        isValid: false,
        error: 'PAN is required',
        suggestion: 'PAN is mandatory for payment gateway registration',
        severity: 'error',
      };
    }

    if (!this.isValidPAN(value.toUpperCase())) {
      return {
        field: 'pan',
        isValid: false,
        error: 'Invalid PAN format',
        suggestion: 'PAN should be 10 characters (e.g., ABCDE1234F)',
        severity: 'error',
      };
    }

    return {
      field: 'pan',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate pincode
   */
  private validatePincode(value: string): FieldValidation {
    const pincodeRegex = /^[1-9][0-9]{5}$/;

    if (!value) {
      return {
        field: 'pincode',
        isValid: false,
        error: 'Pincode is required',
        severity: 'error',
      };
    }

    if (!pincodeRegex.test(value)) {
      return {
        field: 'pincode',
        isValid: false,
        error: 'Invalid pincode',
        suggestion: 'Please enter a valid 6-digit Indian pincode',
        severity: 'error',
      };
    }

    return {
      field: 'pincode',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate IFSC code
   */
  private validateIFSC(value: string): FieldValidation {
    if (!value) {
      return {
        field: 'ifscCode',
        isValid: false,
        error: 'IFSC code is required',
        suggestion: 'You can find this on your cheque or passbook',
        severity: 'error',
      };
    }

    if (!this.isValidIFSC(value.toUpperCase())) {
      return {
        field: 'ifscCode',
        isValid: false,
        error: 'Invalid IFSC code',
        suggestion: 'IFSC should be 11 characters (e.g., SBIN0001234)',
        severity: 'error',
      };
    }

    return {
      field: 'ifscCode',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Validate account number
   */
  private validateAccountNumber(value: string): FieldValidation {
    const cleanValue = value.replace(/[\s\-]/g, '');

    if (!cleanValue) {
      return {
        field: 'accountNumber',
        isValid: false,
        error: 'Account number is required',
        severity: 'error',
      };
    }

    if (cleanValue.length < 9 || cleanValue.length > 18) {
      return {
        field: 'accountNumber',
        isValid: false,
        error: 'Invalid account number length',
        suggestion: 'Account number should be between 9-18 digits',
        severity: 'error',
      };
    }

    if (!/^\d+$/.test(cleanValue)) {
      return {
        field: 'accountNumber',
        isValid: false,
        error: 'Account number should contain only digits',
        severity: 'error',
      };
    }

    return {
      field: 'accountNumber',
      isValid: true,
      severity: 'info',
    };
  }

  /**
   * Cross-validate data across documents
   */
  async crossValidate(
    merchantData: Record<string, any>,
    extractedDocuments: Array<Record<string, any>>
  ): Promise<ValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check if name matches across documents
    const names = extractedDocuments
      .map(doc => doc.name || doc.owner_name)
      .filter(Boolean);

    if (names.length > 1 && !this.namesMatch(names)) {
      warnings.push('Name appears different on different documents');
      suggestions.push('Please ensure all documents belong to the same person');
    }

    // Check if address matches
    const addresses = extractedDocuments
      .map(doc => doc.address)
      .filter(Boolean);

    if (addresses.length > 1 && !this.addressesMatch(addresses)) {
      warnings.push('Addresses on documents don\'t match');
      suggestions.push('Different addresses are okay, but ensure all documents are current');
    }

    // Verify PAN is consistent
    const pans = extractedDocuments
      .map(doc => doc.pan)
      .filter(Boolean);

    if (pans.length > 1 && new Set(pans).size > 1) {
      issues.push('Different PAN numbers found on documents');
      suggestions.push('All documents must have the same PAN number');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      warnings,
    };
  }

  /**
   * Generate helpful error explanation using AI
   */
  async explainValidationError(
    field: string,
    value: any,
    error: string
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(`
      A user is filling out a merchant onboarding form and encountered a validation error.

      Field: {field}
      Their input: {value}
      Error message: {error}

      Generate a helpful, friendly explanation that:
      1. Explains what went wrong in simple terms
      2. Provides a specific example of correct format
      3. Offers to help if they're confused

      Keep it conversational and under 2 sentences.
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    return await chain.invoke({ field, value, error });
  }

  // Helper methods

  private isValidGSTIN(gstin: string): boolean {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  private isValidPAN(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  private isValidIFSC(ifsc: string): boolean {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  }

  private namesMatch(names: string[]): boolean {
    // Simple name matching - in production, use fuzzy matching
    const normalized = names.map(n =>
      n.toLowerCase().replace(/[^a-z]/g, '')
    );
    return new Set(normalized).size === 1;
  }

  private addressesMatch(addresses: string[]): boolean {
    // Simple address matching - in production, use more sophisticated matching
    const normalized = addresses.map(a =>
      a.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    return new Set(normalized).size === 1;
  }

  /**
   * Validate complete merchant data
   */
  async validateMerchantData(data: Record<string, any>): Promise<{
    isValid: boolean;
    issues: Array<{field: string; severity: string; message: string; suggestion?: string}>;
    suggestions: string[];
    warnings: string[];
  }> {
    const issues: Array<{field: string; severity: string; message: string; suggestion?: string}> = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    const requiredFields = [
      'businessName',
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
      'category',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        issues.push({
          field,
          severity: 'error',
          message: `${field} is required`,
          suggestion: `Please provide ${field}`,
        });
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions,
      warnings,
    };
  }
}

export default ValidationEngine;
