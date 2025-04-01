'use client'

import { useState, useEffect } from 'react'
import { Edit2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from '~/hooks/use-toast'
import CreateGalleryModal from './CreateGalleryModal'

type Gallery = {
  id: number;
  name: string;
  description: string | null;
  coverPhotoUrl: string | null;
  coverColor: string | null;
};

interface EditGalleryButtonProps {
  gallery: Gallery;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function EditGalleryButton({ 
  gallery,
  variant = 'outline',
  size = 'default'
}: EditGalleryButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleGalleryUpdated = (updatedGallery: Gallery) => {
    router.refresh();
    toast({ 
      description: "Gallery updated successfully!",
      variant: "default" 
    });
  };

  return (
    <CreateGalleryModal 
      onGalleryCreated={handleGalleryUpdated}
      initialGallery={gallery}
      mode="edit"
    >
      <Button 
        variant={variant} 
        size={size}
        className="flex items-center"
      >
        <Edit2 className="w-4 h-4 mr-2" />
        Edit Gallery
      </Button>
    </CreateGalleryModal>
  );
}