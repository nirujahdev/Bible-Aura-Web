// Contact Form API - Handle contact form submissions and send emails via Spacemail SMTP
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://www.bibleaura.xyz';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Contact] Supabase credentials not configured');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Initialize email transporter
function getEmailTransporter() {
  const smtpHost = process.env.SPACEMAIL_SMTP_HOST || 'mail.spacemail.com';
  const smtpPort = parseInt(process.env.SPACEMAIL_SMTP_PORT || '465');
  const smtpUser = process.env.SPACEMAIL_SMTP_USER;
  const smtpPassword = process.env.SPACEMAIL_SMTP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'contact@bibleaura.xyz';

  if (!smtpUser || !smtpPassword) {
    console.warn('[Contact] SMTP credentials not configured');
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    }),
    fromEmail: smtpUser,
    adminEmail,
  };
}

// Email templates
function getAdminEmailHtml(name: string, email: string, category: string, subject: string, message: string, submissionId: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #667eea; }
          .message { background: white; padding: 15px; border-left: 4px solid #667eea; margin-top: 10px; white-space: pre-wrap; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span> ${name}
            </div>
            <div class="field">
              <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
            </div>
            <div class="field">
              <span class="label">Category:</span> ${category}
            </div>
            <div class="field">
              <span class="label">Subject:</span> ${subject}
            </div>
            <div class="field">
              <span class="label">Message:</span>
              <div class="message">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
              <small>Submission ID: ${submissionId}<br>
              Submitted: ${new Date().toLocaleString()}</small>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from Bible Aura Contact Form</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getUserEmailHtml(name: string, message: string, adminEmail: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin-top: 10px; white-space: pre-wrap; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Bible Aura!</h2>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We've received your message and our team will get back to you within 24 hours.</p>
            <p><strong>Your Inquiry:</strong></p>
            <div class="message-box">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
            <p>If you have any urgent questions, feel free to email us directly at <a href="mailto:${adminEmail}">${adminEmail}</a>.</p>
            <p>Blessings,<br>The Bible Aura Team</p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const origin = req.headers.origin || req.headers.referer || '';
  const allowedOrigins = [
    DEFAULT_ALLOWED_ORIGIN,
    DEFAULT_ALLOWED_ORIGIN.replace('www.', ''),
    DEFAULT_ALLOWED_ORIGIN.replace('https://', 'https://www.'),
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const isAllowedOrigin = allowedOrigins.some(allowed => 
    origin.includes(allowed.replace('https://', '').replace('http://', '').replace('www.', ''))
  );

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    const { name, email, subject, category, message, userId } = req.body;

    // Validate input
    if (!name || !email || !subject || !category || !message) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'All fields are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
      return;
    }

    // Rate limiting: Check if user has submitted too many times in last hour
    const supabase = getSupabaseClient();
    if (supabase) {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { data: recentSubmissions } = await supabase
        .from('contact_submissions')
        .select('id')
        .eq('email', email)
        .gte('created_at', oneHourAgo);

      if (recentSubmissions && recentSubmissions.length >= 5) {
        res.status(429).json({
          error: 'Too many submissions',
          message: 'Please wait before sending another message. Maximum 5 submissions per hour.'
        });
        return;
      }
    }

    // Get IP address and user agent
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.socket.remoteAddress || 
                     'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Save to database
    let submissionId: string | null = null;
    if (supabase) {
      try {
        const { data: submission, error: dbError } = await supabase
          .from('contact_submissions')
          .insert({
            user_id: userId || null,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            category: category.trim(),
            message: message.trim(),
            ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
            user_agent: userAgent,
            status: 'pending'
          })
          .select('id')
          .single();

        if (dbError) {
          console.error('[Contact] Database error:', dbError);
          // Continue even if DB insert fails (graceful degradation)
        } else if (submission) {
          submissionId = submission.id;
          console.log('[Contact] Successfully saved to database:', submissionId);
        }
      } catch (dbError: any) {
        console.error('[Contact] Database error:', dbError.message);
        // Continue even if DB insert fails (graceful degradation)
      }
    }

    // Send emails via SMTP
    const emailConfig = getEmailTransporter();
    if (emailConfig) {
      try {
        const adminEmailHtml = getAdminEmailHtml(
          name,
          email,
          category,
          subject,
          message,
          submissionId || 'N/A'
        );

        const userEmailHtml = getUserEmailHtml(
          name,
          message,
          emailConfig.adminEmail
        );

        // Send admin notification
        await emailConfig.transporter.sendMail({
          from: `"Bible Aura" <${emailConfig.fromEmail}>`,
          to: emailConfig.adminEmail,
          subject: `[${category}] ${subject}`,
          html: adminEmailHtml,
        });

        // Send auto-reply to user
        await emailConfig.transporter.sendMail({
          from: `"Bible Aura" <${emailConfig.fromEmail}>`,
          to: email,
          subject: 'Thank you for contacting Bible Aura',
          html: userEmailHtml,
        });

        console.log('[Contact] Emails sent successfully');
      } catch (emailError: any) {
        console.error('[Contact] Email error:', emailError.message);
        // Return success even if email fails (form submission is saved)
        // But log the error for debugging
      }
    } else {
      console.warn('[Contact] Email not configured, skipping email send');
    }

    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: submissionId
    });

  } catch (error: any) {
    console.error('[Contact] Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process contact form submission'
    });
  }
}

