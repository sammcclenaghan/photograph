"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { deleteImage } from "~/server/actions";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  ZoomIn,
  ZoomOut,
  DownloadIcon,
  Share2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { useLastViewedPhoto } from "~/hooks/use-last-viewed-photo";
import { motion, AnimatePresence, usePresence } from "motion/react";
import { useSwipeable } from "react-swipeable";

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
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#cccccc" opacity="0.5"/><filter id="b" x="0" y="0"><feGaussianBlur stdDeviation="12" /></filter><rect width="100%" height="100%" filter="url(#b)"/></svg>',
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
  isLastViewed = false,
}: {
  image: ImageType;
  onDelete: (id: number) => void;
  onClick: () => void;
  index: number;
  priority?: boolean;
  isLastViewed?: boolean;
}) => {
  const [isPresent, safeToRemove] = usePresence();
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Use a more standard aspect ratio that works better with most photos
  const aspectRatio = 3 / 4; // Standard 4:3 photo ratio

  useEffect(() => {
    !isPresent && setTimeout(safeToRemove, 250);
  }, [isPresent, safeToRemove]);

  // Scroll into view if this is the last viewed image
  useEffect(() => {
    if (isLastViewed && imageRef.current) {
      setTimeout(() => {
        imageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
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
      className={`mb-2 break-inside-avoid ${isLastViewed ? "rounded-xl ring-2 ring-primary ring-offset-2" : ""}`}
      style={{ transform: "translate3d(0, 0, 0)" }} // Force GPU acceleration
    >
      <motion.div
        className="group relative overflow-hidden rounded-xl"
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative cursor-pointer overflow-hidden transition-all duration-200">
          <Image
            src={image.url}
            alt={image.name || "Gallery image"}
            width={500}
            height={500}
            className={`h-auto w-full object-cover transition-opacity duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            placeholder="blur"
            blurDataURL={generateBlurPlaceholder()}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 12vw, 11vw"
            loading={priority ? "eager" : "lazy"}
            onLoadingComplete={() => setIsLoaded(true)}
            quality={75}
          />

          {/* Pinterest-style dark overlay on hover */}
          <div
            className="absolute inset-0 z-10 bg-black/0 transition-opacity duration-200 group-hover:bg-black/30"
            onClick={onClick}
          ></div>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 scale-75 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
          aria-label={`Delete image ${image.name || ""}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default function Images({ galleryId }: ImageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const photoId = searchParams.get("photoId");

  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const spinnerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const {
    data: images,
    error,
    isLoading,
  } = useSWR<ImageType[]>(`/api/images?galleryId=${galleryId}`, fetcher);

  const currentIndex =
    selectedImage && images
      ? images.findIndex((img) => img.id === selectedImage.id)
      : -1;

  useEffect(() => {
    // Only preload if the modal is open and we have images
    if (
      !selectedImage ||
      !images ||
      images.length <= 1 ||
      currentIndex === -1
    ) {
      return;
    }

    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length && index !== currentIndex) {
        const img = new window.Image();
        img.src = images[index].url;
      }
    };
    const nextIndex = (currentIndex + 1) % images.length;
    preloadImage(nextIndex);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    preloadImage(prevIndex);
  }, [selectedImage, images, currentIndex]);

  // --- Effect to handle spinner logic when selectedImage changes ---
  useEffect(() => {
    // Clear any previous timeout when the image changes or modal closes
    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
      spinnerTimeoutRef.current = null;
    }

    if (selectedImage) {
      // 1. Reset loading state for the new image
      setIsLoaded(false);
      // 2. Optimistically hide spinner
      setShowSpinner(false);

      // 3. Set a timer. If onLoadingComplete doesn't fire fast enough, show the spinner.
      spinnerTimeoutRef.current = setTimeout(() => {
        // Only show spinner if the image ISN'T loaded yet when timer fires
        if (!isLoaded) {
          // console.log("Spinner timeout fired, showing spinner");
          setShowSpinner(true);
        }
      }, 250); // Adjust delay (ms) as needed - 250ms is a starting point
    } else {
      // Modal closed, ensure spinner is off
      setShowSpinner(false);
      setIsLoaded(false);
    }

    // Cleanup function to clear timeout if component unmounts or selectedImage changes again
    return () => {
      if (spinnerTimeoutRef.current) {
        clearTimeout(spinnerTimeoutRef.current);
        spinnerTimeoutRef.current = null;
      }
    };
    // IMPORTANT: Add isLoaded to dependencies here ONLY if you want the timeout
    // to potentially *start* after a flicker of isLoaded becoming true then false.
    // Usually, you only want this effect tied strictly to the *change* of selectedImage.
  }, [selectedImage]); // Rerun only when the selected image changes

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

  const handleLoadingComplete = useCallback(() => {
    // console.log("onLoadingComplete fired");
    // 1. Mark as loaded
    setIsLoaded(true);
    // 2. Hide spinner immediately
    setShowSpinner(false);
    // 3. Clear the timeout (if it's still pending)
    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
      spinnerTimeoutRef.current = null;
    }
  }, []); // No dependencies needed if it only uses setters and refs

  const openModal = useCallback(
    (image: ImageType) => {
      setIsLoaded(false);
      setSelectedImage(image);
      setLastViewedPhoto(image.id);

      // Update URL with photoId without page reload
      const params = new URLSearchParams(searchParams.toString());
      params.set("photoId", image.id.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, setLastViewedPhoto],
  );

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    setIsZoomed(false);

    // Remove photoId from URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete("photoId");
    const newQuery = params.toString();
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const navigateImage = useCallback(
    (newDirection: "prev" | "next") => {
      if (!selectedImage || !images || images.length <= 1) return;

      setIsLoaded(false);
      const currentIndex = images.findIndex(
        (img) => img.id === selectedImage.id,
      );
      let newIndex;

      if (newDirection === "prev") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setDirection(-1);
      } else {
        newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setDirection(1);
      }

      const newImage = images[newIndex];
      setSelectedImage(newImage);
      setLastViewedPhoto(newImage.id);
      setIsZoomed(false);

      // Update URL with new photoId
      const params = new URLSearchParams(searchParams.toString());
      params.set("photoId", newImage.id.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [selectedImage, images, pathname, router, searchParams, setLastViewedPhoto],
  );

  // Setup swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateImage("next"),
    onSwipedRight: () => navigateImage("prev"),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === "ArrowLeft") {
          navigateImage("prev");
        } else if (e.key === "ArrowRight") {
          navigateImage("next");
        } else if (e.key === "Escape") {
          closeModal();
        } else if (e.key === " ") {
          // Toggle zoom on spacebar
          setIsZoomed((prev) => !prev);
          e.preventDefault();
        }
      }
    },
    [selectedImage, navigateImage, closeModal],
  );

  // Setup keyboard navigation
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = useCallback(() => {
    if (!selectedImage) return;

    const link = document.createElement("a");
    link.href = selectedImage.url;
    link.download = selectedImage.name || "photograph-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your image download has started.",
    });
  }, [selectedImage, toast]);

  const handleShare = useCallback(() => {
    if (!selectedImage) return;

    // Create a shareable link to the individual photo page
    const shareUrl = `${window.location.origin}/gallery/${galleryId}/img/${selectedImage.id}`;

    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: selectedImage.name || "Shared photo",
          text: "Check out this photo",
          url: shareUrl,
        })
        .catch(() => {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied",
            description: "Photo link copied to clipboard!",
          });
        });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(shareUrl);
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
        toast({
          title: "Image deleted",
          description: "The image has been successfully deleted!",
          variant: "default",
        });

        if (selectedImage?.id === imageId) {
          const currentIndex =
            images?.findIndex((img) => img.id === imageId) ?? -1;
          if (currentIndex !== -1 && images && images.length > 1) {
            const nextIndex =
              currentIndex < images.length - 1
                ? currentIndex + 1
                : currentIndex - 1;
            setDirection(0);
            const newImage = images[nextIndex];
            setSelectedImage(newImage);
            setLastViewedPhoto(newImage.id);

            // Update URL with new photoId
            const params = new URLSearchParams(searchParams.toString());
            params.set("photoId", newImage.id.toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          } else {
            closeModal();
          }
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "Error",
          description: "Failed to delete the image. Please try again.",
          variant: "destructive",
        });
      }
    },
    [
      selectedImage,
      closeModal,
      galleryId,
      images,
      router,
      pathname,
      searchParams,
      toast,
      setLastViewedPhoto,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load images. Please try again later.
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No images in this gallery yet.
      </div>
    );
  }

  return (
    <>
      {/* Main image grid */}
      <motion.div
        className="xs:columns-2 columns-3 gap-4 sm:columns-4 md:columns-5 lg:columns-4 xl:columns-9 2xl:columns-9"
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
            <DialogContent className="z-50 h-full w-full max-w-none overflow-hidden border-none bg-transparent p-0">
              <DialogTitle className="sr-only">Image Viewer</DialogTitle>

              {/* Backdrop overlay */}
              <motion.div
                className="fixed inset-0 z-30 bg-black/70 backdrop-blur-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />

              {/* Main modal content */}
              <div
                className="relative z-50 flex h-full w-full items-center justify-center"
                {...swipeHandlers}
              >
                {/* Main image container */}
                <div className="flex max-h-[90vh] w-full max-w-7xl items-center justify-center overflow-hidden px-4">
                  <div className="relative flex items-center justify-center">
                    <AnimatePresence
                      mode="wait"
                      initial={false}
                      custom={direction}
                    >
                      <motion.div
                        key={selectedImage.id}
                        custom={direction}
                        initial={{
                          opacity: 0,
                          x: direction === 0 ? 0 : direction > 0 ? 300 : -300,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: direction === 0 ? 0 : direction > 0 ? -300 : 300,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        className="relative"
                      >
                        <Image
                          src={selectedImage.url}
                          alt={selectedImage.name || "Gallery image"}
                          width={1920}
                          height={1280}
                          className={`${isZoomed ? "scale-110" : "scale-100"} max-h-[80vh] w-auto transition-transform duration-300`}
                          style={{ objectFit: "contain" }}
                          quality={100}
                          priority
                          onLoadingComplete={handleLoadingComplete}
                          onClick={toggleZoom}
                        />

                        {showSpinner && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-12 w-12 animate-spin text-white/70" />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {!isLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-white/70" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Overlaid UI elements */}
                <div className="absolute inset-0 mx-auto flex max-w-7xl items-center justify-center">
                  {isLoaded && (
                    <div className="relative aspect-[3/2] max-h-full w-full">
                      {/* Navigation buttons */}
                      {images.length > 1 && currentIndex > 0 && (
                        <button
                          className="absolute left-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                          style={{ transform: "translate3d(0, 0, 0)" }}
                          onClick={() => navigateImage("prev")}
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                      )}

                      {images.length > 1 &&
                        currentIndex < images.length - 1 && (
                          <button
                            className="absolute right-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                            style={{ transform: "translate3d(0, 0, 0)" }}
                            onClick={() => navigateImage("next")}
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                        )}

                      {/* Top-right buttons */}
                      <div className="absolute right-0 top-0 flex items-center gap-2 p-3 text-white">
                        <button
                          onClick={handleShare}
                          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                          title="Share image"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>

                        <button
                          onClick={handleDownload}
                          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                          title="Download image"
                        >
                          <DownloadIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Top-left buttons */}
                      <div className="absolute left-0 top-0 flex items-center gap-2 p-3 text-white">
                        <button
                          onClick={closeModal}
                          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </button>

                        <button
                          onClick={toggleZoom}
                          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                        >
                          {isZoomed ? (
                            <ZoomOut className="h-5 w-5" />
                          ) : (
                            <ZoomIn className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {/* Delete button */}
                      <div className="absolute bottom-20 right-3 p-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-full shadow-lg"
                          onClick={() =>
                            selectedImage && handleDeleteImage(selectedImage.id)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Bottom thumbnail carousel */}
                  {images.length > 1 && (
                    <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
                      <motion.div
                        initial={false}
                        className="mx-auto my-6 flex aspect-[3/2] h-14"
                      >
                        <AnimatePresence initial={false}>
                          {images
                            .filter(
                              (_, idx) =>
                                // Filter images to show only ones near the current index
                                Math.abs(idx - currentIndex) <= 15,
                            )
                            .map((image, filteredIdx) => {
                              // Calculate real index in the full array
                              const idx = images.findIndex(
                                (img) => img.id === image.id,
                              );

                              return (
                                <motion.button
                                  initial={{
                                    width: "0%",
                                    x: `${Math.max((currentIndex - 1) * -100, 15 * -100)}%`,
                                  }}
                                  animate={{
                                    scale: idx === currentIndex ? 1.25 : 1,
                                    width: "100%",
                                    x: `${Math.max(currentIndex * -100, 15 * -100)}%`,
                                  }}
                                  exit={{ width: "0%" }}
                                  onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1);
                                    setSelectedImage(image);
                                    setLastViewedPhoto(image.id);
                                    setIsLoaded(false);

                                    // Update URL with new photoId
                                    const params = new URLSearchParams(
                                      searchParams.toString(),
                                    );
                                    params.set("photoId", image.id.toString());
                                    router.push(
                                      `${pathname}?${params.toString()}`,
                                      { scroll: false },
                                    );
                                  }}
                                  key={image.id}
                                  className={` ${
                                    idx === currentIndex
                                      ? "z-20 rounded-md shadow shadow-black/50"
                                      : "z-10"
                                  } ${idx === 0 ? "rounded-l-md" : ""} ${idx === images.length - 1 ? "rounded-r-md" : ""} relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                                >
                                  <Image
                                    alt=""
                                    width={180}
                                    height={120}
                                    className={` ${
                                      idx === currentIndex
                                        ? "brightness-110 hover:brightness-110"
                                        : "brightness-50 contrast-125 hover:brightness-75"
                                    } h-full transform object-cover transition`}
                                    src={image.url}
                                  />
                                </motion.button>
                              );
                            })}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
