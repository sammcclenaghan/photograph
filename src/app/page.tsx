import { auth } from "@clerk/nextjs";
import { getGalleries } from "~/server/queries";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import GalleriesClient from "./GalleriesClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const galleries = await getGalleries();

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <GalleriesClient initialGalleries={galleries} />
      </SignedIn>
    </main>
  );
}
