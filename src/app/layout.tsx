import "~/styles/globals.css";
import Header from "./components/Header";
import { Inter } from "next/font/google";
import { type Metadata } from "next";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Photograph",
  description: "HI",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <ClerkProvider>
        <html lang="en">
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <body className={`font-sans ${inter.variable} dark`}>
            <div className="grid h-screen grid-rows-[auto,1fr]">
              <Header/>
              <main className="overflow-y-scroll">{children}</main>
              {modal}
            </div>
            <div id="modal-root" />
          </body>
        </html>
    </ClerkProvider>
  );
}
