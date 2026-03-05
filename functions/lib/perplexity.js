export async function researchICP(productDescription, website, perplexityKey) {
  const isOnlyFans = website?.toLowerCase().includes('onlyfans');
  const isFanvue = website?.toLowerCase().includes('fanvue');
  const platform = isOnlyFans ? 'OnlyFans' : isFanvue ? 'Fanvue' : '';
  
  let contextPrompt = '';
  
  if (platform && website) {
    contextPrompt = `The product is a subscription to a ${platform} creator. The creator's profile URL is: ${website}. 
    Research this creator and their content niche. Identify the type of content they create.
    Then search Reddit, Twitter/X, and other forums to find discussions about why people subscribe to similar creators.`;
  } else if (website && !productDescription) {
    contextPrompt = `Analyze the website: ${website}. Understand what the product/service is and who it's for.`;
  } else if (productDescription) {
    contextPrompt = `The product/service is: ${productDescription}. Research this type of product and identify target audiences.`;
  }

  const systemPrompt = `You are an expert marketing strategist for Meta Ads. Create at least 10 distinct personas who would buy this product.

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
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: contextPrompt }],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}

export async function generateAngles(personas, perplexityKey) {
  const systemPrompt = `You are an expert Meta Ads creative strategist. Generate ad angles for each persona.

For each: hook (5-8 words), painPoint, angle (2-3 sentences), callToAction, creativeSuggestions (array of 3).

Respond ONLY with valid JSON array: [{ "personaName": "...", "hook": "...", "painPoint": "...", "angle": "...", "callToAction": "...", "creativeSuggestions": [] }]`;

  const userPrompt = `Generate angles for: ${personas.map(p => `${p.name}: ${p.description}`).join('\n')}`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${perplexityKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const jsonMatch = data.choices[0].message.content.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch[0]).map((a, i) => ({ personaId: `persona-${i}`, ...a }));
}
