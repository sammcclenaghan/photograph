import { getImage } from "~/server/queries";
interface PhotoPageProps {
  id: number;
}

export default async function PhotoPage(props: PhotoPageProps) {
  const image = await getImage(props.id);

  return (
    <div className="flex flex-row w-full h-screen bg-green-300">
      {/* Image Container */}
      <div className="w-2/3 flex items-center justify-center p-2">
        <img
          src={image.url}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Content Container */}
      <div className="w-1/3 flex items-center justify-center p-4">
        <div className="text-xl font-bold">
          {image.name}
        </div>
      </div>
    </div>
  );
}
