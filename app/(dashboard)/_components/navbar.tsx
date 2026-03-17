"use client";
import { useEffect, useState } from "react";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useOrganization,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";
import { InviteButton } from "./invite-button";

export const Navbar = () => {
    const [mounted, setMounted] = useState(false);
    const {organization} = useOrganization();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Or a skeleton if preferred
    }

  return (
    <div
      className="w-full px-4 py-3 flex items-center justify-between"
      style={{
        background: "rgba(13,16,23,0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}
    >
      {/* Left: Search on large screens */}
      <div className="hidden lg:flex w-full max-w-lg">
        <SearchInput />
      </div>

      {/* Center: Organization switcher on small screens */}
      <div className="block lg:hidden flex-1">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth:"367px"
              },
              organizationSwitcherTrigger: {
                padding: "6px",
                width: "100%",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                justifyContent: "space-between",
                backgroundColor: "rgba(255,255,255,0.04)",
                color: "#f1f5f9",
              },
            },
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 lg:gap-3 ml-auto">
        
        {organization && (
            <InviteButton />
        )}

        <SignedOut>
          <SignInButton>
            <Button variant="secondary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <SignOutButton>
            <Button variant="destructive" size="sm">
              Sign Out
            </Button>
          </SignOutButton>

          <div className="ml-1">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};
