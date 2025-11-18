# Detailed Merchant Onboarding Journey Flow

## Overview

This document describes the complete user journey for a proprietorship business applying to a payment gateway, with AI agent assistance at every step.

## Journey Map

```
┌─────────────┐
│   WELCOME   │  [2-3 min]
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ BUSINESS INFO   │  [2-3 min] - AI auto-fetches from registries
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│ DOCUMENT UPLOAD  │  [3-5 min] - OCR + AI extraction
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ FORM COMPLETION  │  [1-2 min] - 80% pre-filled
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  VERIFICATION    │  [Real-time] - Automated checks
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ REVIEW & SUBMIT  │  [1 min] - Final confirmation
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│    SUBMITTED     │  - Success & next steps
└──────────────────┘
```

## Detailed Step-by-Step Flow

### Phase 1: Welcome & Introduction (2-3 minutes)

#### User Experience
1. User lands on onboarding page
2. Greeted by AI assistant with friendly message
3. Shown clear timeline (10-12 minutes)
4. List of required documents displayed
5. Benefits highlighted (fast, AI-powered, 24/7 help)

#### AI Agent Behavior
- **Initial Message**: "Hi! I'm here to help you set up payment acceptance for your business. This will take about 10-12 minutes. Ready to get started?"
- **Proactive Actions**:
  - Explains the process at high level
  - Sets expectations
  - Offers to answer pre-emptive questions

#### User Actions
- Click "Get Started" button
- OR ask questions to AI agent
- OR click "Learn More" for detailed info

#### AI Assistance Features
- Answers common questions:
  - "What documents do I need?"
  - "How long does approval take?"
  - "Is this secure?"
- Provides reassurance about data security
- Explains they can save and continue later

#### Metrics Tracked
- Time spent on welcome page
- Questions asked
- Drop-off at this stage

---

### Phase 2: Business Information Collection (2-3 minutes)

#### User Experience
1. Simple conversational form appears
2. AI asks: "What's your business name?"
3. User types business name
4. AI asks: "Do you have a GST number? This helps me auto-fill details."
5. User enters GSTIN (or skips)

#### AI Agent Behavior
- **Conversational Approach**: Instead of showing full form, asks questions one-by-one
- **Smart Fetching**:
  - If GSTIN provided → fetches from GST API
  - Auto-fills: business name, address, state, registration date
  - Shows user: "Great! I found your business. Is this correct?"
- **Validation**:
  - Real-time GSTIN format validation
  - Explains errors in simple language

#### Auto-Fill Data Sources
1. **GST API**: Business name, address, registration date
2. **PAN API**: Owner name (if GST not available)
3. **Business Registry**: Company details
4. **Pincode API**: Auto-complete city/state from pincode

#### Fields Collected
- ✓ Business Name (required)
- ✓ GST Number (optional but recommended)
- ✓ PAN Number (required)
- ✓ Business Type (auto-detected from GSTIN)
- ✓ Owner Name (can be auto-filled)
- ✓ Email (required)
- ✓ Phone (required)

#### AI Assistance Features
- **Smart Validation**:
  ```
  User enters: "ABCDE12345"
  AI: "That PAN format doesn't look right. PAN should be like ABCDE1234F.
       Would you like me to explain PAN format?"
  ```
- **Contextual Help**:
  ```
  User hovers on GST field for 5+ seconds
  AI: "Having trouble finding your GST number? It's on your GST certificate.
       Or you can skip this and I'll help you without it!"
  ```
- **Error Prevention**:
  - Detects common typos
  - Suggests corrections
  - Validates in real-time

#### Proactive Interventions
1. **If user spends >90 seconds without entering data**:
   - AI: "No rush! Would you like me to explain what information I need?"

2. **If validation fails 2+ times**:
   - AI: "I can help you get this right. Let me show you an example."

3. **If user tries to skip GST**:
   - AI: "No problem! I can still help without GST. We'll just need a few more details manually."

#### Metrics Tracked
- Time to complete section
- Auto-fill success rate
- Validation errors
- Help requests
- Drop-off reasons

---

### Phase 3: Document Upload (3-5 minutes)

#### User Experience
1. AI explains: "Now, let's get your documents. I'll read them automatically!"
2. Shows 3 required document types with clear icons
3. User selects document type (e.g., "Business Registration")
4. Drag-and-drop or click to upload
5. AI processes document in real-time
6. Shows extracted data with confidence score
7. User confirms or corrects

#### Required Documents
1. **Business Proof** (one of):
   - GST Certificate (preferred)
   - Trade License
   - Shop & Establishment License

2. **Identity Proof** (one of):
   - PAN Card (preferred)
   - Aadhaar Card

