import { UploadButton } from "~/app/components/UploadButton";
import Images from "./images";

type Props = {
  params: {
    galleryId: string;
  };
};

export default async function GalleryPage({ params }: Props) {
  const { galleryId } = await params;
  const galleryIdNum = Number(galleryId);

  return (
    <div>
      <h1>Gallery {galleryId}</h1>
      <UploadButton galleryId={galleryIdNum} />
      <Images galleryId={galleryIdNum} />
    </div>
  );
}
