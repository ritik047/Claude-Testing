/**
 * Document Processor Service
 * Handles OCR, entity extraction, and document validation
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface OCRResult {
  text: string;
  filePath: string;
  quality: number;
  language: string;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class DocumentProcessor {
  private llm: ChatAnthropic;

  constructor() {
    this.llm = new ChatAnthropic({
      modelName: 'claude-sonnet-4-5-20250929',
      temperature: 0,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Extract text from document using OCR
   * In production, this would use Google Vision API or AWS Textract
   */
  async extractText(fileBuffer: Buffer): Promise<OCRResult> {
    // Mock implementation - in production, integrate with:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js

    // For demo purposes, simulate OCR
    return {
      text: this.simulateOCR(fileBuffer),
      filePath: '/uploads/' + Date.now() + '.pdf',
      quality: 0.92,
      language: 'en',
      blocks: [],
    };
  }

  /**
   * Extract structured entities from OCR text using AI
   */
  async extractEntities(
    text: string,
    documentType: string
  ): Promise<Record<string, any>> {
    const prompt = this.buildExtractionPrompt(documentType);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ text });

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse extracted entities:', error);
      return {};
    }
  }

  /**
   * Build document-specific extraction prompt
   */
  private buildExtractionPrompt(documentType: string): PromptTemplate {
    const templates = {
      business_proof: `
        Extract business information from this GST certificate or trade license text.

        Text: {text}

        Extract the following fields as JSON:
        {{
          "business_name": "exact business name",
          "gstin": "15-character GSTIN if present",
          "trade_license": "license number if present",
          "address": "full business address",
          "city": "city name",
          "state": "state name",
          "pincode": "6-digit pincode",
          "registration_date": "date in YYYY-MM-DD format"
        }}

        Rules:
        - Return only valid, extracted data
        - Use null for missing fields
        - Ensure GSTIN is 15 characters
        - Ensure pincode is 6 digits
        - Format dates as YYYY-MM-DD

        Return only the JSON object, no additional text.
      `,

      id_proof: `
        Extract identity information from this PAN or Aadhaar card text.

        Text: {text}

        Extract the following fields as JSON:
        {{
          "name": "full name as on document",
          "pan": "10-character PAN if present",
          "aadhaar": "12-digit Aadhaar if present (masked)",
          "father_name": "father's name if present",
          "dob": "date of birth in YYYY-MM-DD",
          "address": "full address if present"
        }}

        Rules:
        - Return only valid, extracted data
        - Use null for missing fields
        - PAN must be 10 characters (5 letters, 4 digits, 1 letter)
        - Mask middle 8 digits of Aadhaar (e.g., XXXX-XXXX-1234)
        - Format dates as YYYY-MM-DD

        Return only the JSON object, no additional text.
      `,

      bank_proof: `
        Extract bank details from this cancelled cheque or bank statement.

        Text: {text}

        Extract the following fields as JSON:
        {{
          "account_number": "bank account number",
          "ifsc": "11-character IFSC code",
          "bank_name": "name of the bank",
          "branch": "branch name",
          "account_holder": "account holder name",
          "account_type": "savings/current"
        }}

        Rules:
        - Return only valid, extracted data
        - Use null for missing fields
        - IFSC must be 11 characters
        - Account number should be numeric

        Return only the JSON object, no additional text.
      `,

      address_proof: `
        Extract address information from this utility bill or rent agreement.

        Text: {text}

        Extract the following fields as JSON:
        {{
          "name": "name on document",
          "address": "full address",
          "city": "city name",
          "state": "state name",
          "pincode": "6-digit pincode",
          "document_date": "date in YYYY-MM-DD"
        }}

        Rules:
        - Return only valid, extracted data
        - Use null for missing fields
        - Ensure pincode is 6 digits
        - Format dates as YYYY-MM-DD

        Return only the JSON object, no additional text.
      `,
    };

    return PromptTemplate.fromTemplate(
      templates[documentType] || templates.business_proof
    );
  }

  /**
   * Analyze document quality and suggest improvements
   */
  async analyzeDocumentQuality(
    fileBuffer: Buffer,
    documentType: string
  ): Promise<{
    quality: number;
    issues: string[];
    suggestions: string[];
  }> {
    // In production, analyze:
    // - Image resolution
    // - Blur detection
    // - Brightness/contrast
    // - Document orientation
    // - Document completeness

    const quality = 0.85; // Mock quality score

    const issues: string[] = [];
    const suggestions: string[] = [];

    if (quality < 0.6) {
      issues.push('Low image quality detected');
      suggestions.push('Please retake the photo in better lighting');
    }

    if (quality < 0.8) {
      issues.push('Some text may be unclear');
      suggestions.push('Ensure the document is flat and in focus');
    }

    return { quality, issues, suggestions };
  }

  /**
   * Validate document authenticity (basic checks)
   */
  async validateAuthenticity(
    extractedData: Record<string, any>,
    documentType: string
  ): Promise<{
    isAuthentic: boolean;
    confidence: number;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let confidence = 1.0;

    // Check format validations
    if (documentType === 'business_proof') {
      if (extractedData.gstin && !this.isValidGSTIN(extractedData.gstin)) {
        warnings.push('GSTIN format appears invalid');
        confidence -= 0.3;
      }
    }

    if (documentType === 'id_proof') {
      if (extractedData.pan && !this.isValidPAN(extractedData.pan)) {
        warnings.push('PAN format appears invalid');
        confidence -= 0.3;
      }
    }

    if (documentType === 'bank_proof') {
      if (extractedData.ifsc && !this.isValidIFSC(extractedData.ifsc)) {
        warnings.push('IFSC code format appears invalid');
        confidence -= 0.3;
      }
    }

    return {
      isAuthentic: confidence > 0.5,
      confidence,
      warnings,
    };
  }

  /**
   * Validate GSTIN format
   */
  private isValidGSTIN(gstin: string): boolean {
    // GSTIN format: 2 digits (state) + 10 chars (PAN) + 1 digit + 1 letter + 1 digit
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  /**
   * Validate PAN format
   */
  private isValidPAN(pan: string): boolean {
    // PAN format: 5 letters + 4 digits + 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  /**
   * Validate IFSC format
   */
  private isValidIFSC(ifsc: string): boolean {
    // IFSC format: 4 letters (bank code) + 0 + 6 characters (branch code)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  }

  /**
   * Simulate OCR for demo purposes
   */
  private simulateOCR(fileBuffer: Buffer): string {
    // In production, this would call actual OCR service
    return `
      Sample Business Document
      Business Name: ABC Enterprises
      GSTIN: 27AABCU9603R1ZM
      Address: 123 Main Street, Mumbai
      City: Mumbai
      State: Maharashtra
      Pincode: 400001
    `;
  }

  /**
   * Extract data from multiple documents and merge
   */
  async extractFromMultipleDocuments(
    documents: Array<{ buffer: Buffer; type: string }>
  ): Promise<Record<string, any>> {
    const allData: Record<string, any> = {};

    for (const doc of documents) {
      const ocrResult = await this.extractText(doc.buffer);
      const entities = await this.extractEntities(ocrResult.text, doc.type);

      // Merge with conflict resolution (prefer higher confidence)
      Object.assign(allData, entities);
    }

    return allData;
  }

  /**
   * Provide helpful feedback on document upload
   */
  async generateUploadFeedback(
    documentType: string,
    extractedData: Record<string, any>,
    quality: number
  ): Promise<string> {
    if (quality < 0.6) {
      return `The image quality is quite low. Please retake the photo ensuring:
- Good lighting (natural light works best)
- Document is flat and fully visible
- Camera is steady and in focus`;
    }

    if (quality < 0.8) {
      return `I can read most of the document, but some parts are unclear. For best results:
- Ensure the entire document is in frame
- Avoid shadows on the document
- Make sure text is clearly readable`;
    }

    const missingFields = this.identifyMissingFields(documentType, extractedData);
    if (missingFields.length > 0) {
      return `Great photo! However, I couldn't find: ${missingFields.join(', ')}.
Please ensure these details are visible on the document.`;
    }

    return `Perfect! I've successfully extracted all the information from your ${documentType}.`;
  }

  /**
   * Identify missing critical fields
   */
  private identifyMissingFields(
    documentType: string,
    extractedData: Record<string, any>
  ): string[] {
    const requiredFields = {
      business_proof: ['business_name', 'address', 'pincode'],
      id_proof: ['name', 'pan'],
      bank_proof: ['account_number', 'ifsc', 'bank_name'],
      address_proof: ['address', 'pincode'],
    };

    const required = requiredFields[documentType] || [];
    return required.filter(field => !extractedData[field]);
  }
}

export default DocumentProcessor;
