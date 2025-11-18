/**
 * useOnboardingAgent Hook
 * Custom hook for interacting with the AI onboarding agent
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ConversationMessage,
  AIResponse,
  MerchantData,
  DocumentType,
} from '../types/onboarding';
import { onboardingAPI } from '../api/onboarding';

interface UseOnboardingAgentResult {
  sessionId: string | null;
  conversationHistory: ConversationMessage[];
  suggestedActions: string[];
  isProcessing: boolean;
  agentResponse: AIResponse | null;
  sendMessage: (message: string) => Promise<void>;
  uploadDocument: (file: File, documentType: DocumentType) => Promise<any>;
  updateField: (field: keyof MerchantData, value: any) => Promise<void>;
  enrichData: (data: any) => Promise<any>;
  saveDraft: (data: Partial<MerchantData>) => Promise<void>;
  submitApplication: (data: Partial<MerchantData>) => Promise<void>;
  error: Error | null;
}

export const useOnboardingAgent = (): UseOnboardingAgentResult => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const messageIdCounter = useRef(0);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Check if there's a saved session
      const savedSessionId = localStorage.getItem('onboarding_session_id');

      if (savedSessionId) {
        // Try to resume existing session
        try {
          const response = await onboardingAPI.resumeDraft(savedSessionId);
          if (response.success && response.data) {
            setSessionId(savedSessionId);
            // Load conversation history if available
            if (response.data.conversationHistory) {
              setConversationHistory(response.data.conversationHistory);
            }
            return;
          }
        } catch (err) {
          // If resume fails, start new session
          console.log('Could not resume session, starting new one');
        }
      }

      // Start new session
      const response = await onboardingAPI.startSession();
      if (response.success && response.data) {
        const newSessionId = response.data.sessionId;
        setSessionId(newSessionId);
        localStorage.setItem('onboarding_session_id', newSessionId);

        // Send initial welcome message
        await sendInitialMessage(newSessionId);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Failed to initialize session:', err);
    }
  };

  const sendInitialMessage = async (sessId: string) => {
    try {
      const response = await onboardingAPI.sendMessage(
        sessId,
        'Hello, I want to start the onboarding process',
        {}
      );

      if (response.success && response.data) {
        const aiMessage = response.data.response;

        // Add AI response to conversation
        addMessage('agent', aiMessage.message, {
          suggestedActions: aiMessage.suggestedActions,
        });

        if (aiMessage.suggestedActions) {
          setSuggestedActions(aiMessage.suggestedActions);
        }
      }
    } catch (err) {
      console.error('Failed to send initial message:', err);
    }
  };

  const addMessage = (
    role: 'user' | 'agent',
    content: string,
    metadata?: any
  ) => {
    const message: ConversationMessage = {
      id: `msg_${++messageIdCounter.current}`,
      role,
      content,
      timestamp: new Date(),
      metadata,
    };

    setConversationHistory((prev) => [...prev, message]);
  };

  const sendMessage = useCallback(
    async (message: string) => {
      if (!sessionId || !message.trim()) return;

      setIsProcessing(true);
      setError(null);

      // Add user message immediately
      addMessage('user', message);

      try {
        const response = await onboardingAPI.sendMessage(sessionId, message, {
          conversationHistory: conversationHistory.slice(-5), // Last 5 messages for context
        });

        if (response.success && response.data) {
          const aiMessage = response.data.response;
          setAgentResponse(aiMessage);

          // Add AI response
          addMessage('agent', aiMessage.message, {
            suggestedActions: aiMessage.suggestedActions,
            intent: aiMessage.intent,
            dataUpdates: aiMessage.dataUpdates,
          });

          // Update suggested actions
          if (aiMessage.suggestedActions) {
            setSuggestedActions(aiMessage.suggestedActions);
          }
        } else {
          throw new Error(response.error?.message || 'Failed to send message');
        }
      } catch (err) {
        const error = err as Error;
        setError(error);

        // Add error message
        addMessage('agent', `I apologize, but I encountered an error: ${error.message}. Please try again.`);
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, conversationHistory]
  );

  const uploadDocument = useCallback(
    async (file: File, documentType: DocumentType) => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Add user message
        addMessage('user', `Uploading ${documentType} document: ${file.name}`);

        const response = await onboardingAPI.uploadDocument(
          sessionId,
          file,
          documentType,
          (progress) => {
            console.log(`Upload progress: ${progress}%`);
          }
        );

        if (response.success && response.data) {
          const result = response.data;

          // Add AI feedback
          addMessage('agent', `Great! I've successfully processed your ${documentType}. ${
            result.autoFilled.length > 0
              ? `I've auto-filled ${result.autoFilled.length} fields for you.`
              : ''
          }`);

          return result;
        } else {
          throw new Error(response.error?.message || 'Upload failed');
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        addMessage('agent', `Sorry, I couldn't process that document: ${error.message}`);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId]
  );

  const updateField = useCallback(
    async (field: keyof MerchantData, value: any) => {
      if (!sessionId) return;

      try {
        await onboardingAPI.updateData(sessionId, { [field]: value });
      } catch (err) {
        console.error('Failed to update field:', err);
      }
    },
    [sessionId]
  );

  const enrichData = useCallback(
    async (data: any) => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      try {
        const response = await onboardingAPI.enrichData(sessionId, data);
        if (response.success && response.data) {
          return response.data.enrichedData;
        }
        return null;
      } catch (err) {
        console.error('Failed to enrich data:', err);
        return null;
      }
    },
    [sessionId]
  );

  const saveDraft = useCallback(
    async (data: Partial<MerchantData>) => {
      if (!sessionId) return;

      try {
        await onboardingAPI.saveDraft(sessionId, data);
        addMessage('agent', 'Your progress has been saved. You can continue later from where you left off.');
      } catch (err) {
        console.error('Failed to save draft:', err);
        throw err;
      }
    },
    [sessionId]
  );

  const submitApplication = useCallback(
    async (data: Partial<MerchantData>) => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      setIsProcessing(true);
      setError(null);

      try {
        const response = await onboardingAPI.submitApplication(sessionId, data);

        if (response.success) {
          addMessage('agent', 'Congratulations! Your application has been submitted successfully. Our team will review it shortly.');

          // Clear session from localStorage
          localStorage.removeItem('onboarding_session_id');
        } else {
          throw new Error(response.error?.message || 'Submission failed');
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        addMessage('agent', `Failed to submit application: ${error.message}. Please try again.`);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId]
  );

  return {
    sessionId,
    conversationHistory,
    suggestedActions,
    isProcessing,
    agentResponse,
    sendMessage,
    uploadDocument,
    updateField,
    enrichData,
    saveDraft,
    submitApplication,
    error,
  };
};

export default useOnboardingAgent;
