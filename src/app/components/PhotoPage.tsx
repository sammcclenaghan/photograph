import { getImage } from "~/server/queries";
import { Camera } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

interface PhotoPageProps {
  id: number;
}

export default async function PhotoPage(props: PhotoPageProps) {
  try {
    const image = await getImage(props.id);
    
    if (!image) {
      return <ImageNotFound />;
    }

    return (
      <div className="flex h-screen w-full flex-row bg-background">
        {/* Image Container */}
        <div className="flex w-2/3 items-center justify-center p-2">
          <img
            src={image.url}
            alt={image.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Content Container */}
        <div className="flex w-1/3 items-center justify-center p-4">
          <div className="text-xl font-bold">
            {image.name}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching image:", error);
    return <ImageNotFound />;
  }
}

function ImageNotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mb-6 rounded-full bg-muted p-4">
        <Camera className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h1 className="mb-3 text-3xl font-bold">Image Not Found</h1>
      
      <p className="mb-8 text-muted-foreground">
        The image you're looking for doesn't exist or may have been removed.
      </p>
      
      <Button asChild>
        <Link href="/">
          Return to Galleries
        </Link>
      </Button>
    </div>
  );
}
