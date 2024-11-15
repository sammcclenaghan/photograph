import Link from "next/link";
import { getImages } from "~/server/queries";

interface ImageProps {
  galleryId: number;
}

export default async function Images({ galleryId }: ImageProps) {
  try {
    const images = await getImages(galleryId);
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {images.map((image) => (
            <div key={image.id} className="flex flex-col">
              <Link href={`/gallery/${galleryId}/img/${image.id}`}>
                <div className="relative w-full h-0 pb-[100%]">
                  <img src={image.url} alt={image.name} />
                </div>
              </Link>
              <div className="mt-2 text-center">{image.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    return <div>Error loading images. Please try again later.</div>;
  }
}
