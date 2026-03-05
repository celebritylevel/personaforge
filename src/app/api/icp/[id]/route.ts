import { NextRequest, NextResponse } from 'next/server';
import { getResearch } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const research = await getResearch(id);
  
  if (!research) {
    return NextResponse.json({ error: 'Research not found' }, { status: 404 });
  }
  
  return NextResponse.json(research);
}
