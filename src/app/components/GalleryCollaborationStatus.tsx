"use client";

import { useAuth } from "@clerk/nextjs";
import { Shield, ShieldCheck, ShieldAlert, Eye, PencilLine, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { CollaboratorRole } from "~/server/db/schema";

type Props = {
  galleryId: number;
  ownerId: string;
}

export default function GalleryCollaborationStatus({ galleryId, ownerId }: Props) {
  const { userId } = useAuth();
  const [role, setRole] = useState<CollaboratorRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isOwner = userId === ownerId;
  
  useEffect(() => {
    if (!userId || isOwner) {
      setLoading(false);
      return;
    }
    
    const fetchRole = async () => {
      try {
        const response = await fetch(`/api/galleries/${galleryId}/role`);
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRole();
  }, [galleryId, userId, isOwner]);
  
  if (loading) {
    return <div className="h-8"></div>;
  }
  
  if (isOwner) {
    return (
      <div className="flex items-center gap-1.5 text-sm py-1 px-2 rounded-md bg-primary/10 text-primary">
        <User size={14} />
        <span>Owner</span>
      </div>
    );
  }
  
  if (!role) {
    return null;
  }
  
  const roleInfo = {
    viewer: {
      icon: <Eye size={14} />,
      label: "Viewer",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    editor: {
      icon: <PencilLine size={14} />,
      label: "Editor",
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    admin: {
      icon: <ShieldCheck size={14} />,
      label: "Admin",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    }
  };
  
  const { icon, label, className } = roleInfo[role];
  
  return (
    <div className={`flex items-center gap-1.5 text-sm py-1 px-2 rounded-md ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}