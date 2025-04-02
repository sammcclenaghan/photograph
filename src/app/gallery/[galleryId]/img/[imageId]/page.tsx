import PhotoPage from "~/app/components/PhotoPage";

type Props = {
  params: {
    imageId: string;
  };
};

export default async function PhotoModal(props: Props) {
  const { params } = props;
  const { imageId } = params;
  const imageIdNum = Number(imageId);
  
  // Handle invalid image ID format
  if (isNaN(imageIdNum) || imageIdNum <= 0) {
    return (
      <div>
        <PhotoPage id={-1} /> {/* Pass an invalid ID to trigger the not found handler */}
      </div>
    );
  }

  return (
    <div>
      <PhotoPage id={imageIdNum} />
    </div>
  );
}
