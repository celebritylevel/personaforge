import { generateAngles } from '../../lib/perplexity';
import { saveAngles, getResearch } from '../../lib/storage';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { icpResearchId } = body;

    if (!icpResearchId) {
      return new Response(JSON.stringify({ error: 'ICP Research ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const research = await getResearch(env.DB, icpResearchId);
    if (!research) {
      return new Response(JSON.stringify({ error: 'Research not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const angleResults = await generateAngles(research.personas, env.PERPLEXITY_API_KEY);
    const angles = angleResults.map((a, i) => ({ id: `angle-${i}`, ...a }));
    const savedAngles = await saveAngles(env.DB, { icpResearchId, angles });

    return new Response(JSON.stringify(savedAngles), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
