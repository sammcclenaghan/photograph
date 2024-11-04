import "~/styles/globals.css";
import Header from "./components/Header";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "Photograph",
  description: "HI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      < html lang="en" className={`${GeistSans.variable}`
      }>
        <body className="flex flex-col gap-4">
          < Header />
          {children}
        </body>
      </html >
    </ClerkProvider>
  );
}
