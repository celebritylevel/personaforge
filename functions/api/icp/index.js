import { researchICP } from '../../lib/perplexity';
import { saveResearch, getAllResearch } from '../../lib/storage';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { productDescription, website } = body;

    if (!productDescription && !website) {
      return new Response(JSON.stringify({ error: 'Provide product description or website' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await researchICP(productDescription, website, env.PERPLEXITY_API_KEY);
    const personas = result.personas.map((p, i) => ({ id: `persona-${i}`, ...p }));
    const research = await saveResearch(env.DB, { productDescription: productDescription || result.product, website: website || '', personas });

    return new Response(JSON.stringify(research), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  const research = await getAllResearch(env.DB);
  return new Response(JSON.stringify(research), { headers: { 'Content-Type': 'application/json' } });
}
