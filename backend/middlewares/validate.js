/**
 * Validation middleware for Email OTP Authentication APIs
 */

export const validateSendOtp = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Standard email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address'
    });
  }

  next();
};

export const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address'
    });
  }

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: 'OTP code is required'
    });
  }

  // Verify OTP is a 6-digit numeric string
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be a 6-digit code'
    });
  }

  next();
};
