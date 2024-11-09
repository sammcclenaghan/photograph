import { getImage } from "~/server/queries";

export default async function PhotoPage(props: { id: number }) {
  const image = await getImage(props.id)
  return (
    <div className="flex w-full h-full min-w-0 bg-green-300">
      <div className="flex-shrink flex items-center justify-center">
        <img src={image.url} className="flex-shrink object-contain" />
      </div>
      <div className="flex w-48 flex-col">
        <div className="text-xl font-bold">{image.name}</div>
      </div>
    </div>
  );
}
