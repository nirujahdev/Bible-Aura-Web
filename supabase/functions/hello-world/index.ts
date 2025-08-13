import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email } = await req.json()

    // Initialize SMTP client with your credentials
    const client = new SMTPClient({
      connection: {
        hostname: "mail.spacemail.com",
        port: 465,
        tls: true,
        auth: {
          username: "contact@bibleaura.xyz",
          password: "RGaPY!QtEL$jW78",
        },
      },
    })

    // Email content
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✨ Bible Aura</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered spiritual companion</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${name || 'Friend'}! 👋</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Welcome to Bible Aura - where faith meets technology! This is a hello message from our Supabase Edge Function.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #495057; font-style: italic;">
              "Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Our AI assistant is here to help you dive deeper into God's Word, discover meaningful insights, and strengthen your faith journey.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://biblelive.online" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Visit Bible Aura
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            May God bless your journey!<br>
            <strong>The Bible Aura Team</strong><br>
            <a href="mailto:contact@bibleaura.xyz" style="color: #667eea;">contact@bibleaura.xyz</a>
          </p>
        </div>
      </div>
    `

    // Send email
    await client.send({
      from: "contact@bibleaura.xyz",
      to: email || "contact@bibleaura.xyz",
      subject: `Hello ${name || 'Friend'} from Bible Aura! 🙏`,
      content: `Hello ${name || 'Friend'}!\n\nWelcome to Bible Aura - Your AI-powered spiritual companion.\n\nThis is a hello message from our Supabase Edge Function using your SpaceMail SMTP server.\n\nOur AI assistant is here to help you:\n- Dive deeper into God's Word\n- Discover meaningful insights\n- Strengthen your faith journey\n\nVisit us at: https://biblelive.online\n\nMay God bless your journey!\n\nBest regards,\nThe Bible Aura Team\ncontact@bibleaura.xyz`,
      html: emailHTML,
    })

    await client.close()

    console.log('Email sent successfully to:', email || 'contact@bibleaura.xyz')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Hello ${name || 'World'}! 🙏`,
        emailSent: true,
        recipient: email || 'contact@bibleaura.xyz',
        smtpServer: 'mail.spacemail.com (SSL:465)',
        fromAddress: 'contact@bibleaura.xyz',
        timestamp: new Date().toISOString(),
        note: 'Email sent via SpaceMail SMTP server'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send email',
        smtpServer: 'mail.spacemail.com (SSL:465)',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 