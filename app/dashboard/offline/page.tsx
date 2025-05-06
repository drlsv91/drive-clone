import { Button } from "@/components/ui/button";
import { CloudOff, Download } from "lucide-react";
import { Suspense } from "react";
import BreadcrumbNav from "../components/BreadcrumbNav";

export default async function OfflinePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <BreadcrumbNav />
          <div className="flex items-center gap-2">
            <CloudOff className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold">Offline Access</h1>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading offline settings...</div>}>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Offline Access Settings</h2>
              <p className="text-gray-600 mb-4">
                Make selected files available offline across your devices. Files are automatically synced when you're
                back online.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <p className="text-blue-800 text-sm">
                  Note: This feature is not fully implemented in this demo version.
                </p>
              </div>

              <Button className="mt-2 flex items-center gap-2" disabled>
                <Download className="h-4 w-4" />
                <span>Make Available Offline</span>
              </Button>
            </div>

            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <CloudOff className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Offline Files</h3>
                <p className="text-sm text-gray-500">You don't have any files available for offline access.</p>
                <p className="text-xs text-gray-500 mt-6">Storage Usage: 0 MB</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">How Offline Access Works</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">1. Select Files</h4>
                <p className="text-sm text-gray-600">
                  Choose which files you want to access without an internet connection.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">2. Sync Automatically</h4>
                <p className="text-sm text-gray-600">Files are downloaded to your device and kept up to date.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">3. Access Anywhere</h4>
                <p className="text-sm text-gray-600">
                  Open and edit files even when you're offline. Changes sync when you reconnect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
