/**
 * Onboarding API Service
 * All API calls related to the onboarding process
 */

import { apiClient } from './client';
import {
  APIResponse,
  SendMessageResponse,
  UploadDocumentResponse,
  ValidateFieldResponse,
  EnrichDataResponse,
  OnboardingSession,
  MerchantData,
  DocumentType,
} from '../types/onboarding';

export const onboardingAPI = {
  /**
   * Start a new onboarding session
   */
  async startSession(): Promise<APIResponse<OnboardingSession>> {
    return apiClient.post('/onboarding/session', {
      startedAt: new Date().toISOString(),
    });
  },

  /**
   * Send a message to the AI agent
   */
  async sendMessage(
    sessionId: string,
    message: string,
    context?: any
  ): Promise<APIResponse<SendMessageResponse>> {
    return apiClient.post('/onboarding/send-message', {
      sessionId,
      message,
      context,
    });
  },

  /**
   * Upload and process a document
   */
  async uploadDocument(
    sessionId: string,
    file: File,
    documentType: DocumentType,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse<UploadDocumentResponse>> {
    return apiClient.uploadFile(
      '/onboarding/upload-document',
      file,
      {
        sessionId,
        documentType,
      },
      onProgress
    );
  },

  /**
   * Validate a single field
   */
  async validateField(
    field: string,
    value: any,
    context?: Partial<MerchantData>
  ): Promise<APIResponse<ValidateFieldResponse>> {
    return apiClient.post('/onboarding/validate-field', {
      field,
      value,
      context,
    });
  },

  /**
   * Enrich data from external sources
   */
  async enrichData(
    sessionId: string,
    data: {
      gstin?: string;
      pan?: string;
      pincode?: string;
      ifscCode?: string;
    }
  ): Promise<APIResponse<EnrichDataResponse>> {
    return apiClient.post('/onboarding/enrich-data', {
      sessionId,
      data,
    });
  },

  /**
   * Get current session progress
   */
  async getProgress(sessionId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/onboarding/progress/${sessionId}`);
  },

  /**
   * Update merchant data
   */
  async updateData(
    sessionId: string,
    data: Partial<MerchantData>
  ): Promise<APIResponse<any>> {
    return apiClient.patch(`/onboarding/data/${sessionId}`, { data });
  },

  /**
   * Submit the onboarding application
   */
  async submitApplication(
    sessionId: string,
    data: Partial<MerchantData>
  ): Promise<APIResponse<any>> {
    return apiClient.post('/onboarding/submit', {
      sessionId,
      data,
    });
  },

  /**
   * Save draft (for later continuation)
   */
  async saveDraft(
    sessionId: string,
    data: Partial<MerchantData>
  ): Promise<APIResponse<any>> {
    return apiClient.post('/onboarding/save-draft', {
      sessionId,
      data,
    });
  },

  /**
   * Resume from saved draft
   */
  async resumeDraft(sessionId: string): Promise<APIResponse<OnboardingSession>> {
    return apiClient.get(`/onboarding/resume/${sessionId}`);
  },

  /**
   * Verify specific information (e.g., bank account, PAN)
   */
  async verifyInfo(
    sessionId: string,
    verificationType: 'pan' | 'gstin' | 'bank_account',
    data: any
  ): Promise<APIResponse<any>> {
    return apiClient.post('/onboarding/verify', {
      sessionId,
      verificationType,
      data,
    });
  },
};

export default onboardingAPI;
