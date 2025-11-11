// 🧮 MATH SOLVER - AI Edge Function
// Matematik problemlerini çözen AI function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MathProblemRequest {
  problem: string
  problemType?: string
  imageUrl?: string
  includeSteps?: boolean
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { problem, problemType = 'general', imageUrl, includeSteps = true }: MathProblemRequest = await req.json()
    
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

    // Check user tokens
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('tokens')
      .eq('id', user.id)
      .single()

    const requiredTokens = 2 // Math solving token cost
    if (profile?.tokens < requiredTokens) {
      throw new Error('Insufficient tokens')
    }

    // 🤖 AI Integration (OpenAI örneği)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    let prompt = `Sen bir matematik uzmanısın. Aşağıdaki problemi çöz:`
    
    if (imageUrl) {
      prompt += `\n\nGörsel: ${imageUrl}\nGörseldeki matematik problemini analiz et ve çöz.`
    } else {
      prompt += `\n\nProblem: ${problem}`
    }

    if (includeSteps) {
      prompt += `\n\nLütfen çözümü şu formatta ver:
      1. Adım adım çözüm
      2. Açıklama
      3. Son cevap
      
      Türkçe yanıt ver.`
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Sen matematik problemi çözen uzman bir asistansın. Türkçe yanıt ver.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    const aiResult = await openaiResponse.json()
    
    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResult.error?.message || 'Unknown error'}`)
    }

    const solution = aiResult.choices[0]?.message?.content

    // Parse solution into structured format
    const solutionData = {
      answer: solution,
      steps: solution.split('\n').filter(line => line.trim().length > 0),
      explanation: solution,
      problemType,
      aiModel: 'gpt-4'
    }

    // Save solution to database
    const { data: mathSolution } = await supabaseClient
      .from('math_solutions')
      .insert({
        user_id: user.id,
        problem_text: problem,
        problem_image_url: imageUrl,
        solution_text: solution,
        solution_steps: solutionData.steps,
        problem_type: problemType,
        tokens_used: requiredTokens,
        ai_model: 'gpt-4'
      })
      .select()
      .single()

    // Deduct tokens
    await supabaseClient.rpc('update_user_tokens', {
      user_id: user.id,
      amount: -requiredTokens,
      transaction_type: 'usage',
      description: 'Math problem solving',
      reference_id: mathSolution.id,
      reference_type: 'math'
    })

    // Log activity
    await supabaseClient
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'math',
        title: 'Matematik Problemi Çözüldü',
        description: problem.substring(0, 100) + (problem.length > 100 ? '...' : ''),
        metadata: { problemType, tokensUsed: requiredTokens }
      })

    return new Response(
      JSON.stringify({
        success: true,
        solution: solutionData,
        tokensUsed: requiredTokens,
        solutionId: mathSolution.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Math solver error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Math solving failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
