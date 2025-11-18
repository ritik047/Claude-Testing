# AI Agent Architecture & Design

## Overview

The AI Agent is the core intelligence powering the merchant onboarding journey. It's designed to be proactive, context-aware, and helpful throughout the entire process.

## Agent Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Conversation Manager                       │  │
│  │  - Maintains context across interactions          │  │
│  │  - Tracks user behavior and journey progress      │  │
│  │  - Determines when to intervene                   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │     NLP      │ │     OCR      │ │  Validation  │
    │   Engine     │ │   Engine     │ │   Engine     │
    │              │ │              │ │              │
    │ - Intent     │ │ - Document   │ │ - Real-time  │
    │   detection  │ │   reading    │ │   checks     │
    │ - Entity     │ │ - Data       │ │ - Smart      │
    │   extraction │ │   extraction │ │   suggestions│
    │ - Sentiment  │ │ - Quality    │ │ - Error      │
    │   analysis   │ │   assessment │ │   explanations│
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                    ┌──────────────┐
                    │  Prediction  │
                    │   Engine     │
                    │              │
                    │ - Drop-off   │
                    │   risk       │
                    │ - Confusion  │
                    │   detection  │
                    │ - Next best  │
                    │   action     │
                    └──────────────┘
```

## Core Capabilities

### 1. Conversational Intelligence

#### Natural Language Understanding (NLU)
- **Intent Classification**: Understands what user wants
  - Asking a question
  - Providing information
  - Expressing confusion
  - Requesting help
  - Ready to proceed

- **Entity Extraction**: Pulls out structured data from conversation
  - Business name
  - Numbers (PAN, GST, phone)
  - Addresses
  - Dates

- **Sentiment Analysis**: Detects user emotion
  - Frustrated → Offer simplified explanation
  - Confused → Proactive help
  - Confident → Move faster

#### Example Conversation Flow

```
User: "I have a shop in Mumbai, ABC Electronics"

AI Analysis:
- Intent: Providing business information
- Entities:
  * Business Name: "ABC Electronics"
  * City: "Mumbai"
  * Business Type: Inferred "Retail - Electronics"
- Sentiment: Neutral, straightforward
- Action: Acknowledge and ask for more details

AI Response: "Great! ABC Electronics in Mumbai. I can help you get set up
to accept payments. Do you have a GST number? It'll help me auto-fill
most of your details."
```

### 2. Document Intelligence

#### OCR Pipeline

```
Document Upload
      ↓
Image Quality Check (resolution, brightness, blur)
      ↓
OCR Extraction (Google Vision API / Tesseract)
      ↓
Text Correction (AI fixes OCR errors)
      ↓
Entity Recognition (AI extracts structured data)
      ↓
Confidence Scoring (0-1 reliability score)
      ↓
Validation (format checks, cross-references)
      ↓
User Feedback + Auto-fill
```

#### AI-Powered Extraction

**Example: GST Certificate**

```python
# Extracted OCR Text
"""
GOVERNMENT OF INDIA
GOODS AND SERVICES TAX
Certificate of Registration
GSTIN: 27AABCU9603R1ZM
Legal Name: ABC ENTERPRISES PRIVATE LIMITED
Trade Name: ABC Electronics
Address: Shop No. 12, Business Park,
Andheri East, Mumbai - 400069
"""

# AI Extraction Prompt
"""
Extract business information from this GST certificate.
Return JSON with: business_name, gstin, trade_name, address, pincode
"""

