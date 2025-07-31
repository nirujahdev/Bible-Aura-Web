# ✦Bible Aura - Magic Link Email Delivery Fix

## 🚨 Problem Analysis

Your magic link emails aren't being sent because:
1. **No SMTP configured** - Using Supabase's unreliable default service
2. **Custom email templates not deployed** - Beautiful templates exist but aren't active
3. **No environment configuration** - Missing email delivery settings

## ✅ Complete Solution

### **Step 1: Configure SMTP in Supabase Dashboard**

#### **Go to Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard/projects
2. Select project: `foleepziqgrdgkljedux` 
3. Navigate: **Settings → Authentication**

#### **Configure SMTP Settings:**
Scroll down to **SMTP Settings** and fill in:

**For Gmail SMTP:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: [APP PASSWORD - see below]
SMTP Sender Name: ✦Bible Aura
SMTP Sender Email: your-email@gmail.com
```

**For Outlook/Hotmail:**
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: your-email@outlook.com
SMTP Pass: [APP PASSWORD]
SMTP Sender Name: ✦Bible Aura
SMTP Sender Email: your-email@outlook.com
```

**For Custom Domain (Recommended):**
```
SMTP Host: mail.yourdomain.com
SMTP Port: 587
SMTP User: noreply@bibleaura.com
SMTP Pass: [Your SMTP Password]
SMTP Sender Name: ✦Bible Aura
SMTP Sender Email: noreply@bibleaura.com
```

#### **Generate Gmail App Password:**
1. **Enable 2FA** on your Google account
2. Go to **Google Account Settings → Security**
3. Under "2-Step Verification" → **App passwords**
4. Generate password for "Mail"
5. **Use this 16-character password** (not your regular Gmail password)

### **Step 2: Upload Custom Email Templates**

#### **Magic Link Template:**
1. Go to **Authentication → Email Templates**
2. Click **"Magic Link"**
3. Replace default content with your template from `supabase/email-templates/magic-link.html`
4. Copy and paste the entire HTML content
5. **Save Template**

#### **Other Templates (Optional but Recommended):**
Upload these templates from your `supabase/email-templates/` folder:
- **Confirm signup**: `confirm-signup.html`
- **Reset password**: `reset-password.html`
- **Change email**: `change-email.html`

### **Step 3: Configure Site URL and Redirects**

In **Authentication → URL Configuration**:

**Site URL:** `http://localhost:8080` (development) or `https://yourdomain.com` (production)

**Redirect URLs (add these):**
```
http://localhost:8080/auth
http://localhost:8080/dashboard
https://yourdomain.com/auth
https://yourdomain.com/dashboard
```

### **Step 4: Test Magic Link Delivery**

#### **Testing Steps:**
1. Go to your app: http://localhost:8080/auth
2. Click "Sign in with Magic Link"
3. Enter test email
4. **Check email delivery** (including spam folder)
5. **Check Supabase Dashboard Logs**: Authentication → Logs

#### **Common Issues & Fixes:**

**1. Gmail Blocking Emails:**
- Use App Password (not regular password)
- Enable "Less secure app access" if needed
- Check Gmail's "Sent" folder

**2. Emails Going to Spam:**
- Add SPF record: `v=spf1 include:_spf.google.com ~all`
- Add DKIM authentication
- Use a dedicated sending domain

**3. SMTP Connection Failed:**
- Verify SMTP credentials
- Check firewall settings
- Try port 465 (SSL) instead of 587 (TLS)

### **Step 5: Production SMTP Recommendations**

#### **Best SMTP Services for Production:**

**1. SendGrid (Recommended)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
```

**2. Mailgun**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Mailgun username]
SMTP Pass: [Mailgun password]
```

**3. Amazon SES**
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [AWS Access Key]
SMTP Pass: [AWS Secret Key]
```

### **Step 6: Environment Configuration (Optional)**

Create `.env` file for local development:

```env
# Supabase
VITE_SUPABASE_URL=https://foleepziqgrdgkljedux.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbGVlcHppcWdyZGdrbGplZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxNTgsImV4cCI6MjA2NzY1NTE1OH0.XyTKj6ayTYWnoJRUrkKyuNlQSfE6PMGeBHDdafqMs9g

# App Configuration
VITE_APP_URL=http://localhost:8080

# Email Configuration (if using custom service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Step 7: Troubleshooting Magic Link Issues**

#### **Debug Checklist:**

**1. Check Supabase Logs:**
- Dashboard → Authentication → Logs
- Look for email sending errors

**2. Test Email Delivery:**
```javascript
// Test in browser console
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'your-test-email@gmail.com',
  options: {
    emailRedirectTo: 'http://localhost:8080/auth'
  }
});
console.log({ data, error });
```

**3. Verify SMTP Connection:**
- Use online SMTP testers
- Check with email provider support
- Test with different email addresses

**4. Common Error Messages:**

**"Email not sent"**
- SMTP credentials incorrect
- Email provider blocking

**"Invalid redirect URL"**
- Add URL to Supabase redirect list
- Check Site URL configuration

**"Email rate limited"**
- Wait and try again
- Use different email service

### **Step 8: Production Deployment**

#### **For Production Use:**

**1. Custom Domain Email:**
```
From: noreply@bibleaura.com
Reply-To: support@bibleaura.com
```

**2. Email Authentication:**
- SPF Record: `v=spf1 include:_spf.sendgrid.net ~all`
- DKIM Keys: Provided by email service
- DMARC Policy: `v=DMARC1; p=quarantine; rua=mailto:reports@bibleaura.com`

**3. Monitoring:**
- Track delivery rates
- Monitor bounce rates
- Set up email alerts

## 🎯 Quick Test After Configuration

1. **Configure SMTP** in Supabase Dashboard
2. **Upload magic-link.html** template
3. **Test magic link** in your app
4. **Check email delivery** (inbox + spam)
5. **Click magic link** to verify authentication

## 📞 Support

If magic links still don't work after following this guide:

1. **Check Supabase logs** for specific error messages
2. **Test SMTP credentials** with email client
3. **Try different email provider** (Gmail → Outlook)
4. **Contact Supabase support** with error logs

---

**✦Bible Aura** - Your magic links will work perfectly after this setup! 