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
    const { website } = body;

    if (!website) {
      return new Response(JSON.stringify({ error: 'Website URL required' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const isOnlyFans = website.toLowerCase().includes('onlyfans');
    const isFanvue = website.toLowerCase().includes('fanvue');

    if (!isOnlyFans && !isFanvue) {
      return new Response(JSON.stringify({ error: 'Only OnlyFans and Fanvue URLs are supported' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const platform = isOnlyFans ? 'onlyfans' : 'fanvue';
    const username = website.split('/').pop()?.split('?')[0] || '';

    const { data: existing } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('username', username)
      .eq('platform', platform)
      .single();

    if (existing) {
      return new Response(JSON.stringify({
        id: existing.id,
        username: existing.username,
        name: existing.name,
        about: existing.about,
        avatar: existing.avatar,
        header: existing.header,
        website: existing.website,
        platform: existing.platform,
        subscribersCount: existing.subscribers_count,
        mediasCount: existing.medias_count,
        videosCount: existing.videos_count,
        photosCount: existing.photos_count,
        postsCount: existing.posts_count,
        subscribePrice: existing.subscribe_price,
        joinDate: existing.join_date,
        isVerified: existing.is_verified,
        personas: existing.personas || [],
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
        cached: true
      }), {
        headers: CORS_HEADERS
      });
    }

    const apifyToken = env.APIFY_API_KEY;

    if (!apifyToken) {
      return new Response(JSON.stringify({ error: 'Apify API key not configured' }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    const actorInput = {
      query: [`@${username}`],
      limit: 1
    };

    const actorResponse = await fetch(
      `https://api.apify.com/v2/acts/jupri~onlyfans/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorInput)
      }
    );

    if (!actorResponse.ok) {
      const errorText = await actorResponse.text();
      return new Response(JSON.stringify({ error: `Apify error: ${actorResponse.status}` }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    const profileData = await actorResponse.json();

    if (!profileData || profileData.length === 0) {
      return new Response(JSON.stringify({ error: 'Profile not found or is private' }), {
        status: 404,
        headers: CORS_HEADERS
      });
    }

    const profile = profileData[0];

    const perplexityKey = env.PERPLEXITY_API_KEY;
    let personas = [];

    if (perplexityKey) {
      const systemPrompt = `You are a marketing strategist. Respond ONLY with valid JSON (no markdown, no formatting).

Research Reddit, Twitter, forums to find discussions about why people subscribe to ${platform} creators like this one.

Return this exact JSON structure:
{"personas":[{"name":"The [Archetype]","description":"2 sentences","painPoints":["point1","point2"],"buyingReasons":["reason1","reason2"],"demographics":{"ageRange":"25-34","gender":"All","location":"US","income":"$50k-80k","occupation":"Professional"},"psychographics":["trait1","trait2"],"angleHook":"Compelling hook"}]}

IMPORTANT: Return ONLY valid JSON. No markdown. No extra text. Generate 10 distinct personas.`;

      const userPrompt = `Creator: ${profile.name || username}
About: ${profile.about || profile.rawAbout || 'No description'}
Platform: ${platform}
Subscribers: ${profile.subscribersCount || profile.favoritedCount || 'Unknown'}
Media: ${profile.mediasCount || profile.postsCount || 0} posts
Price: $${profile.subscribePrice || profile.subscribedByData?.subscribePrice || 'Unknown'}

Create 10 distinct personas who would subscribe to this ${platform} creator.`;

      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
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

      if (perplexityResponse.ok) {
        const data = await perplexityResponse.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = content.match(/\{[\s\S]*"personas"[\s\S]*\}/);

        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            personas = (result.personas || []).map((p, i) => ({
              id: `persona-${i}`,
              name: p.name || `Persona ${i + 1}`,
              description: p.description || '',
              painPoints: p.painPoints || [],
              buyingReasons: p.buyingReasons || [],
              demographics: p.demographics || {},
              psychographics: p.psychographics || [],
              angleHook: p.angleHook || ''
            }));
          } catch (e) {
            console.error('Failed to parse personas:', e);
          }
        }
      }
    }

    const id = generateId();
    const now = new Date().toISOString();

    await supabase.from('creator_profiles').insert([{
      id,
      username,
      name: profile.name || '',
      about: profile.about || profile.rawAbout || '',
      avatar: profile.avatar || '',
      header: profile.header || '',
      website,
      platform,
      subscribers_count: profile.subscribersCount || profile.favoritedCount || 0,
      medias_count: profile.mediasCount || 0,
      videos_count: profile.videosCount || 0,
      photos_count: profile.photosCount || 0,
      posts_count: profile.postsCount || 0,
      subscribe_price: String(profile.subscribePrice || profile.subscribedByData?.subscribePrice || 0),
      join_date: profile.joinDate || '',
      is_verified: profile.isVerified || false,
      raw_data: profile,
      personas
    }]);

    return new Response(JSON.stringify({
      id,
      username,
      name: profile.name || '',
      about: profile.about || profile.rawAbout || '',
      avatar: profile.avatar || '',
      header: profile.header || '',
      website,
      platform,
      subscribersCount: profile.subscribersCount || profile.favoritedCount || 0,
      mediasCount: profile.mediasCount || 0,
      videosCount: profile.videosCount || 0,
      photosCount: profile.photosCount || 0,
      postsCount: profile.postsCount || 0,
      subscribePrice: String(profile.subscribePrice || profile.subscribedByData?.subscribePrice || 0),
      joinDate: profile.joinDate || '',
      isVerified: profile.isVerified || false,
      personas,
      createdAt: now,
      updatedAt: now,
      cached: false
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
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const supabase = getSupabase(env);

  if (id) {
    const { data: profile, error } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: CORS_HEADERS
      });
    }

    return new Response(JSON.stringify({
      id: profile.id,
      username: profile.username,
      name: profile.name,
      about: profile.about,
      avatar: profile.avatar,
      header: profile.header,
      website: profile.website,
      platform: profile.platform,
      subscribersCount: profile.subscribers_count,
      mediasCount: profile.medias_count,
      videosCount: profile.videos_count,
      photosCount: profile.photos_count,
      postsCount: profile.posts_count,
      subscribePrice: profile.subscribe_price,
      joinDate: profile.join_date,
      isVerified: profile.is_verified,
      personas: profile.personas || [],
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }), {
      headers: CORS_HEADERS
    });
  }

  const { data: results, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return new Response(JSON.stringify((results || []).map(p => ({
    id: p.id,
    username: p.username,
    name: p.name,
    about: p.about,
    avatar: p.avatar,
    platform: p.platform,
    subscribersCount: p.subscribers_count,
    personas: p.personas || [],
    createdAt: p.created_at
  }))), {
    headers: CORS_HEADERS
  });
}
