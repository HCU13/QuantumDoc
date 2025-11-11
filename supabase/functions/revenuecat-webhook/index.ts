// Supabase Edge Function: RevenueCat Webhook Handler
// Bu fonksiyon RevenueCat'ten gelen webhook event'lerini işler
// Aylık yenilenme, iptal, restore gibi durumları handle eder

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

interface RevenueCatEvent {
  event: {
    type: string // "INITIAL_PURCHASE", "RENEWAL", "CANCELLATION", "BILLING_ISSUE", etc.
    app_user_id: string
    product_id: string
    purchased_at_ms: number
    expiration_at_ms: number
    store: string
    transaction_id: string
    original_transaction_id: string
    price: number
    currency: string
    is_trial_period: boolean
  }
}

// Subscription planına göre aylık token miktarı
const getMonthlyTokens = (productId: string): number => {
  const tokenMap: Record<string, number> = {
    'premium_monthly': 500,
    'premium_student': 300,
    'premium_pro': 1000,
  }
  return tokenMap[productId] || 0
}

// Product ID'den plan adını belirle
const getPlanNameFromProductId = (productId: string): string => {
  if (productId?.includes('pro')) return 'pro'
  if (productId?.includes('basic') || productId?.includes('student')) return 'basic'
  if (productId?.includes('monthly') || productId?.includes('premium')) return 'plus'
  return 'premium'
}

// Product ID'den product name'i belirle
const getProductNameFromProductId = (productId: string): string => {
  const planName = getPlanNameFromProductId(productId)
  if (planName === 'pro') return 'Pro Plan'
  if (planName === 'basic') return 'Basic Plan'
  if (planName === 'plus') return 'Plus Plan'
  return 'Premium Subscription'
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // RevenueCat webhook'ları için auth gerekli değil
    // Authorization header kontrolünü kaldırdık
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Webhook body'sini parse et
    const webhookData: RevenueCatEvent = await req.json()
    const event = webhookData.event

    console.log(`[Webhook] ${event.type} - User: ${event.app_user_id}`)

    // Event type'a göre işlem yap
    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await logPurchaseEvent(supabaseClient, event)
        break

      case 'RENEWAL':
        await handleRenewal(supabaseClient, event)
        break

      case 'CANCELLATION':
        await handleCancellation(supabaseClient, event)
        break

      case 'BILLING_ISSUE':
        await handleBillingIssue(supabaseClient, event)
        break

      case 'PRODUCT_CHANGE':
        await handleProductChange(supabaseClient, event)
        break

      case 'EXPIRATION':
        await handleExpiration(supabaseClient, event)
        break

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ success: true, event: event.type }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('[Webhook] Webhook hatası:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Yenileme (Renewal) işlemi
async function handleRenewal(supabase: any, event: any) {
  const userId = event.app_user_id
  const productId = event.product_id
  const monthlyTokens = getMonthlyTokens(productId)

  if (monthlyTokens === 0) {
    // Removed verbose log Bu plan için token kredisi tanımlı değil')
    return
  }

  try {
    // 1. Purchases tablosuna RENEWAL kaydı ekle
    const planName = getPlanNameFromProductId(productId)
    const productName = getProductNameFromProductId(productId)
    
    const purchaseRecord = {
      user_id: userId,
      product_id: productId,
      product_name: productName, // Dinamik product adı
      product_type: 'subscription',
      transaction_id: event.transaction_id,
      amount: 9.99,
      currency: event.currency || 'USD',
      payment_method: event.store === 'app_store' ? 'Apple Pay' : 'Google Pay',
      payment_provider: event.store,
      store: event.store,
      purchased_at: new Date(event.purchased_at_ms).toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      is_sandbox: event.environment === 'SANDBOX',
      expires_at: new Date(event.expiration_at_ms).toISOString(),
      will_renew: true,
      metadata: {
        event_type: 'RENEWAL',
        renewal_number: event.renewal_number || 1,
        period_type: event.period_type,
        plan_name: planName, // Plan adını metadata'ya ekle
      }
    }

    await supabase
      .from('purchases')
      .upsert(purchaseRecord, { onConflict: 'transaction_id' })

    // Removed verbose log Renewal purchase kaydı oluşturuldu')

    // 2. User'ın mevcut token sayısını al
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const currentTokens = profile?.tokens || 0
    const newTokens = currentTokens + monthlyTokens

    // 3. Token'ları ve subscription_type'ı güncelle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tokens: newTokens,
        subscription_type: planName, // Plan adını kaydet
        subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // 4. Token transaction kaydı
    const { error: txError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: monthlyTokens,
        transaction_type: 'subscription_renewal',
        description: `Aylık abonelik yenileme kredisi: ${monthlyTokens} token`,
        reference_id: event.transaction_id,
        reference_type: 'subscription',
        metadata: {
          product_id: productId,
          renewal_date: new Date(event.purchased_at_ms).toISOString()
        }
      })

    if (txError) {
      console.warn('⚠️ Transaction kaydı oluşturulamadı:', txError)
    }

    // Removed verbose log ${monthlyTokens} token eklendi. Yeni bakiye: ${newTokens}`)
  } catch (error) {
    console.error('[Webhook] Renewal işleme hatası:', error)
    throw error
  }
}

