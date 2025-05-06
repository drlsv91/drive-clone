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
import Image from "next/image";
import { useCallback, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

import { Input } from "@/components/ui/input";
import { useFiles } from "@/hooks/use-files-query";

type FileProps = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  onDelete?: () => void;
};

export default function FileCard({
  id,
  name,
  type,
  size,
  url,
  thumbnailUrl,
  createdAt,
  onDelete,
}: Readonly<FileProps>) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newName, setNewName] = useState(name);

  const {
    actions: { setIsRenaming, isDeleting, isRenaming, renameFile, deleteFile },
  } = useFiles();

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const date = new Date(createdAt).toLocaleDateString();
  const handleDownload = () => {
    window.open(url, "_blank");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newName.length > 0 && newName.length < 256) {
      renameFile({ id, name: newName });
      setIsRenaming(false);
    }
  };

  const renderFileIcon = useCallback(() => {
    const iconType = getFileTypeIcon(type);
    switch (iconType) {
      case "image":
        return <FileImage className="h-10 w-10 text-blue-500" />;
      case "video":
        return <FileVideo className="h-10 w-10 text-purple-500" />;
      case "audio":
        return <FileAudio className="h-10 w-10 text-pink-500" />;
      case "pdf":
        return <FilePdf className="h-10 w-10 text-red-500" />;
      case "word":
        return <FileText className="h-10 w-10 text-blue-600" />;
      case "excel":
        return <FileSpreadsheet className="h-10 w-10 text-green-600" />;
      case "powerpoint":
        return <FilePresentation className="h-10 w-10 text-orange-500" />;
      case "zip":
        return <FileArchive className="h-10 w-10 text-yellow-600" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  }, [type]);

  return (
    <>
      <div className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <RenderThumbnail name={name} thumbnailUrl={thumbnailUrl} renderFileIcon={renderFileIcon} />
              <div className="truncate">
                {isRenaming ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-sm shadow-none focus-visible:ring-[2px] rounded-sm"
                      autoFocus
                      onKeyDown={handleKeyDown}
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
                  <p className="font-medium truncate">{name.substring(0, 25)}</p>
                )}
                <p className="text-xs text-gray-500">
                  {date} · {formatBytes(size)}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Preview</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log("clicked");
                    setIsRenaming(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteFile({ onDelete, id, name })}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

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

const RenderThumbnail = ({
  thumbnailUrl,
  name,
  renderFileIcon,
}: {
  thumbnailUrl?: string | null;
  name: string;
  renderFileIcon: () => React.ReactNode;
}) => {
  if (thumbnailUrl)
    return <Image src={thumbnailUrl} alt={name} width={40} height={40} className="rounded object-cover" />;

  return renderFileIcon();
};

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
