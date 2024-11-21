"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getImages } from '~/server/actions'
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"

interface ImageProps {
  galleryId: number;
}

type ImageType = {
  id: number;
  url: string;
  name: string;
};

export default function Images({ galleryId }: ImageProps) {
  const [images, setImages] = useState<ImageType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const fetchedImages = await getImages(galleryId)
        setImages(fetchedImages)
      } catch (err) {
        console.error("Error fetching images:", err)
        setError("Failed to load images. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [galleryId])

  useEffect(() => {
    const handleRouteChange = () => {
      router.refresh()
    }
    window.addEventListener('focus', handleRouteChange)
    return () => {
      window.removeEventListener('focus', handleRouteChange)
    }
  }, [router])

  const openModal = useCallback((image: ImageType) => {
    setSelectedImage(image)
    router.push(`/gallery/${galleryId}?photoId=${image.id}`, { shallow: true })
  }, [galleryId, router])

  const closeModal = useCallback(() => {
    setSelectedImage(null)
    router.push(`/gallery/${galleryId}`, { shallow: true })
  }, [galleryId, router])

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (!selectedImage) return
    const currentIndex = images.findIndex(img => img.id === selectedImage.id)
    let newIndex
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    }
    setSelectedImage(images[newIndex])
    router.push(`/gallery/${galleryId}?photoId=${images[newIndex].id}`, { shallow: true })
  }, [selectedImage, images, galleryId, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center text-zinc-500 p-4">
        No images in this gallery yet.
      </div>
    )
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="break-inside-avoid mb-4">
            <div
              className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => openModal(image)}
            >
              <Image
                src={image.url}
                alt={image.name}
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
