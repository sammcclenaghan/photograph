"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Link from 'next/link';
import { ThemeToggle } from '~/components/ui/theme-toggle';
import PendingInvitationsNotification from './PendingInvitationsNotification';

export default function Header() {
  return (
    <nav className="flex w-full items-center justify-between p-4 text-xl border-b font-semibold">
      <Link href={"/"}>
        <div>Home</div>
      </Link>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <SignedIn>
          <PendingInvitationsNotification />
          <UserButton />
        </SignedIn>
        
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </nav>
  )
}
