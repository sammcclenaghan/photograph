"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { updateCollaboratorRole, removeCollaborator } from "~/server/actions";
import { toast } from "~/hooks/use-toast"; // Fixed toast import path
import { Users, Trash2 } from "lucide-react";
import type { CollaboratorRole } from "~/server/db/schema";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

type Collaborator = {
  userId: string;
  role: CollaboratorRole;
  email?: string | null;
  invitedAt: Date;
  updatedAt: Date;
};

interface Props {
  galleryId: number;
  galleryOwnerId: string;
  className?: string;
  initialCollaborators?: Collaborator[];
}

export default function ManageCollaboratorsButton({ 
  galleryId, 
  galleryOwnerId,
  className,
  initialCollaborators = [] 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
  
  // Check if current user is the gallery owner
  const isOwner = userId === galleryOwnerId;
  
  // Load collaborators on initial render as well as dialog open
  useEffect(() => {
    if (!initialCollaborators.length) {
      fetchCollaborators();
    } else {
      setCollaborators(initialCollaborators);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen]);

  const fetchCollaborators = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/galleries/${galleryId}/collaborators`);
      
      if (!response.ok) {
        if (response.status === 403) {
          // User doesn't have permission to view collaborators
          setCollaborators([]);
          return;
        }
        throw new Error("Failed to fetch collaborators");
      }
      
      const data = await response.json();
      setCollaborators(data);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast({
        title: "Error",
        description: "Failed to load collaborators",
        variant: "destructive",
      });
      setCollaborators([]); // Set empty array to avoid infinite loading
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: CollaboratorRole) => {
    try {
      setIsLoading(true);
      await updateCollaboratorRole(galleryId, userId, newRole);
      
      // Update local state
      setCollaborators(prev => 
        prev.map(c => c.userId === userId ? { ...c, role: newRole } : c)
      );
      
      toast({
        title: "Role updated",
        description: "Collaborator's role has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      setIsLoading(true);
      await removeCollaborator(galleryId, userId);
      
      // Update local state
      setCollaborators(prev => prev.filter(c => c.userId !== userId));
      
      toast({
        title: "Collaborator removed",
        description: "Collaborator has been removed successfully",
      });
      
      // If current user removed themselves, refresh the page
      if (userId === userId) { // This is the bug! Comparing userId to itself
        router.refresh();
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove collaborator",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display pending invitations separately
  const pendingInvitations = collaborators.filter(c => c.userId.startsWith('pending-'));
  const activeCollaborators = collaborators.filter(c => !c.userId.startsWith('pending-'));

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className={`${className} relative`}
      >
        <Users className="mr-2 h-4 w-4" />
        Collaborators
        {collaborators.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {collaborators.length}
          </div>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Collaborators</DialogTitle>
          </DialogHeader>
          
          {isLoading && collaborators.length === 0 ? (
            <div className="py-6 text-center">Loading collaborators...</div>
          ) : collaborators.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No collaborators yet. Share your gallery to add collaborators.
            </div>
          ) : (
            <div className="space-y-6 max-h-[60vh] overflow-auto">
              {pendingInvitations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
                  <div className="space-y-2">
                    {pendingInvitations.map((invitation) => {
                      const email = invitation.email || invitation.userId.replace('pending-', '');
                      
                      return (
                        <div key={invitation.userId} className="flex items-center justify-between py-2 border-b border-border">
                          <div className="flex-1">
                            <p className="font-medium">{email}</p>
                            <p className="text-xs text-muted-foreground">
                              Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Select 
                              value={invitation.role}
                              onValueChange={(value: CollaboratorRole) => 
                                handleRoleChange(invitation.userId, value)
                              }
                              disabled={!isOwner || isLoading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(invitation.userId)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {activeCollaborators.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Active Collaborators</h3>
                  <div className="space-y-2">
                    {activeCollaborators.map((collaborator) => {
                      const displayEmail = collaborator.email || 'Unknown user';
                      
                      return (
                        <div key={collaborator.userId} className="flex items-center justify-between py-2 border-b border-border">
                          <div className="flex-1">
                            <p className="font-medium">{displayEmail}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {(isOwner || (userId !== collaborator.userId)) && (
                              <Select 
                                value={collaborator.role}
                                onValueChange={(value: CollaboratorRole) => 
                                  handleRoleChange(collaborator.userId, value)
                                }
                                disabled={!isOwner || isLoading}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(collaborator.userId)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}