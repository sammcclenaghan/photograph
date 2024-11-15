"use client";

import React, { useState, useEffect } from "react";
import useMasonry from "~/utils/useMasonry";
import Link from "next/link";
import { getImages } from "~/server/queries";

interface ImageType {
  id: number;
  name: string;
  url: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export function Images() {
  const [images, setImages] = useState<ImageType[]>([]);
  const masonryContainer = useMasonry();

  useEffect(() => {
    const fetchImages = async () => {
      const imgs = await getImages();
      setImages(imgs);
    };
    fetchImages().catch((error) => {
      console.error("Error fetching images:", error);
    });
  }, []);

  return (
    <div
      ref={masonryContainer}
      className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {images.map((image) => (
        <div key={image.id} className="break-inside mt-0 mb-4">
          <Link href={`/img/${image.id}`}>
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-auto"
              loading="lazy"
            />
          </Link>
          <div>{image.name}</div>
        </div>
      ))}
    </div>
  );
}
