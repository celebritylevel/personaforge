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
  const creatorId = url.searchParams.get('creatorId');
  const supabase = getSupabase(env);

  if (creatorId) {
    const { data, error } = await supabase
      .from('creator_domain_configs')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify(null), { headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({
      id: data.id,
      creatorId: data.creator_id,
      primaryDomain: data.primary_domain,
      edgeDomain: data.edge_domain,
      autoAddressProvider: data.auto_address_provider,
      businessEmail: data.business_email,
      businessAddress: data.business_address,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }), { headers: CORS_HEADERS });
  }

  const { data, error } = await supabase
    .from('creator_domain_configs')
    .select('*, creator_profiles(name, username)')
    .order('created_at', { ascending: false });

  return new Response(JSON.stringify((data || []).map(c => ({
    id: c.id,
    creatorId: c.creator_id,
    creatorName: c.creator_profiles?.name,
    creatorUsername: c.creator_profiles?.username,
    primaryDomain: c.primary_domain,
    edgeDomain: c.edge_domain,
    autoAddressProvider: c.auto_address_provider,
    businessEmail: c.business_email,
    businessAddress: c.business_address,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }))), { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  try {
    const body = await request.json();
    const { creatorId, primaryDomain, edgeDomain, autoAddressProvider, businessEmail, businessAddress } = body;

    if (!creatorId) {
      return new Response(JSON.stringify({ error: 'Creator ID required' }), { status: 400, headers: CORS_HEADERS });
    }

    const { data: existing } = await supabase
      .from('creator_domain_configs')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('creator_domain_configs')
        .update({
          primary_domain: primaryDomain || null,
          edge_domain: edgeDomain || null,
          auto_address_provider: autoAddressProvider || 'ipostal1',
          business_email: businessEmail || null,
          business_address: businessAddress || null,
          updated_at: new Date().toISOString()
        })
        .eq('creator_id', creatorId);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
      }

      return new Response(JSON.stringify({ success: true, updated: true }), { headers: CORS_HEADERS });
    }

    const id = generateId();
    const { error } = await supabase.from('creator_domain_configs').insert([{
      id,
      creator_id: creatorId,
      primary_domain: primaryDomain || null,
      edge_domain: edgeDomain || null,
      auto_address_provider: autoAddressProvider || 'ipostal1',
      business_email: businessEmail || null,
      business_address: businessAddress || null
    }]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ success: true, id }), { headers: CORS_HEADERS });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const url = new URL(request.url);
  const creatorId = url.searchParams.get('creatorId');

  if (!creatorId) {
    return new Response(JSON.stringify({ error: 'Creator ID required' }), { status: 400, headers: CORS_HEADERS });
  }

  await supabase.from('creator_domain_configs').delete().eq('creator_id', creatorId);
  return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
}
