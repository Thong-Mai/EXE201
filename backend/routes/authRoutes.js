import express from 'express';
import { sendOtp, verifyOtp, checkEmail } from '../controllers/authController.js';
import { validateSendOtp, validateVerifyOtp } from '../middlewares/validate.js';

const router = express.Router();

// Route to request an Email OTP
router.post('/api/auth/send-otp', validateSendOtp, sendOtp);

// Route to verify an Email OTP
router.post('/api/auth/verify-otp', validateVerifyOtp, verifyOtp);

// Route to check email duplication
router.post('/api/auth/check-email', checkEmail);

export default router;
