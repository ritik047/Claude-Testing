/**
 * Document Upload Component with AI-powered validation
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadProps {
  onUpload: (file: File, documentType: string) => Promise<any>;
  onNext: () => void;
}

interface UploadedDocument {
  file: File;
  type: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  extractedData?: any;
  confidence?: number;
  feedback?: string;
  preview?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  onNext,
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [currentDocType, setCurrentDocType] = useState<string>('business_proof');

  const requiredDocuments = [
    {
      type: 'business_proof',
      label: 'Business Registration',
      description: 'GST Certificate, Trade License, or Shop Act License',
      icon: '🏢',
      examples: ['GST Certificate', 'Trade License', 'Shop & Establishment License'],
    },
    {
      type: 'id_proof',
      label: 'Identity Proof',
      description: 'PAN Card or Aadhaar Card of the business owner',
      icon: '🪪',
      examples: ['PAN Card (Preferred)', 'Aadhaar Card'],
    },
    {
      type: 'bank_proof',
      label: 'Bank Proof',
      description: 'Cancelled cheque or bank statement',
      icon: '🏦',
      examples: ['Cancelled Cheque', 'Bank Statement (last 3 months)'],
    },
  ];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create preview
      const preview = URL.createObjectURL(file);

      // Add to documents list
      const newDoc: UploadedDocument = {
        file,
        type: currentDocType,
        status: 'uploading',
        preview,
      };

      setDocuments((prev) => [...prev, newDoc]);

      // Upload and process
      try {
        // Update status to processing
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.file === file ? { ...doc, status: 'processing' } : doc
          )
        );

        const result = await onUpload(file, currentDocType);

        // Update with results
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.file === file
              ? {
                  ...doc,
                  status: 'success',
                  extractedData: result.extractedData,
                  confidence: result.confidence,
                  feedback: result.feedback,
                }
              : doc
          )
        );
      } catch (error) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.file === file
              ? {
                  ...doc,
                  status: 'error',
                  feedback: 'Upload failed. Please try again.',
                }
              : doc
          )
        );
      }
    },
    [currentDocType, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const getUploadedCount = (docType: string) => {
    return documents.filter(
      (doc) => doc.type === docType && doc.status === 'success'
    ).length;
  };

  const allDocumentsUploaded = requiredDocuments.every(
    (doc) => getUploadedCount(doc.type) > 0
  );

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h2>Upload Your Documents</h2>
        <p>
          I'll automatically extract information from your documents. Just take clear
          photos or upload PDFs.
        </p>
      </div>

      {/* Document Type Selector */}
      <div className="document-types">
        {requiredDocuments.map((docType) => {
          const uploaded = getUploadedCount(docType.type) > 0;
          const isSelected = currentDocType === docType.type;

          return (
            <div
              key={docType.type}
              className={`doc-type-card ${isSelected ? 'selected' : ''} ${
                uploaded ? 'completed' : ''
              }`}
              onClick={() => setCurrentDocType(docType.type)}
            >
              <div className="card-header">
                <span className="icon">{docType.icon}</span>
                {uploaded && <span className="check-mark">✓</span>}
              </div>
              <h3>{docType.label}</h3>
              <p className="description">{docType.description}</p>

              {!uploaded && isSelected && (
                <div className="examples">
                  <p className="examples-label">Accepted:</p>
                  {docType.examples.map((example, i) => (
                    <span key={i} className="example-tag">
                      {example}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Area */}
      <div className="upload-area">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <span className="upload-icon">📤</span>
            {isDragActive ? (
              <p className="dropzone-text">Drop your document here...</p>
            ) : (
              <>
                <p className="dropzone-text">
                  Drag and drop your{' '}
                  <strong>
                    {
                      requiredDocuments.find((d) => d.type === currentDocType)
                        ?.label
                    }
                  </strong>
                </p>
                <p className="dropzone-subtext">or click to browse</p>
              </>
            )}
            <div className="format-info">
              <span>📷 Photo</span>
              <span>📄 PDF</span>
              <span className="size-limit">Max 5MB</span>
            </div>
          </div>
        </div>

        {/* AI Tips */}
        <div className="ai-tips">
          <h4>📸 Tips for best results:</h4>
          <ul>
            <li>✓ Ensure the entire document is visible</li>
            <li>✓ Use good lighting - avoid shadows</li>
            <li>✓ Keep the document flat (no folds or wrinkles)</li>
            <li>✓ Make sure text is clear and readable</li>
          </ul>
        </div>
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="uploaded-documents">
          <h3>Uploaded Documents</h3>
          {documents.map((doc, index) => (
            <DocumentCard key={index} document={doc} />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="upload-actions">
        {allDocumentsUploaded ? (
          <button className="primary-button" onClick={onNext}>
            Continue to Form →
          </button>
        ) : (
          <p className="progress-text">
            {documents.filter((d) => d.status === 'success').length} of{' '}
            {requiredDocuments.length} documents uploaded
          </p>
        )}
        <button className="text-button">Save and continue later</button>
      </div>
    </div>
  );
};

/**
 * Individual Document Card with AI feedback
 */
const DocumentCard: React.FC<{ document: UploadedDocument }> = ({
  document,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (document.status) {
      case 'uploading':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'success':
        return '✓';
      case 'error':
        return '✗';
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'AI is reading your document...';
      case 'success':
        return 'Successfully extracted!';
      case 'error':
        return 'Upload failed';
    }
  };

  return (
    <div className={`document-card status-${document.status}`}>
      {/* Preview Thumbnail */}
      {document.preview && (
        <div className="doc-preview">
          <img src={document.preview} alt="Document preview" />
        </div>
      )}

      {/* Document Info */}
      <div className="doc-info">
        <div className="doc-header">
          <h4>{document.file.name}</h4>
          <span className={`status-badge ${document.status}`}>
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>

        {/* AI Feedback */}
        {document.feedback && (
          <div className="ai-feedback">
            <span className="ai-icon">🤖</span>
            <p>{document.feedback}</p>
          </div>
        )}

        {/* Confidence Score */}
        {document.confidence !== undefined && (
          <div className="confidence-bar">
            <div className="confidence-label">
              <span>Extraction Confidence:</span>
              <span className="confidence-value">
                {Math.round(document.confidence * 100)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${document.confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Extracted Data Preview */}
        {document.extractedData && (
          <div className="extracted-data">
            <button
              className="toggle-details"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '▼' : '▶'} View extracted data
            </button>

            {showDetails && (
              <div className="data-preview">
                {Object.entries(document.extractedData).map(([key, value]) => (
                  <div key={key} className="data-field">
                    <span className="field-label">{key}:</span>
                    <span className="field-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="doc-actions">
        {document.status === 'success' && (
          <>
            <button className="icon-button" title="Re-upload">
              🔄
            </button>
            <button className="icon-button" title="Delete">
              🗑️
            </button>
          </>
        )}
        {document.status === 'error' && (
          <button className="retry-button">Retry Upload</button>
        )}
      </div>
    </div>
  );
};

/**
 * Camera Capture Component
 * Allows direct camera capture on mobile
 */
export const CameraCapture: React.FC<{
  onCapture: (file: File) => void;
}> = ({ onCapture }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="camera-capture">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ display: 'none' }}
      />
      <button
        className="camera-button"
        onClick={() => inputRef.current?.click()}
      >
        📷 Take Photo
      </button>
    </div>
  );
};

export default DocumentUpload;
