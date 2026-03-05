import { NextRequest, NextResponse } from 'next/server';
import { generateAngles } from '@/lib/perplexity';
import { saveAngles, getResearch } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { icpResearchId } = body;

    if (!icpResearchId) {
      return NextResponse.json(
        { error: 'ICP Research ID is required' },
        { status: 400 }
      );
    }

    const research = await getResearch(icpResearchId);
    if (!research) {
      return NextResponse.json(
        { error: 'ICP Research not found' },
        { status: 404 }
      );
    }

    const angleResults = await generateAngles(research.personas);

    const angles = angleResults.map(result => ({
      id: generateId(),
      personaId: result.personaId,
      personaName: result.personaName,
      hook: result.hook,
      painPoint: result.painPoint,
      angle: result.angle,
      callToAction: result.callToAction,
      creativeSuggestions: result.creativeSuggestions,
    }));

    const savedAngles = await saveAngles({
      icpResearchId,
      angles,
    });

    return NextResponse.json(savedAngles);
  } catch (error) {
    console.error('Angles generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate angles' },
      { status: 500 }
    );
  }
}
