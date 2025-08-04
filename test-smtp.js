// ✦Bible Aura - SMTP Test Script
// Test Spaceship Business Mail SMTP configuration
// Run: node test-smtp.js

const nodemailer = require('nodemailer');

// Spaceship Business Mail SMTP Configuration
const smtpConfig = {
  host: 'mail.spacemail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'contact@bibleaura.xyz',
    pass: 'RGaPY!QtEL$jW78'
  }
};

async function testSMTP() {
  console.log('🔧 Testing Spaceship Business Mail SMTP Configuration...\n');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter(smtpConfig);
    
    // Verify connection
    console.log('📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');
    
    // Send test email
    console.log('📧 Sending test email...');
    const testEmail = {
      from: '"✦Bible Aura" <contact@bibleaura.xyz>',
      to: 'contact@bibleaura.xyz', // Send to yourself for testing
      subject: '✦Bible Aura SMTP Test - Configuration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #f85700; text-align: center;">✦Bible Aura</h2>
          <h3 style="color: #333;">SMTP Configuration Test</h3>
          <p style="color: #666; line-height: 1.6;">
            This is a test email to verify that your Spaceship Business Mail SMTP configuration is working correctly.
          </p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Configuration Details:</strong><br>
            📧 Server: mail.spacemail.com<br>
            🔐 Port: 465 (SSL)<br>
            👤 User: contact@bibleaura.xyz<br>
            ⏰ Time: ${new Date().toLocaleString()}
          </div>
          <p style="color: #666;">
            If you receive this email, your SMTP configuration is working perfectly!
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            ✦Bible Aura - AI-Powered Biblical Insights<br>
            https://bibleaura.xyz
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('📬 Check your inbox at: contact@bibleaura.xyz\n');
    
    console.log('🎉 SMTP Configuration Test Complete!');
    console.log('✅ Your Spaceship Business Mail is properly configured');
    console.log('✅ Ready for Supabase Dashboard configuration');
    
  } catch (error) {
    console.error('❌ SMTP Test Failed:');
    console.error('Error:', error.message);
    
    // Provide helpful debugging tips
    console.log('\n🔍 Troubleshooting Tips:');
    console.log('1. Verify your Spaceship Mail credentials');
    console.log('2. Check if email account has 2FA enabled');
    console.log('3. Ensure firewall allows connections to port 465');
    console.log('4. Contact Spaceship support if issues persist');
  }
}

// Check if nodemailer is installed
try {
  require.resolve('nodemailer');
  testSMTP();
} catch (e) {
  console.log('📦 Installing nodemailer...');
  console.log('Run: npm install nodemailer');
  console.log('Then run: node test-smtp.js');
} 