"use client";

import { useState, useEffect } from "react";
import { FileIcon, Grid, List, SortAsc, SortDesc, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import FileCard from "./FileCard";
import ListViewItem from "./ListViewItem";

type File = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
  createdAt: string;
};

interface FileGridProps {
  files: File[];
  onDelete?: (id: string) => void;
}

type SortField = "name" | "createdAt" | "size";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list";

export default function FileGrid({ files, onDelete }: Readonly<FileGridProps>) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortedFiles, setSortedFiles] = useState<File[]>([]);

  // Get unique file types
  const fileTypes = [
    ...new Set(
      files.map((file) => {
        if (file.type.startsWith("image/")) return "image";
        if (file.type.startsWith("video/")) return "video";
        if (file.type.startsWith("audio/")) return "audio";
        if (file.type === "application/pdf") return "pdf";
        if (file.type.includes("word")) return "document";
        if (file.type.includes("spreadsheet") || file.type.includes("excel")) return "spreadsheet";
        if (file.type.includes("presentation") || file.type.includes("powerpoint")) return "presentation";
        return "other";
      })
    ),
  ];

  useEffect(() => {
    let filtered = [...files];

    // Apply filter
    if (filterType) {
      filtered = filtered.filter((file) => {
        if (filterType === "image" && file.type.startsWith("image/")) return true;
        if (filterType === "video" && file.type.startsWith("video/")) return true;
        if (filterType === "audio" && file.type.startsWith("audio/")) return true;
        if (filterType === "pdf" && file.type === "application/pdf") return true;
        if (filterType === "document" && file.type.includes("word")) return true;
        if (filterType === "spreadsheet" && (file.type.includes("spreadsheet") || file.type.includes("excel")))
          return true;
        if (filterType === "presentation" && (file.type.includes("presentation") || file.type.includes("powerpoint")))
          return true;
        if (
          filterType === "other" &&
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/") &&
          !file.type.startsWith("audio/") &&
          file.type !== "application/pdf" &&
          !file.type.includes("word") &&
          !file.type.includes("spreadsheet") &&
          !file.type.includes("excel") &&
          !file.type.includes("presentation") &&
          !file.type.includes("powerpoint")
        )
          return true;
        return false;
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortField === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortField === "size") {
        return sortOrder === "asc" ? a.size - b.size : b.size - a.size;
      }
      return 0;
    });

    setSortedFiles(filtered);
  }, [files, sortField, sortOrder, filterType]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Files ({sortedFiles.length})</h2>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterType(null)}>All files</DropdownMenuItem>
              <DropdownMenuSeparator />
              {fileTypes.map((type) => (
                <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("name")} className="gap-2">
                Name
                {sortField === "name" &&
                  (sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("createdAt")} className="gap-2">
                Date
                {sortField === "createdAt" &&
                  (sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("size")} className="gap-2">
                Size
                {sortField === "size" &&
                  (sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={toggleViewMode}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {sortedFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterType ? `No ${filterType} files found. Try a different filter.` : "No files available."}
          </p>
        </div>
      ) : (
        <RenderViewMode viewMode={viewMode} sortedFiles={sortedFiles} onDelete={onDelete} />
      )}
    </div>
  );
}

const RenderViewMode = ({
  onDelete,
  viewMode,
  sortedFiles,
}: {
  sortedFiles: File[];
  viewMode: string;
  onDelete?: (id: string) => void;
}) => {
  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };
  return viewMode === "grid" ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedFiles.map((file) => (
        <FileCard
          key={file.id}
          id={file.id}
          name={file.name}
          type={file.type}
          size={file.size}
          url={file.url}
          thumbnailUrl={file.thumbnailUrl || undefined}
          createdAt={file.createdAt}
          onDelete={() => handleDelete(file.id)}
        />
      ))}
    </div>
  ) : (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedFiles.map((file) => (
            <ListViewItem
              key={file.id}
              id={file.id}
              name={file.name}
              type={file.type}
              size={file.size}
              url={file.url}
              createdAt={file.createdAt}
              onDelete={() => handleDelete(file.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
