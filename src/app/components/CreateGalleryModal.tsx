'use client'

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { createGallery } from '~/server/actions';
import { UploadButton } from "./UploadButton";

export default function CreateGalleryModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryId, setGalleryId] = useState<number | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget)
      const newGalleryId = await createGallery(formData);

      if (!newGalleryId) {
        throw new Error('Failed to create Gallery')
      }
      setGalleryId(newGalleryId)
    } catch (err) {
      setError('An error occurred while creating the gallery. Please try again')
    } finally {
      setIsLoading(false)
    }
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setDescription('');
    setGalleryId(null);
    setError(null)
  }

  const handleGoToGallery = () => {
    if (galleryId) {
      router.push(`/gallery/${galleryId}`)
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {galleryId ? (
          <>
            <DialogHeader>
              <DialogTitle>Gallery Created</DialogTitle>
              <DialogDescription>
                Your new gallery has been successfully created.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="cover-photo-upload" className="cursor-pointer">
                  Cover Photo:
                </Label>
                <UploadButton galleryId={galleryId} type="galleryCoverUploader" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>Exit</Button>
                <Button onClick={handleGoToGallery}>Go to Gallery</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Gallery</DialogTitle>
              <DialogDescription>
                Create a new gallery to showcase your photos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Gallery'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
