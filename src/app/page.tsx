import { getGalleries } from "~/server/queries";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import Link from "next/link";
import { PlusIcon } from '@heroicons/react/20/solid'
import { deleteGallery } from "~/server/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Galleries />
      </SignedIn>
    </main>
  );
}

async function Galleries() {
  const galleries = await getGalleries();
  if (galleries.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-gray-900">Galleries</h2>
          <Link href={"/create/"}>
            <button className="">Add new gallery</button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {galleries.map((gallery) => (
            <div key={gallery.id}>
              <Link href={`gallery/${gallery.id}`}>
                <div className="relative">
                  <div className="relative h-72 w-full overflow-hidden rounded-lg flex items-center justify-center">
                    {gallery.coverPhotoUrl ? (
                      <img
                        src={gallery.coverPhotoUrl}
                        alt={gallery.name}
                      />
                    ) : (
                      <span className="text-center">No Cover Photo</span>
                    )}
                  </div>
                  <div className="relative mt-4">
                    <p className="mt-1 text-sm text-gray-500">{gallery.description}</p>
                  </div>
                  <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
                    />
                    <p className="relative text-lg font-semibold text-white">{gallery.name}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={async () => {
                      "use server";

                      await deleteGallery(gallery.id);
                    }}
                    className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                  >
                    Delete<span className="sr-only">, {gallery.name}</span>
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div >
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-auto size-12 text-gray-400"
      >
        <path
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No galleries</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new gallery.</p>
      <div className="mt-6">
        <Link href="/create">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
            New Gallery
          </button>
        </Link>
      </div>
    </div>
  );
}
