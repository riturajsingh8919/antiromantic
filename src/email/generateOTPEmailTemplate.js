export function generateOTPEmailTemplate(otp) {
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code - antiromantic</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .email-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
        }
        
        .header-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header-bg::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .logo {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
        }
        
        .header-subtitle {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .container {
            padding: 50px 40px;
            background: #ffffff;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .main-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 35px;
            line-height: 1.7;
        }
        
        .otp-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .otp-label {
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .otp-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 25px 40px;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            border-radius: 15px;
            display: inline-block;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .otp-code::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .otp-code:hover::before {
            left: 100%;
        }
        
        .security-notice {
            background: linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 30px 0;
            border-left: 4px solid #e53e3e;
        }
        
        .security-notice-title {
            font-size: 16px;
            font-weight: 600;
            color: #742a2a;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        
        .security-notice-title::before {
            content: '🔒';
            margin-right: 8px;
        }
        
        .security-notice-text {
            font-size: 14px;
            color: #9b2c2c;
            line-height: 1.6;
        }
        
        .help-section {
            background: #f7fafc;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
        }
        
        .help-text {
            font-size: 14px;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        
        .support-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }
        
        .support-link:hover {
            color: #764ba2;
        }
        
        .footer {
            background: #1a202c;
            color: #a0aec0;
            padding: 30px 40px;
            text-align: center;
        }
        
        .footer-logo {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 15px;
        }
        
        .footer-text {
            font-size: 13px;
            line-height: 1.8;
            margin-bottom: 10px;
            color: #ffffff;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            margin: 0 15px;
            transition: color 0.3s ease;
        }
        
        .footer-link:hover {
            color: #9f7aea;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 20px 0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .container {
                padding: 30px 25px;
            }
            
            .header-bg {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .otp-code {
                font-size: 28px;
                padding: 20px 30px;
                letter-spacing: 6px;
            }
            
            .footer {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header-bg">
            <div class="logo">antiromantic</div>
            <div class="header-subtitle">Secure Authentication</div>
        </div>
        
        <div class="container">
            <div class="greeting">Hello there! 👋</div>
            
            <div class="main-text">
                We received a request to verify your identity. Please use the verification code below to complete your authentication process.
            </div>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="security-notice">
                <div class="security-notice-title">Security Notice</div>
                <div class="security-notice-text">
                    This code is valid for <strong>10 minutes</strong> only. Never share this code with anyone, including our support team. We will never ask for your verification code.
                </div>
            </div>
            
            <div class="help-section">
                <div class="help-text">
                    <strong>Didn't request this?</strong> If you didn't request this verification code, please ignore this email. Your account remains secure.
                </div>
                <div class="help-text">
                    Need assistance? Our support team is here to help: <a href="mailto:support@shopantiromantic.com" class="support-link">support@shopantiromantic.com</a>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-logo">antiromantic</div>
            <div class="footer-text">© ${new Date().getFullYear()} antiromantic. All rights reserved.</div>
            <div class="divider"></div>
            <div class="footer-text">
                This email was sent to verify your identity. If you have any questions, please don't hesitate to contact us.
            </div>
            <div class="footer-links">
                <a href="mailto:support@shopantiromantic.com" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  return html;
}
