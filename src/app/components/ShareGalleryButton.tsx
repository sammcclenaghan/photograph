"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { inviteCollaborator } from "~/server/actions";
import { toast } from "~/hooks/use-toast";
import { Share2 } from "lucide-react";
import type { CollaboratorRole } from "~/server/db/schema";

interface Props {
  galleryId: number;
  className?: string;
}

export default function ShareGalleryButton({ galleryId, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("viewer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await inviteCollaborator(galleryId, email, role);
      
      if (result.success) {
        toast({
          title: "Invitation sent",
          description: result.pending 
            ? `${email} will be notified when they sign up.` 
            : `${email} has been added as a collaborator.`,
        });
        setEmail("");
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Gallery</DialogTitle>
            <DialogDescription>
              Invite collaborators to view or edit this gallery.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={(value: CollaboratorRole) => setRole(value)}>
                <SelectTrigger className="col-span-3" id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (can only view)</SelectItem>
                  <SelectItem value="editor">Editor (can upload and edit)</SelectItem>
                  <SelectItem value="admin">Admin (can invite others)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <div className="flex-1 text-sm text-muted-foreground">
                <p>Viewers can only view the gallery.</p>
                <p>Editors can upload and edit content.</p>
                <p>Admins can also invite others.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? "Inviting..." : "Invite"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}