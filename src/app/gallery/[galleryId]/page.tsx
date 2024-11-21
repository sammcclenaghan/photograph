import { Suspense } from 'react'
import { UploadButton } from "~/app/components/UploadButton"
import Images from "./images"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

type Props = {
  params: {
    galleryId: string
  }
}

export default async function GalleryPage({ params }: Props) {
  const { galleryId } = await params
  const galleryIdNum = Number(galleryId)

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-50 border-zinc-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-zinc-800">Gallery {galleryId}</CardTitle>
          <UploadButton galleryId={galleryIdNum} type="galleryImageUploader" />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center text-zinc-500">Loading images...</div>}>
            <Images galleryId={galleryIdNum} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
