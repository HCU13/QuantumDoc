// Supabase Edge Function: RevenueCat Webhook Handler
// Bu fonksiyon RevenueCat'ten gelen webhook event'lerini işler
// Subscription (Premium) satın alma işlemlerini handle eder

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

interface RevenueCatEvent {
  event: {
    type: string
    app_user_id: string
    product_id: string
    purchased_at_ms: number
    store: string
    transaction_id: string
    price: number
    currency: string
    expiration_at_ms?: number
    period_type?: string
    entitlement_ids?: string[]
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ✅ RevenueCat Authorization header doğrulaması
  // RevenueCat Dashboard → Project Settings → Webhooks → Authorization Header Value
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Webhook body'sini parse et
    const webhookData: RevenueCatEvent = await req.json()
    const event = webhookData.event

    // Premium abonelik işlemlerini handle et
    if (event.product_id === 'premium_monthly' || event.product_id === 'premium') {
      if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
        await handlePremiumSubscription(supabaseClient, event, 'active')
      } else if (event.type === 'CANCELLATION') {
        await handlePremiumSubscription(supabaseClient, event, 'cancelled')
      } else if (event.type === 'EXPIRATION') {
        await handlePremiumSubscription(supabaseClient, event, 'expired')
      }
    }

    return new Response(
      JSON.stringify({ success: true, event: event.type }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Premium abonelik işlemlerini handle et
async function handlePremiumSubscription(supabase: any, event: any, status: 'active' | 'cancelled' | 'expired') {
  const userId = event.app_user_id
  const productId = event.product_id
  
  try {
    // Bitiş tarihini hesapla
    let expiresAt: Date | null = null
    if (event.expiration_at_ms) {
      // RevenueCat'ten gelen expiration tarihini kullan
      expiresAt = new Date(event.expiration_at_ms)
    } else if (status === 'active') {
      // Eğer expiration yoksa, şimdiden 1 ay sonra
      expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    }

    if (status === 'active') {
      // Premium aboneliği aktif et
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          subscription_type: 'premium',
          subscription_status: 'active',
          started_at: new Date(event.purchased_at_ms).toISOString(),
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          entitlement_id: event.entitlement_ids?.[0] || null,
          product_id: productId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (subscriptionError) {
        throw subscriptionError
      }

      // Abonelik artık sadece user_subscriptions'ta; profiles'dan subscription kolonları kaldırıldı

      // Purchase kaydını oluştur
      const purchaseRecord = {
        user_id: userId,
        product_id: productId,
        product_name: 'Premium Monthly Subscription',
        product_type: 'subscription',
        transaction_id: event.transaction_id,
        amount: event.price || 6.99,
        currency: event.currency || 'USD',
        payment_method: event.store === 'app_store' ? 'Apple Pay' : 'Google Pay',
        payment_provider: event.store,
        store: event.store,
        purchased_at: new Date(event.purchased_at_ms).toISOString(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        is_sandbox: false,
        metadata: {
          event_type: event.type,
          subscription_type: 'premium',
          subscription_period: 'monthly',
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        }
      }

      await supabase
        .from('purchases')
        .upsert(purchaseRecord, { onConflict: 'transaction_id' })

    } else if (status === 'cancelled') {
      // Premium aboneliği iptal edildi
      // Not: expires_at tarihini değiştirmiyoruz, kullanıcı expires_at tarihine kadar premium kalabilir
      await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      
    } else if (status === 'expired') {
      // Abonelik süresi doldu, free'e çevir
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_type: 'free',
          subscription_status: 'expired',
          expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (subscriptionError) {
        throw subscriptionError
      }

      // Abonelik artık sadece user_subscriptions'ta
    }

  } catch (error) {
    // Log error - will be caught by Supabase Edge Function logging
    throw error
  }
}
