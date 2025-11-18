/**
 * AI Assistant Component
 * Floating chat interface with the onboarding AI agent
 */

import React, { useState, useRef, useEffect } from 'react';
import { ConversationMessage, OnboardingStep } from '../types/onboarding';

interface AIAssistantProps {
  conversationHistory: ConversationMessage[];
  suggestedActions?: string[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  minimized: boolean;
  onToggleMinimize: () => void;
  currentStep: OnboardingStep;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  conversationHistory,
  suggestedActions,
  onSendMessage,
  isProcessing,
  minimized,
  onToggleMinimize,
  currentStep,
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Simulate typing indicator
  useEffect(() => {
    if (isProcessing) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [isProcessing]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStepName = (step: OnboardingStep): string => {
    const names = {
      [OnboardingStep.WELCOME]: 'Welcome',
      [OnboardingStep.BUSINESS_INFO]: 'Business Information',
      [OnboardingStep.DOCUMENT_UPLOAD]: 'Document Upload',
      [OnboardingStep.FORM_COMPLETION]: 'Form Completion',
      [OnboardingStep.VERIFICATION]: 'Verification',
      [OnboardingStep.REVIEW]: 'Review',
      [OnboardingStep.SUBMITTED]: 'Submitted',
    };
    return names[step] || step;
  };

  return (
    <div className={`ai-assistant ${minimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="assistant-header" onClick={onToggleMinimize}>
        <div className="header-content">
          <div className="avatar">
            <span className="ai-icon">🤖</span>
            <span className="status-indicator online"></span>
          </div>
          <div className="header-text">
            <h4>AI Assistant</h4>
            <p className="status">
              {isProcessing ? 'Thinking...' : 'Online - Ready to help'}
            </p>
          </div>
        </div>
        <button className="minimize-button">
          {minimized ? '▲' : '▼'}
        </button>
      </div>

      {/* Chat Body */}
      {!minimized && (
        <>
          <div className="chat-messages">
            {/* Context Banner */}
            <div className="context-banner">
              <span className="icon">📍</span>
              <span>Current Step: {getStepName(currentStep)}</span>
            </div>

            {/* Messages */}
            {conversationHistory.length === 0 && (
              <div className="welcome-message">
                <div className="message agent">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <p>
                      Hi! I'm your AI onboarding assistant. I'm here to make this
                      process as smooth as possible for you.
                    </p>
                    <p className="mt-2">
                      Feel free to ask me anything - I can explain requirements,
                      help with forms, or clarify any doubts you have!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                {message.role === 'agent' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <p>{message.content}</p>
                  {message.metadata?.suggestedActions && (
                    <div className="inline-suggestions">
                      {message.metadata.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          className="suggestion-button"
                          onClick={() => onSendMessage(action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="message-avatar user">👤</div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message agent">
                <div className="message-avatar">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {suggestedActions && suggestedActions.length > 0 && (
            <div className="quick-actions">
              <p className="quick-actions-label">Quick actions:</p>
              <div className="action-chips">
                {suggestedActions.map((action, index) => (
                  <button
                    key={index}
                    className="action-chip"
                    onClick={() => onSendMessage(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isProcessing}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              {isProcessing ? '...' : '→'}
            </button>
          </div>

          {/* Help Shortcuts */}
          <div className="help-shortcuts">
            <button
              className="shortcut"
              onClick={() => onSendMessage('What documents do I need?')}
            >
              📄 Documents needed
            </button>
            <button
              className="shortcut"
              onClick={() => onSendMessage('How long does this take?')}
            >
              ⏱️ Timeline
            </button>
            <button
              className="shortcut"
              onClick={() => onSendMessage('Explain this step')}
            >
              ❓ Explain step
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Proactive Help Tooltip
 * Shows contextual help based on user behavior
 */
export const ProactiveHelpTooltip: React.FC<{
  message: string;
  onDismiss: () => void;
  onAccept: () => void;
}> = ({ message, onDismiss, onAccept }) => {
  return (
    <div className="proactive-tooltip">
      <div className="tooltip-content">
        <span className="ai-icon">💡</span>
        <p>{message}</p>
      </div>
      <div className="tooltip-actions">
        <button className="tooltip-button primary" onClick={onAccept}>
          Yes, help me
        </button>
        <button className="tooltip-button secondary" onClick={onDismiss}>
          No thanks
        </button>
      </div>
    </div>
  );
};

/**
 * Voice Input Component
 * Allows users to speak their queries
 */
export const VoiceInput: React.FC<{
  onTranscript: (text: string) => void;
}> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    // In production, use Web Speech API
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported in your browser');
    }
  };

  return (
    <button
      className={`voice-button ${isListening ? 'listening' : ''}`}
      onClick={startListening}
      title="Click to speak"
    >
      {isListening ? '🎤 Listening...' : '🎤'}
    </button>
  );
};

/**
 * Contextual Help Component
 * Shows inline help for specific fields
 */
export const ContextualHelp: React.FC<{
  field: string;
  helpText: string;
  example?: string;
}> = ({ field, helpText, example }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="contextual-help">
      <button
        className="help-trigger"
        onClick={() => setShowHelp(!showHelp)}
      >
        ❓
      </button>

      {showHelp && (
        <div className="help-popup">
          <div className="help-content">
            <h5>{field}</h5>
            <p>{helpText}</p>
            {example && (
              <div className="help-example">
                <strong>Example:</strong> {example}
              </div>
            )}
          </div>
          <button
            className="close-help"
            onClick={() => setShowHelp(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
