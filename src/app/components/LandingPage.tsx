import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import image1 from "public/image1.jpg";
import image2 from "public/image2.jpg";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-[85vh] flex flex-col">
      {/* Header */}
      <header className="mb-16 text-center md:text-left">
        <h1 className="text-4xl font-normal tracking-tight md:text-5xl xl:text-6xl">Photograph</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A simple way to share your photography
        </p>
      </header>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
        {/* Left side - info and CTA */}
        <div className="max-w-xl mx-auto md:mx-0">
          <h2 className="text-2xl md:text-3xl font-normal mb-4">Create beautiful galleries for your photography</h2>
          <p className="text-muted-foreground text-lg">
            Upload, organize, and share your photos with a clean, distraction-free interface 
            designed for photographers.
          </p>
          
          <div className="mt-8">
            <SignUpButton mode="modal">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </SignUpButton>
          </div>
        </div>

        {/* Right side - gallery preview with proper image overlay */}
        <div className="hidden md:block relative">
          <div className="relative w-full">
            {/* Main image */}
            <div className="rounded-lg overflow-hidden shadow-xl aspect-[4/3] w-full">
              <Image
                src={image1}
                alt="Photography sample"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              />
            </div>
            
            {/* Overlapping smaller image */}
            <div className="absolute -bottom-8 -left-8 lg:-left-12 xl:-left-16 rounded-lg overflow-hidden shadow-xl w-40 lg:w-48 xl:w-56 aspect-square">
              <div className="relative w-full h-full">
                <Image
                  src={image2}
                  alt="Photography sample"
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile view images */}
        <div className="md:hidden w-full">
          <div className="rounded-lg overflow-hidden shadow-lg aspect-[3/2] w-full">
            <Image
              src={image1}
              alt="Photography sample"
              className="object-cover"
              fill
              sizes="100vw"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-16 text-sm text-muted-foreground text-center md:text-left">
        <p>© {new Date().getFullYear()} Photograph</p>
      </footer>
    </div>
  );
}
