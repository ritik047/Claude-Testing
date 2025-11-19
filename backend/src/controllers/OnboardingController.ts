/**
 * Onboarding Controller
 * Handles all onboarding-related requests
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OnboardingAgent } from '../agents/OnboardingAgent';
import { DocumentProcessor } from '../services/DocumentProcessor';
import { ValidationEngine } from '../services/ValidationEngine';
import { ExternalAPIService } from '../integrations/ExternalAPIService';
import { logger } from '../utils/logger';
import { OnboardingStep } from '../agents/OnboardingAgent';

// In-memory session store (in production, use Redis or Database)
const sessions = new Map<string, any>();

export class OnboardingController {
  private agent: OnboardingAgent;
  private documentProcessor: DocumentProcessor;
  private validationEngine: ValidationEngine;
  private externalAPI: ExternalAPIService;

  constructor() {
    this.agent = new OnboardingAgent();
    this.documentProcessor = new DocumentProcessor();
    this.validationEngine = new ValidationEngine();
    this.externalAPI = new ExternalAPIService();
  }

  /**
   * Start a new onboarding session
   */
  startSession = async (req: Request, res: Response) => {
    try {
      const sessionId = uuidv4();
      const session = {
        sessionId,
        userId: req.body.userId,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        currentStep: OnboardingStep.WELCOME,
        merchantData: {},
        documents: [],
        conversationHistory: [],
        interventions: [],
        status: 'in_progress',
      };

      sessions.set(sessionId, session);
      logger.info(`New session started: ${sessionId}`);

      res.json({
        success: true,
        data: { sessionId, session },
      });
    } catch (error) {
      logger.error('Error starting session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SESSION_START_FAILED',
          message: 'Failed to start session',
        },
      });
    }
  };

  /**
   * Resume an existing session
   */
  resumeSession = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = sessions.get(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      session.lastActivityAt = new Date();
      logger.info(`Session resumed: ${sessionId}`);

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      logger.error('Error resuming session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SESSION_RESUME_FAILED',
          message: 'Failed to resume session',
        },
      });
    }
  };

  /**
   * Send a message to the AI agent
   */
  sendMessage = async (req: Request, res: Response) => {
    try {
      const { sessionId, message, context } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'sessionId and message are required',
          },
        });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      // Build agent context
      const agentContext = {
        sessionId,
        currentStep: session.currentStep,
        merchantData: session.merchantData,
        conversationHistory: session.conversationHistory || [],
        userBehavior: {
          timeOnCurrentStep: 0,
          totalTimeSpent: Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000),
          fieldsCompleted: Object.keys(session.merchantData).length,
          fieldsTotal: 13,
          documentsUploaded: session.documents.length,
          documentsRequired: 3,
          hesitationPoints: [],
          dropOffRisk: 0.2,
        },
        extractedDocuments: session.documents,
      };

      // Get AI response
      const aiResponse = await this.agent.handleConversation(message, agentContext);

      // Update session
      session.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      session.conversationHistory.push({
        role: 'agent',
        content: aiResponse.response,
        timestamp: new Date(),
        metadata: {
          suggestedActions: aiResponse.suggestedActions,
          dataUpdates: aiResponse.dataUpdates,
        },
      });

      // Apply data updates if any
      if (aiResponse.dataUpdates) {
        session.merchantData = { ...session.merchantData, ...aiResponse.dataUpdates };
      }

      // Update step if needed
      if (aiResponse.nextStep) {
        session.currentStep = aiResponse.nextStep;
      }

      session.lastActivityAt = new Date();

      res.json({
        success: true,
        data: {
          response: {
            message: aiResponse.response,
            suggestedActions: aiResponse.suggestedActions,
            dataUpdates: aiResponse.dataUpdates,
            nextStep: aiResponse.nextStep,
          },
          updatedContext: {
            currentStep: session.currentStep,
            merchantData: session.merchantData,
          },
        },
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MESSAGE_FAILED',
          message: 'Failed to process message',
        },
      });
    }
  };

  /**
   * Upload and process a document
   */
  uploadDocument = async (req: Request, res: Response) => {
    try {
      const { sessionId, documentType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      // Process document
      const agentContext = {
        sessionId,
        currentStep: session.currentStep,
        merchantData: session.merchantData,
        conversationHistory: session.conversationHistory,
        userBehavior: {} as any,
        extractedDocuments: session.documents,
      };

      const result = await this.agent.processDocument(
        file.buffer,
        documentType,
        agentContext
      );

      // Add to session documents
      session.documents.push(result);

      // Auto-fill merchant data
      const autoFilledFields: string[] = [];
      if (result.extractedData) {
        for (const [key, value] of Object.entries(result.extractedData)) {
          if (value && !session.merchantData[key]) {
            session.merchantData[key] = value;
            autoFilledFields.push(key);
          }
        }
      }

      session.lastActivityAt = new Date();

      logger.info(`Document processed for session ${sessionId}: ${documentType}`);

      res.json({
        success: true,
        data: {
          document: result,
          extractedData: result.extractedData,
          autoFilled: autoFilledFields,
        },
      });
    } catch (error) {
      logger.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload document',
        },
      });
    }
  };

  /**
   * Update merchant data
   */
  updateData = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { data } = req.body;

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      session.merchantData = { ...session.merchantData, ...data };
      session.lastActivityAt = new Date();

      res.json({
        success: true,
        data: session.merchantData,
      });
    } catch (error) {
      logger.error('Error updating data:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update data',
        },
      });
    }
  };

  /**
   * Enrich data from external sources
   */
  enrichData = async (req: Request, res: Response) => {
    try {
      const { sessionId, data } = req.body;

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      const agentContext = {
        sessionId,
        currentStep: session.currentStep,
        merchantData: { ...session.merchantData, ...data },
        conversationHistory: session.conversationHistory,
        userBehavior: {} as any,
        extractedDocuments: session.documents,
      };

      const enrichedData = await this.agent.enrichData(agentContext);

      session.merchantData = { ...session.merchantData, ...enrichedData };
      session.lastActivityAt = new Date();

      res.json({
        success: true,
        data: {
          enrichedData,
          sources: ['GST API', 'PAN API', 'IFSC API'],
          confidence: 0.9,
        },
      });
    } catch (error) {
      logger.error('Error enriching data:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ENRICH_FAILED',
          message: 'Failed to enrich data',
        },
      });
    }
  };

  /**
   * Validate a field
   */
  validateField = async (req: Request, res: Response) => {
    try {
      const { field, value, context } = req.body;

      const validation = await this.validationEngine.validateField(
        field,
        value,
        context
      );

      res.json({
        success: true,
        data: {
          validation,
        },
      });
    } catch (error) {
      logger.error('Error validating field:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Failed to validate field',
        },
      });
    }
  };

  /**
   * Verify information (PAN, GST, Bank Account)
   */
  verifyInfo = async (req: Request, res: Response) => {
    try {
      const { sessionId, verificationType, data } = req.body;

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      let verificationResult;

      switch (verificationType) {
        case 'pan':
          verificationResult = await this.externalAPI.verifyPAN(data.pan);
          break;
        case 'gstin':
          verificationResult = await this.externalAPI.verifyGSTIN(data.gstin);
          break;
        case 'bank_account':
          verificationResult = await this.externalAPI.verifyBankAccount(
            data.accountNumber,
            data.ifscCode
          );
          break;
        default:
          throw new Error('Invalid verification type');
      }

      res.json({
        success: true,
        data: verificationResult,
      });
    } catch (error) {
      logger.error('Error verifying info:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Failed to verify information',
        },
      });
    }
  };

  /**
   * Get session progress
   */
  getProgress = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      const totalFields = 13;
      const completedFields = Object.keys(session.merchantData).filter(
        (key) => session.merchantData[key]
      ).length;

      const progress = {
        currentStep: session.currentStep,
        completedSteps: this.getCompletedSteps(session.currentStep),
        overallProgress: Math.round((completedFields / totalFields) * 100),
        estimatedTimeRemaining: Math.max(0, (totalFields - completedFields) * 30), // 30 seconds per field
        fieldsCompleted: completedFields,
        fieldsTotal: totalFields,
        documentsUploaded: session.documents.length,
        documentsRequired: 3,
      };

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      logger.error('Error getting progress:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROGRESS_FAILED',
          message: 'Failed to get progress',
        },
      });
    }
  };

  /**
   * Save draft
   */
  saveDraft = async (req: Request, res: Response) => {
    try {
      const { sessionId, data } = req.body;

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      session.merchantData = { ...session.merchantData, ...data };
      session.status = 'paused';
      session.lastActivityAt = new Date();

      logger.info(`Draft saved for session ${sessionId}`);

      res.json({
        success: true,
        data: {
          message: 'Draft saved successfully',
        },
      });
    } catch (error) {
      logger.error('Error saving draft:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SAVE_DRAFT_FAILED',
          message: 'Failed to save draft',
        },
      });
    }
  };

  /**
   * Submit application
   */
  submitApplication = async (req: Request, res: Response) => {
    try {
      const { sessionId, data } = req.body;

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          },
        });
      }

      // Validate all required fields
      const finalData = { ...session.merchantData, ...data };
      const validation = await this.validationEngine.validateMerchantData(finalData);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Please fix all validation errors',
            details: validation.issues,
          },
        });
      }

      // Mark session as completed
      session.status = 'completed';
      session.merchantData = finalData;
      session.submittedAt = new Date();

      logger.info(`Application submitted for session ${sessionId}`);

      // In production, save to database and trigger approval workflow

      res.json({
        success: true,
        data: {
          message: 'Application submitted successfully',
          applicationId: uuidv4(),
          estimatedApprovalTime: '2-4 hours',
        },
      });
    } catch (error) {
      logger.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SUBMISSION_FAILED',
          message: 'Failed to submit application',
        },
      });
    }
  };

  /**
   * Helper: Get completed steps based on current step
   */
  private getCompletedSteps(currentStep: OnboardingStep): OnboardingStep[] {
    const steps = [
      OnboardingStep.WELCOME,
      OnboardingStep.BUSINESS_INFO,
      OnboardingStep.DOCUMENT_UPLOAD,
      OnboardingStep.FORM_COMPLETION,
      OnboardingStep.VERIFICATION,
      OnboardingStep.REVIEW,
      OnboardingStep.SUBMITTED,
    ];

    const currentIndex = steps.indexOf(currentStep);
    return steps.slice(0, currentIndex);
  }
}
