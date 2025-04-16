// app/gallery/[galleryId]/page.tsx

import Images from './images';
import { getGallery } from '~/server/queries';
import { UploadButton } from '~/app/components/UploadButton';
import EditGalleryButton from '~/app/components/EditGalleryButton';
import ShareGalleryButton from '~/app/components/ShareGalleryButton';
import ManageCollaboratorsButton from '~/app/components/ManageCollaboratorsButton';
import GalleryCollaborationStatus from '~/app/components/GalleryCollaborationStatus';
import GalleryNotFound from '~/app/components/GalleryNotFound';

interface Props {
  params: {
    galleryId: string;
  };
}

export default async function GalleryPage({ params }: Props) {
  // Await the params object before destructuring
  const resolvedParams = await Promise.resolve(params);
  const { galleryId } = resolvedParams;
  const galleryIdNum = Number(galleryId);
  
  // Handle invalid gallery ID format
  if (isNaN(galleryIdNum) || galleryIdNum <= 0) {
    return <GalleryNotFound />;
  }

  try {
    const gallery = await getGallery(galleryIdNum);

    if (!gallery) {
      return <GalleryNotFound />;
    }

    return (
      <div className="w-full py-6">
        <div className="px-4 md:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-6">
          <header className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{gallery.name}</h1>
              <GalleryCollaborationStatus galleryId={galleryIdNum} ownerId={gallery.userId} />
            </div>
            <div className="flex items-center space-x-2">
              <EditGalleryButton gallery={gallery} />
              <ShareGalleryButton galleryId={galleryIdNum} />
              <ManageCollaboratorsButton galleryId={galleryIdNum} galleryOwnerId={gallery.userId} />
              <UploadButton galleryId={galleryIdNum} type="galleryImageUploader" />
            </div>
          </header>
          {gallery.description && (
            <p className="mt-4 text-muted-foreground">{gallery.description}</p>
          )}
        </div>
        <div className="w-full px-2 sm:px-3 md:px-4">
          <Images galleryId={galleryIdNum} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return <GalleryNotFound />;
  }
}
