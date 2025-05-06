import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ActionButtons from "../components/ActionButtons";
import BreadcrumbNav from "../components/BreadcrumbNav";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import EmptyFolderState from "./EmptyFolderState";

interface FolderPageProps {
  params: Promise<{
    folderId: string;
  }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  const currentUser = await requireAuth();

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
      userId: currentUser.id,
    },
  });

  if (!folder) {
    notFound();
  }

  // Get all subfolders
  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      userId: currentUser.id,
      isTrash: false,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get all files in the folder
  const files = await prisma.file.findMany({
    where: {
      folderId: folderId,
      userId: currentUser.id,
      isTrash: false,
    },
    orderBy: {
      name: "asc",
    },
  });

  const isEmpty = subfolders.length === 0 && files.length === 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <BreadcrumbNav folderId={folderId} />
          <h1 className="text-2xl font-bold">{folder.name}</h1>
        </div>
        <ActionButtons folderId={folderId} />
      </div>

      <Suspense fallback={<div>Loading folders and files...</div>}>
        {isEmpty ? (
          <EmptyFolderState folderId={folderId} folderName={folder.name} />
        ) : (
          <>
            {subfolders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {subfolders.map((subfolder) => (
                    <FolderCard
                      key={subfolder.id}
                      id={subfolder.id}
                      name={subfolder.name}
                      createdAt={subfolder.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      id={file.id}
                      name={file.name}
                      type={file.type}
                      size={file.size}
                      url={file.url}
                      thumbnailUrl={file.thumbnailUrl || undefined}
                      createdAt={file.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}
