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
      {id}
    </div>
  );
}
