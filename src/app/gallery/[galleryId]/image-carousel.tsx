'use client'

import * as React from "react"
import Image from "next/image"
import { X } from 'lucide-react'
import Link from "next/link"

import { Card, CardContent } from "~/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { getImages } from "~/server/queries"
import { UploadButton } from "~/app/components/UploadButton"

interface ImageProps {
  id: number;
  url: string;
  name: string;
}

interface GalleryProps {
  galleryId: number;
}

export default function ImageGalleryCarousel({ galleryId }: GalleryProps) {
  const [images, setImages] = React.useState<ImageProps[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await getImages(galleryId)
        setImages(fetchedImages)
      } catch (error) {
        console.error("Error fetching images:", error)
      }
    }
    fetchImages()
  }, [galleryId])

  const openCarousel = (index: number) => {
    setActiveIndex(index)
    setIsOpen(true)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gallery {galleryId}</h1>
      <UploadButton galleryId={galleryId} type="galleryImageUploader" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {images.map((image, index) => (
          <Card key={image.id} className="cursor-pointer" onClick={() => openCarousel(index)}>
            <CardContent className="p-2">
              <div className="relative w-full h-0 pb-[100%]">
                <Image
                  src={image.url}
                  alt={image.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <div className="mt-2 text-center">{image.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-full bg-background">
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <Carousel opts={{ startIndex: activeIndex, loop: true }} className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <Image
                          src={image.url}
                          alt={image.name}
                          width={600}
                          height={600}
                          objectFit="contain"
                          className="rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  )
}
