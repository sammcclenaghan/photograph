import { getGalleries } from "~/server/queries";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import Link from "next/link";
import { createGallery } from "~/server/actions";

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
  return (
    <div>
      < div className="flex justify-between items-center mb-6" >
        <h1 className="text-2xl font-bold">My Galleries</h1>
        <CreateGalleryForm />
      </div >
      < div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" >
        {
          galleries.map((gallery) => (
            <div key={gallery.id} className="flex flex-col">
              <Link href={`/gallery/${gallery.id}`}>
                <div className="relative w-full h-0 pb-[100%]">
                  {gallery.id}
                </div>
              </Link>
              <div className="mt-2 text-center">{gallery.name}</div>
            </div>
          ))
        }
      </div >
    </div>
  )
}

function CreateGalleryForm() {
  return (
    <form action={async (formData) => {
      "use server";
      await createGallery(formData)
    }

    } className="flex space-x-2">
      <input
        type="text"
        name="name"
        placeholder="Gallery Name"
        className="border p-2"
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        className="border p-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">
        Create Gallery
      </button>
    </form>
  );
}
