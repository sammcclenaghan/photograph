import { auth } from "@clerk/nextjs/server";
import { getGalleries } from "~/server/queries";
import LandingPage from "./components/LandingPage";
import GalleriesClient from "~/app/components/GalleriesClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-[1960px] p-4">
        <LandingPage />
      </main>
    );
  }

  const galleries = (await getGalleries()) ?? [];

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <GalleriesClient initialGalleries={galleries} />
    </main>
  );
}
