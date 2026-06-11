import { Op } from 'sequelize';
import { Otp, User } from '../db.js';
import transporter from '../config/nodemailer.js';

/**
 * Send OTP API Controller
 * POST /api/auth/send-otp
 */
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký trên hệ thống.'
      });
    }

    // 1. Rate Limit check: max 5 OTPs per hour for each email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await Otp.count({
      where: {
        email,
        createdAt: {
          [Op.gte]: oneHourAgo
        }
      }
    });

    if (count >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Mỗi email chỉ được gửi tối đa 5 OTP trong 1 giờ. Vui lòng thử lại sau.'
      });
    }

    // 2. Generate a random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[TESTING] OTP GENERATED FOR ${email} IS: ${otp}`);

    // 3. Save OTP to DB, set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({ email, otp, expiresAt });

    // 4. Beautiful responsive HTML email template
    const mailOptions = {
      from: `"SAVE+ Security" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `🔐 [SAVE+] Mã OTP: ${otp}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 450px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e4e4e7; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="color: #0d9488; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px;">SAVE+ Xác thực email</h2>
    <p style="color: #27272a; font-size: 14px;">Chào bạn,</p>
    <p style="color: #27272a; font-size: 14px;">Dưới đây là thông tin đăng ký tài khoản của bạn:</p>
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; padding: 12px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-size: 14px; color: #52525b;"><strong>Email của bạn:</strong> ${email}</p>
    </div>
    <p style="color: #27272a; font-size: 14px;">Mã xác thực OTP:</p>
    <div style="background-color: #f0fdfa; border: 1px dashed #0d9488; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
      <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0d9488;">${otp}</span>
    </div>
    <p style="color: #ef4444; font-size: 13px; margin-top: 20px; font-weight: 500;">⏳ Lưu ý: Mã OTP này chỉ có hiệu lực trong vòng <strong>5 phút</strong>.</p>
  </div>
</body>
</html>
      `
    };

    // 5. Send email via transporter
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (mailError) {
      console.error('Error sending SMTP email:', mailError.message);
      
      const isPlaceholder = !process.env.GMAIL_USER || 
                            process.env.GMAIL_USER.includes('your_gmail') || 
                            process.env.GMAIL_USER.includes('yourgmail');

      if (isPlaceholder) {
        console.log(`\n==================================================`);
        console.log(`[DEVELOPMENT BYPASS] KHÔNG THỂ GỬI EMAIL VIA SMTP.`);
        console.log(`MÃ OTP CỦA EMAIL ${email} LÀ: ${otp}`);
        console.log(`Hãy copy mã này và dán vào form trên web để tiếp tục.`);
        console.log(`==================================================\n`);
        
        return res.status(200).json({
          success: true,
          message: 'OTP sent successfully (Bypass: OTP printed to server console)'
        });
      }
      
      throw mailError;
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi mã OTP. Vui lòng kiểm tra lại cấu hình SMTP/Gmail.'
    });
  }
};

/**
 * Verify OTP API Controller
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 1. Fetch the latest OTP record for this email
    const record = await Otp.findOne({
      where: { email },
      order: [['createdAt', 'DESC']]
    });

    // 2. Check if OTP record exists
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy OTP của email này hoặc mã không hợp lệ.'
      });
    }

    // 3. Check if OTP is expired
    if (new Date() > record.expiresAt) {
      await record.destroy(); // Clean up expired OTP
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.'
      });
    }

    // 4. Check if OTP matches
    if (record.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.'
      });
    }

    // 5. Successful verification -> delete OTP records to prevent reuse
    await Otp.destroy({
      where: { email }
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống trong quá trình xác thực OTP.'
    });
  }
};

/**
 * Check Email Duplication API Controller
 * POST /api/auth/check-email
 */
export const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp email.'
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: 'Email đã tồn tại trên hệ thống.'
      });
    }
    return res.status(200).json({
      success: true,
      exists: false,
      message: 'Email chưa được đăng ký.'
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra trùng lặp email.'
    });
  }
};
