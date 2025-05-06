"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessagesSquare, Share, Lock, Activity } from "lucide-react";
import { toast } from "sonner";
import { showError } from "@/lib/utils";

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: Readonly<NotificationSettingsProps>) {
  const router = useRouter();

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState({
    fileShared: true,
    commentAdded: true,
    securityAlerts: true,
    newFeatures: false,
    weeklyDigest: true,
  });
  console.log(userId);

  const [pushNotifications, setPushNotifications] = useState({
    fileShared: true,
    commentAdded: false,
    securityAlerts: true,
    newFeatures: false,
    weeklyDigest: false,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // Simulate API call
    triggerUpdateNotification("email", key);
  };

  const handlePushToggle = (key: keyof typeof pushNotifications) => {
    setPushNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    triggerUpdateNotification("push", key);
  };

  const triggerUpdateNotification = async (type: string, setting: string) => {
    setIsUpdating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Settings updated", {
        description: `${setting.replace(/([A-Z])/g, " $1").toLowerCase()} ${type} notifications updated.`,
      });
    } catch (error: unknown) {
      showError(error, "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAll = async () => {
    setIsUpdating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Settings saved", {
        description: "All notification settings have been updated.",
      });

      router.refresh();
    } catch (error: unknown) {
      showError(error, "Save failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>Control when and how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Email Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Shared Files</Label>
                  <p className="text-sm text-gray-500">Receive emails when someone shares files with you.</p>
                </div>
                <Switch
                  checked={emailNotifications.fileShared}
                  onCheckedChange={() => handleEmailToggle("fileShared")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Comments</Label>
                  <p className="text-sm text-gray-500">Receive emails when someone comments on your files.</p>
                </div>
                <Switch
                  checked={emailNotifications.commentAdded}
                  onCheckedChange={() => handleEmailToggle("commentAdded")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Security Alerts</Label>
                  <p className="text-sm text-gray-500">Receive emails about security-related events.</p>
                </div>
                <Switch
                  checked={emailNotifications.securityAlerts}
                  onCheckedChange={() => handleEmailToggle("securityAlerts")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Features</Label>
                  <p className="text-sm text-gray-500">Receive emails about new features and updates.</p>
                </div>
                <Switch
                  checked={emailNotifications.newFeatures}
                  onCheckedChange={() => handleEmailToggle("newFeatures")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Digest</Label>
                  <p className="text-sm text-gray-500">Receive a weekly summary of your account activity.</p>
                </div>
                <Switch
                  checked={emailNotifications.weeklyDigest}
                  onCheckedChange={() => handleEmailToggle("weeklyDigest")}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Push Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Shared Files</Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications when someone shares files with you.
                  </p>
                </div>
                <Switch
                  checked={pushNotifications.fileShared}
                  onCheckedChange={() => handlePushToggle("fileShared")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Comments</Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications when someone comments on your files.
                  </p>
                </div>
                <Switch
                  checked={pushNotifications.commentAdded}
                  onCheckedChange={() => handlePushToggle("commentAdded")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Security Alerts</Label>
                  <p className="text-sm text-gray-500">Receive push notifications about security-related events.</p>
                </div>
                <Switch
                  checked={pushNotifications.securityAlerts}
                  onCheckedChange={() => handlePushToggle("securityAlerts")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Features</Label>
                  <p className="text-sm text-gray-500">Receive push notifications about new features and updates.</p>
                </div>
                <Switch
                  checked={pushNotifications.newFeatures}
                  onCheckedChange={() => handlePushToggle("newFeatures")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Digest</Label>
                  <p className="text-sm text-gray-500">
                    Receive a weekly summary of your account activity as a push notification.
                  </p>
                </div>
                <Switch
                  checked={pushNotifications.weeklyDigest}
                  onCheckedChange={() => handlePushToggle("weeklyDigest")}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between flex-wrap gap-2 border-t pt-6">
          <div className="text-xs text-gray-500">
            <p>Your notification settings are automatically saved as you change them.</p>
          </div>
          <Button onClick={handleSaveAll} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save All Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span>Notification Types</span>
          </CardTitle>
          <CardDescription>Learn about the different types of notifications you can receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="rounded-full bg-blue-100 p-2 h-fit">
                <Share className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Sharing Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Notifications when files are shared with you or when you share files with others.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-green-100 p-2 h-fit">
                <MessagesSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Comment Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Notifications when someone comments on your files or replies to your comments.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-red-100 p-2 h-fit">
                <Lock className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Security Notifications</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Important alerts about account security, such as login attempts, password changes, etc.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 border-t pt-6">
          <p>You can contact support if you experience issues with notifications.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
