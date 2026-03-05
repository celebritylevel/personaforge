import { NextRequest, NextResponse } from 'next/server';
import { getAngles } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const angles = await getAngles(id);
  
  if (!angles) {
    return NextResponse.json({ angles: null });
  }
  
  return NextResponse.json(angles);
}
