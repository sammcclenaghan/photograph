"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useToast } from "~/hooks/use-toast";
import { useUser } from "@clerk/nextjs";

type Invitation = {
  id: string;
  galleryId: number;
  galleryName: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
};

export default function PendingInvitationsNotification() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Fetch invitations when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      fetchInvitations();
      
      const interval = setInterval(() => {
        fetchInvitations();
      }, 30000); // Check for new invitations every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoaded, user]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      // Include the user's email as a query parameter
      const emailAddress = user?.primaryEmailAddress?.emailAddress;
      
      if (!emailAddress) {
        console.error("User email not available");
        return;
      }
      
      // Log the email we're checking
      console.log("Checking for invitations for:", emailAddress);
      
      const response = await fetch(`/api/invitations?email=${encodeURIComponent(emailAddress)}`);
      
      console.log("Invitations response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Invitations data:", data);
        setInvitations(data);
      } else {
        const errorText = await response.text();
        console.error("Error fetching invitations:", errorText);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (galleryId: number) => {
    try {
      const emailAddress = user?.primaryEmailAddress?.emailAddress;
      if (!emailAddress) return;
      
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          galleryId,
          email: emailAddress 
        }),
      });

      if (response.ok) {
        // Remove the invitation from the local state
        setInvitations((prev) => prev.filter((inv) => inv.galleryId !== galleryId));
        
        toast({
          title: "Invitation accepted!",
          description: "You can now access the shared gallery.",
        });
        
        // Refresh the page to show the new gallery
        router.refresh();
      } else {
        throw new Error("Failed to accept invitation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineInvitation = async (galleryId: number) => {
    try {
      const emailAddress = user?.primaryEmailAddress?.emailAddress;
      if (!emailAddress) return;
      
      const response = await fetch("/api/invitations/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          galleryId,
          email: emailAddress 
        }),
      });

      if (response.ok) {
        // Remove the invitation from the local state
        setInvitations((prev) => prev.filter((inv) => inv.galleryId !== galleryId));
        
        toast({
          title: "Invitation declined",
          description: "The invitation has been declined.",
        });
      } else {
        throw new Error("Failed to decline invitation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Always show the bell icon, but only show the count badge if there are invitations
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {invitations.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 text-center border-b">
          <p className="font-medium">Pending Invitations</p>
        </div>
        {loading ? (
          <div className="p-3 text-center text-sm text-muted-foreground">
            Loading invitations...
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          invitations.map((invitation) => (
            <div key={invitation.id} className="p-3 border-b">
              <div className="mb-2">
                <p className="font-medium">{invitation.galleryName}</p>
                <p className="text-sm text-muted-foreground">
                  You've been invited as a <span className="font-medium">{invitation.role}</span>
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeclineInvitation(invitation.galleryId)}
                >
                  Decline
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleAcceptInvitation(invitation.galleryId)}
                >
                  Accept
                </Button>
              </div>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}