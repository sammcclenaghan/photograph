// app/gallery/[galleryId]/page.tsx

import { notFound } from 'next/navigation';
import Images from './images';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { getGallery } from '~/server/queries';
import { UploadButton } from '~/app/components/UploadButton';
import EditGalleryButton from '~/app/components/EditGalleryButton';

interface Props {
  params: {
    galleryId: string;
  };
}

export default async function GalleryPage({ params }: Props) {
  const { galleryId } = await params;
  const galleryIdNum = Number(galleryId);

  const gallery = await getGallery(galleryIdNum);

  if (!gallery) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-50 border-zinc-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold text-zinc-800">{gallery.name}</CardTitle>
          <div className="flex items-center space-x-4">
            <EditGalleryButton gallery={gallery} />
            <UploadButton galleryId={galleryIdNum} type="galleryImageUploader" />
          </div>
        </CardHeader>
        <CardContent>
          <Images galleryId={galleryIdNum} />
        </CardContent>
      </Card>
    </div>
  );
}
