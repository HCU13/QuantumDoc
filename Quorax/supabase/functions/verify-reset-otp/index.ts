// 🔐 VERIFY RESET OTP - Edge Function
// OTP'yi doğrular ve geçerliyse şifre sıfırlama token'ı döner

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, otp, new_password, verify_only } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!verify_only && !new_password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // OTP'yi kontrol et
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("password_reset_otps")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .eq("otp", otp.trim())
      .eq("used", false)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(JSON.stringify({ error: "invalid_otp" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Süre kontrolü
    if (new Date(otpRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "expired_otp" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sadece doğrulama modunda — şifre değiştirmeden dön
    if (verify_only) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Kullanıcıyı bul
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return new Response(JSON.stringify({ error: "user_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Şifreyi güncelle
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: new_password },
    );

    if (updateError) throw updateError;

    // OTP'yi kullanıldı olarak işaretle
    await supabaseAdmin
      .from("password_reset_otps")
      .update({ used: true })
      .eq("email", email.trim().toLowerCase());

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-reset-otp error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
