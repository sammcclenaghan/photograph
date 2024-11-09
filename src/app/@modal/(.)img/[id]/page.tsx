import { Modal } from "../modal";
import PhotoPage from "~/app/components/PhotoPage";

type Props = {
  params: {
    id: string;
  };
};

export default async function PhotoModal(props: Props) {
  const { params } = props;
  const { id } = params;

  return (
    <Modal>
      <PhotoPage id={Number(id)} />
    </Modal>
  );
}
