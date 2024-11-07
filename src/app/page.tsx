import { getImages } from "~/server/queries";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";

export const dynamic = "force-dynamic"

async function Images() {
  const images = await getImages();
  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {images.map((image) => (
        <div key={image.id} className="flex h-48 w-48 flex-col">
          <img
            src={image.url}
            alt={image.name}
          />
          <div>{image.name}</div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </main>
  );
}
