import "~/styles/globals.css";
import Header from "./components/Header";
import { Outfit } from "next/font/google";
import { type Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { Toaster } from "~/components/ui/toaster";
import { dark } from '@clerk/themes'

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Photograph",
  description: "A beautiful photo gallery application",
  icons: [{ rel: "icon", url: "/icon.svg" }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.className}>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}>
        <body className={`font-sans antialiased`}>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
              <Toaster />
            </main>
          </div>
          <div id="modal-root" />
        </body>
      </ClerkProvider>
    </html>
  );
}
