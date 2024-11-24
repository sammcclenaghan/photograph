import { useDropzone } from "@uploadthing/react";
import { useCallback, useState } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "~/utils/uploadthing";
import { Button } from "~/components/ui/button";
import { UploadCloud } from 'lucide-react';
import Image from 'next/image';

export default function UploadDropZone({
  galleryId,
  type,
  onUploadComplete,
}: {
  galleryId: number;
  type: "galleryImageUploader" | "galleryCoverUploader";
  onUploadComplete: (url: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const { startUpload, isUploading, routeConfig } = useUploadThing(type, {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        onUploadComplete(res[0].url);
      }
      setFiles([]);
      setPreview(null);
    },
    onUploadError: (error) => {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    },
    onUploadBegin: ({ file }) => {
      console.log("Upload has begun for", file);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    if (acceptedFiles[0]) {
      const objectUrl = URL.createObjectURL(acceptedFiles[0]);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(routeConfig),
    multiple: false,
  });

  const handleUpload = () => {
    if (files.length > 0) {
      startUpload(files, { galleryId });
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
          }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Preview"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? "Drop the file here"
                : "Drag 'n' drop a file here, or click to select a file"}
            </p>
          </>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {routeConfig
            ? `Allowed files: ${Object.keys(routeConfig).join(", ")}`
            : ""}
        </p>
      </div>
      {files.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Selected file: {files[0].name}</p>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
}
