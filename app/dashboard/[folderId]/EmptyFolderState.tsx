"use client";

interface EmptyFolderStateProps {
  folderId: string;
  folderName: string;
}

export default function EmptyFolderState({ folderId, folderName }: EmptyFolderStateProps) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <h3 className="text-lg font-medium text-gray-900">This folder is empty</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new folder or uploading a file to "{folderName}".
      </p>
    </div>
  );
}
