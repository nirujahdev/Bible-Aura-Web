# ✦Bible Aura - Supabase Email Templates

Beautiful, responsive email templates for Supabase authentication with ✦Bible Aura branding.

## 📧 Available Templates

1. **Confirm Signup** (`confirm-signup.html`) - Welcome new users
2. **Invite User** (`invite-user.html`) - Invite new users to the platform  
3. **Magic Link** (`magic-link.html`) - Passwordless login
4. **Change Email** (`change-email.html`) - Email address changes
5. **Reset Password** (`reset-password.html`) - Password recovery
6. **Reauthentication** (`reauthentication.html`) - Security verification

## 🎨 Design Features

- **✦Bible Aura Branding**: Consistent with your app's spiritual aesthetic
- **Responsive Design**: Mobile-optimized layouts
- **Orange Theme**: Primary color #f85700 with gradients
- **Montserrat Typography**: Professional, modern font
- **Security Focus**: Clear security notices and expiration warnings
- **Interactive Elements**: Hover effects and smooth transitions

## 🛠️ Implementation in Supabase

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Settings**
3. Scroll down to **Email Templates**
4. For each template type:
   - Click **Edit** next to the template name
   - Copy the HTML content from the corresponding file
   - Paste it into the template editor
   - Click **Save**

### Method 2: Supabase CLI

```bash
# Update email templates using Supabase CLI
supabase functions deploy --project-ref your-project-ref
```

### Method 3: API Configuration

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'your-supabase-url',
  'your-supabase-anon-key',
  {
    auth: {
      emailRedirectTo: 'https://your-domain.com/auth/callback'
    }
  }
)
```

## 🔧 Template Variables

All templates use Supabase's built-in variables:

| Variable | Description | Usage Example |
|----------|-------------|---------------|
| `{{ .ConfirmationURL }}` | Action confirmation link | All templates |
| `{{ .Token }}` | Security token | Reset, Magic Link |
| `{{ .TokenHash }}` | Hashed token | Security purposes |
| `{{ .SiteURL }}` | Your website URL | Footer links |
| `{{ .Email }}` | User's email address | All templates |
| `{{ .Data }}` | Additional data object | Custom fields |
| `{{ .RedirectTo }}` | Redirect destination | After actions |

## 📱 Responsive Features

- **Mobile-First Design**: Optimized for smartphones
- **Flexible Layouts**: Adapts to different screen sizes
- **Touch-Friendly**: Large buttons and interactive areas
- **Fast Loading**: Optimized CSS and minimal images

## 🎯 Customization

### Colors
Primary colors are defined in CSS variables:
```css
--aura-orange: #f85700;
--aura-orange-light: #ff7f39;
--aura-orange-dark: #d64900;
```

### Typography
Using Montserrat font family:
```css
font-family: 'Montserrat', Arial, sans-serif;
```

### Logos
Templates include the ✦Bible Aura logo text. To add image logos:
```html
<img src="https://your-domain.com/logo.png" alt="✦Bible Aura" />
```

## 🔐 Security Features

- **Link Expiration**: Clear expiration notices
- **Security Warnings**: Instructions for suspicious activity
- **One-Time Use**: Magic links and tokens
- **Contact Information**: Support links for help

## 📄 Template Breakdown

### Confirm Signup
- Welcomes new users
- Highlights key features
- Security notice about link expiration
- Clear call-to-action button

### Invite User
- Personal invitation message
- Shows inviter's email
- Feature overview
- Professional invitation tone

### Magic Link
- Passwordless authentication
- Security information
- One-time use notice
- Crystal ball emoji for "magic" theme

### Change Email
- Shows old and new email addresses
- Security warnings
- Data protection assurance
- Clear confirmation process

### Reset Password
- Step-by-step instructions
- Password security tips
- Reassuring tone
- Visual step indicators

### Reauthentication
- Security alert styling
- Account protection messaging
- Verification details
- Emergency contact information

## 🌟 Best Practices

1. **Test Templates**: Always test with real email addresses
2. **Mobile Testing**: Check on various mobile devices
3. **Link Validation**: Ensure all template variables work
4. **Brand Consistency**: Keep colors and messaging aligned
5. **Security Focus**: Emphasize security in all communications

## 📧 Email Deliverability

- Templates use web-safe fonts
- Inline CSS for maximum compatibility
- Tested across major email clients
- Minimal external dependencies

## 🔄 Updates and Maintenance

- Keep templates updated with brand changes
- Monitor email delivery rates
- Update security messaging as needed
- Test after Supabase updates

## 📞 Support

For questions about these templates:
- Check the Supabase documentation
- Review email template variables
- Test in development environment first
- Contact support for technical issues

---

**✦Bible Aura** - AI-Powered Biblical Insight

*These templates enhance your user authentication experience with beautiful, branded communications that reflect your spiritual platform's mission.* 