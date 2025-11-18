# Payment Gateway Onboarding Frontend

AI-powered interactive onboarding journey for Indian businesses applying for Payment Gateway services.

## Features

✨ **AI-Powered Assistant** - Contextual help throughout the journey
📄 **Smart Document Upload** - OCR with auto-fill capabilities
✓ **Real-time Validation** - Instant feedback on form fields
🎯 **Progress Tracking** - Visual indicators showing completion status
💾 **Save & Resume** - Continue your application anytime
📱 **Mobile-First** - Fully responsive design
🔒 **Secure** - Encrypted data transmission and storage

## Tech Stack

- **React 18.2** with TypeScript
- **Vite 5** for blazing fast builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Dropzone** for file uploads
- **Zustand** for state management

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL
# VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:3001
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Testing

```bash
# Run tests
npm test
```

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API clients
│   │   ├── client.ts          # Axios instance
│   │   └── onboarding.ts      # Onboarding API
│   ├── components/            # React components
│   │   ├── OnboardingFlow.tsx # Main flow orchestrator
│   │   ├── AIAssistant.tsx    # Chat assistant
│   │   ├── DocumentUpload.tsx # Document upload
│   │   ├── SmartForm.tsx      # Intelligent form
│   │   ├── ProgressTracker.tsx # Progress indicator
│   │   └── ReviewSubmit.tsx   # Review & submit
│   ├── hooks/                 # Custom React hooks
│   │   └── useOnboardingAgent.ts # AI agent hook
│   ├── styles/                # CSS files
│   │   ├── index.css         # Global styles + Tailwind
│   │   └── onboarding.css    # Component styles
│   ├── types/                 # TypeScript types
│   │   └── onboarding.ts     # Type definitions
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite environment types
├── public/                    # Static assets
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Key Components

### OnboardingFlow
Main orchestrator that manages the 7-step onboarding journey:
1. Welcome
2. Business Info
3. Document Upload
4. Form Completion
5. Verification
6. Review
7. Success

### AIAssistant
Floating chat interface with features:
- Conversational AI powered by Claude
- Suggested actions
- Quick shortcuts
- Voice input support
- Contextual help

### DocumentUpload
Smart document upload with:
- Drag & drop interface
- Camera capture (mobile)
- AI-powered OCR
- Confidence scoring
- Auto-fill capabilities

### SmartForm
Intelligent form with:
- Real-time validation
- Indian-specific validations (PAN, GSTIN, IFSC, etc.)
- Auto-fetch data from external APIs
- Contextual help
- Save draft functionality

## Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Environment
VITE_ENV=development
```

## API Integration

The frontend expects the following API endpoints:

```
POST   /onboarding/session           - Start new session
POST   /onboarding/send-message      - Send chat message
POST   /onboarding/upload-document   - Upload document
POST   /onboarding/validate-field    - Validate field
POST   /onboarding/enrich-data       - Enrich data from external sources
GET    /onboarding/progress/:id      - Get progress
PATCH  /onboarding/data/:id          - Update data
POST   /onboarding/submit            - Submit application
POST   /onboarding/save-draft        - Save draft
GET    /onboarding/resume/:id        - Resume draft
POST   /onboarding/verify            - Verify information
```

## Indian Payment Aggregator Compliance

### Required Documents (Proprietorship)
1. Business Registration (GST/Trade License/Shop Act)
2. Identity Proof (PAN Card - mandatory)
3. Bank Proof (Cancelled Cheque/Bank Statement)

### Validations Implemented
- **PAN**: 10-char format (ABCDE1234F)
- **GSTIN**: 15-char format (optional)
- **Mobile**: 10-digit Indian number (6-9 prefix)
- **IFSC**: 11-char bank code
- **Pincode**: 6-digit postal code
- **Email**: Valid email format

### External APIs Used
- GST verification
- PAN verification
- IFSC code lookup
- Pincode to city/state
- Bank account verification

## Styling

### Tailwind CSS
Utility-first CSS framework for rapid UI development.

### Custom CSS
Component-specific styles in `onboarding.css`:
- Gradient backgrounds
- Animations (pulse, bounce, fadeIn)
- Progress indicators
- Chat interface
- Document cards
- Form elements

### Responsive Design
- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## Performance

### Optimizations
- Code splitting with React.lazy()
- Image optimization
- Lazy loading for off-screen components
- Debounced API calls
- Cached responses

### Bundle Size
- Initial bundle: ~304 KB (gzipped: ~98 KB)
- CSS: ~35 KB (gzipped: ~7 KB)

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators
- ARIA labels

## Security

- Input sanitization
- XSS protection
- CSRF protection
- Secure file uploads
- Encrypted API communication
- No sensitive data in localStorage

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Regenerate types
npm run build
```

### Styling Issues
```bash
# Rebuild Tailwind
npm run dev
```

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@example.com

## License

Proprietary - All rights reserved

---

**Built with ❤️ for Indian businesses**
