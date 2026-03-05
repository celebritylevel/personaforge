import { NextRequest, NextResponse } from 'next/server';
import { researchICP } from '@/lib/perplexity';
import { saveResearch } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productDescription, website } = body;

    if (!productDescription && !website) {
      return NextResponse.json(
        { error: 'Please provide either a product description or website' },
        { status: 400 }
      );
    }

    const result = await researchICP(productDescription, website);

    const personas = result.personas.map(persona => ({
      id: generateId(),
      ...persona,
    }));

    const research = await saveResearch({
      productDescription: productDescription || result.product,
      website: website || '',
      personas,
    });

    return NextResponse.json(research);
  } catch (error) {
    console.error('ICP research error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to research ICP' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { getAllResearch } = await import('@/lib/storage');
  const research = await getAllResearch();
  return NextResponse.json(research);
}
