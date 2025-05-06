import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { Suspense } from "react";
import BreadcrumbNav from "../components/BreadcrumbNav";
import FileCard from "../components/FileCard";
import { Metadata } from "next";

export default async function RecentPage() {
  const currentUser = await requireAuth();

  // Get recent files (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentFiles = await prisma.file.findMany({
    where: {
      userId: currentUser.id,
      isTrash: false,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <div>
      <div className="mb-6">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold">Recent</h1>
      </div>

      <Suspense fallback={<div>Loading recent files...</div>}>
        {recentFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No recent files</h3>
            <p className="mt-1 text-sm text-gray-500">Files you've accessed in the last 30 days will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentFiles.map((file) => (
              <FileCard
                key={file.id}
                id={file.id}
                name={file.name}
                type={file.type}
                size={file.size}
                url={file.url}
                thumbnailUrl={file.thumbnailUrl ?? undefined}
                createdAt={file.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  title: "DriveClone -  Recent Items",
  description: "drive clone view recents items",
};
