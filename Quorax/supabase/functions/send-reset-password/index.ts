// 🔐 SEND RESET PASSWORD - Edge Function
// Kullanıcının app dilinde şifre sıfırlama OTP maili gönderir

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") ?? "";
const SENDER_NAME = "Quorax";

const templates = {
  tr: {
    subject: "Quorax - Şifre Sıfırlama Kodunuz",
    body: (code: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#8A4FFF,#6932E0);padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Quorax</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Yapay Zeka Asistanın</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">Şifre Sıfırlama</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Quorax hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki kodu uygulamaya girin:
              </p>
              <!-- OTP Code -->
              <div style="background:#f0ebff;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
                <p style="color:#8A4FFF;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;">${code}</p>
                <p style="color:#888;font-size:13px;margin:8px 0 0;">Bu kod 15 dakika geçerlidir</p>
              </div>
              <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
                Bu isteği siz yapmadıysanız bu maili görmezden gelebilirsiniz. Hesabınız güvende.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;">© 2025 Quorax. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  en: {
    subject: "Quorax - Your Password Reset Code",
    body: (code: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#8A4FFF,#6932E0);padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Quorax</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your AI Assistant</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">Password Reset</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
                You requested a password reset for your Quorax account. Enter the code below in the app:
              </p>
              <!-- OTP Code -->
              <div style="background:#f0ebff;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
                <p style="color:#8A4FFF;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;">${code}</p>
                <p style="color:#888;font-size:13px;margin:8px 0 0;">This code is valid for 15 minutes</p>
              </div>
              <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email. Your account is secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;">© 2025 Quorax. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
};

async function sendEmail(to: string, subject: string, html: string) {
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: SMTP_USER,
        password: SMTP_PASS,
      },
    },
  });
  await client.send({
    from: `${SENDER_NAME} <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
  await client.close();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, language } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language === "tr" ? "tr" : "en";

    // Supabase admin client ile OTP gönder
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 6 haneli OTP üret
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP'yi users tablosuna kaydet (15 dk geçerli)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: upsertError } = await supabaseAdmin
      .from("password_reset_otps")
      .upsert({
        email: email.trim().toLowerCase(),
        otp,
        expires_at: expiresAt,
        used: false,
      }, { onConflict: "email" });

    if (upsertError) {
      console.error("OTP upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to generate OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mail gönder
    const template = templates[lang];
    await sendEmail(email.trim(), template.subject, template.body(otp));

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-reset-password error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
