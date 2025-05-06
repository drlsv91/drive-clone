"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { signOut } from "next-auth/react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, KeyRound, LogOut, Shield, UserX } from "lucide-react";
import { toast } from "sonner";
import { showError } from "@/lib/utils";

interface SecuritySettingsProps {
  userId: string;
}

export default function SecuritySettings({ userId }: Readonly<SecuritySettingsProps>) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isActivityTracking, setIsActivityTracking] = useState(true);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  console.log(userId);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "New password and confirmation must match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      toast.success("Password changed", {
        description: "Your password has been updated successfully.",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      showError(error, "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    try {
      // In a real app, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setIs2FAEnabled(checked);

      toast.info(checked ? "2FA Enabled" : "2FA Disabled", {
        description: checked
          ? "Two-factor authentication has been enabled."
          : "Two-factor authentication has been disabled.",
      });
    } catch (error: unknown) {
      showError(error, "Operation failed");
    }
  };

  const handleToggleActivity = async (checked: boolean) => {
    try {
      setIsActivityTracking(checked);

      toast.info(checked ? "Activity Tracking Enabled" : "Activity Tracking Disabled", {
        description: checked
          ? "Your account activity will be tracked for security purposes."
          : "Account activity tracking has been disabled.",
      });
    } catch (error: unknown) {
      showError(error, "Operation failed");
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleDeleteAccount = async () => {
    try {
      // This would be a real API call in a production app
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      toast.success("Account deleted", {
        description: "Your account has been deleted successfully.",
      });

      // Redirect to home page
      await signOut({ callbackUrl: "/" });
    } catch (error: unknown) {
      showError(error, "Deletion failed");
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <span>Password Management</span>
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <p className="text-xs text-gray-500">
                Use at least 8 characters with a mix of letters, numbers & symbols.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <Button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          <p>Note: This is a demo and password changes are not saved.</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>Configure additional security features to protect your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
            </div>
            <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Activity Tracking</Label>
              <p className="text-sm text-gray-500">Track login attempts and security events.</p>
            </div>
            <Switch checked={isActivityTracking} onCheckedChange={handleToggleActivity} />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Recent Login Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Current session</p>
                  <p className="text-gray-500">Lagos, Nigeria • Chrome on Windows</p>
                </div>
                <span className="text-green-600 text-xs font-medium">Active</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Yesterday</p>
                  <p className="text-gray-500">Lagos, Nigeria • Chrome on Windows</p>
                </div>
                <span className="text-gray-600 text-xs font-medium">9:45 AM</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="text-gray-500">
            View All Activity
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>Actions that can permanently affect your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium mb-1">Sign out from all devices</h3>
                <p className="text-sm text-gray-500">This will end all active sessions except your current one.</p>
              </div>
              <Button variant="outline" onClick={() => setShowSignOutDialog(true)} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="border border-red-200 rounded-md p-4 bg-red-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-red-600 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-600">Permanently delete your account and all your data.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog for Sign Out confirmation */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Sign Out from All Devices?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out from all devices except the current one. You&apos;ll need to sign in again on those
              devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Delete Account confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="h-5 w-5" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
