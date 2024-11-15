"use client";

import { useState } from "react";
import { createGallery } from "~/server/actions";
import { useRouter } from "next/navigation";
import { useUploadThing } from "~/utils/uploadthing";

type Input = Parameters<typeof useUploadThing>;

const useUploadThingInputProps = (...args: Input) => {
  const $ut = useUploadThing(...args);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const result = await $ut.startUpload(selectedFiles);

    console.log("uplodaded files", result);
    return result;
  };

  return {
    inputProps: {
      onChange,
      multiple: false,
      accept: "image/*",
    },
    isUploading: $ut.isUploading,
  };
};

export default function CreateGalleryForm() {
  const [name, setName] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const router = useRouter();

  const { inputProps, isUploading } = useUploadThingInputProps(
    "galleryCoverUploader",
    {
      onClientUploadComplete: (res) => {
        if (res && res.length > 0) {
          const url = res[0].fileUrl;
          setCoverPhotoUrl(url);
        }
      },
    });
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!coverPhotoUrl) {
      console.error("Upload Cover Photo not submitted");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("coverPhotoUrl", coverPhotoUrl);

    await createGallery(formData);
    setName("");
    setCoverPhotoUrl("");
    router.refresh(); // Refresh the page to show the new gallery
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter gallery name"
        required
      />
      <div>
        <label htmlFor="cover-photo-upload" className="cursor-pointer">
          {/* You can replace this with an SVG or icon if you'd like */}
          Upload Cover Photo
        </label>
        <input
          id="cover-photo-upload"
          type="file"
          className="sr-only"
          {...inputProps}
        />
      </div>
      {isUploading && <p>Uploading cover photo...</p>}
      <button type="submit" disabled={isUploading || !coverPhotoUrl}>
        {isUploading ? "Uploading..." : "Create Gallery"}
      </button>
    </form>
  );
}
