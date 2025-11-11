// 💬 CHAT AI RESPONSE - AI Edge Function
// Chat sohbetleri için AI yanıtları üreten function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  chatId: string
  message: string
  context?: string[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { chatId, message, context = [] }: ChatRequest = await req.json()
    
    // Get auth user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify chat ownership
    const { data: chat } = await supabaseClient
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single()

    if (!chat) {
      throw new Error('Chat not found or access denied')
    }

    // Check user tokens
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('tokens')
      .eq('id', user.id)
      .single()

    const requiredTokens = 1 // Chat message token cost
    if (profile?.tokens < requiredTokens) {
      throw new Error('Insufficient tokens')
    }

    // Get recent chat history for context
    const { data: recentMessages } = await supabaseClient
      .from('messages')
      .select('content, sender_type')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build conversation context
    const conversationHistory = recentMessages
      ?.reverse()
      .map(msg => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) || []

    // 🤖 AI Integration (OpenAI örneği)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = `Sen QuantumDoc uygulamasının yardımcı asistanısın. 
    
    Özellikler:
    - Türkçe konuş
    - Dostça ve yardımsever ol
    - Matematik, fen, dil öğrenimi konularında uzman
    - Kısa ve net yanıtlar ver
    - Gerektiğinde örnekler ver
    - Eğitici ve motive edici ol
    
    Kullanıcının sorularına en iyi şekilde yardım et.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    const aiResult = await openaiResponse.json()
    
    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResult.error?.message || 'Unknown error'}`)
    }

    const aiResponse = aiResult.choices[0]?.message?.content

    // Save AI message to database
    const { data: aiMessage } = await supabaseClient
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: user.id,
        content: aiResponse,
        sender_type: 'assistant',
        message_type: 'text',
        metadata: {
          aiModel: 'gpt-3.5-turbo',
          tokensUsed: aiResult.usage?.total_tokens || 0,
          processingTime: Date.now()
        }
      })
      .select()
      .single()

    // Update chat last_message_at
    await supabaseClient
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    // Deduct tokens
    await supabaseClient.rpc('update_user_tokens', {
      user_id: user.id,
      amount: -requiredTokens,
      transaction_type: 'usage',
      description: 'Chat AI response',
      reference_id: aiMessage.id,
      reference_type: 'chat'
    })

    // Log activity
    await supabaseClient
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'chat',
        title: 'AI Sohbet',
        description: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        metadata: { chatId, tokensUsed: requiredTokens }
      })

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        messageId: aiMessage.id,
        tokensUsed: requiredTokens
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Chat AI error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'AI response failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
