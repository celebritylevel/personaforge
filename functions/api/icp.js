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

export async function onRequestPost(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  try {
    const body = await request.json();
    const { productDescription, website } = body;

    if (!productDescription && !website) {
      return new Response(JSON.stringify({ error: 'Provide product description or website' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const perplexityKey = env.PERPLEXITY_API_KEY;

    if (!perplexityKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    const isOnlyFans = website && website.toLowerCase().includes('onlyfans');
    const isFanvue = website && website.toLowerCase().includes('fanvue');
    const platform = isOnlyFans ? 'OnlyFans' : isFanvue ? 'Fanvue' : '';

    let contextPrompt = '';

    if (platform && website) {
      contextPrompt = `The product is a subscription to a ${platform} creator at ${website}. Research this creator's content niche, style, and audience. Create 10 distinct personas who would subscribe.`;
    } else if (website && !productDescription) {
      contextPrompt = `Analyze the website: ${website}. Create 10 distinct personas who would be interested in this product.`;
    } else if (productDescription) {
      contextPrompt = `The product/service is: ${productDescription}. Create 10 distinct personas who would buy this.`;
    }

    const systemPrompt = `You are a marketing strategist. Respond ONLY with valid JSON (no markdown, no formatting).

Return this exact JSON structure:
{"product":"brief description","personas":[{"name":"The [Archetype]","description":"2 sentences","painPoints":["point1","point2"],"buyingReasons":["reason1","reason2"],"demographics":{"ageRange":"25-34","gender":"All","location":"US","income":"$50k-80k","occupation":"Professional"},"psychographics":["trait1","trait2"],"angleHook":"Compelling hook"}]}

IMPORTANT: Return ONLY valid JSON. No markdown. No extra text.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextPrompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `API error: ${response.status} - ${errorText}` }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(JSON.stringify({ error: 'Invalid API response' }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    let content = data.choices[0].message.content;

    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const jsonMatch = content.match(/\{[\s\S]*"personas"[\s\S]*\}/);

    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Could not find personas in response', raw: content.substring(0, 500) }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to parse JSON', raw: content.substring(0, 500) }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    if (!result.personas || !Array.isArray(result.personas)) {
      return new Response(JSON.stringify({ error: 'No personas found' }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    const personas = result.personas.map((p, i) => ({
      id: `persona-${i}`,
      name: p.name || `Persona ${i + 1}`,
      description: p.description || '',
      painPoints: p.painPoints || [],
      buyingReasons: p.buyingReasons || [],
      demographics: p.demographics || {},
      psychographics: p.psychographics || [],
      angleHook: p.angleHook || ''
    }));

    const id = generateId();

    const { error: insertError } = await supabase.from('icp_research').insert([{
      id,
      product_description: productDescription || result.product || '',
      website: website || '',
      personas
    }]);

    if (insertError) {
      console.error('Database error:', insertError);
    }

    return new Response(JSON.stringify({
      id,
      productDescription: productDescription || result.product || '',
      website: website || '',
      personas,
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

export async function onRequestGet(context) {
  const { env } = context;
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from('icp_research')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  return new Response(JSON.stringify(data), {
    headers: CORS_HEADERS
  });
}
