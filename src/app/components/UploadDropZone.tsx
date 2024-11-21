import { useDropzone } from "@uploadthing/react";
import { useCallback, useState } from "react";
import { generateClientDropzoneAccept, generatePermittedFileTypes } from "uploadthing/client";

import { useUploadThing } from "~/utils/uploadthing";

export default function UploadDropZone({
  galleryId,
  type,
}: {
  galleryId: number;
  type: "galleryImageUploader" | "galleryCoverUploader";
}) {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, routeConfig } = useUploadThing(type, {
    onClientUploadComplete: () => {
      alert("uploaded successfully!!");
    },
    onUploadError: () => {
      alert("error");
    },
    onUploadBegin: ({ file }) => {
      console.log("upload has begun for", file);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div>
        {files.length > 0 && (
          <button onClick={() => startUpload(files, { galleryId })}>
            Upload {files.length} files
          </button>
        )}
      </div>
      Drop files here!
    </div>
  );
}
