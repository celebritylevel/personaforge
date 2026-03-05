export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { productDescription, website } = body;
    
    if (!productDescription && !website) {
      return new Response(JSON.stringify({ error: 'Provide product description or website' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const perplexityKey = env.PERPLEXITY_API_KEY;
    
    if (!perplexityKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const isOnlyFans = website?.toLowerCase().includes('onlyfans');
    const isFanvue = website?.toLowerCase().includes('fanvue');
    const platform = isOnlyFans ? 'OnlyFans' : isFanvue ? 'Fanvue' : '';
    
    let contextPrompt = '';
    
    if (platform && website) {
      contextPrompt = `The product is a subscription to a ${platform} creator. Research this creator.`;
    } else if (website && !productDescription) {
      contextPrompt = `Analyze the website: ${website}.`;
    } else if (productDescription) {
      contextPrompt = `The product/service is: ${productDescription}.`;
    }
    
    const systemPrompt = `You are a marketing strategist for Meta Ads. Create at least 10 distinct personas.

For each persona provide: name, description, painPoints (array), buyingReasons (array), demographics (object with ageRange, gender, location, income, occupation), psychographics (array), angleHook.

Respond ONLY with valid JSON:
{
  "product": "Brief description",
  "personas": [{ "name": "...", "description": "...", "painPoints": [], "buyingReasons": [], "demographics": {}, "psychographics": [], "angleHook": "..." }]
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextPrompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(JSON.stringify({ error: 'Invalid API response' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Could not parse response' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    if (!result.personas || !Array.isArray(result.personas)) {
      return new Response(JSON.stringify({ error: 'No personas found in response' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const personas = result.personas.map((p, i) => ({
      id: `persona-${i}`,
      ...p
    }));
    
    const db = env.DB;
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    try {
      await db.prepare(
        'INSERT INTO icp_research (id, product_description, website, personas, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        id, 
        productDescription || result.product || '', 
        website || '', 
        JSON.stringify(personas),
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
    } catch (dbError) {
      // Continue even if DB fails - return the result anyway
      console.error('Database error:', dbError);
    }
    
    return new Response(JSON.stringify({
      id,
      productDescription: productDescription || result.product || '',
      website: website || '',
      personas,
      createdAt: new Date().toISOString(),
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
