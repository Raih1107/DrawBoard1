"use client";

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

    const {organization} = useOrganization();

  return (
    <div className="w-full px-4 py-3 bg-white border-b flex items-center justify-between">
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
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                justifyContent: "space-between",
                backgroundColor: "white",
              },
            },
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 lg:gap-4">
        
        {organization && (
            <InviteButton />
        )}

        <SignedOut>
          <SignInButton>
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 transition" size="sm" >
              Sign in
            </Button>  
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <SignOutButton>
            <Button variant="destructive" size="sm">
              Sign Out
            </Button>
          </SignOutButton>

          <div className="ml-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};
