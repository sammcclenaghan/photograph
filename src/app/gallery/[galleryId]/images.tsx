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
      duration: 0.1,
    },
  }),
};

const ImageItem = ({ image, onDelete, onClick, index }: { image: ImageType; onDelete: (id: number) => void; onClick: () => void; index: number }) => {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    // Reduce timeout to make elements disappear faster
    !isPresent && setTimeout(safeToRemove, 250);
  }, [isPresent, safeToRemove]);

  return (
    <motion.div
      layout
      layoutId={`image-${image.id}`}
      custom={index}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
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
      initial={{ 
        opacity: 0, 
        x: direction === 0 ? 0 : (direction > 0 ? 300 : -300),
        scale: direction === 0 ? 0.9 : 1 
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: 1
      }}
      exit={{ 
        opacity: 0, 
        x: direction === 0 ? 0 : (direction > 0 ? -300 : 300),
        scale: direction === 0 ? 0.9 : 1 
      }}
      transition={{ 
        type: "tween", 
        ease: "easeInOut", 
        duration: 0.35 
      }}
      className="absolute inset-0 w-full h-full"
    >
      <motion.div
        className="w-full h-full"
        animate={{ scale: isZoomed ? 1.1 : 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
      >
        <Image
          src={image.url}
          alt={image.name}
          fill
          style={{ objectFit: !isZoomed ? 'contain' : 'cover' }}
          quality={90}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          onClick={toggleZoom}
          className="transition-opacity duration-300"
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        Failed to load images. Please try again later.
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">No images in this gallery yet.</div>
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
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 rounded-lg border-none overflow-hidden bg-background/90 backdrop-blur-md">
              <DialogTitle className="sr-only">Image Carousel</DialogTitle>
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                  <CarouselImage
                    key={selectedImage.id}
                    image={selectedImage}
                    direction={direction}
                    isZoomed={isZoomed}
                    toggleZoom={toggleZoom}
                  />
                </AnimatePresence>
                
                {/* Image counter */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/50 backdrop-blur-sm rounded-full text-xs font-medium">
                  {images && `${images.findIndex(img => img.id === selectedImage.id) + 1} / ${images.length}`}
                </div>
                
                {/* Close button */}
                <motion.div
                  className="absolute top-4 right-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={closeModal}
                    aria-label="Close"
                    className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border-none hover:bg-background/70"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                {/* Navigation buttons */}
                <div className="absolute inset-y-0 left-0 w-1/5 flex items-center justify-start">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateImage('prev')}
                      className="h-10 w-10 ml-4 rounded-full bg-background/50 backdrop-blur-sm border-none hover:bg-background/70"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  </motion.div>
                </div>
                
                <div className="absolute inset-y-0 right-0 w-1/5 flex items-center justify-end">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateImage('next')}
                      className="h-10 w-10 mr-4 rounded-full bg-background/50 backdrop-blur-sm border-none hover:bg-background/70"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </motion.div>
                </div>
                
                {/* Control panel */}
                <motion.div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 px-3 py-2 rounded-full bg-background/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleZoom}
                    className="h-8 w-8 rounded-full hover:bg-background/70"
                    aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                  >
                    {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectedImage && handleDeleteImage(selectedImage.id)}
                    className="h-8 w-8 rounded-full hover:bg-destructive/20 text-destructive hover:text-destructive"
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
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