// İptal (Cancellation) işlemi
async function handleCancellation(supabase: any, event: any) {
  const userId = event.app_user_id

  try {
    const planName = getPlanNameFromProductId(event.product_id)
    
    // Purchases tablosuna cancellation bilgisi güncelle
    await supabase
      .from('purchases')
      .update({
        will_renew: false,
        cancelled_at: new Date().toISOString(),
        metadata: {
          event_type: 'CANCELLATION',
          cancellation_reason: event.cancellation_reason || 'user_cancelled',
          plan_name: planName,
        }
      })
      .eq('user_id', userId)
      .eq('product_id', event.product_id)
      .order('purchased_at', { ascending: false })
      .limit(1)

    // Removed verbose log Purchase cancellation kaydedildi')

    // Subscription'ı iptal et ama mevcut süre sonuna kadar aktif kalacak
    const { error } = await supabase
      .from('profiles')
      .update({
        // subscription_type hemen değiştirme, expiration'da değişecek
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error

    // Removed verbose log Cancellation kaydedildi')
  } catch (error) {
    console.error('[Webhook] Cancellation işleme hatası:', error)
  }
}

// Ödeme sorunu (Billing Issue)
async function handleBillingIssue(supabase: any, event: any) {
  const userId = event.app_user_id
  const planName = getPlanNameFromProductId(event.product_id)

  try {
    // Purchases tablosuna billing issue bilgisi güncelle
    await supabase
      .from('purchases')
      .update({
        billing_issues_detected_at: new Date().toISOString(),
        status: 'billing_issue',
        metadata: {
          event_type: 'BILLING_ISSUE',
          grace_period_expires_at: event.grace_period_expires_date,
          plan_name: planName,
        }
      })
      .eq('user_id', userId)
      .eq('product_id', event.product_id)
      .order('purchased_at', { ascending: false })
      .limit(1)

    // Removed verbose log Billing issue purchase kaydına eklendi')
    // Removed verbose log User ${userId} için ödeme sorunu var`)
    
    // TODO: Push notification veya email gönder
  } catch (error) {
    console.error('[Webhook] Billing issue işleme hatası:', error)
  }
}

// Plan değişikliği (Product Change)
async function handleProductChange(supabase: any, event: any) {
  const userId = event.app_user_id
  const newProductId = event.product_id

  try {
    // Yeni plana göre subscription'ı güncelle
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error

    // Removed verbose log Plan değişti: ${newProductId}`)
  } catch (error) {
    console.error('[Webhook] Product change işleme hatası:', error)
  }
}

// Süre dolması (Expiration)
async function handleExpiration(supabase: any, event: any) {
  const userId = event.app_user_id

  try {
    // Purchases tablosuna expiration bilgisi güncelle
    await supabase
      .from('purchases')
      .update({
        status: 'expired',
        will_renew: false,
        metadata: {
          event_type: 'EXPIRATION',
          expiration_reason: event.expiration_reason || 'subscription_expired',
        }
      })
      .eq('user_id', userId)
      .eq('product_id', event.product_id)
      .order('purchased_at', { ascending: false })
      .limit(1)

    // Removed verbose log Purchase expiration kaydedildi')

    // Subscription'ı free'ye çevir
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_type: 'free',
        subscription_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error

    // Removed verbose log Subscription expired, user free\'ye çevrildi')
  } catch (error) {
    console.error('[Webhook] Expiration işleme hatası:', error)
  }
}

// İlk satın alma logu - app'te de kaydediliyor ama webhook'ten de kayıt düşelim
async function logPurchaseEvent(supabase: any, event: any) {
  const userId = event.app_user_id
  const productId = event.product_id
  
  try {
    // purchases tablosuna INITIAL_PURCHASE kaydı ekle
    const planName = getPlanNameFromProductId(productId)
    const productName = getProductNameFromProductId(productId)
    
    const purchaseRecord = {
      user_id: userId,
      product_id: productId,
      product_name: productName, // Dinamik product adı
      product_type: 'subscription',
      transaction_id: event.transaction_id,
      amount: event.price || 9.99,
      currency: event.currency || 'USD',
      payment_method: event.store === 'app_store' ? 'Apple Pay' : 'Google Pay',
      payment_provider: event.store,
      store: event.store,
      purchased_at: new Date(event.purchased_at_ms).toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      is_sandbox: event.environment === 'SANDBOX',
      expires_at: new Date(event.expiration_at_ms).toISOString(),
      will_renew: !event.is_trial_period, // Trial değilse renew edilir
      metadata: {
        event_type: 'INITIAL_PURCHASE',
        period_type: event.period_type,
        is_trial: event.is_trial_period,
        original_transaction_id: event.original_transaction_id,
        plan_name: planName, // Plan adını metadata'ya ekle
      }
    }

    // Upsert kullan - app'ten de gelmiş olabilir
    await supabase
      .from('purchases')
      .upsert(purchaseRecord, { onConflict: 'transaction_id' })

    // Removed verbose log Initial purchase webhook kaydı oluşturuldu')
    
    // User'ı premium yap ve ilk token kredisini ekle
    const monthlyTokens = getMonthlyTokens(productId)
    
    if (monthlyTokens > 0) {
      // Mevcut token'ları al
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens, subscription_type')
        .eq('id', userId)
        .single()

      // Eğer zaten premium değilse güncelle
      if (profile?.subscription_type !== planName) {
        const currentTokens = profile?.tokens || 0
        const newTokens = currentTokens + monthlyTokens

        await supabase
          .from('profiles')
          .update({ 
            tokens: newTokens,
            subscription_type: planName, // Plan adını kaydet
            subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
          })
          .eq('id', userId)

        // Token transaction kaydı
        await supabase
          .from('token_transactions')
          .insert({
            user_id: userId,
            amount: monthlyTokens,
            transaction_type: 'subscription_purchase',
            description: `İlk abonelik token kredisi: ${monthlyTokens} token`,
            reference_id: event.transaction_id,
            reference_type: 'subscription',
            metadata: {
              product_id: productId,
              purchase_date: new Date(event.purchased_at_ms).toISOString()
            }
          })

        // Removed verbose log Webhook: İlk ${monthlyTokens} token kredisi eklendi`)
      } else {
        // Removed verbose log User zaten premium, token app tarafından eklendi')
      }
    }
  } catch (error) {
    console.error('[Webhook] Purchase log hatası:', error)
  }
}

