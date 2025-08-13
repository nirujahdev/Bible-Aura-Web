# Deploy Hello-World Function - Manual Instructions

## 📧 Function Details
- **Function Name**: `hello-world`
- **SMTP Server**: `mail.spacemail.com:465 (SSL)`
- **Email**: `contact@bibleaura.xyz`
- **Project ID**: `foleepziqgrdgkljedux`

## 🚀 Option 1: Install Supabase CLI (Recommended)

### Download and Install Supabase CLI:
1. Go to: https://github.com/supabase/cli/releases
2. Download the Windows executable
3. Add to your PATH or use directly

### Or try this PowerShell command:
```powershell
# Download Supabase CLI
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/download/v1.191.3/supabase_1.191.3_windows_amd64.tar.gz" -OutFile "supabase.tar.gz"
```

## 🔧 Option 2: Deploy Using Supabase Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/foleepziqgrdgkljedux
2. **Navigate to**: Edge Functions → Create Function
3. **Function Name**: `hello-world`
4. **Copy and paste the code** from `index.ts`
5. **Deploy**

## 🚀 Option 3: CLI Commands (Once CLI is installed)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref foleepziqgrdgkljedux

# Deploy the function
supabase functions deploy hello-world --project-ref foleepziqgrdgkljedux
```

## ✅ Test Your Function

### Using curl:
```bash
curl -L -X POST 'https://foleepziqgrdgkljedux.supabase.co/functions/v1/hello-world' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"name": "Bible Aura User", "email": "test@example.com"}'
```

### Using PowerShell:
```powershell
$headers = @{
    'Authorization' = 'Bearer [YOUR_ANON_KEY]'
    'Content-Type' = 'application/json'
}

$body = @{
    name = "Bible Aura User"
    email = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'https://foleepziqgrdgkljedux.supabase.co/functions/v1/hello-world' -Method POST -Headers $headers -Body $body
```

## 🔑 Get Your Anon Key

1. Go to: https://supabase.com/dashboard/project/foleepziqgrdgkljedux/settings/api
2. Copy the **anon/public** key
3. Replace `[YOUR_ANON_KEY]` in the curl command

## 📧 What the Function Does

- Accepts `name` and `email` parameters
- Sends a welcome email using your SMTP server (`mail.spacemail.com`)
- Returns success/error status
- Uses beautiful HTML email template
- Includes Bible verse and Bible Aura branding

## 🔍 Expected Response

**Success:**
```json
{
  "success": true,
  "message": "Hello Bible Aura User! 🙏",
  "emailSent": true,
  "recipient": "test@example.com",
  "smtpServer": "mail.spacemail.com (SSL:465)",
  "fromAddress": "contact@bibleaura.xyz",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "note": "Email sent via SpaceMail SMTP server"
}
```

## 🛠️ Troubleshooting

- **"Missing Authorization header"**: Add your anon key
- **"Function not found"**: Check if deployed correctly
- **"SMTP connection failed"**: Verify SMTP credentials
- **"Invalid JSON"**: Check request body format

## 📱 Integration Example

```javascript
// Frontend integration
const sendHelloEmail = async (name, email) => {
  const response = await fetch('https://foleepziqgrdgkljedux.supabase.co/functions/v1/hello-world', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email })
  })
  
  return await response.json()
}
``` 