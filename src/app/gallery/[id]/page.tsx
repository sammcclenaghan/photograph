import { UploadButton } from "~/app/components/UploadButton";
import Images from "./images";

type Props = {
  params: {
    id: string;
  };
};

export default async function GalleryPage({ params }: Props) {
  const { id } = await params;
  const galleryId = Number(id);

  return (
    <div>
      <h1>Gallery {galleryId}</h1>
      <UploadButton galleryId={galleryId} />
      <Images id={galleryId} />
    </div>
  );
}
