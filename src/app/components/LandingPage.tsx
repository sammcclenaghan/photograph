import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import image1 from "public/image1.jpg";
import image2 from "public/image2.jpg";

export default function LandingPage() {
  return (
    <div className="relative min-h-[85vh] flex flex-col">
      {/* Simple header */}
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl font-normal tracking-tight md:text-5xl">Photograph</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A simple way to share your photography
        </p>
      </header>

      {/* Main content - Photo showcase */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - brief info and CTA */}
        <div className="flex flex-col justify-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-normal">Create beautiful galleries for your photography</h2>
            <p className="text-muted-foreground">
              Upload, organize, and share your photos with a clean, distraction-free interface 
              designed for photographers.
            </p>
            
            <div className="pt-4">
              <SignUpButton mode="modal">
                <Button size="lg">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>

        {/* Right side - photo gallery preview */}
        <div className="relative hidden md:block">
          <div className="relative rounded-md overflow-hidden h-[450px]">
            <Image
              src={image1}
              alt="Photography sample"
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-8 -left-16 w-48 h-64 rounded-md overflow-hidden shadow-lg">
            <Image
              src={image2}
              alt="Photography sample"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        </div>
      </div>

      {/* Mobile view images */}
      <div className="mt-8 md:hidden">
        <div className="rounded-md overflow-hidden h-[300px] relative">
          <Image
            src={image1}
            alt="Photography sample"
            className="object-cover"
            fill
            sizes="100vw"
          />
        </div>
      </div>

      {/* Simple footer */}
      <footer className="mt-auto pt-16 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Photograph</p>
      </footer>
    </div>
  );
}
