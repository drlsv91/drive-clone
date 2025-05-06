import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import BreadcrumbNav from "../components/BreadcrumbNav";
import ActionButtons from "../components/ActionButtons";
import FolderCard from "../components/FolderCard";
import FileGrid from "../components/FileGrid";
import { Star } from "lucide-react";
import authOptions from "@/auth/authOptions";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export default async function StarredPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const starredFolders = await prisma.folder.findMany({
    where: {
      userId: session.user.id,
      isStarred: true,
      isTrash: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const starredFiles = await prisma.file.findMany({
    where: {
      userId: session.user.id,
      isStarred: true,
      isTrash: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <BreadcrumbNav />
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
            <h1 className="text-2xl font-bold">Starred</h1>
          </div>
        </div>
        <ActionButtons />
      </div>

      <Suspense fallback={<div>Loading starred items...</div>}>
        {starredFolders.length === 0 && starredFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Star className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No starred items</h3>
            <p className="mt-1 text-sm text-gray-500">Items you star will appear here for quick access.</p>
          </div>
        ) : (
          <>
            {starredFolders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {starredFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      id={folder.id}
                      name={folder.name}
                      isRoot={folder.isRoot}
                      isStarred={true}
                      createdAt={folder.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </div>
            )}

            {starredFiles.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Files</h2>
                <FileGrid
                  files={starredFiles.map((file) => ({
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: file.url,
                    thumbnailUrl: file.thumbnailUrl ?? undefined,
                    createdAt: file.createdAt.toISOString(),
                  }))}
                />
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  title: "DriveClone -  Starred List",
  description: "drive clone view starred files",
};
