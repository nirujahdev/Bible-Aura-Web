# ✦Bible Aura Email Templates - Quick Reference

## Template Files

| Template | File | Purpose | Key Features |
|----------|------|---------|--------------|
| **Confirm Signup** | `confirm-signup.html` | New user account confirmation | Welcome message, feature highlights, 24h expiration |
| **Invite User** | `invite-user.html` | User invitation | Personal invitation, inviter email display, feature overview |
| **Magic Link** | `magic-link.html` | Passwordless authentication | Secure one-time link, magic theme, security details |
| **Change Email** | `change-email.html` | Email address updates | Old/new email display, security warnings, data protection |
| **Reset Password** | `reset-password.html` | Password recovery | Step-by-step guide, security tips, reassuring tone |
| **Reauthentication** | `reauthentication.html` | Security verification | Alert styling, account protection, emergency contact |

## Supabase Template Mapping

Map these files to Supabase's email template types:

- `confirm-signup.html` → **Confirm signup**
- `invite-user.html` → **Invite user**  
- `magic-link.html` → **Magic Link**
- `change-email.html` → **Change Email Address**
- `reset-password.html` → **Reset Password**
- `reauthentication.html` → **Reauthentication**

## Common Elements

All templates include:
- ✦Bible Aura branding with orange theme (#f85700)
- Montserrat typography
- Responsive mobile design
- Security notices and expiration warnings
- Footer with website links
- Spiritual messaging and tone

## Template Variables Used

- `{{ .ConfirmationURL }}` - Main action link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Website URL for footer links
- `{{ .Token }}` - Security token (where applicable)
- `{{ .Data }}` - Additional data (e.g., new email address)

## Installation Steps

1. Copy HTML content from each file
2. Go to Supabase Dashboard → Authentication → Settings
3. Paste into corresponding email template
4. Save and test each template
5. Verify mobile responsiveness 