'use client'

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { deleteGallery, createGallery } from "~/server/actions";
import CreateGalleryModal from "./components/CreateGalleryModal";
import { Button } from "~/components/ui/button";

type Gallery = {
  id: number;
  name: string;
  description: string;
  coverPhotoUrl: string | null;
};

export default function GalleriesClient({ initialGalleries }: { initialGalleries: Gallery[] }) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const router = useRouter();

  const handleGalleryCreated = async (newGallery: Gallery) => {
    setGalleries(prevGalleries => [...prevGalleries, newGallery]);
  };

  const handleDeleteGallery = async (galleryId: number) => {
    await deleteGallery(galleryId);
    setGalleries(prevGalleries => prevGalleries.filter(gallery => gallery.id !== galleryId));
  };

  if (galleries.length === 0) {
    return <EmptyState onGalleryCreated={handleGalleryCreated} />;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Galleries</h2>
          <CreateGalleryModal onGalleryCreated={handleGalleryCreated}>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Gallery
            </Button>
          </CreateGalleryModal>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="relative group">
              <Link href={`gallery/${gallery.id}`}>
                <div className="relative">
                  <div className="relative h-72 w-full overflow-hidden rounded-lg flex items-center justify-center">
                    {gallery.coverPhotoUrl ? (
                      <img
                        src={gallery.coverPhotoUrl}
                        alt={gallery.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-center">No Cover Photo</span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                      <h3 className="text-lg font-semibold text-white">{gallery.name}</h3>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{gallery.description}</p>
                  </div>
                </div>
              </Link>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100"
                onClick={() => handleDeleteGallery(gallery.id)}
                aria-label={`Delete ${gallery.name}`}
              >
                <Trash2Icon className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          ))}
        </div>
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
        className="mx-auto size-12 text-gray-400"
      >
        <path
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No galleries</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new gallery.</p>
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
