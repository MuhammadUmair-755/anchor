"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Button from "@mui/material/Button";
import AnchorIcon from "@mui/icons-material/Anchor";
import LoginIcon from "@mui/icons-material/Login";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <AnchorIcon fontSize="medium" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Anchor
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="outlined"
                size="small"
                startIcon={<LoginIcon />}
                className="normal-case"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                variant="contained"
                size="small"
                className="normal-case bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
