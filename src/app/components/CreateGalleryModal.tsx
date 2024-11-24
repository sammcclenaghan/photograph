'use client'

import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label';
import { useRouter } from 'next/navigation';

import { createGallery, updateGallery, updateGalleryCoverPhoto } from '~/server/actions';
import UploadDropZone from './UploadDropZone';

type Gallery = {
  id: number;
  name: string;
  description: string;
  coverPhotoUrl: string | null;
};

export default function CreateGalleryModal({ children, onGalleryCreated }: { children: React.ReactNode, onGalleryCreated: (gallery: Gallery) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGallery, setNewGallery] = useState<Gallery | null>(null);
  const router = useRouter();

  const handleCreateOrUpdateGallery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      let gallery: Gallery;

      if (newGallery) {
        // Update existing gallery
        gallery = await updateGallery(newGallery.id, formData);
      } else {
        // Create new gallery
        gallery = await createGallery(formData);
      }

      if (!gallery) {
        throw new Error('Failed to create or update Gallery');
      }

      setNewGallery(gallery);
      setStep(2);
    } catch (err) {
      setError('An error occurred while creating or updating the gallery. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = async (url: string) => {
    if (newGallery) {
      try {
        const updatedGallery = await updateGalleryCoverPhoto(newGallery.id, url);
        onGalleryCreated(updatedGallery);
        setOpen(false);
        resetState();
      } catch (err) {
        setError('Failed to update gallery cover photo');
      }
    }
  };

  const handleClose = () => {
    if (newGallery) {
      onGalleryCreated(newGallery);
    }
    setOpen(false);
    resetState();
  };

  const resetState = () => {
    setStep(1);
    setName('');
    setDescription('');
    setError(null);
    setNewGallery(null);
  };

  const handleBack = () => {
    setStep(1);
    if (newGallery) {
      setName(newGallery.name);
      setDescription(newGallery.description);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 1 ? (newGallery ? 'Edit Gallery' : 'Create New Gallery') : 'Add Cover Photo'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 ? 'Enter gallery details' : 'Upload a cover photo for your gallery'}
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <form onSubmit={handleCreateOrUpdateGallery}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Saving...' : (newGallery ? 'Update Gallery' : 'Create Gallery')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label>Cover Photo</Label>
              {newGallery && (
                <UploadDropZone
                  galleryId={newGallery.id}
                  type="galleryCoverUploader"
                  onUploadComplete={handleUploadComplete}
                />
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
              <Button
                onClick={handleBack}
                variant="outline"
                className="mb-2 sm:mb-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
              >
                Skip
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