# AI Response
{
  "business_name": "ABC Enterprises Private Limited",
  "gstin": "27AABCU9603R1ZM",
  "trade_name": "ABC Electronics",
  "address": "Shop No. 12, Business Park, Andheri East, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400069"
}
```

#### Quality Assessment

AI evaluates each document:
- **Image Quality**: Blur, lighting, resolution
- **Completeness**: All corners visible
- **Readability**: Text clarity
- **Authenticity Indicators**: Watermarks, logos

Provides actionable feedback:
```
Low Quality → "The image is blurry. Could you retake in better light?"
Incomplete → "I can see part of the document. Please ensure it's fully visible."
Perfect → "Perfect! I've extracted all details."
```

### 3. Intelligent Validation

#### Real-time Field Validation

The AI doesn't just check format - it understands context and helps.

**Traditional Validation**:
```
Input: "ABCDE12345"
Error: "Invalid PAN format"
```

**AI-Powered Validation**:
```
Input: "ABCDE12345"
AI: "That PAN format doesn't look quite right. PAN should be 10 characters
with pattern like ABCDE1234F (5 letters, 4 digits, 1 letter).

Did you mean: ABCDE1234F?"
```

#### Smart Error Explanations

AI provides context-aware help:

```javascript
// User enters email
email: "test@gmailcom"

// AI Analysis
- Format: Missing dot before TLD
- Intent: Likely typo
- Confidence: High that user meant gmail.com

// AI Response
"Missing '.' before com. Did you mean: test@gmail.com?"
[Auto-correct] [Manual edit]
```

#### Cross-field Validation

AI validates relationships between fields:

```
GSTIN: 27AABCU9603R1ZM
State: Delhi

AI: "There's a mismatch. GSTIN starts with '27' which is Maharashtra,
but you selected Delhi. Should I update state to Maharashtra?"
```

### 4. Proactive Intervention System

#### Drop-off Risk Detection

AI continuously calculates drop-off risk based on:

```python
drop_off_risk = calculate_risk({
  'time_on_step': 180,  # seconds
  'fields_completed': 2,
  'total_fields': 15,
  'validation_errors': 3,
  'help_requests': 0,
  'hesitation_points': ['gstin', 'bank_account'],
  'page_focus': False  # user switched tabs
})

# Result: 0.75 (High risk)
```

#### Intervention Triggers

1. **High Time on Step** (>2 minutes):
   ```
   AI: "Taking your time is fine! Need help with anything?
   [Explain this section] [Show example] [Skip for now]"
   ```

2. **Multiple Validation Errors** (>3):
   ```
   AI: "I see you're having trouble with this field. Let me help!
   [Show correct format] [Provide example] [Auto-fill if possible]"
   ```

3. **Hesitation Detected**:
   ```
   User hovers on field for 30+ seconds without typing

   AI: "Not sure what to enter here? This is your [field name].
   Example: [relevant example]
   Or I can help you find this information!"
   ```

4. **User Inactivity** (>60 seconds):
   ```
   AI: "Still here? Just checking if you need help with anything!
   Or you can save and continue later if you need to step away."
   ```

5. **Repeated Field Access** (user keeps going back to same field):
   ```
   AI: "I notice you keep coming back to [field name].
   This is a common confusion point. Let me explain:
   [Clear explanation]"
   ```

### 5. Predictive Intelligence

#### Next Best Action Prediction

AI predicts what user likely wants to do next:

```python
# Context
current_step = 'business_info'
gstin_entered = True
validation_passed = True

# AI Prediction
next_actions = predict_next_actions(context)
# Result: ["Fetch GST details", "Auto-fill form", "Proceed to documents"]

# AI Behavior
if gstin_valid:
  auto_fetch_gst_data()
  show_confirmation_with_prefilled_data()
  suggest_next_step()
```

#### Smart Suggestions

Based on user profile and behavior:

```
Business Type: Retail Electronics
AI suggests:
- Category: "Retail - Electronics"
- Average Ticket Size: "₹3,000-₹5,000"
- Monthly Volume: "₹2,00,000-₹5,00,000"

