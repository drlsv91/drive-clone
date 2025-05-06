"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBytes, getFileTypeIcon } from "@/lib/utils";
import {
  Download,
  Edit,
  Eye,
  File,
  Archive as FileArchive,
  Music as FileAudio,
  Image as FileImage,
  FileJson as FilePdf,
  FileType as FilePresentation,
  FileSpreadsheet,
  FileText,
  Video as FileVideo,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useFiles } from "@/hooks/use-files-query";
import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";

interface ListViewItemProps {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  onDelete?: () => void;
}

export default function ListViewItem({ id, name, type, size, url, createdAt, onDelete }: Readonly<ListViewItemProps>) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [newName, setNewName] = useState(name);

  const {
    actions: { renameFile, deleteFile, isRenaming, isDeleting, setIsRenaming },
  } = useFiles();

  const date = new Date(createdAt).toLocaleDateString();

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleDownload = () => {
    window.open(url, "_blank");
  };

  const renderFileIcon = () => {
    const iconType = getFileTypeIcon(type);
    const iconSize = "h-5 w-5";

    switch (iconType) {
      case "image":
        return <FileImage className={`${iconSize} text-blue-500`} />;
      case "video":
        return <FileVideo className={`${iconSize} text-purple-500`} />;
      case "audio":
        return <FileAudio className={`${iconSize} text-pink-500`} />;
      case "pdf":
        return <FilePdf className={`${iconSize} text-red-500`} />;
      case "word":
        return <FileText className={`${iconSize} text-blue-600`} />;
      case "excel":
        return <FileSpreadsheet className={`${iconSize} text-green-600`} />;
      case "powerpoint":
        return <FilePresentation className={`${iconSize} text-orange-500`} />;
      case "zip":
        return <FileArchive className={`${iconSize} text-yellow-600`} />;
      default:
        return <File className={`${iconSize} text-gray-500`} />;
    }
  };

  const getFileTypeName = () => {
    if (type.startsWith("image/")) return "Image";
    if (type.startsWith("video/")) return "Video";
    if (type.startsWith("audio/")) return "Audio";
    if (type === "application/pdf") return "PDF";
    if (type.includes("word")) return "Document";
    if (type.includes("spreadsheet") || type.includes("excel")) return "Spreadsheet";
    if (type.includes("presentation") || type.includes("powerpoint")) return "Presentation";
    if (type.includes("zip") || type.includes("archive")) return "Archive";

    return type.split("/")[1]?.toUpperCase() || "File";
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0">{renderFileIcon()}</div>
            <div className="ml-4">
              {isRenaming ? (
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && renameFile({ name: newName, id })}
                  />

                  <IoCloseOutline
                    size="1.5rem"
                    className="cursor-pointer"
                    onClick={() => {
                      setIsRenaming(false);
                      setNewName(name);
                    }}
                  />
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{name}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{getFileTypeName()}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{formatBytes(size)}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{date}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreview}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteFile({ onDelete, name, id })}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <div className="flex flex-col items-center justify-center gap-4">
            <DialogTitle className="text-xl font-bold">{name}</DialogTitle>

            <PreviewFile
              name={name}
              url={url}
              onDownload={handleDownload}
              onRenderFIleIcon={renderFileIcon}
              type={type}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const PreviewFile = ({
  type,
  url,
  name,
  onDownload,
  onRenderFIleIcon,
}: {
  type: string;
  url: string;
  name: string;
  onDownload: () => void;
  onRenderFIleIcon: () => React.ReactNode;
}) => {
  if (type.startsWith("image/")) {
    return (
      <div className="w-full max-h-[70vh] overflow-hidden flex items-center justify-center">
        <Image src={url} alt={name} width={800} height={600} className="object-contain max-w-full max-h-[70vh]" />
      </div>
    );
  }

  if (type === "application/pdf") {
    return <iframe src={url} className="w-full h-[70vh]" title={name} />;
  }
  return (
    <div className="text-center p-10 border rounded-lg">
      <div className="flex flex-col items-center gap-4">
        {onRenderFIleIcon()}
        <p>Preview not available for this file type</p>
        <Button onClick={onDownload}>Download</Button>
      </div>
    </div>
  );
};
