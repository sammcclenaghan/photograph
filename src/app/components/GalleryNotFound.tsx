import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Camera } from 'lucide-react';

export default function GalleryNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <h1 className="mb-3 text-3xl font-bold">Gallery Not Found</h1>
        
        <p className="mb-8 text-muted-foreground">
          The gallery you're looking for doesn't exist or may have been removed.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/">
              Go to Galleries
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/create">
              Create New Gallery
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}