User can accept or modify
```

### 6. Context Awareness

#### Session Context

AI maintains context throughout the session:

```javascript
context = {
  session_id: "sess_123",
  user_id: "user_456",
  current_step: "document_upload",
  previous_steps: ["welcome", "business_info"],
  merchant_data: {
    business_name: "ABC Electronics",
    gstin: "27AABCU9603R1ZM",
    // ... other fields
  },
  conversation_history: [
    {role: "agent", content: "Hi! What's your business name?"},
    {role: "user", content: "ABC Electronics"},
    // ... more messages
  ],
  user_behavior: {
    time_spent: 420,  // seconds
    fields_completed: 8,
    help_requests: 2,
    drop_off_risk: 0.3,  // Low
  },
  documents_uploaded: ["gst_certificate"],
  last_active: "2024-01-15T10:30:00Z"
}
```

#### Contextual Responses

AI uses full context to provide relevant help:

```
User: "What's IFSC?"

Without Context:
AI: "IFSC is Indian Financial System Code."

With Context (knows user is on bank details step):
AI: "IFSC is your bank's code. You can find it on your cheque - it's
11 characters like 'SBIN0001234'. Look at the top of your cancelled
cheque, it should be printed there. Would you like me to show you where?"
```

### 7. Multi-turn Conversation

AI handles complex multi-turn conversations:

```
User: "I have a question about documents"
AI: "Sure! I'm here to help. What would you like to know?"

User: "Do I need GST certificate?"
AI: "GST certificate is recommended but not mandatory. If you have GST
registration, it helps me auto-fill most details. If not, no problem -
I'll just ask a few more questions. Do you have GST registration?"

User: "Yes but I don't have certificate now"
AI: "No worries! If you have your GSTIN (15-character number), I can
fetch your details from the GST portal. Or you can upload the
certificate later. What would you prefer?"

User: "I have the number"
AI: "Perfect! Just enter your GSTIN and I'll fetch everything for you."
```

### 8. Personalization

#### Adaptive Communication Style

AI adapts to user:

**Scenario 1: Tech-savvy user**
- Detects: Quick responses, no help needed, familiar with terms
- AI style: Concise, fast-paced, technical terms OK

**Scenario 2: First-time user**
- Detects: Slow responses, multiple help requests, confusion
- AI style: Detailed explanations, simple language, more examples

**Scenario 3: Business owner (busy)**
- Detects: Quick inputs, wants to finish fast
- AI style: "Let me handle this. Just confirm."

#### Language Adaptation

```
User types in Hindi: "Mera business Mumbai mein hai"

