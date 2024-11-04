import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export default function Header() {
  return (
    <nav className="flex w-full items-center justify-between p-4 text-xl border-b font-semibold">
      <div> Gallery</div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  )
}
