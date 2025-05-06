"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Pencil, User } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: Date;
  };
}

export default function ProfileSettings({ user }: Readonly<ProfileSettingsProps>) {
  const { update } = useSession();

  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const accountCreatedDate = new Date(user.createdAt).toLocaleDateString();

  const handleUpdate = async () => {
    if (!displayName.trim()) {
      toast.error("Name required", {
        description: "Please provide a display name.",
      });
      return;
    }

    setIsUpdating(true);

    try {
      await axios.patch(`/api/users/profile`, { name: displayName });

      // Update the session with new data
      await update({
        name: displayName,
      });

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Update failed", {
        description: error.message ?? "Something went wrong.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal information and how it appears to others.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback className="text-3xl">
                {user.name?.charAt(0) || <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-medium text-lg">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">Member since {accountCreatedDate}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="displayName">Display Name</Label>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 gap-1">
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} size="sm" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.name);
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Input id="displayName" value={displayName} disabled className="bg-gray-50" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email changes are not available in this demo.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 justify-between flex-wrap gap-2">
          <span>All profile changes are saved automatically.</span>
          <Button variant="outline" size="sm">
            Download My Data
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>Configure how your account works across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select id="language" className="w-full p-2 border rounded-md bg-background" defaultValue="en" disabled>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
            <p className="text-xs text-gray-500">Language changes are not available in this demo.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select id="timezone" className="w-full p-2 border rounded-md bg-background" defaultValue="UTC" disabled>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
            </select>
            <p className="text-xs text-gray-500">Timezone changes are not available in this demo.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