AI detects: Hindi language preference
AI switches: "बिल्कुल! मैं हिंदी में मदद कर सकता हूं। आपके बिज़नेस का नाम क्या है?"
(Sure! I can help in Hindi. What's your business name?)
```

## AI Agent Prompts

### Core System Prompt

```
You are an AI assistant helping merchants onboard to a payment gateway.

Your personality:
- Friendly and conversational, not robotic
- Patient and encouraging
- Clear and concise
- Proactive but not pushy

Your goals:
1. Help user complete onboarding in <12 minutes
2. Minimize manual data entry
3. Explain technical terms in simple language
4. Prevent drop-offs
5. Ensure high-quality submissions

Your capabilities:
- Read documents (OCR + AI)
- Auto-fill forms from extracted data
- Validate inputs in real-time
- Fetch data from government APIs (GST, PAN, etc.)
- Provide contextual help
- Detect when user is stuck

Guidelines:
- Keep responses under 2-3 sentences usually
- Use examples when explaining
- Offer specific actions, not vague help
- Celebrate progress
- Be transparent about what you're doing
- Admit when you don't know something
- Escalate to human when needed

Current context:
{context}

User message:
{user_message}

Respond naturally and helpfully.
```

### Step-specific Prompts

**Document Upload Step**:
```
You're helping the user upload documents.

Focus on:
- Explaining why each document is needed
- Providing clear examples
- Giving tips for good photo quality
- Reassuring about data security
- Offering alternatives (upload later, different document types)

If document upload fails:
- Stay positive
- Suggest specific fixes
- Offer camera option if upload doesn't work

If extraction confidence is low:
- Be honest about it
- Ask user to verify extracted data
- Suggest retaking if needed
```

**Validation Step**:
```
You're helping with form validation.

When validation fails:
1. Explain what's wrong in simple terms
2. Show correct format with example
3. Suggest fix if obvious typo detected
4. Offer to explain if user seems confused

Be constructive, never blame the user.
Examples:
✗ "You entered the wrong format"
✓ "That format doesn't look quite right. Here's an example: [example]"
```

## AI Decision Trees

### Example: Document Processing Decision Tree

```
Document Uploaded
      │
      ├─> OCR Quality < 0.6
      │   └─> Provide feedback: "Image quality is low"
      │       ├─> Suggest: "Retake in better light"
      │       └─> Option: "Try anyway" or "Retake"
      │
      ├─> OCR Quality 0.6-0.85
      │   └─> Extract data
      │       ├─> Confidence > 0.85 → Auto-fill
      │       └─> Confidence < 0.85 → Ask confirmation
      │
      └─> OCR Quality > 0.85
          └─> Extract data
              └─> Auto-fill with confirmation
```

### Example: Help Request Decision Tree

```
User asks "What's this?"
      │
      ├─> Identify field context
      │   ├─> Simple field → Direct explanation
      │   ├─> Complex field → Explanation + Example
      │   └─> Optional field → Explain + "You can skip"
      │
      ├─> Check user history
      │   ├─> Asked before → More detailed explanation
      │   └─> First time → Standard explanation
      │
      └─> Provide help
          ├─> Text explanation
          ├─> Visual example if available
          └─> Offer to auto-fill if possible
```

## Performance Optimization

### Response Time Goals
- Text response: <500ms
- Document processing: <3s
- Validation: <200ms
- API enrichment: <2s

### Caching Strategy
- Pre-compute common responses
- Cache API results (GST, PAN, IFSC)
- Store user context in Redis
- Reuse conversation embeddings

### Scalability
- Stateless agent design
- Horizontal scaling
- Async processing for documents
- Queue-based architecture for batch operations

## Error Handling

### Graceful Degradation

```
AI Service Down:
└─> Switch to rule-based system
    └─> Basic validation still works
        └─> Manual help available

OCR Fails:
└─> Manual entry with help
    └─> Explain each field
        └─> Provide examples

API Timeout:
└─> Show cached/manual option
    └─> "I couldn't fetch automatically. You can enter manually."
        └─> Retry in background
```

### User-Facing Errors

Never show technical errors. Always helpful messages:

```
✗ "Error 500: Internal server error"
✓ "Oops! Something went wrong. Let's try that again. [Retry]"

✗ "OCR extraction failed"
✓ "I'm having trouble reading this document. Could you try uploading
   again or entering the details manually?"

✗ "API timeout"
✓ "This is taking longer than expected. Want to enter manually while
   I keep trying in the background?"
```

## Metrics & Monitoring

### AI Performance Metrics

1. **Intent Classification Accuracy**: >95%
2. **Entity Extraction Accuracy**: >90%
3. **OCR Accuracy**: >95%
4. **Intervention Success Rate**: >80%
5. **User Satisfaction with AI**: >4.5/5

### Behavioral Metrics

1. **Average Response Relevance**: >4/5
2. **Help Request Resolution**: >90%
3. **Auto-fill Acceptance Rate**: >85%
4. **Validation Error Reduction**: >70%

## Future Enhancements

### Voice Interface
- Voice input for all fields
- Voice responses from AI
- Natural conversation flow

### Advanced Personalization
- Learn from user's business type
- Adapt to user's expertise level
- Remember preferences across sessions

### Predictive Approval
- AI pre-assesses approval likelihood
- Flags potential issues early
- Suggests fixes before submission

### Multi-modal Understanding
- Analyze document images visually (not just OCR)
- Detect document type from image
- Verify authenticity visually

This AI agent design ensures merchants receive intelligent, context-aware, and proactive assistance throughout their onboarding journey.
