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

export const InviteButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Invite members
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 border-none max-w-[880px]">
        {/* Accessible title + description (can be visually hidden if needed) */}
        <DialogTitle className="sr-only">Invite Members</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your organization members.
        </DialogDescription>

        <OrganizationProfile routing="hash" />

      </DialogContent>
    </Dialog>
  );
};