3. **Bank Proof** (one of):
   - Cancelled Cheque (preferred)
   - Bank Statement (last 3 months)

#### AI Document Processing Flow

```
User uploads document
       ↓
OCR Extraction (Google Vision API / Tesseract)
       ↓
AI Entity Extraction (Claude/GPT-4)
       ↓
Quality Assessment (0-1 confidence score)
       ↓
Validation & Cross-checking
       ↓
User Feedback + Auto-fill
```

#### Real-Time Feedback Examples

**Scenario 1: Perfect Upload**
```
✓ Perfect! I've extracted all details from your GST certificate.
Confidence: 95%
Auto-filled: Business name, Address, GSTIN, Registration date
```

**Scenario 2: Low Quality**
```
⚠️ The image is a bit blurry. I can read most of it, but for best results:
- Ensure good lighting
- Keep document flat
- Make sure entire document is in frame

Would you like to retake? Or shall I work with this?
```

**Scenario 3: Partial Extraction**
```
✓ I got most details, but couldn't read:
- GSTIN (appears cut off)

Could you either:
1. Re-upload with full document visible
2. Enter GSTIN manually: [input field]
```

#### AI Assistance Features

1. **Quality Pre-check**:
   - Before processing, AI analyzes image quality
   - Warns if resolution too low
   - Suggests better lighting/angle

2. **Smart Extraction**:
   - Extracts structured data using AI
   - Cross-references with previous inputs
   - Flags inconsistencies

3. **Confidence Scoring**:
   - High (>85%): Auto-fill without confirmation
   - Medium (60-85%): Auto-fill with confirmation prompt
   - Low (<60%): Manual entry with AI suggestions

4. **Helpful Tips**:
   ```
   💡 Tip: Place your PAN card on a dark background for better contrast!
   ```

#### Proactive Interventions

1. **After failed upload**:
   ```
   AI: "That upload didn't work. Common fixes:
   • Check file size (max 5MB)
   • Ensure it's a clear photo or PDF
   • Try a different angle

   Want to try camera instead of upload?"
   ```

2. **If user sticks on upload screen >2 minutes**:
   ```
   AI: "Stuck? I can help you find these documents:
   • PAN: It's a card with 10-character number
   • GST: Look for your GST certificate (if you have GST registration)
   • Bank: A cancelled cheque from your business account

   Don't have all of them now? You can upload later!"
   ```

3. **Wrong document type detected**:
   ```
   AI: "I see this is a PAN card, but you selected 'Business Proof'.
   Should I change it to 'Identity Proof' for you?"
   ```

#### Metrics Tracked
- Upload success rate
- OCR accuracy
- Time per document
- Re-upload frequency
- Quality issues
- Auto-fill acceptance rate

---

### Phase 4: Smart Form Completion (1-2 minutes)

#### User Experience
1. AI: "Great! I've pre-filled 80% of the form from your documents. Please review and fill remaining fields."
2. Form appears with most fields already filled
3. Highlighted fields need attention (in yellow)
4. Real-time validation as user types
5. Inline help for each field

#### Pre-filled Fields (from documents)
- ✓ Business Name
- ✓ Owner Name
- ✓ PAN
- ✓ GSTIN
- ✓ Address
- ✓ City, State, Pincode
- ✓ Bank Account Number
- ✓ IFSC Code
- ✓ Bank Name

#### Fields Requiring User Input
- Business Category (dropdown with AI suggestions)
- Website (if any)
- Monthly Volume (estimate)
- Average Ticket Size

#### AI-Powered Form Features

1. **Smart Defaults**:
   ```
   AI analyzes business type and suggests:
   Category: "Retail - Electronics" (based on GST category code)

   User can accept or change
   ```

2. **Intelligent Validation**:
   ```
   User types pincode: "400"
   AI: "Pincode should be 6 digits. Did you mean 400001 (Mumbai)?"
   ```

3. **Auto-complete**:
   ```
   User types city: "Mum"
   AI suggests: Mumbai, Mumtaz Nagar, etc.
   ```

4. **Cross-field Validation**:
   ```
   IFSC: SBIN0001234
   AI auto-fills: Bank Name = State Bank of India, Branch = Main Branch

   Then validates account number format for SBI
   ```

5. **Contextual Help**:
   ```
   Field: "Average Ticket Size"
   Help icon → AI explains: "This is the typical amount per transaction.
   For example: ₹500 for coffee shop, ₹5000 for electronics store"
   ```

#### Real-time Validation Examples

**Email Validation**:
```
Input: "test@gmailcom"
AI: "Missing '.' before com. Did you mean: test@gmail.com?"
```

