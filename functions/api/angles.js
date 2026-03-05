export async function onRequestPost(context) {
  const { request, env } = context;
  
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
    const { icpResearchId } = body;
    
    if (!icpResearchId) {
      return new Response(JSON.stringify({ error: 'ICP Research ID required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const db = env.DB;
    const result = await db.prepare('SELECT * FROM icp_research WHERE id = ?').bind(icpResearchId).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Research not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const personas = JSON.parse(result.personas);
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
        model: 'llama-3.1-sonar-large-128k-online',
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
    
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    await db.prepare(
      'INSERT INTO angles (id, icp_research_id, angles, created_at) VALUES (?, ?, ?, ?)'
    ).bind(id, icpResearchId, JSON.stringify(angles), new Date().toISOString()).run();
    
    return new Response(JSON.stringify({
      id,
      icpResearchId,
      angles,
      createdAt: new Date().toISOString(),
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
