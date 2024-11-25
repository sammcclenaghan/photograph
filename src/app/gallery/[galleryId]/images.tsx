"use client";

import { useState, useCallback, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteImage } from '~/server/actions';
import { Loader2, ChevronLeft, ChevronRight, X, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { useToast } from "~/hooks/use-toast"
import { motion, AnimatePresence, usePresence } from "motion/react"

interface ImageProps {
  galleryId: number;
}

type ImageType = {
  id: number;
  url: string;
  name: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const staggerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

const ImageItem = ({ image, onDelete, onClick, index }: { image: ImageType; onDelete: (id: number) => void; onClick: () => void; index: number }) => {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    !isPresent && setTimeout(safeToRemove, 1000);
  }, [isPresent, safeToRemove]);

  return (
    <motion.div
      layout
      custom={index}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="break-inside-avoid mb-4"
    >
      <motion.div
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
          onClick={onClick}
        >
          <Image
            src={image.url}
            alt={image.name}
            width={500}
            height={500}
            className="w-full h-auto object-cover"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#cccccc"/></svg>'
            )}`}
          />
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

const CarouselImage = ({ image, direction, isZoomed, toggleZoom }: { image: ImageType; direction: number; isZoomed: boolean; toggleZoom: () => void }) => {
  return (
    <motion.div
      key={image.id}
      custom={direction}
      initial={{ y: direction === 0 ? 300 : 0, x: direction > 0 ? 1000 : 1000, opacity: 0 }}
      animate={{ y: 0, x: 0, opacity: 1 }}
      exit={{ y: direction === 0 ? 300 : 0, x: direction === 0 ? 0 : (direction > 0 ? -1000 : 1000), opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0"
    >
      <motion.div
        className="w-full h-full"
        whileTap={{ scale: !isZoomed ? 1 : 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Image
          src={image.url}
          alt={image.name}
          fill
          style={{ objectFit: !isZoomed ? 'contain' : 'cover' }}
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          onClick={toggleZoom}
        />
      </motion.div>
    </motion.div>
  );
};

export default function Images({ galleryId }: ImageProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const { toast } = useToast();

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
    setIsZoomed(false);
    router.push(`/gallery/${galleryId}`, { shallow: true });
  }, [galleryId, router]);

  const navigateImage = useCallback(
    (newDirection: 'prev' | 'next') => {
      if (!selectedImage || !images) return;
      const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
      let newIndex;
      if (newDirection === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setDirection(-1);
      } else {
        newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setDirection(1);
      }
      setSelectedImage(images[newIndex]);
      setIsZoomed(false);
      router.push(`/gallery/${galleryId}?photoId=${images[newIndex].id}`, { shallow: true });
    },
    [selectedImage, images, galleryId, router]
  );

  const handleDeleteImage = useCallback(
    async (imageId: number) => {
      try {
        await deleteImage(imageId);
        await mutate(`/api/images?galleryId=${galleryId}`);
        toast({ title: "Image deleted", description: "The image has been successfully deleted!", variant: "default" })
        if (selectedImage?.id === imageId) {
          const currentIndex = images?.findIndex((img) => img.id === imageId) ?? -1;
          if (currentIndex !== -1 && images && images.length > 1) {
            const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : currentIndex - 1;
            setDirection(0); // Set direction to 0 for the slide-up animation
            setSelectedImage(images[nextIndex]);
            router.push(`/gallery/${galleryId}?photoId=${images[nextIndex].id}`, { shallow: true });
          } else {
            closeModal();
          }
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
    [selectedImage, closeModal, galleryId, images, router, toast]
  );

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'ArrowLeft') {
          navigateImage('prev');
        } else if (e.key === 'ArrowRight') {
          navigateImage('next');
        } else if (e.key === 'Escape') {
          closeModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, navigateImage, closeModal]);



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
      <motion.div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <AnimatePresence mode="popLayout">
          {images.map((image, index) => (
            <ImageItem
              key={image.id}
              image={image}
              onDelete={handleDeleteImage}
              onClick={() => openModal(image)}
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <Dialog open={true} onOpenChange={closeModal}>
            <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
              <DialogTitle className="sr-only">Image Carousel</DialogTitle>
              <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                  <CarouselImage
                    key={selectedImage.id}
                    image={selectedImage}
                    direction={direction}
                    isZoomed={isZoomed}
                    toggleZoom={toggleZoom}
                  />
                </AnimatePresence>
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </motion.div>
                <motion.div
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={() => navigateImage('prev')}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                </motion.div>
                <motion.div
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={() => navigateImage('next')}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </motion.div>
                <motion.div
                  className="absolute bottom-2 right-2 flex space-x-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={toggleZoom}
                    aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                  >
                    {isZoomed ? <ZoomOut className="h-6 w-6" /> : <ZoomIn className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="text-white"
                    onClick={() => selectedImage && handleDeleteImage(selectedImage.id)}
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
