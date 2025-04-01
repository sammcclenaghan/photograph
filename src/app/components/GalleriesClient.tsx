'use client'

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { PlusIcon, Trash2Icon, Share2Icon } from 'lucide-react'
import { deleteGallery } from "~/server/actions";
import CreateGalleryModal from "./CreateGalleryModal";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast"
import { useAuth } from "@clerk/nextjs";

type Gallery = {
  id: number;
  name: string;
  description: string;
  coverPhotoUrl: string | null;
  coverColor: string | null;
  userId: string;
};

export default function GalleriesClient({ initialGalleries }: { initialGalleries: Gallery[] }) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useAuth();

  const handleGalleryCreated = async (newGallery: Gallery) => {
    setGalleries(prevGalleries => [newGallery, ...prevGalleries]);
    router.refresh();
    toast({ description: "You have successfully created a gallery!", variant: "default" })
  };

  const handleDeleteGallery = async (galleryId: number) => {
    try {
      await deleteGallery(galleryId);
      setGalleries(prevGalleries => prevGalleries.filter(gallery => gallery.id !== galleryId));
      toast({ description: "You have successfully deleted a gallery!", variant: "destructive" });
    } catch (error) {
      toast({ 
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete gallery",
        variant: "destructive" 
      });
    }
  };

  if (galleries.length === 0) {
    return <EmptyState onGalleryCreated={handleGalleryCreated} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Galleries</h2>
        <CreateGalleryModal onGalleryCreated={handleGalleryCreated}>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Gallery
          </Button>
        </CreateGalleryModal>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {galleries.map((gallery) => {
          const isOwner = gallery.userId === userId;

          return (
            <div key={gallery.id} className="relative group">
              <Link href={`gallery/${gallery.id}`}>
                <div className="relative">
                  <div 
                    className="relative h-72 w-full overflow-hidden rounded-lg flex items-center justify-center bg-muted shadow-sm transition-all duration-300 hover:shadow-md"
                    style={gallery.coverColor ? { backgroundColor: gallery.coverColor } : {}}
                  >
                    {gallery.coverPhotoUrl ? (
                      <img
                        src={gallery.coverPhotoUrl}
                        alt={gallery.name}
                        className="object-cover w-full h-full"
                      />
                    ) : !gallery.coverColor ? (
                      <span className="text-center text-muted-foreground">No Cover</span>
                    ) : null}
                    <div className={`absolute inset-0 ${!gallery.coverColor ? 'bg-black bg-opacity-30' : 'bg-opacity-20'} flex items-end p-4`}>
                      <h3 className="text-lg font-semibold text-white drop-shadow-md">{gallery.name}</h3>
                    </div>
                    
                    {/* Shared indicator */}
                    {!isOwner && (
                      <div className="absolute top-2 left-2 bg-secondary/80 backdrop-blur-sm rounded-md p-1.5 flex items-center gap-1">
                        <Share2Icon className="h-3.5 w-3.5 text-foreground" />
                        <span className="text-xs font-medium">Shared</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground line-clamp-2">{gallery.description}</p>
                    {!isOwner && (
                      <span className="text-xs text-muted-foreground">Shared with you</span>
                    )}
                  </div>
                </div>
              </Link>
              {/* Only show delete button for galleries the user owns */}
              {isOwner && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 backdrop-blur-sm hover:bg-background/90 dark:bg-secondary/80 dark:hover:bg-secondary"
                  onClick={() => handleDeleteGallery(gallery.id)}
                  aria-label={`Delete ${gallery.name}`}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ onGalleryCreated }: { onGalleryCreated: (gallery: Gallery) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-auto size-12 text-muted-foreground"
      >
        <path
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-foreground">No galleries</h3>
      <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new gallery.</p>
      <div className="mt-6">
        <CreateGalleryModal onGalleryCreated={onGalleryCreated}>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Gallery
          </Button>
        </CreateGalleryModal>
      </div>
    </div>
  );
}