**Phone Validation**:
```
Input: "98765432"
AI: "Indian mobile numbers are 10 digits starting with 6-9.
Did you mean: 9876543210?"
```

**IFSC Validation**:
```
Input: "SBIN001234"
AI: "IFSC codes are 11 characters. You're missing a digit.
Check your cheque - it should be like: SBIN0001234"
```

#### Proactive Interventions

1. **If user changes auto-filled data**:
   ```
   AI: "I notice you changed the business name from the document.
   Is this correct? I want to make sure we have the right details."
   ```

2. **If validation fails multiple times**:
   ```
   AI: "Having trouble with this field? I'm here to help!
   [Show example] [Explain format] [Skip for now]"
   ```

3. **Hesitation on complex field**:
   ```
   User hovers on "Monthly Volume" for 30+ seconds
   AI: "Not sure about monthly volume? A rough estimate is fine!
   Just think: How much total payment you expect per month?
   Example: ₹1,00,000 for small shop, ₹10,00,000 for larger business"
   ```

#### Metrics Tracked
- Form completion time
- Fields manually edited
- Validation errors per field
- Help requests per field
- Auto-fill acceptance vs rejection

---

### Phase 5: Verification (Real-time)

#### User Experience
1. AI: "Almost there! Let me verify everything..."
2. Animated progress showing checks
3. Real-time status updates
4. Instant feedback on issues
5. Option to fix errors immediately

#### Automated Checks Performed

1. **Business Verification**:
   - GST status check (active/inactive)
   - PAN validation
   - Cross-check name on PAN vs documents
   - Business registry lookup

2. **Document Validation**:
   - Document authenticity checks
   - Data consistency across documents
   - Expiry date checks
   - Quality re-assessment

3. **Bank Account Verification**:
   - IFSC code validation
   - Bank account name match with business/owner
   - Penny drop verification (optional)

4. **KYC Checks**:
   - PAN-Aadhaar linking status
   - Negative list screening
   - Risk assessment
   - Compliance checks

#### AI Transparency

```
✓ Business Details Verified
  • GST status: Active
  • PAN: Valid
  • Business name matches across documents

✓ Documents Validated
  • All documents authentic
  • No expiry issues
  • Data consistent

⏳ Bank Account Verification
  • IFSC: Valid (State Bank of India)
  • Account verification in progress...

✓ KYC Verification
  • PAN verified
  • Risk score: Low
  • Compliance: Pass
```

#### Handling Issues

**Scenario 1: Minor Issue**
```
⚠️ Name Mismatch Detected
Document 1: "John Doe"
Document 2: "John D Doe"

AI: "I noticed a slight difference in names. Is this the same person?
This is common and not a problem - just confirming!"

[Yes, same person] [No, let me correct]
```

**Scenario 2: Critical Issue**
```
✗ GST Status: Inactive

AI: "Your GST registration appears inactive. This might affect approval.

What would you like to do?
1. Continue anyway (manual review required)
2. Update GST number
3. Proceed without GST

Need help? I can explain your options."
```

**Scenario 3: All Clear**
```
✓ All Checks Passed!

AI: "Excellent! Everything looks perfect. Your application is ready to submit.

Quick summary:
• Business verified ✓
• Documents validated ✓
• Bank account confirmed ✓
• KYC completed ✓

Ready to submit?"
```

#### Metrics Tracked
- Verification success rate
- Time to verify
- Issues found
- Issue resolution rate
- User actions on issues

---

### Phase 6: Review & Submit (1 minute)

#### User Experience
1. Complete summary of all information
2. Editable sections (click to edit)
3. Terms & conditions
4. AI's final review
5. Submit button
6. Estimated approval timeline

#### Review Screen Layout

```
┌────────────────────────────────────┐
│  Review Your Application           │
├────────────────────────────────────┤
│                                    │
│  Business Information      [Edit]  │
│  ├ ABC Enterprises                │
│  ├ GSTIN: 27AABCU9603R1ZM         │
│  └ Category: Retail               │
│                                    │
│  Owner Details            [Edit]  │
│  ├ John Doe                       │
│  ├ PAN: ABCDE1234F                │
│  └ john@example.com               │
│                                    │
│  Bank Details             [Edit]  │
│  ├ State Bank of India            │
│  ├ A/c: ****1234                  │
│  └ IFSC: SBIN0001234              │
│                                    │
│  Documents                [View]  │
│  ├ ✓ Business Proof               │
│  ├ ✓ Identity Proof               │
│  └ ✓ Bank Proof                   │
│                                    │
├────────────────────────────────────┤
│  [✓] I agree to terms & conditions│
│                                    │
│  [Submit Application] →            │
└────────────────────────────────────┘
```

