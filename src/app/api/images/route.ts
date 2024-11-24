import { NextRequest, NextResponse } from 'next/server';
import { getImages } from '~/server/actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const galleryId = searchParams.get('galleryId');

  if (!galleryId) {
    return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 });
  }

  try {
    const images = await getImages(Number(galleryId));
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
