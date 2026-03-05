import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getSupabase(env) {
  return createClient(
    env.SUPABASE_URL || 'https://bmsvxytzueetnlhsefuv.supabase.co',
    env.SUPABASE_SERVICE_KEY || env.SUPABASE_SECRET_KEY
  );
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const icpResearchId = url.searchParams.get('icpResearchId');
  const supabase = getSupabase(env);

  if (icpResearchId) {
    const { data, error } = await supabase
      .from('angles')
      .select('*')
      .eq('icp_research_id', icpResearchId)
      .order('created_at', { ascending: false });

    return new Response(JSON.stringify(data || []), { headers: CORS_HEADERS });
  }

  const { data, error } = await supabase
    .from('angles')
    .select('*')
    .order('created_at', { ascending: false });

  return new Response(JSON.stringify(data || []), { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await request.json();
    const { icpResearchId, creatorProfileId } = body;

    if (!icpResearchId && !creatorProfileId) {
      return new Response(JSON.stringify({ error: 'ICP Research ID or Creator Profile ID required' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    let personas = [];

    if (icpResearchId) {
      const { data: result, error } = await supabase
        .from('icp_research')
        .select('*')
        .eq('id', icpResearchId)
        .single();

      if (!result) {
        return new Response(JSON.stringify({ error: 'Research not found' }), {
          status: 404,
          headers: CORS_HEADERS
        });
      }

      personas = result.personas || [];
    }

    if (creatorProfileId) {
      const { data: creator, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('id', creatorProfileId)
        .single();

      if (!creator) {
        return new Response(JSON.stringify({ error: 'Creator not found' }), {
          status: 404,
          headers: CORS_HEADERS
        });
      }

      personas = creator.personas || [];
    }

    if (personas.length === 0) {
      return new Response(JSON.stringify({ error: 'No personas found' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const perplexityKey = env.PERPLEXITY_API_KEY;

    const systemPrompt = `You are an expert Meta Ads creative strategist. Generate ad angles for each persona.

For each: hook (5-8 words), painPoint, angle (2-3 sentences), callToAction, creativeSuggestions (array of 3).

Respond ONLY with valid JSON array: [{ "personaName": "...", "hook": "...", "painPoint": "...", "angle": "...", "callToAction": "...", "creativeSuggestions": [] }]`;

    const userPrompt = `Generate angles for: ${personas.map(p => `${p.name}: ${p.description}`).join('\n')}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const angles = JSON.parse(jsonMatch[0]).map((a, i) => ({
      id: `angle-${i}`,
      personaId: `persona-${i}`,
      ...a,
    }));

    const id = generateId();

    await supabase.from('angles').insert([{
      id,
      icp_research_id: icpResearchId || null,
      creator_profile_id: creatorProfileId || null,
      angles
    }]);

    return new Response(JSON.stringify({
      id,
      icpResearchId,
      creatorProfileId,
      angles,
      createdAt: new Date().toISOString(),
    }), {
      headers: CORS_HEADERS
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
