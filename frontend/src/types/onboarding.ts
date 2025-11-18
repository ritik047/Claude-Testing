/**
 * TypeScript Types for AI-Powered Onboarding
 */

export enum OnboardingStep {
  WELCOME = 'welcome',
  BUSINESS_INFO = 'business_info',
  DOCUMENT_UPLOAD = 'document_upload',
  FORM_COMPLETION = 'form_completion',
  VERIFICATION = 'verification',
  REVIEW = 'review',
  SUBMITTED = 'submitted',
}

export interface MerchantData {
  // Business Information
  businessName: string;
  businessType: 'proprietorship' | 'partnership' | 'private_limited' | 'llp';
  gstin?: string;
  pan: string;
  tradeLicenseNumber?: string;
  cin?: string;

  // Contact Information
  ownerName: string;
  email: string;
  phone: string;

  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Bank Details
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';

  // Business Details
  category: string;
  subCategory?: string;
  website?: string;
  description?: string;
  monthlyVolume?: number;
  averageTicketSize?: number;
  establishmentDate?: string;

  // Additional
  numberOfEmployees?: number;
  yearlyTurnover?: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
    dataExtracted?: Partial<MerchantData>;
  };
}

export interface AgentContext {
  sessionId: string;
  userId?: string;
  currentStep: OnboardingStep;
  merchantData: Partial<MerchantData>;
  conversationHistory: ConversationMessage[];
  userBehavior: UserBehaviorMetrics;
  extractedDocuments: ExtractedDocument[];
}

export interface UserBehaviorMetrics {
  timeOnCurrentStep: number;
  totalTimeSpent: number;
  fieldsCompleted: number;
  fieldsTotal: number;
  documentsUploaded: number;
  documentsRequired: number;
  hesitationPoints: string[];
  dropOffRisk: number;
  interactionCount: number;
  lastActiveTime: Date;
}

export interface ExtractedDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
  extractedData: Record<string, any>;
  confidence: number;
  validationStatus: 'pending' | 'valid' | 'invalid' | 'needs_review';
  issues?: ValidationIssue[];
  ocrQuality?: number;
}

export type DocumentType =
  | 'business_proof'
  | 'id_proof'
  | 'address_proof'
  | 'bank_proof'
  | 'other';

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AIResponse {
  message: string;
  suggestedActions?: string[];
  dataUpdates?: Partial<MerchantData>;
  nextStep?: OnboardingStep;
  intent?: string;
  confidence?: number;
}

export interface DocumentProcessingResult {
  success: boolean;
  document: ExtractedDocument;
  extractedData: Partial<MerchantData>;
  confidence: number;
  feedback: string;
  suggestions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
  warnings: string[];
}

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  overallProgress: number; // 0-100
  estimatedTimeRemaining: number; // in seconds
  fieldsCompleted: number;
  fieldsTotal: number;
  documentsUploaded: number;
  documentsRequired: number;
}

export interface ProactiveIntervention {
  type: 'help_offer' | 'clarification' | 'auto_fill_suggestion' | 'drop_off_prevention';
  message: string;
  suggestedActions: string[];
  priority: 'low' | 'medium' | 'high';
  triggeredBy: 'time_spent' | 'hesitation' | 'error' | 'confusion';
}

export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
  confidence: number;
}

export interface OnboardingSession {
  sessionId: string;
  userId?: string;
  startedAt: Date;
  lastActivityAt: Date;
  currentStep: OnboardingStep;
  merchantData: Partial<MerchantData>;
  documents: ExtractedDocument[];
  conversationHistory: ConversationMessage[];
  interventions: ProactiveIntervention[];
  status: 'in_progress' | 'completed' | 'abandoned' | 'paused';
}

// API Response Types

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  context: Partial<AgentContext>;
}

export interface SendMessageResponse {
  response: AIResponse;
  updatedContext: Partial<AgentContext>;
}

export interface UploadDocumentRequest {
  sessionId: string;
  documentType: DocumentType;
  file: File;
}

export interface UploadDocumentResponse {
  document: ExtractedDocument;
  extractedData: Partial<MerchantData>;
  autoFilled: string[];
}

export interface ValidateFieldRequest {
  field: string;
  value: any;
  context?: Partial<MerchantData>;
}

export interface ValidateFieldResponse {
  validation: FieldValidation;
  suggestions?: string[];
}

export interface EnrichDataRequest {
  sessionId: string;
  data: {
    gstin?: string;
    pan?: string;
    pincode?: string;
    ifscCode?: string;
  };
}

export interface EnrichDataResponse {
  enrichedData: Partial<MerchantData>;
  sources: string[];
  confidence: number;
}

// Event Types for Analytics

export type OnboardingEvent =
  | 'session_started'
  | 'step_completed'
  | 'document_uploaded'
  | 'field_filled'
  | 'validation_error'
  | 'help_requested'
  | 'intervention_triggered'
  | 'auto_fill_accepted'
  | 'auto_fill_rejected'
  | 'session_paused'
  | 'session_resumed'
  | 'session_completed'
  | 'session_abandoned';

export interface AnalyticsEvent {
  event: OnboardingEvent;
  sessionId: string;
  timestamp: Date;
  step?: OnboardingStep;
  metadata?: Record<string, any>;
}

// Configuration Types

export interface OnboardingConfig {
  features: {
    aiAssistant: boolean;
    documentOCR: boolean;
    autoFill: boolean;
    voiceInput: boolean;
    proactiveHelp: boolean;
    multiLanguage: boolean;
  };
  thresholds: {
    dropOffRiskThreshold: number;
    hesitationTimeSeconds: number;
    minConfidenceForAutoFill: number;
    maxFieldValidationDelay: number;
  };
  limits: {
    maxFileSize: number;
    maxDocuments: number;
    sessionTimeout: number;
  };
}

export const DEFAULT_CONFIG: OnboardingConfig = {
  features: {
    aiAssistant: true,
    documentOCR: true,
    autoFill: true,
    voiceInput: true,
    proactiveHelp: true,
    multiLanguage: false,
  },
  thresholds: {
    dropOffRiskThreshold: 0.7,
    hesitationTimeSeconds: 120,
    minConfidenceForAutoFill: 0.85,
    maxFieldValidationDelay: 500,
  },
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxDocuments: 10,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },
};
