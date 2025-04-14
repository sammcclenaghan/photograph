import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { ArrowRight, Camera, Share2, Layout, Shield } from "lucide-react";
import image1 from "public/image1.jpg";
import image2 from "public/image2.jpg";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        {/* Left side - Content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight">
            <span className="block">Showcase your</span>
            <span className="block text-primary">photography</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
            Beautiful galleries to display and share your work with the world.
            Simple, elegant, and distraction-free.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <SignUpButton mode="modal">
              <Button size="lg" className="gap-2 px-8 text-base md:text-lg">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </SignUpButton>
            
            <Button variant="outline" size="lg" className="text-base md:text-lg">
              View Examples
            </Button>
          </div>
        </div>
        
        {/* Right side - Image gallery mosaic */}
        <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
          {/* Main large image */}
          <div className="absolute top-0 right-0 w-[70%] h-[70%] rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src={image1}
              alt="Landscape photography"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Smaller overlapping image */}
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-lg overflow-hidden shadow-xl">
            <Image 
              src={image2}
              alt="Portrait photography"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-normal text-center mb-16">
            Designed for photographers, by photographers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-3">Beautiful Galleries</h3>
              <p className="text-muted-foreground">
                Create stunning visual galleries with customizable layouts that perfectly showcase your work.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-3">Easy Sharing</h3>
              <p className="text-muted-foreground">
                Share your galleries instantly with clients, friends, or on social media with secure private links.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow lg:col-span-1 md:col-span-2 lg:col-start-auto md:col-start-1">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-3">Drag & Drop Organization</h3>
              <p className="text-muted-foreground">
                Intuitively organize and arrange your photos with our simple drag and drop interface.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial/Example Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-normal text-center mb-6">See what's possible</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
          Join photographers around the world who use Photograph to showcase their work.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Example Gallery 1 */}
          <div className="relative rounded-xl overflow-hidden aspect-[3/4] group">
            <Image 
              src={image1}
              alt="Nature gallery example"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-white text-2xl font-medium">Nature Collection</h3>
              <p className="text-white/80">By Sarah Johnson</p>
            </div>
          </div>
          
          {/* Example Gallery 2 */}
          <div className="relative rounded-xl overflow-hidden aspect-[3/4] group">
            <Image 
              src={image2}
              alt="Portrait gallery example"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-white text-2xl font-medium">Urban Perspectives</h3>
              <p className="text-white/80">By Michael Chen</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-normal mb-4">Ready to showcase your work?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
            Join thousands of photographers and start creating beautiful galleries today.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="px-8 text-lg">
              Create Your Gallery
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border pt-8">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Photograph. All rights reserved.
          </p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
