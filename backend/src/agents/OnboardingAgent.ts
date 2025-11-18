/**
 * Onboarding Agent - Core AI Agent for Merchant Onboarding
 *
 * This agent orchestrates the entire onboarding journey with:
 * - Context-aware conversations
 * - Proactive assistance
 * - Intelligent data extraction
 * - Real-time validation
 * - Drop-off prevention
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { DocumentProcessor } from '../services/DocumentProcessor';
import { ValidationEngine } from '../services/ValidationEngine';
import { ExternalAPIService } from '../integrations/ExternalAPIService';

export interface AgentContext {
  sessionId: string;
  userId?: string;
  currentStep: OnboardingStep;
  merchantData: Partial<MerchantData>;
  conversationHistory: ConversationMessage[];
  userBehavior: UserBehaviorMetrics;
  extractedDocuments: ExtractedDocument[];
}

export enum OnboardingStep {
  WELCOME = 'welcome',
  BUSINESS_INFO = 'business_info',
  DOCUMENT_UPLOAD = 'document_upload',
  FORM_COMPLETION = 'form_completion',
  VERIFICATION = 'verification',
  REVIEW = 'review',
  SUBMITTED = 'submitted'
}

export interface MerchantData {
  // Business Information
  businessName: string;
  businessType: string;
  gstin?: string;
  pan: string;
  tradeLicenseNumber?: string;

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

  // Business Details
  category: string;
  website?: string;
  monthlyVolume?: number;
  averageTicketSize?: number;
}

export interface ConversationMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface UserBehaviorMetrics {
  timeOnCurrentStep: number;
  totalTimeSpent: number;
  fieldsCompleted: number;
  fieldsTotal: number;
  documentsUploaded: number;
  documentsRequired: number;
  hesitationPoints: string[];
  dropOffRisk: number; // 0-1 score
}

export interface ExtractedDocument {
  documentType: string;
  filePath: string;
  extractedData: Record<string, any>;
  confidence: number;
  validationStatus: 'pending' | 'valid' | 'invalid';
  issues?: string[];
}

export class OnboardingAgent {
  private llm: ChatOpenAI | ChatAnthropic;
  private documentProcessor: DocumentProcessor;
  private validationEngine: ValidationEngine;
  private externalAPI: ExternalAPIService;

  constructor() {
    // Initialize LLM (Claude Sonnet for high quality responses)
    this.llm = new ChatAnthropic({
      modelName: 'claude-sonnet-4-5-20250929',
      temperature: 0.3,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.documentProcessor = new DocumentProcessor();
    this.validationEngine = new ValidationEngine();
    this.externalAPI = new ExternalAPIService();
  }

  /**
   * Main conversation handler
   * Processes user input and generates contextual responses
   */
  async handleConversation(
    userMessage: string,
    context: AgentContext
  ): Promise<{
    response: string;
    suggestedActions?: string[];
    dataUpdates?: Partial<MerchantData>;
    nextStep?: OnboardingStep;
  }> {
    // Analyze user intent
    const intent = await this.analyzeIntent(userMessage, context);

    // Check if proactive intervention is needed
    const intervention = await this.checkProactiveIntervention(context);
    if (intervention) {
      return intervention;
    }

    // Generate contextual response
    const prompt = this.buildConversationalPrompt(
      userMessage,
      context,
      intent
    );

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      userMessage,
      context: JSON.stringify(context),
      intent,
    });

    // Extract any data from the conversation
    const dataUpdates = await this.extractDataFromConversation(
      userMessage,
      response,
      context
    );

    // Determine if we should move to next step
    const nextStep = this.shouldMoveToNextStep(context, dataUpdates);

    return {
      response,
      dataUpdates,
      nextStep,
      suggestedActions: this.generateSuggestedActions(context, intent),
    };
  }

  /**
   * Analyzes user intent from their message
   */
  private async analyzeIntent(
    message: string,
    context: AgentContext
  ): Promise<string> {
    const intentPrompt = PromptTemplate.fromTemplate(`
      Analyze the user's intent from their message in the context of merchant onboarding.

      User message: {message}
      Current step: {currentStep}

      Classify intent as one of:
      - provide_information: User is providing requested information
      - ask_question: User has a question
      - express_confusion: User is confused or stuck
      - request_help: User explicitly asks for help
      - ready_to_proceed: User wants to move forward
      - go_back: User wants to revisit a previous step

      Return only the intent classification.
    `);

    const chain = RunnableSequence.from([
      intentPrompt,
      this.llm,
      new StringOutputParser(),
    ]);

    return await chain.invoke({
      message,
      currentStep: context.currentStep,
    });
  }

  /**
   * Checks if proactive intervention is needed based on user behavior
   */
  private async checkProactiveIntervention(
    context: AgentContext
  ): Promise<{
    response: string;
    suggestedActions?: string[];
  } | null> {
    const { userBehavior, currentStep } = context;

    // High drop-off risk
    if (userBehavior.dropOffRisk > 0.7) {
      return {
        response: "I notice you might be stuck. No worries! I'm here to help. What's confusing you right now?",
        suggestedActions: [
          'Explain this step',
          'Show an example',
          'Skip for now',
        ],
      };
    }

    // User spending too much time on a field
    if (userBehavior.timeOnCurrentStep > 120) { // 2 minutes
      return {
        response: "Taking your time is fine! Would you like me to explain this section or provide an example?",
        suggestedActions: [
          'Yes, explain this',
          'Show an example',
          "I'm fine, thanks",
        ],
      };
    }

    // Low completion rate
    const completionRate = userBehavior.fieldsCompleted / userBehavior.fieldsTotal;
    if (completionRate < 0.3 && userBehavior.totalTimeSpent > 300) {
      return {
        response: "I can help speed this up! Would you like me to auto-fill information from your documents?",
        suggestedActions: [
          'Yes, please auto-fill',
          'No, I prefer manual entry',
        ],
      };
    }

    return null;
  }

  /**
   * Builds the conversational prompt for the LLM
   */
  private buildConversationalPrompt(
    userMessage: string,
    context: AgentContext,
    intent: string
  ): PromptTemplate {
    return PromptTemplate.fromTemplate(`
      You are an AI assistant helping merchants onboard to a payment gateway.

      Your goals:
      1. Be friendly, clear, and concise
      2. Minimize user effort
      3. Explain technical terms in simple language
      4. Provide specific, actionable guidance
      5. Celebrate progress

      Current Context:
      - Step: {currentStep}
      - User intent: {intent}
      - Progress: {fieldsCompleted}/{fieldsTotal} fields completed
      - Documents uploaded: {documentsUploaded}/{documentsRequired}

      Conversation history:
      {conversationHistory}

      User message: {userMessage}

      Generate a helpful, conversational response that:
      - Addresses the user's intent
      - Guides them toward completion
      - Uses simple language
      - Keeps response under 2-3 sentences
      - Provides specific next steps when appropriate

      Response:
    `);
  }

  /**
   * Extracts structured data from conversational exchange
   */
  private async extractDataFromConversation(
    userMessage: string,
    agentResponse: string,
    context: AgentContext
  ): Promise<Partial<MerchantData>> {
    // Use NLP to extract entities from user message
    const extractionPrompt = PromptTemplate.fromTemplate(`
      Extract merchant data from this conversation exchange.

      User: {userMessage}
      Agent: {agentResponse}
      Current step: {currentStep}

      Extract any of the following if present:
      - businessName
      - ownerName
      - email
      - phone
      - address
      - city
      - state
      - pincode
      - gstin
      - pan

      Return as JSON object with only the fields found. Return empty object if nothing to extract.
    `);

    const chain = RunnableSequence.from([
      extractionPrompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      userMessage,
      agentResponse,
      currentStep: context.currentStep,
    });

    try {
      return JSON.parse(result);
    } catch {
      return {};
    }
  }

  /**
   * Process uploaded document with OCR and AI extraction
   */
  async processDocument(
    file: Buffer,
    documentType: string,
    context: AgentContext
  ): Promise<ExtractedDocument> {
    // Run OCR
    const ocrResult = await this.documentProcessor.extractText(file);

    // Use AI to extract structured data
    const extractedData = await this.documentProcessor.extractEntities(
      ocrResult.text,
      documentType
    );

    // Validate extracted data
    const validation = await this.validationEngine.validateDocument(
      extractedData,
      documentType
    );

    // Check quality and confidence
    const confidence = this.calculateConfidence(
      ocrResult,
      extractedData,
      validation
    );

    const result: ExtractedDocument = {
      documentType,
      filePath: ocrResult.filePath,
      extractedData,
      confidence,
      validationStatus: validation.isValid ? 'valid' : 'invalid',
      issues: validation.issues,
    };

    // If confidence is high, auto-fill data
    if (confidence > 0.85 && validation.isValid) {
      await this.autoFillFromDocument(result, context);
    }

    return result;
  }

  /**
   * Auto-fill merchant data from extracted document
   */
  private async autoFillFromDocument(
    document: ExtractedDocument,
    context: AgentContext
  ): Promise<void> {
    const mapping = this.getDocumentFieldMapping(document.documentType);

    for (const [docField, merchantField] of Object.entries(mapping)) {
      if (document.extractedData[docField]) {
        context.merchantData[merchantField] = document.extractedData[docField];
      }
    }
  }

  /**
   * Calculate confidence score for extracted data
   */
  private calculateConfidence(
    ocrResult: any,
    extractedData: any,
    validation: any
  ): number {
    let score = 0;

    // OCR quality (0-0.4)
    score += ocrResult.quality * 0.4;

    // Data completeness (0-0.3)
    const completeness = Object.keys(extractedData).length / 10; // Expected ~10 fields
    score += Math.min(completeness, 1) * 0.3;

    // Validation success (0-0.3)
    score += validation.isValid ? 0.3 : 0;

    return Math.min(score, 1);
  }

  /**
   * Enrich data using external APIs
   */
  async enrichData(
    context: AgentContext
  ): Promise<Partial<MerchantData>> {
    const enrichedData: Partial<MerchantData> = {};

    // Fetch from GST API if GSTIN available
    if (context.merchantData.gstin) {
      const gstData = await this.externalAPI.fetchGSTDetails(
        context.merchantData.gstin
      );
      Object.assign(enrichedData, gstData);
    }

    // Fetch from PAN API
    if (context.merchantData.pan) {
      const panData = await this.externalAPI.fetchPANDetails(
        context.merchantData.pan
      );
      Object.assign(enrichedData, panData);
    }

    // Auto-fill address from pincode
    if (context.merchantData.pincode && !context.merchantData.city) {
      const locationData = await this.externalAPI.fetchLocationFromPincode(
        context.merchantData.pincode
      );
      Object.assign(enrichedData, locationData);
    }

    // Get IFSC details
    if (context.merchantData.ifscCode) {
      const bankData = await this.externalAPI.fetchBankDetails(
        context.merchantData.ifscCode
      );
      Object.assign(enrichedData, bankData);
    }

    return enrichedData;
  }

  /**
   * Generate helpful suggestions based on context
   */
  private generateSuggestedActions(
    context: AgentContext,
    intent: string
  ): string[] {
    const { currentStep, merchantData } = context;

    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return [
          'Get started',
          'Learn more about the process',
          'Estimated time: 10 minutes',
        ];

      case OnboardingStep.BUSINESS_INFO:
        if (!merchantData.gstin) {
          return [
            'Enter GST number',
            "I don't have GST",
            'What is GST?',
          ];
        }
        return ['Continue', 'Review information'];

      case OnboardingStep.DOCUMENT_UPLOAD:
        return [
          'Upload document',
          'Take a photo',
          'What documents do I need?',
          'Why is this needed?',
        ];

      case OnboardingStep.FORM_COMPLETION:
        return [
          'Auto-fill from documents',
          'Continue manually',
          'Save and continue later',
        ];

      case OnboardingStep.REVIEW:
        return [
          'Submit application',
          'Edit information',
          'How long for approval?',
        ];

      default:
        return ['Continue', 'Get help'];
    }
  }

  /**
   * Determines if ready to move to next step
   */
  private shouldMoveToNextStep(
    context: AgentContext,
    dataUpdates?: Partial<MerchantData>
  ): OnboardingStep | undefined {
    const { currentStep, merchantData, extractedDocuments } = context;

    // Apply data updates
    const updatedData = { ...merchantData, ...dataUpdates };

    switch (currentStep) {
      case OnboardingStep.WELCOME:
        if (updatedData.businessName) {
          return OnboardingStep.BUSINESS_INFO;
        }
        break;

      case OnboardingStep.BUSINESS_INFO:
        if (
          updatedData.businessName &&
          updatedData.ownerName &&
          (updatedData.gstin || updatedData.pan)
        ) {
          return OnboardingStep.DOCUMENT_UPLOAD;
        }
        break;

      case OnboardingStep.DOCUMENT_UPLOAD:
        const requiredDocs = ['business_proof', 'id_proof', 'bank_proof'];
        const uploadedTypes = extractedDocuments.map(d => d.documentType);
        if (requiredDocs.every(doc => uploadedTypes.includes(doc))) {
          return OnboardingStep.FORM_COMPLETION;
        }
        break;

      case OnboardingStep.FORM_COMPLETION:
        if (this.isFormComplete(updatedData)) {
          return OnboardingStep.VERIFICATION;
        }
        break;

      case OnboardingStep.VERIFICATION:
        return OnboardingStep.REVIEW;

      case OnboardingStep.REVIEW:
        return OnboardingStep.SUBMITTED;
    }

    return undefined;
  }

  /**
   * Check if form is complete
   */
  private isFormComplete(data: Partial<MerchantData>): boolean {
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
      'category',
    ];

    return requiredFields.every(field => data[field]);
  }

  /**
   * Document type to merchant field mapping
   */
  private getDocumentFieldMapping(documentType: string): Record<string, string> {
    const mappings = {
      business_proof: {
        business_name: 'businessName',
        gstin: 'gstin',
        trade_license: 'tradeLicenseNumber',
        address: 'address',
      },
      id_proof: {
        name: 'ownerName',
        pan: 'pan',
        address: 'address',
      },
      bank_proof: {
        account_number: 'accountNumber',
        ifsc: 'ifscCode',
        bank_name: 'bankName',
        account_holder: 'accountHolderName',
      },
    };

    return mappings[documentType] || {};
  }

  /**
   * Calculate drop-off risk based on behavior
   */
  calculateDropOffRisk(behavior: UserBehaviorMetrics): number {
    let risk = 0;

    // Time-based risk
    if (behavior.timeOnCurrentStep > 180) risk += 0.3;
    if (behavior.totalTimeSpent > 900 && behavior.fieldsCompleted < 5) risk += 0.2;

    // Progress-based risk
    const completionRate = behavior.fieldsCompleted / behavior.fieldsTotal;
    if (completionRate < 0.2) risk += 0.3;

    // Hesitation points
    if (behavior.hesitationPoints.length > 3) risk += 0.2;

    return Math.min(risk, 1);
  }
}

export default OnboardingAgent;
