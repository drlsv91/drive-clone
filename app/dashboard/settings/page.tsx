import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { formatBytes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BreadcrumbNav from "../components/BreadcrumbNav";
import NotificationSettings from "./components/NotificationSettings";
import ProfileSettings from "./components/ProfileSettings";
import SecuritySettings from "./components/SecuritySettings";
import StorageSettings from "./components/StorageSettings";
import { Metadata } from "next";

export default async function SettingsPage() {
  const currentUser = await requireAuth();

  // Get user data including storage usage
  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      usedStorage: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Calculate storage metrics
  const totalStorage = 100 * 1024 * 1024; // 100MB for demo
  const usedStorage = user.usedStorage;
  const usedPercentage = Math.min(Math.round((usedStorage / totalStorage) * 100), 100);
  const remainingStorage = Math.max(totalStorage - usedStorage, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Suspense fallback={<div>Loading settings...</div>}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings
              user={{
                id: user.id,
                name: user.name ?? "",
                email: user.email ?? "",
                image: user.image ?? "",
                createdAt: user.createdAt,
              }}
            />
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <StorageSettings
              storageData={{
                usedStorage,
                totalStorage,
                usedPercentage,
                remainingStorage,
                formattedUsedStorage: formatBytes(usedStorage),
                formattedTotalStorage: formatBytes(totalStorage),
                formattedRemainingStorage: formatBytes(remainingStorage),
              }}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecuritySettings userId={user.id} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings userId={user.id} />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  title: "DriveClone -  Settings",
  description: "drive clone view settings",
};
