const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function queryPerplexity(messages: PerplexityMessage[]): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages,
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data: PerplexityResponse = await response.json();
  return data.choices[0].message.content;
}

export async function researchICP(
  productDescription?: string,
  website?: string
): Promise<{
  product: string;
  personas: Array<{
    name: string;
    description: string;
    painPoints: string[];
    buyingReasons: string[];
    demographics: {
      ageRange: string;
      gender: string;
      location: string;
      income: string;
      occupation: string;
    };
    psychographics: string[];
    angleHook: string;
  }>;
}> {
  const isOnlyFans = website?.toLowerCase().includes('onlyfans');
  const isFanvue = website?.toLowerCase().includes('fanvue');
  const isCreatorPlatform = isOnlyFans || isFanvue;
  const platform = isOnlyFans ? 'OnlyFans' : isFanvue ? 'Fanvue' : '';
  
  let contextPrompt = '';
  
  if (isCreatorPlatform && website) {
    contextPrompt = `The product is a subscription to a ${platform} creator. The creator's profile URL is: ${website}. 
    Research this creator and their content niche. Identify the type of content they create (fitness, lifestyle, adult, gaming, etc).
    Then search Reddit, Twitter/X, and other forums to find discussions about why people subscribe to similar creators.
    Focus on the psychological and emotional reasons people subscribe.`;
  } else if (website && !productDescription) {
    contextPrompt = `Analyze the website: ${website}. 
    Understand what the product/service is, who it's for, and what problems it solves.
    Research the market and competitors to understand the target audience.`;
  } else if (productDescription) {
    contextPrompt = `The product/service is: ${productDescription}.
    ${website ? `Additional context from website: ${website}` : ''}
    Research this type of product and identify target audiences.`;
  }

  const systemPrompt = `You are an expert marketing strategist specializing in Meta Ads and audience research. 
Your task is to identify at least 10 distinct personas/avatars who would buy this product or subscribe to this creator.

IMPORTANT - Andromeda Update Alignment:
Meta's Andromeda update requires advertisers to create diverse ad creatives targeting different audience segments.
This means we need MULTIPLE personas with DIFFERENT motivations, not just the obvious ones.

For each persona, provide:
1. name: A descriptive name for this persona archetype
2. description: 2-3 sentence description of this person
3. painPoints: Array of 3-5 specific pain points or frustrations they experience
4. buyingReasons: Array of 3-5 reasons why they would buy/subscribe
5. demographics: Object with ageRange, gender, location, income, occupation
6. psychographics: Array of 3-5 psychological traits, interests, or values
7. angleHook: A compelling hook/headline that would resonate with this persona for an ad

Be creative and think outside the box. Consider:
- Different age groups
- Different life situations
- Different emotional states
- Different use cases for the product
- Both rational and emotional buying triggers
- Status, belonging, self-improvement, entertainment, convenience motivations

Respond ONLY with valid JSON in this exact format:
{
  "product": "Brief product description",
  "personas": [
    {
      "name": "The [Archetype Name]",
      "description": "...",
      "painPoints": ["...", "..."],
      "buyingReasons": ["...", "..."],
      "demographics": {
        "ageRange": "e.g., 25-34",
        "gender": "e.g., Male/Female/All",
        "location": "e.g., US Urban Areas",
        "income": "e.g., $50k-80k",
        "occupation": "e.g., Office Worker"
      },
      "psychographics": ["...", "..."],
      "angleHook": "A compelling hook for this persona"
    }
  ]
}`;

  const userPrompt = `${contextPrompt}

Based on the Meta Ads Andromeda update requirements, create at least 10 diverse personas who would be interested in this.
Think about different angles: status seekers, problem solvers, entertainment seekers, social connectors, self-improvers, etc.

For creator platforms, consider personas like:
- The lonely professional seeking connection
- The fitness enthusiast looking for inspiration
- The curious explorer of new content
- The supporter/fan who wants to help creators
- The entertainment seeker looking for unique content
- The community member wanting to belong
- The aspirational follower wanting to learn
- The emotional support seeker
- The exclusive content hunter
- The personality admirer

Make each persona distinct with unique pain points and motivations.`;

  const response = await queryPerplexity([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse Perplexity response:', response);
    throw new Error('Failed to parse ICP research results');
  }
}

export async function generateAngles(
  personas: Array<{
    name: string;
    description: string;
    painPoints: string[];
    buyingReasons: string[];
    angleHook: string;
  }>
): Promise<Array<{
  personaId: string;
  personaName: string;
  hook: string;
  painPoint: string;
  angle: string;
  callToAction: string;
  creativeSuggestions: string[];
}>> {
  const systemPrompt = `You are an expert Meta Ads creative strategist. 
Your task is to generate compelling ad angles for each persona based on their pain points and buying reasons.

For each persona, create:
1. hook: A scroll-stopping first line (5-8 words max)
2. painPoint: The main problem this ad addresses
3. angle: A 2-3 sentence angle that bridges pain to solution
4. callToAction: A clear, action-oriented CTA
5. creativeSuggestions: Array of 3 specific visual/creative ideas for the ad

Follow Meta Ads best practices:
- Focus on emotional triggers
- Use pattern interrupts in hooks
- Create urgency without being pushy
- Make the benefit clear immediately
- Use social proof where relevant

Respond ONLY with valid JSON array:
[
  {
    "personaName": "...",
    "hook": "...",
    "painPoint": "...",
    "angle": "...",
    "callToAction": "...",
    "creativeSuggestions": ["...", "...", "..."]
  }
]`;

  const userPrompt = `Generate Meta Ads angles for these personas:

${personas.map((p, i) => `
Persona ${i + 1}: ${p.name}
Description: ${p.description}
Pain Points: ${p.painPoints.join(', ')}
Buying Reasons: ${p.buyingReasons.join(', ')}
Suggested Hook: ${p.angleHook}
`).join('\n---\n')}

Create unique, non-repetitive angles for each persona. Make them feel authentic and compelling.`;

  const response = await queryPerplexity([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    const angles = JSON.parse(jsonMatch[0]);
    return angles.map((angle: { personaName: string; hook: string; painPoint: string; angle: string; callToAction: string; creativeSuggestions: string[] }, index: number) => ({
      personaId: `persona-${index}`,
      ...angle,
    }));
  } catch (e) {
    console.error('Failed to parse angles response:', response);
    throw new Error('Failed to parse angles generation results');
  }
}
