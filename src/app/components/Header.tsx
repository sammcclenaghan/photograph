"use client";

import { SignInButton, UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link';
import { ThemeToggle } from '~/components/ui/theme-toggle';

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="flex w-full items-center justify-between p-4 text-xl border-b font-semibold">
      <Link href={"/"}>
        <div>Home</div>
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton />
        )}
      </div>
    </nav>
  )
}
