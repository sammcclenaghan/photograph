"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { deleteImage } from '~/server/actions';
import { 
  Loader2, X, 
  Trash2, DownloadIcon, Share2, ZoomOut
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { useToast } from "~/hooks/use-toast";
import { useLastViewedPhoto } from "~/hooks/use-last-viewed-photo";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "~/components/ui/carousel";

interface ImageProps {
  galleryId: number;
}

type ImageType = {
  id: number;
  url: string;
  name: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Generate a SVG blur placeholder for images
function generateBlurPlaceholder() {
  return `data:image/svg+xml;base64,${btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#cccccc" opacity="0.5"/><filter id="b" x="0" y="0"><feGaussianBlur stdDeviation="12" /></filter><rect width="100%" height="100%" filter="url(#b)"/></svg>'
  )}`;
}

const staggerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
};

const ImageItem = ({ 
  image, 
  onDelete, 
  onClick, 
  index,
  priority = false,
  isLastViewed = false
}: { 
  image: ImageType; 
  onDelete: (id: number) => void; 
  onClick: () => void; 
  index: number;
  priority?: boolean;
  isLastViewed?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Generate a consistent aspect ratio based on image ID
  const aspectRatio = 0.8 + ((image.id % 7) / 10);

  // Scroll into view if this is the last viewed image
  useEffect(() => {
    if (isLastViewed && imageRef.current) {
      setTimeout(() => {
        imageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [isLastViewed]);

  return (
    <motion.div
      ref={imageRef}
      layout
      layoutId={`image-${image.id}`}
      custom={index}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
      className={`break-inside-avoid mb-3 ${isLastViewed ? 'ring-2 ring-primary ring-offset-2 rounded-xl' : ''}`}
      style={{ transform: 'translate3d(0, 0, 0)' }} // Force GPU acceleration
    >
      <motion.div
        className="relative group"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="rounded-xl overflow-hidden transition-all duration-200 shadow-sm cursor-pointer brightness-90 hover:brightness-110"
          onClick={onClick}
        >
          <div style={{ paddingBottom: `${100 * aspectRatio}%` }} className="relative bg-muted">
            <Image
              src={image.url}
              alt={image.name || "Gallery image"}
              fill
              className={`object-cover absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              placeholder="blur"
              blurDataURL={generateBlurPlaceholder()}
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
              loading={priority ? "eager" : "lazy"}
              onLoadingComplete={() => setIsLoaded(true)}
              quality={60}
            />
            
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md scale-75"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
          aria-label={`Delete image ${image.name || ''}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Animation variants for image transitions
const imageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 300 : -300,
    scale: direction === 0 ? 0.9 : 1
  }),
  center: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    zIndex: 1
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -300 : 300,
    scale: direction === 0 ? 0.9 : 1,
    zIndex: 0
  }),
};

const CarouselImage = ({ 
  image, 
  direction, 
  isZoomed, 
  toggleZoom
}: { 
  image: ImageType; 
  direction: number; 
  isZoomed: boolean; 
  toggleZoom: () => void;
}) => {
  return (
    <motion.div
      key={image.id}
      custom={direction}
      initial="enter"
      animate="center"
      exit="exit"
      variants={imageVariants}
      transition={{ 
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      style={{ transform: 'translate3d(0, 0, 0)' }} // Force GPU acceleration
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        animate={{ scale: isZoomed ? 1.1 : 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
      >
        <Image
          src={image.url}
          alt={image.name || "Gallery image"}
          fill
          style={{ objectFit: !isZoomed ? 'contain' : 'cover' }}
          quality={90}
          priority
          sizes="95vw"
          onClick={toggleZoom}
          placeholder="blur"
          blurDataURL={generateBlurPlaceholder()}
          className="transition-opacity duration-300"
        />
      </motion.div>
    </motion.div>
  );
};

export default function Images({ galleryId }: ImageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const photoId = searchParams.get('photoId');
  
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();
  
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const { toast } = useToast();

  const { data: images, error, isLoading } = useSWR<ImageType[], Error>(
    `/api/images?galleryId=${galleryId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3
    }
  );

  // Handle URL params for direct navigation to a specific image
  useEffect(() => {
    if (photoId && images && images.length > 0) {
      const photoIdNum = Number(photoId);
      const matchedImage = images.find((img) => img.id === photoIdNum);
      
      if (matchedImage) {
        setSelectedImage(matchedImage);
        setDirection(0); // No slide animation on direct URL navigation
      }
    }
  }, [photoId, images]);

  // Calculate current image index
  const currentIndex = selectedImage && images 
    ? images.findIndex(img => img.id === selectedImage.id) 
    : -1;

  const openModal = useCallback(
    (image: ImageType) => {
      setSelectedImage(image);
      setLastViewedPhoto(image.id);
      
      // Update URL with photoId without page reload
      const params = new URLSearchParams(searchParams.toString());
      params.set('photoId', image.id.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, setLastViewedPhoto]
  );

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    setIsZoomed(false);
    
    // Remove photoId from URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete('photoId');
    const newQuery = params.toString();
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const navigateImage = useCallback(
    (newDirection: 'prev' | 'next') => {
      if (!selectedImage || !images || images.length <= 1) return;
      
      const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
      let newIndex;
      
      if (newDirection === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setDirection(-1);
      } else {
        newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setDirection(1);
      }
      
      const newImage = images[newIndex];
      if (!newImage) return; // Guard against undefined
      
      setSelectedImage(newImage);
      setLastViewedPhoto(newImage.id);
      setIsZoomed(false);
      
      // Update URL with new photoId
      const params = new URLSearchParams(searchParams.toString());
      params.set('photoId', newImage.id.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [selectedImage, images, pathname, router, searchParams, setLastViewedPhoto]
  );

  // Setup swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateImage('next'),
    onSwipedRight: () => navigateImage('prev'),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'ArrowLeft') {
          navigateImage('prev');
        } else if (e.key === 'ArrowRight') {
          navigateImage('next');
        } else if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === ' ') {
          // Toggle zoom on spacebar
          setIsZoomed((prev) => !prev);
          e.preventDefault();
        }
      }
    },
    [selectedImage, navigateImage, closeModal]
  );

  // Setup keyboard navigation
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = useCallback(() => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = selectedImage.url;
    link.download = selectedImage.name || 'photograph-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your image download has started.",
    });
  }, [selectedImage, toast]);

  const handleShare = useCallback(async () => {
    if (!selectedImage) return;
    
    // Create a shareable link to the individual photo page
    const shareUrl = `${window.location.origin}/gallery/${galleryId}/img/${selectedImage.id}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedImage.name || 'Shared photo',
          text: 'Check out this photo',
          url: shareUrl,
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Photo link copied to clipboard!",
        });
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Photo link copied to clipboard!",
      });
    }
  }, [selectedImage, galleryId, toast]);

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const handleDeleteImage = useCallback(
    async (imageId: number) => {
      try {
        await deleteImage(imageId);
        await mutate(`/api/images?galleryId=${galleryId}`);
        toast({ title: "Image deleted", description: "The image has been successfully deleted!", variant: "default" });
        
        if (selectedImage?.id === imageId) {
          const currentIndex = images?.findIndex((img) => img.id === imageId) ?? -1;
          if (currentIndex !== -1 && images && images.length > 1) {
            const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : currentIndex - 1;
            setDirection(0);
            const newImage = images[nextIndex];
            if (!newImage) return; // Guard against undefined
            
            setSelectedImage(newImage);
            setLastViewedPhoto(newImage.id);
            
            // Update URL with new photoId
            const params = new URLSearchParams(searchParams.toString());
            params.set('photoId', newImage.id.toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
    [selectedImage, closeModal, galleryId, images, router, pathname, searchParams, toast, setLastViewedPhoto]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading gallery images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p>Failed to load images. Please try again later.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
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
      {/* Main image grid */}
      <motion.div
        className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05,
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
              priority={index < 8} // Load first 8 images eagerly
              isLastViewed={image.id === lastViewedPhoto}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Modal/Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <Dialog open={true} onOpenChange={closeModal}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 rounded-xl border-none overflow-hidden bg-black/95 backdrop-blur-lg shadow-2xl ring-1 ring-white/10">
              <DialogTitle className="sr-only">Image Viewer</DialogTitle>
              
              <div className="relative w-full h-full flex flex-col overflow-hidden">

                
                {/* Main image viewer */}
                <div className="relative flex-1 w-full pb-16"> {/* Added bottom padding to make room for thumbnails */}
                  {images && images.length > 0 ? (
                    <Carousel
                      opts={{
                        align: "center",
                        containScroll: false,
                        loop: true,
                        startIndex: currentIndex !== -1 ? currentIndex : 0
                      }}
                      className="w-full h-full relative"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <CarouselContent className="h-full" {...swipeHandlers}>
                        {images.map((img) => (
                          <CarouselItem key={img.id} className="h-full">
                            <div className="relative h-[85vh] w-full">
                              <motion.div
                                className="relative w-full h-full"
                                animate={{ scale: isZoomed && selectedImage.id === img.id ? 1.1 : 1 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 400, 
                                  damping: 25 
                                }}
                              >
                                <Image
                                  src={img.url}
                                  alt={img.name || "Gallery image"}
                                  fill
                                  sizes="95vw"
                                  priority={img.id === selectedImage?.id}
                                  quality={90}
                                  className="transition-opacity duration-300"
                                  style={{ 
                                    objectFit: !isZoomed ? 'contain' : 'cover',
                                    height: '100%',
                                    width: '100%',
                                    opacity: img.id === selectedImage?.id ? 1 : 0.4
                                  }}
                                  onClick={selectedImage?.id === img.id ? toggleZoom : undefined}
                                  placeholder="blur"
                                  blurDataURL={generateBlurPlaceholder()}
                                />
                              </motion.div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      
                      {images.length > 1 && (
                        <>
                          <CarouselPrevious 
                            onClick={() => navigateImage('prev')}
                            className="h-12 w-12 left-4 border-none bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
                          />
                          <CarouselNext 
                            onClick={() => navigateImage('next')}
                            className="h-12 w-12 right-4 border-none bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
                          />
                        </>
                      )}
                    </Carousel>
                  ) : (
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                      {selectedImage && (
                        <CarouselImage
                          key={`modal-image-${selectedImage.id}`}
                          image={selectedImage}
                          direction={direction}
                          isZoomed={isZoomed}
                          toggleZoom={toggleZoom}
                        />
                      )}
                    </AnimatePresence>
                  )}

                </div>
                
                {/* Image counter and action buttons */}
                <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center">
                  <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-sm font-medium text-white/90">
                    {currentIndex !== -1 && `${currentIndex + 1} / ${images.length}`}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm border-none hover:bg-white/20 transition-all"
                      onClick={handleDownload}
                      aria-label="Download image"
                    >
                      <DownloadIcon className="h-4 w-4 text-white/90" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm border-none hover:bg-white/20 transition-all"
                      onClick={handleShare}
                      aria-label="Share image"
                    >
                      <Share2 className="h-4 w-4 text-white/90" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm border-none hover:bg-white/20 transition-all"
                      onClick={closeModal}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 text-white/90" />
                    </Button>
                  </div>
                </div>

                {/* Thumbnail carousel */}
                {images && images.length > 1 && (
                  <div className="w-full py-3 px-4 bg-black/60 backdrop-blur-md border-t border-white/10 absolute bottom-0 left-0 right-0">
                    <Carousel
                      opts={{
                        align: "center",
                        containScroll: "trimSnaps",
                        dragFree: true
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="py-1">
                        {images.map((image, idx) => (
                          <CarouselItem key={image.id} className="basis-14 md:basis-16 lg:basis-20 pl-2 first:pl-4">
                            <button
                              onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                const newImage = images[idx];
                                if (!newImage) return; // Guard against undefined
                                
                                setSelectedImage(newImage);
                                setLastViewedPhoto(newImage.id);
                                
                                // Update URL with new photoId
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('photoId', newImage.id.toString());
                                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                              }}
                              className={`relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all duration-200 ${
                                selectedImage?.id === image.id
                                  ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-black'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                              aria-label={`View image ${idx + 1}`}
                            >
                              <Image
                                src={image.url}
                                alt=""
                                fill
                                className="object-cover transition-all duration-200"
                                sizes="(max-width: 768px) 64px, 96px"
                                quality={30}
                              />
                            </button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                )}
                
                {/* Delete button */}
                <motion.div 
                  className="absolute bottom-20 right-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full shadow-lg"
                    onClick={() => selectedImage && handleDeleteImage(selectedImage.id)}
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </motion.div>
                
                {/* Image name/caption - if available */}
                {selectedImage?.name && (
                  <div className="absolute bottom-4 left-4 max-w-[80%] px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-md text-sm text-white truncate">
                    {selectedImage.name}
                  </div>
                )}
                
                {/* Zoom indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isZoomed ? 1 : 0,
                    transition: { delay: isZoomed ? 0.2 : 0 }
                  }}
                  className="absolute top-20 right-4 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-md text-white"
                >
                  {isZoomed ? (
                    <div className="flex items-center">
                      <ZoomOut className="h-4 w-4 mr-2" />
                      <span>Zoomed</span>
                    </div>
                  ) : null}
                </motion.div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
