import type { NextApiRequest, NextApiResponse } from 'next';
import { getImages } from '~/server/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { galleryId } = req.query;

  if (!galleryId) {
    return res.status(400).json({ error: 'Gallery ID is required' });
  }

  try {
    const images = await getImages(Number(galleryId));
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
}
