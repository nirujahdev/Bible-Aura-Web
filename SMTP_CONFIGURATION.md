# ✦Bible Aura - SMTP Configuration with Spaceship Business Mail

## 📧 **Your SMTP Settings**

**Account Information:**
- **Email**: contact@bibleaura.xyz
- **Password**: RGaPY!QtEL$jW78  
- **Provider**: Spaceship Business Mail

**SMTP Configuration:**
- **Server**: mail.spacemail.com
- **Port**: 465
- **Security**: SSL
- **Authentication**: Required

---

## 🚀 **Step 1: Configure SMTP in Supabase Dashboard**

### **Access Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard/projects
2. Select your project: `foleepziqgrdgkljedux`
3. Navigate: **Settings → Authentication**
4. Scroll down to **SMTP Settings**

### **Fill in SMTP Configuration:**
```
SMTP Host: mail.spacemail.com
SMTP Port: 465
SMTP User: contact@bibleaura.xyz
SMTP Pass: RGaPY!QtEL$jW78
SMTP Sender Name: ✦Bible Aura
SMTP Sender Email: contact@bibleaura.xyz
```

### **Important Settings:**
- ✅ **Enable SMTP**: Check this box
- ✅ **Use SSL**: Select SSL (not TLS) since port 465
- ✅ **Sender Name**: ✦Bible Aura
- ✅ **From Address**: contact@bibleaura.xyz

---

## 🔧 **Step 2: Update Environment Configuration**

### **Production Environment (.env.production):**
```env
# SMTP Configuration for Production
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_USER=contact@bibleaura.xyz
SMTP_PASS=RGaPY!QtEL$jW78
SMTP_SENDER_NAME=✦Bible Aura
SMTP_SENDER_EMAIL=contact@bibleaura.xyz
SMTP_SECURE=true
```

### **Local Development (.env):**
```env
# SMTP Configuration for Development
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_USER=contact@bibleaura.xyz
SMTP_PASS=RGaPY!QtEL$jW78
SMTP_SENDER_NAME=✦Bible Aura (Dev)
SMTP_SENDER_EMAIL=contact@bibleaura.xyz
SMTP_SECURE=true
```

---

## 📍 **Step 3: Configure Site URLs**

### **In Supabase Dashboard → Authentication → URL Configuration:**

**Site URL (Production):**
```
https://bibleaura.xyz
```

**Redirect URLs (Add these):**
```
https://bibleaura.xyz/auth
https://bibleaura.xyz/dashboard
http://localhost:8080/auth
http://localhost:8080/dashboard
```

---

## 🎨 **Step 4: Upload Email Templates**

Your custom email templates are ready in `supabase/email-templates/`:

### **Upload to Supabase:**
1. Go to **Authentication → Email Templates**
2. For each template:
   - Click **Edit** next to template name
   - Copy HTML from your template files
   - Paste into Supabase editor
   - Click **Save**

**Templates to upload:**
- ✉️ **Magic Link**: `magic-link.html`
- ✉️ **Confirm Signup**: `confirm-signup.html`  
- ✉️ **Reset Password**: `reset-password.html`
- ✉️ **Change Email**: `change-email.html`

---

## 🧪 **Step 5: Test Email Delivery**

### **Test Magic Link Authentication:**
1. Go to: https://bibleaura.xyz/auth
2. Click "Sign in with Magic Link"
3. Enter a test email address
4. Check email delivery (including spam folder)

### **Test in Browser Console:**
```javascript
// Test magic link delivery
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'your-test-email@gmail.com',
  options: {
    emailRedirectTo: 'https://bibleaura.xyz/auth'
  }
});
console.log({ data, error });
```

---

## 🔍 **Step 6: Troubleshooting**

### **Check Supabase Logs:**
- Dashboard → Authentication → Logs
- Look for email sending errors

### **Common Issues with Spaceship Mail:**

**1. SSL Connection Issues:**
- Ensure port 465 with SSL (not TLS)
- Check firewall settings

**2. Authentication Failures:**
- Verify username: `contact@bibleaura.xyz`
- Verify password: `RGaPY!QtEL$jW78`
- Check if 2FA is enabled on email account

**3. Emails Going to Spam:**
- Add SPF record to DNS: `v=spf1 include:spacemail.com ~all`
- Configure DKIM if available
- Use consistent sender address

---

## 🌐 **Step 7: DNS Configuration (Recommended)**

### **Add these DNS records to bibleaura.xyz:**

**SPF Record (TXT):**
```
v=spf1 include:spacemail.com ~all
```

**DMARC Record (TXT) - Optional:**
```
v=DMARC1; p=quarantine; rua=mailto:contact@bibleaura.xyz
```

---

## ✅ **Step 8: Verify Configuration**

### **Checklist:**
- [ ] SMTP configured in Supabase Dashboard
- [ ] SSL enabled (port 465)
- [ ] Email templates uploaded
- [ ] Site URLs configured
- [ ] DNS records added (optional)
- [ ] Magic link tested successfully

### **Test Results Expected:**
- ✅ Magic link emails delivered within 30 seconds
- ✅ Emails appear in inbox (not spam)
- ✅ Email branding matches Bible Aura design
- ✅ Links work and redirect properly

---

## 📞 **Support Contacts**

**Spaceship Mail Support:**
- Check Spaceship hosting dashboard
- Contact their support for SMTP issues

**Supabase Support:**
- Dashboard → Help & Support
- For authentication/email template issues

---

## 🎯 **Production Monitoring**

### **Track Email Performance:**
- Monitor delivery rates in Supabase logs
- Check bounce rates regularly
- Set up alerts for failed deliveries

### **Best Practices:**
- Regular SMTP credential rotation
- Monitor spam scores
- Keep email templates updated
- Test email delivery monthly

---

**✦Bible Aura** - Professional email delivery with your own domain! 🚀 