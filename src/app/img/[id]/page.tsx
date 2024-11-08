import { getImage } from "~/server/queries";

type Props = {
  params: {
    id: string;
  };
};

export default async function PhotoModal(props: Props) {
  const { params } = props;
  const { id } = params;

  const image = await getImage(Number(id));

  return (
    <div>
      <img src={image.url} className="w-96" />
    </div>
  );
}
