"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { useRouter } from 'next/navigation';
import { UploadButton } from '~/utils/uploadthing';

export default function Header() {
  const router = useRouter()
  return (
    <nav className="flex w-full items-center justify-between p-4 text-xl border-b font-semibold">
      <div> Gallery</div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div>
          <UploadButton endpoint="galleryImageUploader" onClientUploadComplete={() => { router.refresh() }} />
          <UserButton />
        </div>
      </SignedIn>
    </nav>
  )
}
