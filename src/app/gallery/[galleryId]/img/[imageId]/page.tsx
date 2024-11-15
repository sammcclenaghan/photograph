import PhotoPage from "~/app/components/PhotoPage";

type Props = {
  params: {
    imageId: string;
  };
};

export default async function PhotoModal(props: Props) {
  const { params } = props;
  const { imageId } = params;

  return (
    <div>
      <PhotoPage id={Number(imageId)} />
    </div>
  );
}
