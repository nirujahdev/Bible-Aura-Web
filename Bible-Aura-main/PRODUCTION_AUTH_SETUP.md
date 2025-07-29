<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>✦Bible Aura - Your Magic Link</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f8f9fa 0%, #fff5f0 100%);
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(248, 87, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #f85700 0%, #ff7f39 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .tagline {
            font-size: 14px;
            font-weight: 400;
            opacity: 0.9;
            letter-spacing: 1px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .magic-title {
            font-size: 28px;
            font-weight: 700;
            color: #333;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .magic-text {
            font-size: 16px;
            color: #666;
            margin-bottom: 32px;
            text-align: center;
            line-height: 1.7;
        }
        
        .magic-link-container {
            background: linear-gradient(135deg, #fff5f0 0%, #f8f9fa 100%);
            border: 2px solid #f85700;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }
        
        .magic-icon {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        
        .cta-button {
            display: block;
            width: fit-content;
            margin: 0 auto 16px;
            padding: 16px 32px;
            background: linear-gradient(135deg, #f85700 0%, #ff7f39 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(248, 87, 0, 0.3);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(248, 87, 0, 0.4);
        }
        
        .magic-note {
            font-size: 14px;
            color: #666;
            font-style: italic;
        }
        
        .security-info {
            background: #f8f9fa;
            border-left: 4px solid #f85700;
            border-radius: 8px;
            padding: 20px;
            margin: 32px 0;
        }
        
        .security-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
        }
        
        .security-list {
            list-style: none;
            padding: 0;
        }
        
        .security-item {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .security-item:before {
            content: "🔒";
            position: absolute;
            left: 0;
        }
        
        .footer {
            background: #333;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer-text {
            font-size: 14px;
            margin-bottom: 16px;
            opacity: 0.8;
        }
        
        .footer-links {
            font-size: 12px;
            opacity: 0.6;
        }
        
        .footer-links a {
            color: #f85700;
            text-decoration: none;
            margin: 0 8px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .magic-title {
                font-size: 24px;
            }
            
            .magic-icon {
                font-size: 40px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✦Bible Aura</div>
            <div class="tagline">AI-POWERED BIBLICAL INSIGHT</div>
        </div>
        
        <div class="content">
            <h1 class="magic-title">Your Secure Sign-In Link ✨</h1>
            <p class="magic-text">
                We've prepared a secure, one-time link for you to access your ✦Bible Aura account. No password needed - just click below to continue your spiritual journey.
            </p>
            
            <div class="magic-link-container">
                <span class="magic-icon">🔮</span>
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Sign In Securely ✨
                </a>
                <p class="magic-note">This magic link is personalized just for you</p>
            </div>
            
            <div class="security-info">
                <h3 class="security-title">Security Information</h3>
                <ul class="security-list">
                    <li class="security-item">This link expires in 24 hours for your security</li>
                    <li class="security-item">Can only be used once from this device</li>
                    <li class="security-item">If you didn't request this link, please ignore this email</li>
                    <li class="security-item">Your account remains secure until you click the link</li>
                </ul>
            </div>
            
            <p class="magic-text">
                Once signed in, you'll have access to all your personalized biblical insights, prayer journals, and AI-powered study tools.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                Secure access to your spiritual journey with ✦Bible Aura
            </p>
            <div class="footer-links">
                <a href="{{ .SiteURL }}">Visit Website</a> |
                <a href="{{ .SiteURL }}/privacy">Privacy Policy</a> |
                <a href="{{ .SiteURL }}/support">Support</a>
            </div>
        </div>
    </div>
</body>
</html> 