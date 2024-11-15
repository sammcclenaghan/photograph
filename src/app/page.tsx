import { getGalleries } from "~/server/queries";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import Link from "next/link";
import CreateGalleryForm from "./components/CreateGalleryForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const galleries = await getGalleries();

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        {/* Header with Create Gallery Button */}
        <div className="flex justify-between items-center mb-6">
          {/* You can add a title or logo here if desired */}
          <h1 className="text-2xl font-bold">My Galleries</h1>
          {/* Create Gallery Form or Button */}
          <CreateGalleryForm />
        </div>
        {/* Galleries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="flex flex-col">
              <Link href={`/gallery/${gallery.id}`}>
                <div className="relative w-full h-0 pb-[100%]">
                  {gallery.id}
                </div>
              </Link>
              <div className="mt-2 text-center">{gallery.name}</div>
            </div>
          ))}
        </div>
      </SignedIn>
    </main>
  );
}
