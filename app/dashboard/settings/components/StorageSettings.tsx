"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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
import { HardDrive, Trash2, AlertTriangle, BarChart3, FileUp, Folder, Image, FileText, FileVideo } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { showError } from "@/lib/utils";
import Link from "next/link";

interface StorageSettingsProps {
  storageData: {
    usedStorage: number;
    totalStorage: number;
    usedPercentage: number;
    remainingStorage: number;
    formattedUsedStorage: string;
    formattedTotalStorage: string;
    formattedRemainingStorage: string;
  };
}

export default function StorageSettings({ storageData }: Readonly<StorageSettingsProps>) {
  const router = useRouter();

  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);

  // File type statistics for the chart (these would come from backend in a real app)
  const fileTypes = [
    { type: "Images", size: storageData.usedStorage * 0.42, icon: Image },
    { type: "Documents", size: storageData.usedStorage * 0.28, icon: FileText },
    { type: "Videos", size: storageData.usedStorage * 0.15, icon: FileVideo },
    { type: "Others", size: storageData.usedStorage * 0.15, icon: FileUp },
  ];

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true);

    try {
      await axios.delete("/api/trash/empty");

      toast.success("Trash emptied", {
        description: "All items in trash have been permanently deleted.",
      });

      setShowEmptyTrashDialog(false);
      router.refresh();
    } catch (error: unknown) {
      showError(error, "Operation failed");
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);

    try {
      // This would be a real API call in a production app
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success("Cache cleared", {
        description: "Your cache has been cleared successfully.",
      });

      router.refresh();
    } catch (error: unknown) {
      showError(error, "Operation failed");
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>Monitor your storage usage and manage your space efficiently.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Used</span>
              <span>
                {storageData.formattedUsedStorage} of {storageData.formattedTotalStorage}
              </span>
            </div>
            <Progress value={storageData.usedPercentage} className="h-3" />
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{storageData.formattedRemainingStorage} available</span>
              <span>{storageData.usedPercentage}% used</span>
            </div>
          </div>

          {/* Storage Analytics */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-sm flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4" />
              <span>Storage Breakdown</span>
            </h3>

            <div className="space-y-3">
              {fileTypes.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.type}</span>
                    </div>
                    <span>{Math.round((item.size / storageData.usedStorage) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{
                        width: `${Math.round((item.size / storageData.usedStorage) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              This breakdown shows how your storage is being used by different file types.
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/trash">
              <Trash2 className="mr-2 h-4 w-4" />
              Manage Trash
            </Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowEmptyTrashDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Empty Trash
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleClearCache} disabled={isClearingCache}>
            <HardDrive className="mr-2 h-4 w-4" />
            {isClearingCache ? "Clearing Cache..." : "Clear Cache"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Plans</CardTitle>
          <CardDescription>Upgrade your storage capacity to fit your needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Plan */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Current Plan: Free</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Active</span>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-gray-500" />
                <span>{storageData.formattedTotalStorage} storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-gray-500" />
                <span>Basic folder management</span>
              </li>
              <li className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-gray-500" />
                <span>10MB max file size</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan - Upgrade Option */}
          <div className="border p-4 rounded-lg bg-white border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Pro Plan</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommended</span>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-gray-500" />
                <span>1TB storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-gray-500" />
                <span>Advanced folder management</span>
              </li>
              <li className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-gray-500" />
                <span>100MB max file size</span>
              </li>
            </ul>
            <div className="text-sm font-semibold mb-4">$9.99/month</div>
            <Button className="w-full" disabled>
              Upgrade Plan
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">Upgrading is not available in this demo.</p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog for Empty Trash confirmation */}
      <AlertDialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Empty Trash?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all items in your trash. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEmptyingTrash}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              disabled={isEmptyingTrash}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isEmptyingTrash ? "Emptying..." : "Empty Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
