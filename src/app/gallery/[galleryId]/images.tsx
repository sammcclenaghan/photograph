"use client";

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteImage } from '~/server/actions';
import { Loader2, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { useToast } from "~/hooks/use-toast"

interface ImageProps {
  galleryId: number;
}

type ImageType = {
  id: number;
  url: string;
  name: string;
};

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Images({ galleryId }: ImageProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const { toast } = useToast();
  const galleryName = await getGalleryName()

  // Use SWR to fetch images
  const { data: images, error, isLoading } = useSWR<ImageType[]>(
    `/api/images?galleryId=${galleryId}`,
    fetcher
  );

  const openModal = useCallback(
    (image: ImageType) => {
      setSelectedImage(image);
      router.push(`/gallery/${galleryId}?photoId=${image.id}`, { shallow: true });
    },
    [galleryId, router]
  );

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    router.push(`/gallery/${galleryId}`, { shallow: true });
  }, [galleryId, router]);

  const navigateImage = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedImage || !images) return;
      const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
      let newIndex;
      if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      } else {
        newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      }
      setSelectedImage(images[newIndex]);
      router.push(`/gallery/${galleryId}?photoId=${images[newIndex].id}`, { shallow: true });
    },
    [selectedImage, images, galleryId, router]
  );

  const handleDeleteImage = useCallback(
    async (imageId: number) => {
      try {
        await deleteImage(imageId);
        // Revalidate images data
        await mutate(`/api/images?galleryId=${galleryId}`);
        toast({ title: "Image deleted", description: "The image has been successfuly deleted!", variant: "default" })
        if (selectedImage?.id === imageId) {
          closeModal();
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast({
          title: "Error",
          description: "Failed to delete the image. Please try again.",
          variant: "destructive",
        });
      }
    },
    [selectedImage, closeModal, galleryId]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Failed to load images. Please try again later.
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center text-zinc-500 p-4">No images in this gallery yet.</div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="break-inside-avoid mb-4">
            <div className="relative group">
              <div
                className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => openModal(image)}
              >
                <Image
                  src={image.url}
                  style={{ transform: "translate3d(0, 0, 0)" }}
                  alt={image.name}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(image.id);
                }}
                aria-label="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={closeModal}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">Image Carousel</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white"
              onClick={closeModal}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white"
              onClick={() => navigateImage('prev')}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
              onClick={() => navigateImage('next')}
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="absolute bottom-2 right-2 text-white"
              onClick={() => selectedImage && handleDeleteImage(selectedImage.id)}
              aria-label="Delete image"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
