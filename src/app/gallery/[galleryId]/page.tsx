// app/gallery/[galleryId]/page.tsx

import { notFound } from 'next/navigation';
import Images from './images';
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
      <div className="mb-8">
        <header className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground">{gallery.name}</h1>
          <div className="flex items-center space-x-4">
            <EditGalleryButton gallery={gallery} />
            <UploadButton galleryId={galleryIdNum} type="galleryImageUploader" />
          </div>
        </header>
        {gallery.description && (
          <p className="mt-4 text-muted-foreground">{gallery.description}</p>
        )}
      </div>
      <div className="mt-6">
        <Images galleryId={galleryIdNum} />
      </div>
    </div>
  );
}
