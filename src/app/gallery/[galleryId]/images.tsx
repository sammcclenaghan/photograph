import Link from "next/link";
import { getImages } from "~/server/queries";

interface ImageProps {
  id: number;
}

export default async function Images(galleryId: ImageProps) {
  const { id } = galleryId;

  const images = await getImages(id);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {images.map((image) => (
          <div key={image.id} className="flex flex-col">
            <Link href={`/gallery/${id}/img/${image.id}`}>
              <div className="relative w-full h-0 pb-[100%]">
                <img src={image.url} />
              </div>
            </Link>
            <div className="mt-2 text-center">{image.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
