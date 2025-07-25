"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrganizationProfile } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export const InviteButton = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Navigate to #/organization-members to show the Members tab
      window.location.hash = "/organization-members";
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Invite members
        </Button>
      </DialogTrigger>

      <DialogContent
          className="p-0 border-none w-full max-w-[880px] sm:max-w-[95vw] sm:w-[95vw] lg:max-w-[880px] lg:w-[880px] max-h-[90vh] overflow-y-auto sm:rounded-lg"
        >

        <DialogTitle className="sr-only">Invite Members</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your organization members.
        </DialogDescription>

        {/* Now this will read the hash and open Members tab */}
        <OrganizationProfile routing="hash" />
      </DialogContent>
    </Dialog>
  );
};