#### AI Final Check

```
AI: "I've reviewed your application. Everything looks great! ✓

Before you submit:
• All required information is complete
• Documents are verified
• Estimated approval time: 2-4 hours
• You'll get updates via SMS and email

Have any last-minute questions?"
```

#### Proactive Interventions

1. **If user hesitates to submit**:
   ```
   AI: "Having second thoughts? Common concerns:

   Q: Is this secure?
   A: Yes! Bank-grade encryption, compliant with RBI norms.

   Q: Can I edit later?
   A: Some details can be updated after submission.

   Q: When will I get approved?
   A: Usually 2-4 hours during business hours.

   Ready to proceed?"
   ```

2. **Terms not accepted**:
   ```
   AI: "I can explain the terms in simple language:
   • We'll use your data only for onboarding
   • Standard payment gateway agreement
   • Your business details remain confidential

   Want me to highlight key points?"
   ```

#### Post-Submission

```
🎉 Application Submitted Successfully!

Application ID: #MER123456
Submitted: [timestamp]

What happens next:
1. Review (2-4 hours) - Our team reviews
2. Approval (same day) - You'll get email & SMS
3. Integration (30 min) - Start accepting payments!

Track status: [Dashboard link]

AI: "Congratulations! 🎉 While you wait, I can help you:
• Prepare for integration
• Understand fee structure
• Set up your first product

What would you like to know?"
```

#### Metrics Tracked
- Time on review screen
- Edits made
- Submission success rate
- Post-submission engagement

---

### Phase 7: Post-Submission Engagement (Ongoing)

#### AI's Continued Assistance

1. **Proactive Status Updates**:
   ```
   [2 hours later]
   AI: "Good news! Your application is under review.
   Our team is looking at it now. ETA: 1-2 hours."
   ```

2. **Answering Queries**:
   ```
   User: "How do I integrate?"
   AI: "Great question! Once approved, integration takes 3 steps:
   1. Get API keys from dashboard
   2. Install our SDK (I'll guide you)
   3. Test with sample transactions

   I'll walk you through each step when you're ready!"
   ```

3. **Handling Additional Requirements**:
   ```
   AI: "Quick update: We need one more document -
   Recent bank statement (last 3 months).

   This is routine for compliance. I can help you upload it now.

   [Upload Document]"
   ```

4. **Celebrating Approval**:
   ```
   🎊 Approved! Your merchant account is active!

   AI: "Fantastic news! You're all set to accept payments.

   Your merchant ID: MER123456
   Next step: Let's integrate! It takes just 30 minutes.

   Ready to start?"
   ```

---

## Drop-off Prevention Strategies

### Critical Drop-off Points & Solutions

#### Point 1: Document Upload (Highest Drop-off)

**Prevention**:
- Clear examples of each document
- Allow "upload later" option
- Mobile camera support
- WhatsApp upload option
- AI guidance on finding documents

#### Point 2: Form Complexity

**Prevention**:
- Auto-fill 80% from documents
- Progressive disclosure (show only needed fields)
- Real-time help
- Save-and-continue option

#### Point 3: Verification Delays

**Prevention**:
- Real-time checks (not batch)
- Transparent progress
- Immediate issue resolution
- No waiting periods

#### Point 4: Confusion/Uncertainty

**Prevention**:
- Proactive AI interventions
- 24/7 chat support
- Clear explanations
- Examples for every field

---

## Success Metrics

### Journey Performance KPIs

1. **Completion Rate**: Target 85% (vs 30% traditional)
2. **Time to Complete**: Target <12 min (vs 30-45 min)
3. **Auto-fill Rate**: Target 80% fields
4. **AI Intervention Success**: Target 80% resolved
5. **User Satisfaction**: Target 4.5+/5
6. **Approval Rate**: Target 90%+ (better quality)

### Real-time Monitoring

- Drop-off rate per step
- AI helpfulness score
- Document upload success rate
- Validation error rate
- Time spent per step
- Help request frequency

---

## Multi-Language Support (Future)

Journey will be available in:
- English (default)
- Hindi
- Tamil
- Telugu
- Bengali
- Marathi
- Gujarati

AI will detect user's preferred language and adapt accordingly.

---

## Accessibility Features

1. **Screen reader support**
2. **Keyboard navigation**
3. **High contrast mode**
4. **Text size adjustment**
5. **Voice input for all fields**
6. **Simple language mode** (no jargon)

---

This journey ensures merchants can complete onboarding with minimal friction, maximum guidance, and a delightful experience powered by AI.
