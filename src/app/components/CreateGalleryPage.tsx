"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createGallery } from "~/server/actions";
import { UploadButton } from "./UploadButton";

export default function CreateGalleryPage() {
  const [galleryId, setGalleryId] = useState<number | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const galleryId = await createGallery(formData);
    setGalleryId(galleryId ?? null);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Gallery</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          type="text"
          name="name"
          placeholder="Gallery Name"
          className="border p-2"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="border p-2"
        />
        {galleryId && (
          <div className="flex items-center space-x-2">
            <label htmlFor="cover-photo-upload" className="cursor-pointer">
              Cover Photo:
            </label>
            <UploadButton galleryId={galleryId} type="galleryCoverUploader" />
          </div>
        )}
        <button type="submit" className="bg-blue-500 text-white p-2">
          Create Gallery
        </button>
      </form>
      {galleryId && (
        <div className="mt-4">
          <button
            onClick={() => router.push(`/gallery/${galleryId}`)}
            className="bg-green-500 text-white p-2"
          >
            Go to Gallery
          </button>
        </div>
      )}
    </div>
  );
}
