import PhotoPage from "~/app/components/PhotoPage";
import { getImage } from "~/server/queries";

type Props = {
  params: {
    id: string;
  };
};

export default async function PhotoModal(props: Props) {
  const { params } = props;
  const { id } = params;

  return (
    <div>
      <PhotoPage id={Number(id)} />
    </div>
  );
}
