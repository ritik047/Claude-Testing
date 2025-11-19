/**
 * Onboarding Routes
 * All routes for the merchant onboarding process
 */

import { Router } from 'express';
import multer from 'multer';
import { OnboardingController } from '../controllers/OnboardingController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
});

const controller = new OnboardingController();

// Session management
router.post('/session', controller.startSession);
router.get('/resume/:sessionId', controller.resumeSession);

// AI conversation
router.post('/send-message', controller.sendMessage);

// Document processing
router.post('/upload-document', upload.single('file'), controller.uploadDocument);

// Data management
router.patch('/data/:sessionId', controller.updateData);
router.post('/enrich-data', controller.enrichData);

// Validation
router.post('/validate-field', controller.validateField);
router.post('/verify', controller.verifyInfo);

// Progress tracking
router.get('/progress/:sessionId', controller.getProgress);

// Draft and submission
router.post('/save-draft', controller.saveDraft);
router.post('/submit', controller.submitApplication);

export { router as onboardingRouter };
