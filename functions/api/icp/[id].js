export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  const db = env.DB;
  const result = await db.prepare('SELECT * FROM icp_research WHERE id = ?').bind(id).first();
  
  if (!result) {
    return new Response(JSON.stringify({ error: 'Research not found' }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  return new Response(JSON.stringify({
    id: result.id,
    productDescription: result.product_description,
    website: result.website,
    personas: JSON.parse(result.personas),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
