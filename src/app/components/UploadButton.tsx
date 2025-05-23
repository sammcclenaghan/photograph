"use client"

import { useCallback, useRef, useState } from "react"
import { useUploadThing } from "~/utils/uploadthing"
import { useRouter } from "next/navigation"
import { Upload, X } from 'lucide-react'
import { cn } from "~/lib/utils"
import { Progress } from "~/components/ui/progress"
import { mutate } from 'swr';
import { useToast } from "~/hooks/use-toast";

export function UploadButton({
  galleryId,
  type,
}: {
  galleryId: number
  type: "galleryImageUploader" | "galleryCoverUploader",
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { startUpload } = useUploadThing(type, {
    onClientUploadComplete: async () => {
      console.log("Upload completed, refreshing page...")
      setIsUploading(false)
      setUploadProgress(0)
      await mutate(`/api/images?galleryId=${galleryId}`);
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress)
    },
    onUploadError: (error: unknown) => {
      console.error("Upload error:", error)
      setIsUploading(false)
      setUploadProgress(0)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
  })

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset file input if no files are selected
    if (!e.target.files || e.target.files.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)
    const files = Array.from(e.target.files)
    await startUpload(files, { galleryId })
  }, [galleryId, startUpload])

  const onUploadClick = (e: React.MouseEvent) => {
    if (isUploading) {
      e.preventDefault()
      e.stopPropagation()
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <label
        className={cn(
          "group relative flex h-10 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-md text-white after:transition-[width] after:duration-500 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2",
          isUploading ? "bg-zinc-950 after:absolute after:left-0 after:h-full after:bg-zinc-700 after:content-['']" : "bg-zinc-800",
        )}
        style={isUploading ? { "--progress-width": `${uploadProgress}%` } as React.CSSProperties : {}}
        onClick={onUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="sr-only"
          disabled={isUploading}
        />
        {isUploading ? (
          <span className="z-10">
            {uploadProgress >= 100 ? (
              "Processing..."
            ) : (
              <>
                <span className="block group-hover:hidden">{uploadProgress}%</span>
                <X className="hidden size-4 group-hover:block" />
              </>
            )}
          </span>
        ) : (
          <span className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </span>
        )}
        {isUploading && (
          <Progress
            value={uploadProgress}
            className="w-full h-1 absolute bottom-0 left-0"
          />
        )}
      </label>
      <div className="h-[1.25rem] text-xs leading-5 text-gray-600">
        {type === "galleryImageUploader" ? "Upload images to gallery" : "Upload cover photo"}
      </div>
    </div>
  )
}
