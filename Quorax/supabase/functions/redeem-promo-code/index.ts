/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "invalid_code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Find promo code
    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single();

    if (promoError || !promo) {
      return new Response(JSON.stringify({ error: "code_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "code_expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max uses
    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
      return new Response(JSON.stringify({ error: "code_exhausted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already redeemed this code
    const { data: existing } = await supabase
      .from("user_promo_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("promo_code_id", promo.id)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ error: "already_redeemed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Kullanıcının mevcut subscription'ını oku
    const { data: currentSub } = await supabase
      .from("user_subscriptions")
      .select("subscription_type, subscription_status, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    const isCurrentlyPremium =
      currentSub?.subscription_type === "premium" &&
      currentSub?.subscription_status === "active" &&
      (currentSub?.expires_at === null || new Date(currentSub.expires_at) > now);

    // Premium aktifse mevcut bitiş tarihinin üstüne ekle, değilse bugünden başlat
    const baseDate =
      isCurrentlyPremium && currentSub?.expires_at
        ? new Date(currentSub.expires_at)
        : now;
    const premiumUntil = new Date(baseDate);
    premiumUntil.setDate(premiumUntil.getDate() + promo.duration_days);

    // Insert redemption
    const { error: redemptionError } = await supabase
      .from("user_promo_redemptions")
      .insert({
        user_id: user.id,
        promo_code_id: promo.id,
        premium_until: premiumUntil.toISOString(),
      });

    if (redemptionError) {
      return new Response(JSON.stringify({ error: "redemption_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment uses_count
    await supabase
      .from("promo_codes")
      .update({ uses_count: promo.uses_count + 1 })
      .eq("id", promo.id);

    // user_subscriptions tablosunu güncelle (tek kaynak)
    if (currentSub) {
      await supabase
        .from("user_subscriptions")
        .update({
          subscription_type: "premium",
          subscription_status: "active",
          expires_at: premiumUntil.toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          subscription_type: "premium",
          subscription_status: "active",
          expires_at: premiumUntil.toISOString(),
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        duration_days: promo.duration_days,
        premium_until: premiumUntil.toISOString(),
        extended: isCurrentlyPremium,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
